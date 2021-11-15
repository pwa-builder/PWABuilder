import { env } from "../../utils/environment";
import { findBestAppIcon } from "../../utils/icons";
import { ManifestContext } from "../../utils/interfaces";
import { generateBundleId, IOSAppPackageOptions, validateIOSOptions } from "../../utils/ios-validation";

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

  const createPackageUrl = `${env.iosPackageGeneratorUrl}`;
  const createPackageResponse = await fetch(createPackageUrl, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: new Headers({ 'content-type': 'application/json' }),
  });

  if (!createPackageResponse.ok) {
    const responseText = await createPackageResponse.text();
    throw new Error(
      `Error generating iOS package.\nStatus code: ${createPackageResponse.status}\nError: ${createPackageResponse.statusText}\nDetails: ${responseText}`
    );
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