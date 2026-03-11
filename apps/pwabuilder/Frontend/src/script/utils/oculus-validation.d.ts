import { Manifest } from "@pwabuilder/manifest-validation";
import { PackageOptions } from "./interfaces";
/**
 * Package options for PWABuilder's Oculus platform. Should match https://github.com/pwa-builder/pwabuilder-oculus/blob/main/Microsoft.PWABuilder.Oculus/Models/OculusAppPackageOptions.cs
 */
export interface OculusAppPackageOptions extends PackageOptions {
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
export declare enum SigningMode {
    /**
     * No signing key. The Oculus APK will be unsigned.
     */
    None = 0,
    /**
     * A new signing key will be generated and the APK will be signed with it.
     */
    New = 1,
    /**
     * An existing signing key will be used to sign the APK.
     */
    Existing = 2
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
export declare function validateOculusOptions(options?: OculusAppPackageOptions | null): string[];
