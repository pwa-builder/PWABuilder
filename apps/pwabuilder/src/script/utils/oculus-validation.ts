import { validateAndroidPackageId } from "./android-validation";
import { Manifest } from "./interfaces";

/**
 * Package options for PWABuilder's Oculus platform. Should match https://github.com/pwa-builder/pwabuilder-oculus/blob/main/Microsoft.PWABuilder.Oculus/Models/OculusAppPackageOptions.cs
 */
export interface OculusAppPackageOptions {
  /**
   * The ID of the app package, usually a reverse-domain style string, e.g. com.myawesomepwa
   */
  packageId: string;
  /**
   * The name of the app.
   */
  name: string;
  /**
   * The URL analyzed in PWABuilder.
   */
  url: string;
  /**
   * The Android version code of the Oculus app. Should be 1 or greater.
   */
  versionCode: number;
  /**
   * The version name displayed to end-users, e.g. "1.0.0.0beta2".
   */
  versionName: string;
  /**
   * The URL of the PWA's manifest.
   */
  manifestUrl: string;
  /**
   * The manifest of the PWA to generate the Oculus app package (APK) for.
   */
  manifest: Manifest;
  /**
   * The signing configuration: whether to skip signing the APK, whether to generate a new siging key to sign the APK with, or to use an existing signing key with which to sign the APK.
   */
  signingMode: SigningMode;
  /**
   * The signing key information. This should be specified only when SigningMode === SigningMode.Existing. Otherwise, this should be null.
   */
  existingSigningKey: SigningKeyInfo | null;
}

export enum SigningMode {
  /**
   * No signing key. The Oculus APK will be unsigned.
   */
  None,
  /**
   * A new signing key will be generated and the APK will be signed with it.
   */
  New,
  /**
   * An existing signing key will be used to sign the APK.
   */
  Existing
}

export interface SigningKeyInfo {
  /** 
   * Base64-encoded .keystore file.
   */
  keyStoreFile: string;
  /**
   * The password for the .keystore file.
   */
  storePassword: string;
  /**
   * The alias of the key to use to sign the APK.
   */
  alias: string;
  /**
   * The password of the key to use to sign the APK.
   */
  password: string;
}

/**
 * Validates the iOS app package options and returns errors as an array of strings. 
 * The array will be empty if there are no errors.
 * @param options The options to validate.
 */
export function validateOculusOptions(options?: OculusAppPackageOptions | null): string[] {
  const errors: string[] = [];
  if (!options) {
    errors.push('No Oculus package options supplied');
    return errors;
  }

  // Oculus package ID has the same validation as Android package ID.
  validateAndroidPackageId(options.packageId)
    .forEach(e => errors.push(e.error));

  if (!options.name) {
    errors.push('Name required');
  } else if (options.name.length < 3 || options.name.length > 50) {
    errors.push('Name must be between 3 and 50 characters in length');
  }

  if (!options.versionCode || options.versionCode <= 0) {
    errors.push('Version code must be greater than zero');
  }

  if (!options.versionName) {
    errors.push('Version name required');
  }

  if (!options.manifest) {
    errors.push("Manifest required");
  }

  if (!options.manifestUrl) {
    errors.push('Manifest URL required');
  }

  try {
    new URL(options.manifestUrl);
  } catch (manifestUrlError) {
    errors.push('Manifest URL must be a valid, absolute URL');
  }

  try {
    new URL(options.url);
  } catch (urlError) {
    errors.push('Url must be a valid, absolute URL');
  }

  // It's OK for signing key to be null. But if we've specified an existing signing key, then
  // we must also supply the key password, key alias, and store password.
  if (options.signingMode === SigningMode.Existing) {
    if (!options.existingSigningKey) {
      errors.push('Existing signing key required when SigningMode === SigningMode.Existing');
    } else {
      if (!options.existingSigningKey.storePassword) {
        errors.push('Store password required when using existing signing key');
      }
      if (!options.existingSigningKey.password) {
        errors.push('Key password required when using existing signing key');
      }
      if (!options.existingSigningKey.alias) {
        errors.push('Key alias required when using existing signing key');
      }
    }
  }

  return errors;
}