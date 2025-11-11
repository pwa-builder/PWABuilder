import express from 'express';
import escape from 'escape-html';
import { AndroidPackageOptions as AndroidPackageOptions } from '../models/androidPackageOptions.js';
import tmp from 'tmp';
import net from 'net';
import { SigningOptions, } from '../models/signingOptions.js';
import { AppPackageRequest } from '../models/appPackageRequest.js';
import generatePassword from 'password-generator';
import fetch, { Response } from 'node-fetch';
import { AnalyticsInfo, trackEvent } from '../services/analytics.js';
import { PackageCreator } from '../services/packageCreator.js';
import { PackageCreationProgress } from '../models/packageCreationProgress.js';
import { errorToString } from "../utils/errorToString.js";
import { packageJobQueue } from "../services/packageJobQueue.js";
import { database } from "../services/databaseService.js";
import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";
import { blobStorage } from "../services/azureStorageBlobService.js";

const router = express.Router();

tmp.setGracefulCleanup(); // remove any tmp file artifacts on process exit
const packageCreator = new PackageCreator();
packageCreator.addEventListener("progress", e => packageCreationProgress(e));

/**
 * Health check endpoint that verifies the service is running.
 * This is used by Azure health checks to ensure app instance is healthy.
 */
router.get('/ping', (_: express.Request, response: express.Response) => {
    response.status(200).json({ status: 'healthy' });
});

/**
 * Generates an APK package and zips it up along with the signing key info. Sends back the zip file.
 * Expects a POST body containing @see ApkOptions form data.
 * 
 * NOTE: This endpoint is deprecated as of October 2025 and will be removed in a future release. Fetching this endpoint can take too long. Instead, use /queuePackage to enqueue a background job.
 */
router.post(['/generateAppPackage', '/generateApkZip'], async (request, response) => await generatePackageZip(request, response));

/**
 * Enqueues a Google Play packaging job to be processed in the background.
 * Expects a POST body containing AndroidPackageOptions.
 */
router.post("/enqueuePackageJob", async (request, response) => await enqueuePackage(request, response));

/**
 * Gets the package job, including status, of the job with the given ID. The result will be JSON of the package job. A 404 error will be thrown if no such job is found.
 * Expects a query parameter "id" containing the job ID.
 */
router.get("/getPackageJob", async (request, response) => await getPackageJob(request, response));

/**
 * Downloads the zip file for the completed package job with the given ID. A 404 error will be thrown if no such job is found, or a 400 error if the job is not yet completed.
 */
router.get("/downloadPackageZip", async (request, response) => await downloadPackageZip(request, response));

/**
 * This endpoint tries to fetch a URL. This is useful because we occasionally have bug reports
 * where the Android packaging service can't fetch an image or other resource.
 * Example: https://github.com/pwa-builder/PWABuilder/issues/1166
 *
 * Often, the cause is the developer's web server is blocking an IP address range that includes
 * our published app service.
 *
 * This endpoint checks for that by performing a simple fetch.
 *
 * Usage: /fetch?type=blob&url=https://somewebsite.com/favicon-512x512.png
 */
router.get('/fetch', async (request, response) => await fetchResource(request, response));

