import { generatePackageId } from "../../utils/android-validation";
import { env } from "../../utils/environment";
import { ManifestContext } from "../../utils/interfaces";
import { OculusAppPackageOptions, SigningKeyInfo, SigningMode, validateOculusOptions } from "../../utils/oculus-validation";
import { getHeaders } from "../../utils/platformTrackingHeaders";

export let hasGeneratedOculusPackage = false;

export async function generateOculusPackage(
  options: OculusAppPackageOptions,
): Promise<Blob> {
  const validationErrors = validateOculusOptions(options);
  if (validationErrors.length > 0) {
    throw new Error(
      'Invalid Oculus app package options. ' + validationErrors.join('\n')
    );
  }

  let headers = {...getHeaders(), 'content-type': 'application/json' };

  const referrer = sessionStorage.getItem('ref');
  const createPackageUrl = `${env.oculusPackageGeneratorUrl}${referrer ? '?ref=' + encodeURIComponent(referrer) : ''}`;
  const createPackageResponse = await fetch(createPackageUrl, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: new Headers(headers),
  });

  if (!createPackageResponse.ok) {
    const responseText = await createPackageResponse.text();

    let err = new Error(
      `Error generating Oculus package.\nStatus code: ${createPackageResponse.status}\nError: ${createPackageResponse.statusText}\nDetails: ${responseText}`
    );

    Object.defineProperty(createPackageResponse, "stack_trace", {value: responseText});
    //@ts-ignore
    err.response = createPackageResponse;
    throw err;
  }

  hasGeneratedOculusPackage = true;
  return await createPackageResponse.blob();
}

export function createOculusPackageOptionsFromManifest(manifestContext: ManifestContext): OculusAppPackageOptions {
  return {
    name: manifestContext.manifest.short_name || manifestContext.manifest.name || "My PWA",
    packageId: generatePackageId(new URL(manifestContext.siteUrl).host),
    manifestUrl: manifestContext.manifestUrl,
    manifest: manifestContext.manifest,
    versionCode: 1,
    versionName: '1.0.0.0',
    existingSigningKey: null,
    signingMode: SigningMode.New,
    url: manifestContext.siteUrl
  };
}

export function emptyOculusPackageOptions(): OculusAppPackageOptions {
  return {
    name: '',
    packageId: '',
    manifestUrl: '',
    manifest: {},
    versionCode: 1,
    versionName: '1.0.0.0',
    existingSigningKey: null,
    signingMode: SigningMode.New,
    url: '',
  };
}

export function emptyOculusSigningKey(): SigningKeyInfo {
  return {
    keyStoreFile: '',
    storePassword: '',
    alias: '',
    password: ''
  };
}