import { MetaHorizonPackageOptions } from "../models/metaHorizonPackageOptions.js";
import { GeneratedAppPackage } from "../models/generatedAppPackage.js";
import tmp from "tmp";
import { LocalKeyFileSigningOptions } from "../models/signingOptions.js";
import { BubbleWrapper } from './bubbleWrapper.js';
import { join } from "path";
import fs from 'fs-extra';
import { base64ToBuffer } from "../utils/base64ToBuffer.js";
import archiver from 'archiver';
import { deleteAsync } from 'del';
import { AnalyticsInfo, trackEvent } from './analytics.js';
import { msToFriendly } from "../utils/msToFriendly.js";
import { PackageCreationProgress } from "../models/packageCreationProgress.js";
import EventEmitter from "events";
import { errorToString } from "../utils/errorToString.js";

/**
 * Generates an app package ready for upload to the Meta Horizon Store.
 */
export class PackageCreator {
    private readonly tempFileRemovalTimeoutMs = 1000 * 60 * 10; // 10 minutes
    private readonly eventEmitter = new EventEmitter();

    /**
     * Creates a new app package ready for upload to the Meta Horizon Store.
     */
    public async create(packageOptions: MetaHorizonPackageOptions): Promise<GeneratedAppPackage> {
        const startTime = Date.now();
        try {
            const appPackage = await this.createAppPackage(packageOptions);
            this.dispatchProgressEvent(`Successfully created app package for ${packageOptions.pwaUrl}`);
            this.analyticsTrackPackageCreationSuccess(packageOptions);
            return appPackage;
        } catch (err) {
            const errorStr = errorToString(err);
            this.dispatchProgressEvent(`Error creating app package: ${errorStr}`, "error");
            this.analyticsTrackPackageCreationFailure(packageOptions, errorStr);
            throw err;
        } finally {
            const durationMs = Date.now() - startTime;
            this.dispatchProgressEvent(`Process completed in ${msToFriendly(durationMs)}`);
        }
    }

    /**
     * Creates a Meta Horizon package and zips up the results.
     */
    public async createZip(packageOptions: MetaHorizonPackageOptions): Promise<string> {
        const appPackage = await this.create(packageOptions);
        try {
            const zipFilePath = await this.zipAppPackage(appPackage, packageOptions);
            return zipFilePath;
        } catch (err) {
            const errorStr = errorToString(err);
            this.dispatchProgressEvent(`Error zipping app package: ${errorStr}`, "error");
            this.analyticsTrackPackageCreationFailure(packageOptions, errorStr);
            throw err;
        }
    }

    addEventListener(type: "progress", listener: (e: PackageCreationProgress) => void) {
        this.eventEmitter.addListener(type, listener);
    }

    removeEventListener(type: "progress", listener: (e: PackageCreationProgress) => void) {
        this.eventEmitter.removeListener(type, listener);
    }

    private async createAppPackage(options: MetaHorizonPackageOptions): Promise<GeneratedAppPackage> {
        this.dispatchProgressEvent(`Generating Meta Horizon app package for ${options.pwaUrl}`);
        let projectDir: tmp.DirResult | null = null;
        try {
            this.dispatchProgressEvent(`Creating temp directory...`);
            projectDir = tmp.dirSync({ prefix: 'pwabuilder-metahorizon-' });
            const projectDirPath = projectDir.name;

            this.dispatchProgressEvent(`Creating signing information...`);
            const signing = await this.createLocalSigningKeyInfo(options, projectDirPath);

            return await this.createAppPackageWith403Fallback(
                options,
                projectDirPath,
                signing
            );
        } finally {
            this.scheduleTmpDirectoryCleanup(projectDir?.name);
        }
    }

    /**
     * Returns true if the given URL is considered safe to fetch from this service.
     */
    private isSafeUrlForFetch(url: string): boolean {
        if (!url) {
            return false;
        }
        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            return false;
        }

        const protocol = parsed.protocol.toLowerCase();
        if (protocol !== 'http:' && protocol !== 'https:') {
            return false;
        }