async function generatePackageZip(request: express.Request, response: express.Response): Promise<void> {
    console.info("Received app package request");
    const apkRequest = validateAndroidOptionsRequest(request);
    const platformId = request.headers['platform-identifier'];
    const platformIdVersion = request.headers['platform-identifier-version'];
    const correlationId = request.headers['correlation-id'];
    const analyticsInfo: AnalyticsInfo = {
        url: apkRequest.options?.pwaUrl || apkRequest.options?.host || '',
        packageId: apkRequest.options?.packageId || '',
        name: apkRequest.options?.name || '',
        platformId: platformId ? platformId.toString() : null,
        platformIdVersion: platformIdVersion
            ? platformIdVersion.toString()
            : null,
        correlationId: correlationId ? correlationId.toString() : null,
        referrer: request.query.ref ? request.query.ref.toString() : null,
    };

    if (apkRequest.validationErrors.length > 0 || !apkRequest.options) {
        const errorMessage = 'Invalid PWA settings: ' + apkRequest.validationErrors.join(', ');
        console.error("Package request was invalid", errorMessage);
        trackEvent(analyticsInfo, errorMessage, false);
        response.status(500).send(escape(errorMessage));
        return;
    }

    try {
        console.info("Generating app package...");
        const zipFile = await packageCreator.createZip(apkRequest.options);
        response.sendFile(zipFile, {});
        trackEvent(analyticsInfo, null, true);
        console.info('Package generation completed successfully.');
    } catch (err) {
        console.error('Error generating app package', err);
        const errorString = errorToString(err);
        trackEvent(analyticsInfo, errorString, false);
        response
            .status(500)
            .send('Error generating app package: \r\n' + escape(errorString));
    }
}

