// below code pulled from the main PWABuilder site

export interface ShortcutItem {
  name: string;
  url: string;
  description?: string;
  short_name?: string;
  icons?: Icon[];
}

export interface Icon {
  src: string;
  generated?: boolean;
  type?: string;
  sizes?: string;
  purpose?: "any" | "maskable" | "monochrome";
  label?: string;
}

export interface ShareTarget {
  action?: string;
  method?: string;
  enctype?: string;
  params?: ShareTargetParams;
}

export interface ShareTargetParams {
  title?: string;
  text?: string;
  url?: string;
  files?: FilesParams[];
}

export interface FilesParams {
  name: string;
  accept: string[];
}
/**
 * Settings for the Android APK generation. This is the raw data passed to the CloudApk service.
 * It should match the CloudApk service's AndroidPackageOptions interface: https://github.com/pwa-builder/CloudAPK/blob/master/build/androidPackageOptions.ts
 */

export interface AndroidPackageOptions {
  appVersion: string;
  appVersionCode: number;
  backgroundColor: string;
  display: "standalone" | "fullscreen" | "fullscreen-sticky";
  enableNotifications: boolean;
  enableSiteSettingsShortcut: boolean;
  fallbackType: string;
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
  launcherName: string;
  maskableIconUrl: string | null;
  monochromeIconUrl: string | null;
  name: string;
  navigationColor: string;
  navigationColorDark: string;
  navigationDividerColor: string;
  navigationDividerColorDark: string;
  orientation:
    | "default"
    | "any"
    | "natural"
    | "landscape"
    | "portrait"
    | "portrait-primary"
    | "portrait-secondary"
    | "landscape-primary"
    | "landscape-secondary";
  packageId: string;
  shareTarget?: ShareTarget | Array<any>;
  shortcuts: ShortcutItem[];
  signing: AndroidSigningOptions;
  signingMode: "new" | "none" | "mine";
  splashScreenFadeOutDuration: number;
  startUrl: string;
  themeColor: string;
  themeColorDark?: string;
  webManifestUrl: string;
}
/**
 * Signing options for Android APK generation. This is sent to the Cloud APK service as part of AndroidApkOptions.
 * It should generally match the CloudApk service's SigningOptions interface: https://github.com/pwa-builder/CloudAPK/blob/master/build/signingOptions.ts
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
export type AndroidPackageValidationError = {
  field: keyof AndroidPackageOptions | keyof AndroidSigningOptions | null;
  error: string;
};
