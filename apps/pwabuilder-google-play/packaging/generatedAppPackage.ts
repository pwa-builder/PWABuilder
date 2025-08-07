import { LocalKeyFileSigningOptions } from "./signingOptions.js";

/**
 * The output of this tool: an APK file for testing locally on a device or emulator.
 * This will also contain the signing info, asset links files, and app bundle file
 * when a signing key is supplied.
 */
export interface GeneratedAppPackage {
    /**
     * The path to the .aab app bundle file. This is the file that is submitted to the Google Play sdtore. This will be null when no signging key is supplied.
     */
    appBundleFilePath: string | null;
    /**
     * The path to the .apk file. This file is used for testing your app on a local Android device or Android emulator.
     */
    apkFilePath: string;
    /**
     * The signing info containing the signing key, store password, key password, alias, and additional signing information. This will be null if no signing key was supplied.
     */
    signingInfo: LocalKeyFileSigningOptions | null;
    /**
     * The path to the digital asset links file (assetlinks.json). This file must be uploaded to https://my-awesome-pwa.com/.well-known/assetlinks.json to prove domain ownership. Otherwise, the app will load with the browser address bar visible. This will be null when no signing key is supplied.
     */
    assetLinkFilePath: string | null;
    /**
     * The directory containing the source code of the project.
     */
    projectDirectory: string;
}