        const hostname = parsed.hostname.toLowerCase();

        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname.endsWith('.localhost') ||
            hostname.endsWith('.local') ||
            hostname.endsWith('.localdomain') ||
            hostname.endsWith('.internal')
        ) {
            return false;
        }

        return true;
    }

    private async createAppPackageWith403Fallback(
        options: MetaHorizonPackageOptions,
        projectDirPath: string,
        signing: LocalKeyFileSigningOptions | null
    ): Promise<GeneratedAppPackage> {
        // If we get a 403 error or timeout, retry using PWABuilder's URL proxy service.
        const http1Fetch = 'node-fetch';
        const http2Fetch = 'fetch-h2';
        try {
            const bubbleWrapper = new BubbleWrapper(
                options,
                projectDirPath,
                signing,
                http1Fetch
            );
            this.dispatchProgressEvent('Using Bubblewrap to generate app package...');
            bubbleWrapper.addEventListener("progress", e => this.bubblewrapProgress(e))
            return await bubbleWrapper.generateAppPackage();
        } catch (error) {
            const errorMessage = (error as Error)?.message || `${error}`;
            this.dispatchProgressEvent("Unable to generate app package due to error. Checking if error is 403 Forbidden or timeout. " + errorMessage, "warn");
            const is403Error =
                (error as any)?.status === 403 ||
                (error as any)?.response?.status === 403 ||
                errorMessage.includes('403') ||
                errorMessage.includes('ECONNREFUSED') ||
                errorMessage.includes('ENOTFOUND');
            const isTimeout = errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ESOCKETTIMEDOUT');
            const isRunDotAppManifestError = options.pwaUrl.indexOf("run.app/") && errorMessage.includes("Unexpected token");
            if (is403Error || isTimeout || isRunDotAppManifestError) {
                const optionsWithSafeUrl = this.getMetaHorizonOptionsWithProxiedUrls(options);
                const isCloudflare = await this.TryCheckCloudflare(options.iconUrl);
                if (isCloudflare) {
                    this.dispatchProgressEvent("Cloudflare is blocking PWABuilder from accessing your app's images. If the problem persists, please temporarily disable Cloudflare's \"Bot fight mode\" while you're packaging with PWABuilder. For more help, see https://docs.pwabuilder.com/#/builder/faq?id=error-403-forbidden-during-analysis-or-packaging", "warn");
                } else {
                    this.dispatchProgressEvent("Your web app is blocking PWABuilder from accessing your app's images, serving 403 Forbidden errors to PWABuilder. If the problem persists, please temporarily disable your firewall, CDN, or Cloudflare while packaging with PWABuilder. For more help, see https://docs.pwabuilder.com/#/builder/faq?id=error-403-forbidden-during-analysis-or-packaging", "warn");
                }
                const bubbleWrapper = new BubbleWrapper(
                    optionsWithSafeUrl,
                    projectDirPath,
                    signing,
                    http2Fetch
                );
                bubbleWrapper.addEventListener("progress", e => this.bubblewrapProgress(e));
                return await bubbleWrapper.generateAppPackage();
            }

            this.dispatchProgressEvent(`Bubblewrap failed to generate an app package due to an error. ${error}`, "error");
            throw error;
        }
    }

    private async createLocalSigningKeyInfo(packageSettings: MetaHorizonPackageOptions, projectDir: string): Promise<LocalKeyFileSigningOptions | null> {
        if (packageSettings.signingMode === 'none') {
            return null;
        }

        const keyFilePath = join(projectDir, 'signingKey.keystore');
        if (packageSettings.signingMode === 'mine') {
            if (!packageSettings.signing?.file) {
                throw new Error("Signing mode is 'mine', but no signing key file was supplied.");
            }

            const fileBuffer = base64ToBuffer(packageSettings.signing.file);
            await fs.writeFile(keyFilePath, new Uint8Array(fileBuffer));
        }

        if (!packageSettings.signing) {
            throw new Error(
                `Signing mode was set to ${packageSettings.signingMode}, but no signing information was supplied.`
            );
        }

        return {
            keyFilePath: keyFilePath,
            ...packageSettings.signing,
        };
    }

    private TryCheckCloudflare(iconUrl: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            try {
                if (!this.isSafeUrlForFetch(iconUrl)) {
                    resolve(false);
                    return;
                }

                const response = await fetch(iconUrl, { method: 'GET' });
                const serverHeader = response.headers.get('Server') || '';
                resolve(!!serverHeader && serverHeader.includes('cloudflare'));
            } catch (error) {
                resolve(false);
            }
        });
    }

    private scheduleTmpFileCleanup(file: string | null): void {
        if (file) {
            console.info('Scheduled cleanup for tmp file', file);
            const delFile = function () {
                const filePath = file.replace(/\\/g, '/');
                deleteAsync([filePath], { force: true })
                    .then((deletedPaths: string[]) =>
                        console.info('Cleaned up tmp file', deletedPaths)
                    )
                    .catch((err: any) =>
                        console.warn(
                            'Unable to cleanup tmp file. It will be cleaned up on process exit',
                            err,
                            filePath
                        )
                    );
            };
            setTimeout(() => delFile(), this.tempFileRemovalTimeoutMs);
        }
    }

    private scheduleTmpDirectoryCleanup(dir?: string | null): void {
        if (dir) {
            const dirToDelete = dir.replace(/\\/g, '/');
            const dirPatternToDelete = dirToDelete + '/**';
            console.info('Scheduled cleanup for tmp directory', dirPatternToDelete);
            const delDir = function () {
                deleteAsync([dirPatternToDelete], { force: true })
                    .then((deletedPaths: string[]) =>
                        console.info(
                            'Cleaned up tmp directory',
                            dirPatternToDelete,
                            deletedPaths?.length,
                            'subdirectories and files were deleted'
                        )
                    )
                    .catch((err: any) =>
                        console.warn(
                            'Unable to cleanup tmp directory. It will be cleaned up on process exit',
                            err
                        )
                    );
            };
            setTimeout(() => delDir(), this.tempFileRemovalTimeoutMs);
        }
    }

    private getMetaHorizonOptionsWithProxiedUrls(options: MetaHorizonPackageOptions): MetaHorizonPackageOptions {
        const absoluteUrlProps: Array<keyof MetaHorizonPackageOptions> = [
            'maskableIconUrl',
            'monochromeIconUrl',
            'iconUrl',
            'webManifestUrl',
        ];
        const newOptions: MetaHorizonPackageOptions = { ...options };
        for (let prop of absoluteUrlProps) {
            const url = newOptions[prop];
            if (url && typeof url === 'string') {
                const absoluteUrl = new URL(url, options.webManifestUrl);
                const isManifestUrl = prop === 'webManifestUrl';
                if (isManifestUrl) {
                    (newOptions as any)[prop] = `https://pwabuilder.com/api/manifests/getFromCacheOrProxy?manifestUrl=${encodeURIComponent(absoluteUrl.toString())}`;
                    this.dispatchProgressEvent(`Updated manifest URL to use manifest proxy. Old value ${options.webManifestUrl}, new value ${(newOptions)[prop]}`);
                } else {
                    (newOptions as any)[prop] = PackageCreator.getImageProxyUrl(absoluteUrl, options.analysisId);
                    this.dispatchProgressEvent(`Updated ${prop} to use image proxy. Old value ${options[prop]}, new value ${(newOptions)[prop]}`);
                }
            }
        }

        if (newOptions.shortcuts && Array.isArray(newOptions.shortcuts)) {
            newOptions.shortcuts.forEach(shortcut => {
                (shortcut.icons || [])
                    .filter(icon => !!icon.src)
                    .forEach(icon => {
                        const oldValue = icon.src;
                        icon.src = PackageCreator.getImageProxyUrl(new URL(icon.src, options.webManifestUrl), options.analysisId);
                        this.dispatchProgressEvent(`Updated shortcut icon to use image proxy. Old value ${oldValue}, new value ${icon.src}`);
                    });
            });
        }

        return newOptions;
    }

    private static getImageProxyUrl(imageUrl: URL, analysisId: string | null): string {
        return `https://pwabuilder.com/api/images/getSafeImageForAnalysis?imageUrl=${encodeURIComponent(imageUrl.toString())}&analysisId=${encodeURIComponent(analysisId || "")}`;
    }

    /***
     * Creates a zip file containing the app package and associated artifacts.
     */
    async zipAppPackage(appPackage: GeneratedAppPackage, packageOptions: MetaHorizonPackageOptions): Promise<string> {
        this.dispatchProgressEvent("Zipping app package...");
        const apkName = `${packageOptions.name}${packageOptions.signingMode === 'none' ? '-unsigned' : ''}.apk`;
        let tmpZipFile: string | null = null;

        return new Promise((resolve, reject) => {
            try {
                const archive = archiver('zip', {
                    zlib: { level: 5 },
                });

                archive.on('warning', function (zipWarning: any) {
                    console.warn('Warning during zip creation', zipWarning);
                });
                archive.on('error', function (zipError: any) {
                    console.error('Error during zip creation', zipError);
                    reject(zipError);
                });

                tmpZipFile = tmp.tmpNameSync({
                    prefix: 'pwabuilder-metahorizon-',
                    postfix: '.zip',
                });
                const output = fs.createWriteStream(tmpZipFile);
                output.on('close', () => {
                    if (tmpZipFile) {
                        this.dispatchProgressEvent("App package zipped successfully.");
                        resolve(tmpZipFile);
                    } else {
                        this.dispatchProgressEvent("An error occurred while creating the zip file.", "error");
                        reject('No zip file was created');
                    }
                });

                archive.pipe(output);

                const isSigned = !!appPackage.signingInfo;
                archive.file(appPackage.apkFilePath, { name: apkName });
                archive.file(
                    isSigned ? './static/next-steps.html' : './static/next-steps-unsigned.html',
                    { name: 'Readme.html' }
                );

                if (appPackage.signingInfo && appPackage.signingInfo.keyFilePath) {
                    archive.file(appPackage.signingInfo.keyFilePath, {
                        name: 'signing.keystore',
                    });
                    const readmeContents = [
                        "Keep this file and signing.keystore in a safe place. You'll need these files if you want to upload future versions of your PWA to the Meta Horizon Store.\r\n",
                        'Key store file: signing.keystore',
                        `Key store password: ${appPackage.signingInfo.storePassword}`,
                        `Key alias: ${appPackage.signingInfo.alias}`,
                        `Key password: ${appPackage.signingInfo.keyPassword}`,
                        `Signer's full name: ${appPackage.signingInfo.fullName}`,
                        `Signer's organization: ${appPackage.signingInfo.organization}`,
                        `Signer's organizational unit: ${appPackage.signingInfo.organizationalUnit}`,
                        `Signer's country code: ${appPackage.signingInfo.countryCode}`,
                    ];
                    archive.append(readmeContents.join('\r\n'), {
                        name: 'signing-key-info.txt',
                    });

                    if (appPackage.assetLinkFilePath) {
                        archive.file(appPackage.assetLinkFilePath, {
                            name: 'assetlinks.json',
                        });
                    }
                }

                if (appPackage.appBundleFilePath) {
                    archive.file(appPackage.appBundleFilePath, {
                        name: `${packageOptions.name}${packageOptions.signingMode === 'none' ? '-unsigned' : ''}.aab`,
                    });
                }

                if (packageOptions.includeSourceCode) {
                    archive.directory(appPackage.projectDirectory, 'source');
                }

                archive.finalize();
            } catch (err) {
                reject(err);
            } finally {
                this.scheduleTmpFileCleanup(tmpZipFile);
            }
        });
    }

    private analyticsTrackPackageCreationSuccess(options: MetaHorizonPackageOptions) {
        const analyticsInfo = this.metaHorizonOptionsToAnalyticsInfo(options);
        trackEvent(analyticsInfo, null, true);
    }

    private analyticsTrackPackageCreationFailure(options: MetaHorizonPackageOptions, error: string) {
        const analyticsInfo = this.metaHorizonOptionsToAnalyticsInfo(options);
        trackEvent(analyticsInfo, error, false);
    }

    private metaHorizonOptionsToAnalyticsInfo(options: MetaHorizonPackageOptions): AnalyticsInfo {
        return {
            url: options.pwaUrl || options.host || '',
            packageId: options.packageId || '',
            name: options.name || '',
            platformId: options.analyticsInfo?.platformId || null,
            platformIdVersion: options.analyticsInfo?.platformIdVersion || null,
            correlationId: options.analyticsInfo?.correlationId || null,
            referrer: options.analyticsInfo?.referrer || null,
        };
    }

    private bubblewrapProgress(e: PackageCreationProgress): void {
        this.eventEmitter.emit("progress", e);
    }

    private dispatchProgressEvent(message: string, level: "info" | "warn" | "error" = "info"): void {
        const event: PackageCreationProgress = { message, level };
        this.eventEmitter.emit("progress", event);
    }
}
