import { env } from "../../utils/environment";
import { findBestAppIcon } from "../../utils/icons";
import { ManifestContext } from "../../utils/interfaces";
import { generateMacOSBundleId, MacOSAppPackageOptions, validateMacOSOptions } from "../../utils/macos-validation";
import { getHeaders } from "../../utils/platformTrackingHeaders";

export let hasGeneratedMacOSPackage = false;

export async function generateMacOSPackage(
  options: MacOSAppPackageOptions,
): Promise<Blob> {
  const validationErrors = validateMacOSOptions(options);
  if (validationErrors.length > 0) {
    throw new Error(
      'Invalid macOS app package options. ' + validationErrors.join('\n')
    );
  }

  let headers = {...getHeaders(), 'content-type': 'application/json' };

  const referrer = sessionStorage.getItem('ref');
  const createPackageUrl = `${env.macosPackageGeneratorUrl}${referrer ? '?ref=' + encodeURIComponent(referrer) : ''}`;
  const createPackageResponse = await fetch(createPackageUrl, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: new Headers(headers),
  });

  if (!createPackageResponse.ok) {
    const responseText = await createPackageResponse.text();

    let err = new Error(
      `Error generating macOS package.\nStatus code: ${createPackageResponse.status}\nError: ${createPackageResponse.statusText}\nDetails: ${responseText}`
    );

    Object.defineProperty(createPackageResponse, "stack_trace", {value: responseText});
    //@ts-ignore
    err.response = createPackageResponse;
    throw err;
  }

  hasGeneratedMacOSPackage = true;
  return await createPackageResponse.blob();
}

export function createMacOSPackageOptionsFromManifest(manifestContext: ManifestContext): MacOSAppPackageOptions {
  const host = [
    manifestContext.siteUrl,
    manifestContext.manifestUrl
  ]
    .map(i => tryGetHost(i))
    .find(i => !!i) || '';

  return {
    name: manifestContext.manifest.short_name || manifestContext.manifest.name || "My PWA",
    bundleId: generateMacOSBundleId(host),
    url: new URL(manifestContext.manifest.start_url || "/", manifestContext.manifestUrl).toString(),
    imageUrl: findBestAppIcon(manifestContext.manifest.icons)?.src || '',
    themeColor: manifestContext.manifest.theme_color || '#000000',
    backgroundColor: manifestContext.manifest.background_color || '#ffffff',
    permittedUrls: [],
    manifestUrl: manifestContext.manifestUrl,
    manifest: manifestContext.manifest
  };
}

export function emptyMacOSPackageOptions(): MacOSAppPackageOptions {
  return {
    name: '',
    bundleId: '',
    url: '',
    imageUrl: '',
    themeColor: '#000000',
    backgroundColor: '#ffffff',
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
