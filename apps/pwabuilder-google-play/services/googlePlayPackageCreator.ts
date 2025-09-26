import { AndroidPackageOptions } from "../models/androidPackageOptions";
import { GeneratedAppPackage } from "../models/generatedAppPackage";
import tmp from "tmp";
import { LocalKeyFileSigningOptions } from "../models/signingOptions";
import { BubbleWrapper } from '../services/bubbleWrapper.js';
import { join } from "path";
import fs from 'fs-extra';
import { base64ToBuffer } from "../utils/base64ToBuffer.js";
import archiver from 'archiver';
import { deleteAsync } from 'del';
import { AnalyticsInfo, trackEvent } from '../services/analytics.js';
import { errorToString } from '../packaging/utils.js';
import { msToFriendly } from "../utils/msToFriendly.js";

/**
 * Generates an app package ready for upload to Google Play.
 */
class GooglePlayPackageGenerator {
    private readonly tempFileRemovalTimeoutMs = 1000 * 60 * 5; // 5 minutes

    public async create(packageOptions: AndroidPackageOptions): Promise<GeneratedAppPackage> {
      const startTime = Date.now();
      try {
        // Create the app package./
        const appPackage = await this.createAppPackage(packageOptions);

        // Create our zip file containing the app package, readme, and signing info.
        const zipFile = await this.zipAppPackage(appPackage, packageOptions);

        // Upload the zip file to Azure Blob Storage
          
          this.analyticsTrackPackageCreationSuccess(packageOptions);
          console.info('Package generation completed successfully.');
      } catch (err) {
          console.error('Error generating app package', err);
          const errorString = errorToString(err);
          this.analyticsTrackPackageCreationFailure(packageOptions, errorString);
          throw err;
      } finally {
        const durationMs = Date.now() - startTime;
        console.info(`Finished generating package for ${packageOptions.pwaUrl} in ${msToFriendly(durationMs)}`);
      }
    }

    private async createAppPackage(options: AndroidPackageOptions): Promise<GeneratedAppPackage> {
      console.log("Generating app package", options.pwaUrl);
      let projectDir: tmp.DirResult | null = null;
      try {
        // Create a temporary directory where we'll do all our work.
        console.info("Creating temp directory...");
        projectDir = tmp.dirSync({ prefix: 'pwabuilder-cloudapk-' });
        const projectDirPath = projectDir.name;

        // Get the signing information.
        console.info("Creating signing information...");
        const signing = await this.createLocalSigninKeyInfo(options, projectDirPath);

        // Generate the APK, keys, and digital asset links.
        return await this.createAppPackageWith403Fallback(
          options,
          projectDirPath,
          signing
        );
      } finally {
        // Schedule this directory for cleanup in the near future.
        scheduleTmpDirectoryCleanup(projectDir?.name);
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
    // https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl?url=https://foo.com/img/png
    const http1Fetch = 'node-fetch';
    const http2Fetch = 'fetch-h2';
    try {
      const bubbleWrapper = new BubbleWrapper(
        options,
        projectDirPath,
        signing,
        http1Fetch
      );
      return await bubbleWrapper.generateAppPackage();
    } catch (error) {
      const errorMessage = (error as Error)?.message || '';
      console.error('Unable to generate app package due to error. Checking if error is 403.', errorMessage);
      const is403Error =
        errorMessage.includes('403') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ENOTFOUND');
      if (is403Error) {
        const optionsWithSafeUrl = getAndroidOptionsWithSafeUrls(options);
        console.warn(
          'Encountered 403 error when generating app package. Retrying with safe URL proxy.',
          error,
          optionsWithSafeUrl
        );
        const bubbleWrapper = new BubbleWrapper(
          optionsWithSafeUrl,
          projectDirPath,
          signing,
          http2Fetch
        );
        return await bubbleWrapper.generateAppPackage();
      }

      // It's not a 403 / connection refused? Just throw it.
      console.error('Bubblewrap failed to generated app package.', error);
      throw error;
    }
  }

  private async createLocalSigninKeyInfo(apkSettings: AndroidPackageOptions, projectDir: string): Promise<LocalKeyFileSigningOptions | null> {
    // If we're told not to sign it, skip this.
    if (apkSettings.signingMode === 'none') {
      return null;
    }

    // Did the user upload a key file for signing? If so, download it to our directory.
    const keyFilePath = join(projectDir, 'signingKey.keystore');
    if (apkSettings.signingMode === 'mine') {
      if (!apkSettings.signing?.file) {
        throw new Error(
          "Signing mode is 'mine', but no signing key file was supplied."
        );
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

  /***
   * Creates a zip file containing the app package and associated artifacts.
   */
  private zipAppPackage(
    appPackage: GeneratedAppPackage,
    apkOptions: AndroidPackageOptions
  ): Promise<string> {
    console.info("Zipping app package...");
    const apkName = `${apkOptions.name}${
      apkOptions.signingMode === 'none' ? '-unsigned' : ''
    }.apk`;
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
            resolve(tmpZipFile);
          } else {
            reject('No zip file was created');
          }
        });

        archive.pipe(output);

        // Append the APK and next steps readme.
        const isSigned = !!appPackage.signingInfo;
        archive.file(appPackage.apkFilePath, { name: apkName });
        archive.file(
          isSigned ? './Next-steps.html' : './Next-steps-unsigned.html',
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
            name: `${apkOptions.name}${
              apkOptions.signingMode === 'none' ? '-unsigned' : ''
            }.aab`,
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

  scheduleTmpFileCleanup(file: string | null) {
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

  private scheduleTmpDirectoryCleanup(dir?: string | null) {
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

  private getAndroidOptionsWithSafeUrls(options: AndroidPackageOptions): AndroidPackageOptions {
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
        const safeUrlFetcherEndpoint = 'https://pwabuilder.com/api/images/getsafeimageforanalysis';
        const safeUrl = `${safeUrlFetcherEndpoint}?imageUrl=${encodeURIComponent(url)}`;
        (newOptions[prop] as any) = safeUrl;
      }
    }
    return newOptions;
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
}