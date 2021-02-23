import { fileSave } from 'browser-fs-access';
import {
  validateAndroidOptions,
  AndroidApkOptions,
  generatePackageId,
} from '../../utils/android-validation';
import { env } from '../../utils/environment';
import { findSuitableIcon } from '../../utils/icons';
import { getURL } from '../app-info';
import { getManifest, getManiURL } from '../manifest';

export async function generateAndroidPackage(
  androidOptions: AndroidApkOptions
) {
  const validationErrors = validateAndroidOptions(androidOptions);
  if (validationErrors.length > 0 || !androidOptions) {
    throw new Error(
      'Invalid Adroid options. ' + validationErrors.map(a => a.error).join('\n')
    );
  }

  const generateAppUrl = `${env.androidPackageGeneratorUrl}/generateAppPackage`;

  try {
    const response = await fetch(generateAppUrl, {
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }),
      body: JSON.stringify(androidOptions),
    });

    if (response.status === 200) {
      return await response.blob();
    } else {
      const responseText = await response.text();

      // Did it fail because images couldn't be fetched with ECONNREFUSED? E.g. https://github.com/pwa-builder/PWABuilder/issues/1312
      // If so, retry using our downloader proxy service.
      const hasSafeImages =
        androidOptions.iconUrl &&
        androidOptions.iconUrl.includes(env.safeUrlFetcher || '');
      const isConnectionRefusedOrForbidden =
        (responseText || '').includes('ECONNREFUSED') ||
        response.status === 403;

      if (!hasSafeImages && isConnectionRefusedOrForbidden) {
        console.warn(
          'Android package generation failed with ECONNREFUSED. Retrying with safe images.',
          responseText
        );
        const updatedOptions = updateAndroidOptionsWithSafeUrls(androidOptions);

        await generateAndroidPackage(updatedOptions);
      } else {
        throw new Error(
          `Error generating Android package.\n\nStatus code: ${response.status}\n\nError: ${response.statusText}\n\nDetails: ${responseText}`
        );
      }
    }
  } catch (err) {
    throw new Error(
      `Error generating Android platform due to HTTP error.\n\nStatus code: ${err.status}\n\nError: ${err.statusText}\n\nDetails: ${err}`
    );
  }
}

