import express, { response } from 'express';
import { BubbleWrapper } from '../build/bubbleWrapper.js';
import { AndroidPackageOptions as AndroidPackageOptions } from '../build/androidPackageOptions.js';
import { join } from 'path';
import tmp, { dir } from 'tmp';
import archiver from 'archiver';
import fs from 'fs-extra';
import {
  LocalKeyFileSigningOptions,
  SigningOptions,
} from '../build/signingOptions.js';
import { deleteAsync } from 'del';
import { GeneratedAppPackage } from '../build/generatedAppPackage.js';
import { AppPackageRequest } from '../build/appPackageRequest.js';
import generatePassword from 'password-generator';
import fetch, { Response } from 'node-fetch';
import { logUrlResult } from '../build/urlLogger.js';
import { errorToString } from '../build/utils.js';
import { AnalyticsInfo, trackEvent } from '../build/analytics.js';

const router = express.Router();

const tempFileRemovalTimeoutMs = 1000 * 60 * 5; // 5 minutes
tmp.setGracefulCleanup(); // remove any tmp file artifacts on process exit

/**
 * Generates an APK package and zips it up along with the signing key info. Sends back the zip file.
 * Expects a POST body containing @see ApkOptions form data.
 */
router.post(
  ['/generateAppPackage', '/generateApkZip'],
  async function (request: express.Request, response: express.Response) {
    const apkRequest = validateApkRequest(request);
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
      const errorMessage =
        'Invalid PWA settings: ' + apkRequest.validationErrors.join(', ');
      logUrlResult(
        apkRequest.options?.pwaUrl || apkRequest.options?.host || '',
        false,
        errorMessage
      );
      trackEvent(analyticsInfo, errorMessage, false);
      response.status(500).send(errorMessage);
      return;
    }

    try {
      const appPackage = await createAppPackage(apkRequest.options);

      // Create our zip file containing the APK, readme, and signing info.
      const zipFile = await zipAppPackage(appPackage, apkRequest.options);
      response.sendFile(zipFile, {});
      logUrlResult(
        apkRequest.options.pwaUrl || apkRequest.options.host,
        true,
        null
      );
      trackEvent(analyticsInfo, null, true);
      console.info('Process completed successfully.');
    } catch (err) {
      console.error('Error generating app package', err);
      const errorString = errorToString(err);
      logUrlResult(
        apkRequest.options.pwaUrl || apkRequest.options.host,
        false,
        'Error generating app package ' + errorToString
      );
      trackEvent(analyticsInfo, errorString, false);
      response
        .status(500)
        .send('Error generating app package: \r\n' + errorString);
    }
  }
);

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
router.get(
  '/fetch',
  async function (request: express.Request, response: express.Response) {
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

    let fetchResult: Response;

    try {
      fetchResult = await fetch(url);
    } catch (fetchError) {
      response
        .status(500)
        .send(`Unable to initiate fetch for ${url}. Error: ${fetchError}`);
      return;
    }

    if (!fetchResult.ok) {
      response
        .status(fetchResult.status)
        .send(
          `Unable to fetch ${url}. Status: ${fetchResult.status}, ${fetchResult.statusText}`
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
          `Unable to fetch result from ${url} using type ${type}. Error: ${getResultError}`
        );
    }
  }
);

function validateApkRequest(request: express.Request): AppPackageRequest {
  const validationErrors: string[] = [];

  // If we were unable to parse ApkOptions, there's no more validation to do.
  let options: AndroidPackageOptions | null =
    tryParseOptionsFromRequest(request);
  if (!options) {
    validationErrors.push(
      "Malformed argument. Coudn't find ApkOptions in body"
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
    ...requiredFields.filter((f) => !options![f]).map((f) => `${f} is required`)
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
        .map((f) => `Signing option ${f} is required`)
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

async function createAppPackage(
  options: AndroidPackageOptions
): Promise<GeneratedAppPackage> {
  let projectDir: tmp.DirResult | null = null;
  try {
    // Create a temporary directory where we'll do all our work.
    projectDir = tmp.dirSync({ prefix: 'pwabuilder-cloudapk-' });
    const projectDirPath = projectDir.name;

    // Get the signing information.
    const signing = await createLocalSigninKeyInfo(options, projectDirPath);

    // Generate the APK, keys, and digital asset links.
    return await createAppPackageWith403Fallback(
      options,
      projectDirPath,
      signing
    );
  } finally {
    // Schedule this directory for cleanup in the near future.
    scheduleTmpDirectoryCleanup(projectDir?.name);
  }
}

async function createAppPackageWith403Fallback(
  options: AndroidPackageOptions,
  projectDirPath: string,
  signing: LocalKeyFileSigningOptions | null
) {
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
    console.log('ERROR MESSAGE', errorMessage);
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

async function createLocalSigninKeyInfo(
  apkSettings: AndroidPackageOptions,
  projectDir: string
): Promise<LocalKeyFileSigningOptions | null> {
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
    await fs.promises.writeFile(keyFilePath, fileBuffer);
  }

  function base64ToBuffer(base64: string): Buffer {
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base 64 string');
    }

    return Buffer.from(matches[2], 'base64');
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
async function zipAppPackage(
  appPackage: GeneratedAppPackage,
  apkOptions: AndroidPackageOptions
): Promise<string> {
  console.info('Zipping app package with options', appPackage, apkOptions);
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
      scheduleTmpFileCleanup(tmpZipFile);
    }
  });
}

function scheduleTmpFileCleanup(file: string | null) {
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
    setTimeout(() => delFile(), tempFileRemovalTimeoutMs);
  }
}

function scheduleTmpDirectoryCleanup(dir?: string | null) {
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
    setTimeout(() => delDir(), tempFileRemovalTimeoutMs);
  }
}

function getAndroidOptionsWithSafeUrls(
  options: AndroidPackageOptions
): AndroidPackageOptions {
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
      const safeUrlFetcherEndpoint =
        'https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl';
      const safeUrl = `${safeUrlFetcherEndpoint}?url=${encodeURIComponent(
        url
      )}`;
      (newOptions[prop] as any) = safeUrl;
    }
  }
  return newOptions;
}

export default router;
