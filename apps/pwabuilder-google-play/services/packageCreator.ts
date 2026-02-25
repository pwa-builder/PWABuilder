import { AndroidPackageOptions } from "../models/androidPackageOptions.js";
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
 * Generates an app package ready for upload to Google Play.
 */
export class PackageCreator {
    private readonly tempFileRemovalTimeoutMs = 1000 * 60 * 10; // 10 minutes
    private readonly eventEmitter = new EventEmitter();

    /**
     * Creates a new app package ready for upload to Google Play.
     * @param packageOptions The options for the app package.
     * @returns The generated app package details, including the .aab Android App Bundle file, an .apk for testing on a local Android device, key signing information, and asset links.
     */
    public async create(packageOptions: AndroidPackageOptions): Promise<GeneratedAppPackage> {
        const startTime = Date.now();
        try {
            // Create the app package.
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
     * Creates a Google Play package and zips up the results.
     * @param packageOptions 
     */
    public async createZip(packageOptions: AndroidPackageOptions): Promise<string> {
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

    /**
   * Adds an event listener to the BubbleWrapper instance to listen for progress events.
   * @param type The type of event to listen for. Currently, only "progress" is supported.
   * @param listener The event listener to add.
   */
    addEventListener(type: "progress", listener: (e: PackageCreationProgress) => void) {
        this.eventEmitter.addListener(type, listener);
    }

    /**
     * Removes an event listener from the BubbleWrapper instance.
     * @param type The type of event to remove. Currently, only "progress" is supported.
     * @param listener The event listener to remove.
     */
    removeEventListener(type: "progress", listener: (e: PackageCreationProgress) => void) {
        this.eventEmitter.removeListener(type, listener);
    }

    private async createAppPackage(options: AndroidPackageOptions): Promise<GeneratedAppPackage> {
        this.dispatchProgressEvent(`Generating app package for ${options.pwaUrl}`);
        let projectDir: tmp.DirResult | null = null;
        try {
            // Create a temporary directory where we'll do all our work.
            this.dispatchProgressEvent(`Creating temp directory...`);
            projectDir = tmp.dirSync({ prefix: 'pwabuilder-cloudapk-' });
            const projectDirPath = projectDir.name;

            // Get the signing information.
            this.dispatchProgressEvent(`Creating signing information...`);
            const signing = await this.createLocalSigningKeyInfo(options, projectDirPath);

            // Generate the APK, keys, and digital asset links.
            return await this.createAppPackageWith403Fallback(
                options,
                projectDirPath,
                signing
            );
        } finally {
            // Schedule this directory for cleanup in the near future.
            this.scheduleTmpDirectoryCleanup(projectDir?.name);
        }
    }

    private async createAppPackageWith403Fallback(
        options: AndroidPackageOptions,
        projectDirPath: string,
        signing: LocalKeyFileSigningOptions | null
    ): Promise<GeneratedAppPackage> {
        // Create the app package.
        // If we get a get a 403 error, try again using our URL proxy service.
        //
        // We've witnessed dozens of cases where we receive a 403 forbidden from accessing a server:
        // - https://github.com/pwa-builder/PWABuilder/issues/1499
        // - https://github.com/pwa-builder/PWABuilder/issues/1476
        // - https://github.com/pwa-builder/PWABuilder/issues/1375
        // - https://github.com/pwa-builder/PWABuilder/issues/1320
        //
        // When this happens, we can swap out the APK url items with a safe proxy server that doesn't have the same issues.
        // For example, if the icon is https://foo.com/img.png, we change this to
        // https://pwabuilder.com/api/images/getSafeImageForAnalysis?imageUrl=https://foo.com/img/png
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
            if (is403Error || isTimeout) {
                const optionsWithSafeUrl = this.getAndroidOptionsWithProxiedUrls(options);
                // See if it's Cloudflare. Check the Server response header for "cloudflare".
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

            // It's not a 403 / connection refused? Just throw it.
            this.dispatchProgressEvent(`Bubblewrap failed to generated app package due to an error. ${error}`, "error");
            throw error;
        }
    }

    private async createLocalSigningKeyInfo(apkSettings: AndroidPackageOptions, projectDir: string): Promise<LocalKeyFileSigningOptions | null> {
        // If we're told not to sign it, skip this.
        if (apkSettings.signingMode === 'none') {
            return null;
        }

        // Did the user upload a key file for signing? If so, download it to our directory.
        const keyFilePath = join(projectDir, 'signingKey.keystore');
        if (apkSettings.signingMode === 'mine') {
            if (!apkSettings.signing?.file) {
                throw new Error("Signing mode is 'mine', but no signing key file was supplied.");
            }

            const fileBuffer = base64ToBuffer(apkSettings.signing.file);
            await fs.writeFile(keyFilePath, new Uint8Array(fileBuffer));
        }

        // Make sure we have signing info supplied, otherwise we received bad data.
        if (!apkSettings.signing) {
            throw new Error(
                `Signing mode was set to ${apkSettings.signingMode}, but no signing information was supplied.`
            );
        }

        return {
            keyFilePath: keyFilePath,
            ...apkSettings.signing,
        };
    }

    private TryCheckCloudflare(iconUrl: string): Promise<boolean> {
        // Do a fetch to get just the headers of the icon. If the response headers come back
        // with the Server header being "cloudflare", we know Cloudflare is in use.
        return new Promise(async (resolve) => {
            try {
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
                const filePath = file.replace(/\\/g, '/'); // Use / instead of \ otherwise del gets failed to delete files on Windows
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
        // We can't use dir.removeCallback() because it will fail with "ENOTEMPTY: directory not empty" error.
        // We can't use fs.rmdir(path, { recursive: true }) as it's supported only in Node 12+, which isn't used by our docker image.

        if (dir) {
            const dirToDelete = dir.replace(/\\/g, '/'); // Use '/' instead of '\', otherwise del gets confused and won't cleanup on Windows.
            const dirPatternToDelete = dirToDelete + '/**'; // Glob pattern to delete subdirectories and files
            console.info('Scheduled cleanup for tmp directory', dirPatternToDelete);
            const delDir = function () {
                deleteAsync([dirPatternToDelete], { force: true }) // force allows us to delete files outside of workspace
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

    private getAndroidOptionsWithProxiedUrls(options: AndroidPackageOptions): AndroidPackageOptions {
        const absoluteUrlProps: Array<keyof AndroidPackageOptions> = [
            'maskableIconUrl',
            'monochromeIconUrl',
            'iconUrl',
            'webManifestUrl',
        ];
        const newOptions: AndroidPackageOptions = { ...options };
        for (let prop of absoluteUrlProps) {
            const url = newOptions[prop];
            if (url && typeof url === 'string') {
                const absoluteUrl = new URL(url, options.webManifestUrl);
                const isManifestUrl = prop === 'webManifestUrl';
                if (isManifestUrl) {
                    // We have a special endpoint for manifests that checks the PWABuilder web string cache first.
                    (newOptions as any)[prop] = `https://pwabuilder.com/api/manifests/getFromCacheOrProxy?manifestUrl=${encodeURIComponent(absoluteUrl.toString())}`;
                    this.dispatchProgressEvent(`Updated manifest URL to use manifest proxy. Old value ${options.webManifestUrl}, new value ${(newOptions)[prop]}`);
                } else {
                    // Otherwise, use the image proxy.
                    (newOptions as any)[prop] = PackageCreator.getImageProxyUrl(absoluteUrl, options.analysisId);
                    this.dispatchProgressEvent(`Updated ${prop} to use image proxy. Old value ${options[prop]}, new value ${(newOptions)[prop]}`);
                }
            }
        }

        // Also, any shortcut images should be proxied too.
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
    async zipAppPackage(appPackage: GeneratedAppPackage, apkOptions: AndroidPackageOptions): Promise<string> {
        this.dispatchProgressEvent("Zipping app package...");
        const apkName = `${apkOptions.name}${apkOptions.signingMode === 'none' ? '-unsigned' : ''}.apk`;
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
                    prefix: 'pwabuilder-cloudapk-',
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

                // Append the APK and next steps readme.
                const isSigned = !!appPackage.signingInfo;
                archive.file(appPackage.apkFilePath, { name: apkName });
                archive.file(
                    isSigned ? './static/next-steps.html' : './static/next-steps-unsigned.html',
                    { name: 'Readme.html' }
                );

                // If we've signed it, we should have signing info, asset links file, and app bundle.
                if (appPackage.signingInfo && appPackage.signingInfo.keyFilePath) {
                    archive.file(appPackage.signingInfo.keyFilePath, {
                        name: 'signing.keystore',
                    });
                    const readmeContents = [
                        "Keep this file and signing.keystore in a safe place. You'll need these files if you want to upload future versions of your PWA to the Google Play Store.\r\n",
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

                    // Zip up the asset links.
                    if (appPackage.assetLinkFilePath) {
                        archive.file(appPackage.assetLinkFilePath, {
                            name: 'assetlinks.json',
                        });
                    }
                }

                // Zip up the app bundle as well.
                if (appPackage.appBundleFilePath) {
                    archive.file(appPackage.appBundleFilePath, {
                        name: `${apkOptions.name}${apkOptions.signingMode === 'none' ? '-unsigned' : ''}.aab`,
                    });
                }

                // Add the source code directory if need be.
                if (apkOptions.includeSourceCode) {
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

    private analyticsTrackPackageCreationSuccess(options: AndroidPackageOptions) {
        const analyticsInfo = this.androidOptionsToAnalyticsInfo(options);
        trackEvent(analyticsInfo, null, true);
    }

    private analyticsTrackPackageCreationFailure(options: AndroidPackageOptions, error: string) {
        const analyticsInfo = this.androidOptionsToAnalyticsInfo(options);
        trackEvent(analyticsInfo, error, false);
    }

    private androidOptionsToAnalyticsInfo(options: AndroidPackageOptions): AnalyticsInfo {
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
        this.eventEmitter.emit("progress", e); // Bubble it up.
    }

    private dispatchProgressEvent(message: string, level: "info" | "warn" | "error" = "info"): void {
        const event: PackageCreationProgress = { message, level };
        this.eventEmitter.emit("progress", event);
    }
}