export function createAndroidPackageOptionsFromManifest(): AndroidApkOptions {
  const manifest = getManifest();
  if (!manifest) {
    throw new Error(
      'Could not find the web manifest'
    );
  }

  const maniURL = getManiURL();
  const pwaURL = getURL();

  if (!pwaURL) {
    throw new Error("Can't find the current URL");
  }

  if (!maniURL) {
    throw new Error('Cant find the manifest URL');
  }

  const appName = manifest.short_name || manifest.name || 'My PWA';
  const packageName = generatePackageId(new URL(pwaURL).hostname);
  // Use standalone display mode unless the manifest has fullscreen specified.
  const display =
    manifest.display === 'fullscreen' ? 'fullscreen' : 'standalone';
  // StartUrl must be relative to the host.
  // We make sure it is below.
  let relativeStartUrl: string;
  if (
    !manifest.start_url ||
    manifest.start_url === '/' ||
    manifest.start_url === '.' ||
    manifest.start_url === './'
  ) {
    // First, if we don't have a start_url in the manifest, or it's just "/",
    // then we can just use that.
    relativeStartUrl = '/';
  } else {
    // The start_url in the manifest is either a relative or absolute path.
    // Ensure it's a path relative to the root.
    const absoluteStartUrl = new URL(manifest.start_url, maniURL);
    relativeStartUrl =
      absoluteStartUrl.pathname + (absoluteStartUrl.search || '');
  }
  const manifestIcons = manifest.icons || [];
  const icon =
    findSuitableIcon(manifestIcons, 'any', 512, 512, 'image/png') ||
    findSuitableIcon(manifestIcons, 'any', 192, 192, 'image/png') ||
    findSuitableIcon(manifestIcons, 'any', 512, 512, 'image/jpeg') ||
    findSuitableIcon(manifestIcons, 'any', 192, 192, 'image/jpeg') ||
    findSuitableIcon(manifestIcons, 'any', 512, 512, undefined) || // A 512x512 or larger image with unspecified type
    findSuitableIcon(manifestIcons, 'any', 192, 192, undefined) || // A 512x512 or larger image with unspecified type
    findSuitableIcon(manifestIcons, 'any', 0, 0, undefined); // Welp, we tried. Any image of any size, any type.
  if (!icon) {
    throw new Error("Can't find a suitable icon to use for the Android package. Ensure your manifest has a square, large (512x512 or better) PNG icon.");
  }

  const maskableIcon =
    findSuitableIcon(manifestIcons, 'maskable', 512, 512, 'image/png') ||
    findSuitableIcon(manifestIcons, 'maskable', 192, 192, 'image/png') ||
    findSuitableIcon(manifestIcons, 'maskable', 192, 192, undefined);
  const monochromeIcon =
    findSuitableIcon(manifestIcons, 'monochrome', 512, 512, 'image/png') ||
    findSuitableIcon(manifestIcons, 'monochrome', 192, 192, 'image/png') ||
    findSuitableIcon(manifestIcons, 'monochrome', 192, 192, undefined);
  const navColorOrFallback =
    manifest.theme_color || manifest.background_color || '#000000';

  return {
    appVersion: '1.0.0.0',
    appVersionCode: 1,
    backgroundColor:
      manifest.background_color || manifest.theme_color || '#FFFFFF',
    display: display,
    enableNotifications: true,
    enableSiteSettingsShortcut: true,
    fallbackType: 'customtabs',
    features: {
      locationDelegation: {
        enabled: true,
      },
      playBilling: {
        enabled: false,
      },
    },
    host: maniURL,
    iconUrl: getAbsoluteUrl(icon.src, maniURL),
    includeSourceCode: false,
    isChromeOSOnly: false,
    launcherName: manifest.short_name || appName, // launcher name should be the short name. If none is available, fallback to the full app name.
    maskableIconUrl: getAbsoluteUrl(maskableIcon?.src, maniURL),
    monochromeIconUrl: getAbsoluteUrl(monochromeIcon?.src, maniURL),
    name: appName,
    navigationColor: navColorOrFallback,
    navigationColorDark: navColorOrFallback,
    navigationDividerColor: navColorOrFallback,
    navigationDividerColorDark: navColorOrFallback,
    orientation: manifest.orientation || 'default',
    packageId: packageName,
    shortcuts: manifest.shortcuts || [],
    signing: {
      file: null,
      alias: 'my-key-alias',
      fullName: `${manifest.short_name || manifest.name || 'App'} Admin`,
      organization: manifest.name || 'PWABuilder',
      organizationalUnit: 'Engineering',
      countryCode: 'US',
      keyPassword: '', // If empty, one will be generated by CloudAPK service
      storePassword: '', // If empty, one will be generated by CloudAPK service
    },
    signingMode: 'new',
    splashScreenFadeOutDuration: 300,
    startUrl: (manifest.start_url as string),
    themeColor: manifest.theme_color || '#FFFFFF',
    shareTarget: manifest.share_target,
    webManifestUrl: maniURL,
  };    
}

/**
 * Resolves a relative URL to an absolute URL based on the manifest URL.
 * If relativeUrl is null, this will return an empty string.
 * @param relativeUrl The relative URL to make absolute.
 * @param manifestUrl The absolute URL to the web manifest.
 */
function getAbsoluteUrl(relativeUrl: string | null, manifestUrl: string): string {
  if (!relativeUrl) {
    return '';
  }

  return new URL(relativeUrl, manifestUrl).toString();
}

function updateAndroidOptionsWithSafeUrls(
  options: AndroidApkOptions
): AndroidApkOptions {
  const absoluteUrlProps: Array<keyof AndroidApkOptions> = [
    'maskableIconUrl',
    'monochromeIconUrl',
    'iconUrl',
    'webManifestUrl',
  ];
  for (const prop of absoluteUrlProps) {
    const url = options[prop];
    if (url && typeof url === 'string') {
      const safeUrl = `${process.env.safeUrlFetcher}?url=${encodeURIComponent(
        url
      )}`;
      (options as any)[prop] = safeUrl;
    }
  }
  return options;
}
