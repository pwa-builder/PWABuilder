import { env } from "../../utils/environment";
import { findBestAppIcon } from "../../utils/icons";
import { ManifestContext } from "../../utils/interfaces";
import { generateBundleId, IOSAppPackageOptions, validateIOSOptions } from "../../utils/ios-validation";
import { getHeaders } from "../../utils/platformTrackingHeaders";

export let hasGeneratedIOSPackage = false;

export async function generateIOSPackage(
  options: IOSAppPackageOptions,
): Promise<Blob> {
  const validationErrors = validateIOSOptions(options);
  if (validationErrors.length > 0) {
    throw new Error(
      'Invalid iOS app package options. ' + validationErrors.join('\n')
    );
  }

  let headers = {...getHeaders(), 'content-type': 'application/json' };

  const referrer = sessionStorage.getItem('ref');
  const createPackageUrl = `${env.iosPackageGeneratorUrl}${referrer ? '?ref=' + encodeURIComponent(referrer) : ''}`;
  const createPackageResponse = await fetch(createPackageUrl, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: new Headers(headers),
  });

  if (!createPackageResponse.ok) {
    const responseText = await createPackageResponse.text();

    let err = new Error(
      `Error generating iOS package.\nStatus code: ${createPackageResponse.status}\nError: ${createPackageResponse.statusText}\nDetails: ${responseText}`
    );

    Object.defineProperty(createPackageResponse, "stack_trace", {value: responseText});
    //@ts-ignore
    err.response = createPackageResponse;
    throw err;
  }

  hasGeneratedIOSPackage = true;
  return await createPackageResponse.blob();
}

export function createIOSPackageOptionsFromManifest(manifestContext: ManifestContext): IOSAppPackageOptions {
  const host = [
    manifestContext.siteUrl,
    manifestContext.manifestUrl
  ]
    .map(i => tryGetHost(i))
    .find(i => !!i) || '';

  return {
    name: manifestContext.manifest.short_name || manifestContext.manifest.name || "My PWA",
    bundleId: generateBundleId(host),
    url: new URL(manifestContext.manifest.start_url || "/", manifestContext.manifestUrl).toString(),
    imageUrl: findBestAppIcon(manifestContext.manifest.icons)?.src || '',
    splashColor: manifestContext.manifest.background_color || '#ffffff',
    progressBarColor: manifestContext.manifest.theme_color || '#000000',
    statusBarColor: manifestContext.manifest.theme_color || manifestContext.manifest.background_color || '#ffffff',
    permittedUrls: [],
    manifestUrl: manifestContext.manifestUrl,
    manifest: manifestContext.manifest
  };
}

export function emptyIOSPackageOptions(): IOSAppPackageOptions {
  return {
    name: '',
    bundleId: '',
    url: '',
    imageUrl: '',
    splashColor: '#ffffff',
    progressBarColor: '#000000',
    statusBarColor: '#ffffff',
    permittedUrls: [],
    manifestUrl: '',
    manifest: {}
  }
}

function tryGetHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch (hostError) {
    console.warn("Unable to parse host URL due to error", url, hostError);
    return null;
  }
}