import express from 'express';
import escape from 'escape-html';
import tmp from 'tmp';
import net from 'net';
import fetch, { Response } from 'node-fetch';
import { AnalyticsInfo, trackEvent } from '../services/analytics.js';
import { PackageCreator } from '../services/packageCreator.js';
import { PackageCreationProgress } from '../models/packageCreationProgress.js';
import { errorToString } from "../utils/errorToString.js";
import { packageJobQueue } from "../services/packageJobQueue.js";
import { redisService } from "../services/redisService.js";
import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";
import { blobStorage } from "../services/azureStorageBlobService.js";
import { validateAndroidOptionsRequest } from '../utils/android-options-validation.js';

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
 * Health check endpoint that returns the current package job queue length.
 * Useful for monitoring and diagnostics.
 */
router.get('/health', async (_: express.Request, response: express.Response) => {
    try {
        const queueLength = await packageJobQueue.getQueueLength();
        const processedLastHour = await packageJobQueue.getProcessedCountLastHour();
        const runningTimeMs = Date.now() - packageJobQueue.getStartDate().getTime();
        const twoHoursInMs = 2 * 60 * 60 * 1000;
        let errorMessage = "";
        if (queueLength >= 50) {
            errorMessage = `Google Play package job queue length is high: ${queueLength} jobs are currently in the queue.`;
        } else if (queueLength > 5 && processedLastHour < 1 && runningTimeMs > twoHoursInMs) {
            errorMessage = `Google Play package jobs processed in the last hour is low: only ${processedLastHour} jobs were processed in the previous 60 minutes by the current instance.`;
        }

        const totalSeconds = Math.floor(runningTimeMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const numFormat = new Intl.NumberFormat('en', { minimumIntegerDigits: 2 });
        const runningTime = `${numFormat.format(hours)}:${numFormat.format(minutes)}:${numFormat.format(seconds)}`;
        const statusCode = errorMessage ? 500 : 200;
        response.status(statusCode).json({
            status: errorMessage ? 'unhealthy' : 'healthy',
            googlePlayPackageQueueLength: queueLength,
            googlePlayPackagesProcessedInLastHour: processedLastHour,
            runningTime: runningTime,
            errorMessage: errorMessage
        });
    } catch (error) {
        console.error("Error getting queue length for health check", error);
        response.status(500).json({ status: 'unhealthy', error: 'Failed to retrieve queue length' });
    }
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
    const apkRequest = validateAndroidOptionsRequest(request.body);
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

    const job = await redisService.getJson<GooglePlayPackageJob>(jobId);
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

    const job = await redisService.getJson<GooglePlayPackageJob>(jobId);
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
    const apkRequest = validateAndroidOptionsRequest(request.body);
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