async function downloadPackageZip(request: express.Request, response: express.Response): Promise<void> {
    // Get the ID of the package job from the request.
    const jobId = request.query.id;
    if (!jobId || typeof jobId !== 'string') {
        response.status(400).send('You must specify a jobId query parameter');
        return;
    }

    const job = await database.getJson<GooglePlayPackageJob>(jobId);
    if (!job) {
        console.warn("No job found with ID", jobId);
        response.status(404).send(`No job found with ID`);
        return;
    }

    if (job.status === "Failed") {
        response.status(400).send(`Job failed: ${job.errors || "Unknown error"}`);
        return;
    }

    if (job.status !== "Completed" || !job.uploadedBlobFileName) {
        response.status(400).send(`Job is not ready for download. Current status: ${job.status}`);
        return;
    }

    // Download it from Azure storage.
    const downloadStream = await blobStorage.downloadFileStream(job.uploadedBlobFileName);
    downloadStream.on('error', (err) => {
        console.error("Download zip file failed due to stream error:", err);
        if (!response.headersSent) {
            response.status(500).send("Download failed due to a stream error.");
        }
    });

    // Send back the zip.
    const hostname = new URL(job.pwaUrl).host.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${hostname} - Google Play Package.zip`;
    response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    response.setHeader('Content-Type', 'application/zip');
    downloadStream.pipe(response);
}

async function getPackageJob(request: express.Request, response: express.Response): Promise<void> {
    // Get the ID of the package job to check.
    const jobId = request.query.id;
    if (!jobId || typeof jobId !== 'string') {
        response.status(400).send('You must specify a jobId query parameter');
        return;
    }

    console.info("Received request for package job status", jobId);

    const job = await database.getJson<GooglePlayPackageJob>(jobId);
    if (!job) {
        console.warn("No job found with ID", jobId);
        response.status(404).send(`No job found with ID`);
        return;
    }

    // Send back the job as JSON.
    console.info("Request for package job completed successfully. Returning job", jobId, job.status);
    response.status(200).json(job);
}

async function enqueuePackage(request: express.Request, response: express.Response): Promise<void> {
    // Validate the request
    console.info("Received app package request");
    const apkRequest = validateAndroidOptionsRequest(request);
    const platformId = request.headers['platform-identifier'];
    const platformIdVersion = request.headers['platform-identifier-version'];
    const correlationId = request.headers['correlation-id'];
    const analyticsInfo: AnalyticsInfo = {
        url: apkRequest.options?.pwaUrl || apkRequest.options?.host || '',
        packageId: apkRequest.options?.packageId || '',
        name: apkRequest.options?.name || '',
        platformId: platformId ? platformId.toString() : null,
        platformIdVersion: platformIdVersion
            ? platformIdVersion.toString()
            : null,
        correlationId: correlationId ? correlationId.toString() : null,
        referrer: request.query.ref ? request.query.ref.toString() : null,
    };

    if (apkRequest.validationErrors.length > 0 || !apkRequest.options) {
        const errorMessage = 'Invalid PWA settings: ' + apkRequest.validationErrors.join(', ');
        console.error("Package request was invalid", errorMessage);
        trackEvent(analyticsInfo, errorMessage, false);
        response.status(500).send(escape(errorMessage));
        return;
    }

    try {
        // Enqueue the job.
        const packageOptions = apkRequest.options;
        packageOptions.analyticsInfo = analyticsInfo;
        const jobId = await packageJobQueue.enqueue(packageOptions);

        console.info(`Package job enqueued with ID ${jobId} for ${packageOptions.analysisId}`);
        response.status(200).send(jobId);
    } catch (error) {
        console.error("Failed to enqueue package job:", error);
        trackEvent(analyticsInfo, errorToString(error), false);
        response.status(500).send("Failed to enqueue package job");
    }
}

async function fetchResource(request: express.Request, response: express.Response) {
    const url = request.query.url;
    if (!url) {
        response.status(500).send('You must specify a URL');
        return;
    }
    if (typeof url !== 'string') {
        response.status(500).send('URL must be a string');
        return;
    }

    let type;
    if (
        request.query.type !== null &&
        typeof request.query.type === 'string' &&
        ['blob', 'json', 'text'].includes(request.query.type)
    ) {
        type = request.query.type;
    } else {
        type = 'text';
    }

    // SSRF PREVENTION: validate the URL before fetching!
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch (parseError) {
        response.status(400).send('Invalid URL');
        return;
    }

    // Only support http and https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        response.status(400).send('Only HTTP/HTTPS URLs are allowed');
        return;
    }

    // Block localhost and private/internal address ranges
    const forbiddenHostnames = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
        '[::1]'
    ];
    const hostname = parsedUrl.hostname.toLowerCase();
    if (forbiddenHostnames.includes(hostname)) {
        response.status(403).send('Access to localhost is forbidden');
        return;
    }
    // Prevent IP addresses in private address ranges
    function isPrivateIp(ip: string) {
        if (net.isIP(ip)) {
            // IPv4
            if (ip.startsWith('10.')) return true;
            if (ip.startsWith('192.168.')) return true;
            if (ip.startsWith('172.')) {
                const second = Number(ip.split('.')[1]);
                if (second >= 16 && second <= 31) return true;
            }
            if (ip === '127.0.0.1' || ip === '0.0.0.0') return true;
        }
        // IPv6
        if (ip === '::1') return true;
        if (ip.startsWith('fc') || ip.startsWith('fd')) return true; // Unique local address
        return false;
    }

    // If hostname is an IP, check if it's private
    if (net.isIP(hostname) && isPrivateIp(hostname)) {
        response.status(403).send('Access to private IP ranges is forbidden');
        return;
    }

    let fetchResult: Response;

    try {
        console.info("Fetching URL", parsedUrl);
        // @sarif-suppress 195 Justification: while this URL is user-provided, we check it for SSRF above.
        fetchResult = await fetch(parsedUrl);
    } catch (fetchError) {
        console.error("Unable to fetch URL", url, fetchError);
        response
            .status(500)
            .send(`Unable to initiate fetch for ${escape(url)}. Error: ${escape(String(fetchError))}`);
        return;
    }

    if (!fetchResult.ok) {
        response
            .status(fetchResult.status)
            .send(
                `Unable to fetch ${escape(url)}. Status: ${fetchResult.status}, ${escape(String(fetchResult.statusText))}`
            );
        return;
    }

    if (fetchResult.type) {
        response.type(fetchResult.type);
    }

    if (fetchResult.headers) {
        fetchResult.headers.forEach((value, name) =>
            response.setHeader(name, value)
        );
    }

    try {
        if (type === 'blob') {
            const blob = await fetchResult.arrayBuffer();
            response.status(fetchResult.status).send(Buffer.from(blob));
        } else if (type === 'json') {
            const json = await fetchResult.json();
            response.status(fetchResult.status).send(json);
        } else {
            const text = await fetchResult.text();
            response.status(fetchResult.status).send(text);
        }
    } catch (getResultError) {
        response
            .status(500)
            .send(
                `Unable to fetch result from ${escape(url)} using type ${escape(type)}. Error: ${escape(String(getResultError))}`
            );
    }
}

function validateAndroidOptionsRequest(request: express.Request): AppPackageRequest {
    const validationErrors: string[] = [];

    // If we were unable to parse AndroidPackageOptions, there's no more validation to do.
    let options: AndroidPackageOptions | null =
        tryParseOptionsFromRequest(request);
    if (!options) {
        validationErrors.push(
            "Malformed argument. Coudn't find AndroidPackageOptions in body"
        );
        return {
            options: null,
            validationErrors,
        };
    }

    // Ensure we have required fields.
    const requiredFields: Array<keyof AndroidPackageOptions> = [
        'appVersion',
        'appVersionCode',
        'backgroundColor',
        'display',
        'fallbackType',
        'host',
        'iconUrl',
        'launcherName',
        'navigationColor',
        'packageId',
        'signingMode',
        'startUrl',
        'themeColor',
        'webManifestUrl',
    ];

    // The "fullScopeUrl" field is required only for Meta Quest devices.
    if (options.isMetaQuest) {
        requiredFields.push('fullScopeUrl');
    }

    validationErrors.push(
        ...requiredFields.filter((f) => !options![f]).map((f) => `${f as string} is required`)
    );

    // We must have signing options if the signing is enabled.
    if (options.signingMode !== 'none' && !options.signing) {
        validationErrors.push(
            `Signing options are required when signing mode = '${options.signingMode}'`
        );
    }

    // If the user is supplying their own signing key, we have some additional requirements:
    // - A signing key file must be specified
    // - The signing key file must be a base64 encoded string.
    // - A store password must be supplied
    // - A key password must be supplied
    if (options.signingMode === 'mine' && options.signing) {
        // We must have a keystore file uploaded if the signing mode is use existing.
        if (!options.signing.file) {
            validationErrors.push(
                "You must supply a signing key file when signing mode = 'mine'"
            );
        }

        // Signing file must be a base 64 encoded string.
        if (options.signing.file && !options.signing.file.startsWith('data:')) {
            validationErrors.push(
                'Signing file must be a base64 encoded string containing the Android keystore file'
            );
        }

        if (!options.signing.storePassword) {
            validationErrors.push(
                "You must supply a store password when signing mode = 'mine'"
            );
        }

        if (!options.signing.keyPassword) {
            validationErrors.push(
                "You must supply a key password when signing mode = 'mine'"
            );
        }
    }

    // Validate signing option fields
    if (options.signingMode !== 'none' && options.signing) {
        console.log("options.signing", options.signing);
        // If we don't have a key password or store password, create one now.
        const passToUse = generatePassword(12, false);

        if (!options.signing.keyPassword) {
            options.signing.keyPassword = passToUse;
        }
        if (!options.signing.storePassword) {
            options.signing.storePassword = passToUse;
        }

        // Verify we have the required signing options.
        const requiredSigningOptions: Array<keyof SigningOptions> = [
            'alias',
            'keyPassword',
            'storePassword',
        ];

        // If we're creating a new key, we require additional info.
        if (options.signingMode === 'new') {
            requiredSigningOptions.push(
                'countryCode',
                'fullName',
                'organization',
                'organizationalUnit'
            );
        }

        validationErrors.push(
            ...requiredSigningOptions
                .filter((f) => !options?.signing![f])
                .map((f) => `Signing option ${f as string} is required`)
        );
    }

    return {
        options: options,
        validationErrors,
    };
}

function tryParseOptionsFromRequest(
    request: express.Request
): AndroidPackageOptions | null {
    // See if the body is our options request.
    if (request.body['packageId']) {
        return request.body as AndroidPackageOptions;
    }

    return null;
}

function packageCreationProgress(e: PackageCreationProgress) {
    if (e.level === 'error') {
        console.error(e.message);
    } else if (e.level === 'warn') {
        console.warn(e.message);
    } else {
        console.info(e.message);
    }
}

export default router;
