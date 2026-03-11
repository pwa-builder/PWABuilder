import { PackageOptions, ShareTarget, ShortcutItem } from './interfaces';
/**
 * Settings for the Android APK generation. This is the raw data passed to the CloudApk service.
 * It should match the CloudApk service's AndroidPackageOptions interface: https://github.com/pwa-builder/CloudAPK/blob/master/build/androidPackageOptions.ts
 */
export interface AndroidPackageOptions extends PackageOptions {
    analysisId?: string | null;
    appVersion: string;
    appVersionCode: number;
    backgroundColor: string;
    display: 'standalone' | 'fullscreen' | 'fullscreen-sticky';
    enableNotifications: boolean;
    enableSiteSettingsShortcut: boolean;
    fallbackType: 'customtabs' | 'webview';
    features: {
        appsFlyer?: {
            enabled: boolean;
            appsFlyerId: string;
        };
        locationDelegation?: {
            enabled: boolean;
        };
        playBilling?: {
            enabled: boolean;
        };
        firstRunFlag?: {
            enabled: boolean;
            queryParameterName: string;
        };
    };
    host: string;
    iconUrl: string;
    includeSourceCode: boolean;
    isChromeOSOnly: boolean;
    isMetaQuest: boolean;
    launcherName: string;
    maskableIconUrl: string | null;
    monochromeIconUrl: string | null;
    name: string;
    navigationColor: string;
    navigationColorDark: string;
    navigationDividerColor: string;
    navigationDividerColorDark: string;
    orientation: 'default' | 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';
    packageId: string;
    pwaUrl: string;
    shareTarget?: ShareTarget;
    shortcuts: ShortcutItem[];
    signing: AndroidSigningOptions;
    signingMode: 'new' | 'none' | 'mine';
    splashScreenFadeOutDuration: number;
    startUrl: string;
    themeColor: string;
    themeColorDark?: string;
    webManifestUrl: string;
    fullScopeUrl: string;
    minSdkVersion?: number;
}
/**
 * Signing options for Android APK generation. This is sent to the service as part of AndroidPackageOptions.
 * It should generally match the CloudApk service's SigningOptions interface: https://github.com/pwa-builder/PWABuilder/blob/main/apps/pwabuilder-google-play/models/signingOptions.ts
 */
export interface AndroidSigningOptions {
    /**
     * The base64 encoded contents of the Android .keystore file.
     * This can be null when signing mode is "none" or "new".
     */
    file: string | null;
    alias: string;
    fullName: string;
    organization: string;
    organizationalUnit: string;
    countryCode: string;
    keyPassword: string;
    storePassword: string;
}
type AndroidPackageValidationError = {
    field: keyof AndroidPackageOptions | keyof AndroidSigningOptions | null;
    error: string;
};
export declare const maxSigningKeySizeInBytes = 2097152;
export declare function generatePackageId(host: string): string;
export declare const dnameInvalidCharacters = "\\,\\=\\+\\<\\>\\#\\;\\\\\"";
export declare function sanitizeDname(input: string | undefined): string;
export declare function validateAndroidPackageId(packageId?: string | null): AndroidPackageValidationError[];
export declare function validateAndroidOptions(options: Partial<AndroidPackageOptions | null>): AndroidPackageValidationError[];
export declare function validateUrl(url: string, base?: string): string | null;
export {};
