import { AppsFlyerConfig } from "@bubblewrap/core/dist/lib/features/AppsFlyerFeature.js";
import { FirstRunFlagConfig } from "@bubblewrap/core/dist/lib/features/FirstRunFlagFeature.js";
import { LocationDelegationConfig } from "@bubblewrap/core/dist/lib/features/LocationDelegationFeature.js";
import { PlayBillingConfig } from "@bubblewrap/core/dist/lib/features/PlayBillingFeature.js";
import { ShareTarget, WebManifestShortcutJson } from "@bubblewrap/core/dist/lib/types/WebManifest.js";
import { SigningOptions } from "./signingOptions.js";

/**
 * Options for generating the Android package.
 */
export type AndroidPackageOptions = {
    /**
     * Additional origins to be considered trusted by the app.
     */
    additionalTrustedOrigins?: string[],
    /**
     * The app version.
     */
    appVersion: string;
    /**
     * The app version code.
     */
    appVersionCode: number;
    /**
     * The app background color.
     */
    backgroundColor: string;
    /**
     * Display mode. 
     * standalone means the app displays like a normal app: with status bar and navbar visible. Recommended for most PWAs.
     * fullscreen means the app takes up every bit of available real-estate, no status bar or nav bar is visible. Recommended for games and immersive media experiences.
     * fullscreen-sticky is like fullscreen, except that when the user swipes from the device edge, the system bars appear semi-transparent, and the touch gesture is passed to your app so it can respond. Recommended for drawing apps and games that involve much swiping.
     */
    display: "standalone" | "fullscreen" | "fullscreen-sticky";
    /**
     * Whether to use Push Notification Delegation. If enabled, the TWA will be able to send push notifications without browser permission prompts.
     */
    enableNotifications: boolean;
    /**
     * Whether to show "site settings" / "app settings" shortcut for installed apps. https://twitter.com/daviddalbusco/status/1307033355020578818
     */
    enableSiteSettingsShortcut?: boolean;
    /**
     * Fallback behavior. "customtabs" = use Chrome's Custom Tabs feature as a fallback. "webview" = use a embedded web view as a fallback behavior.
     */
    fallbackType?: "customtabs" | "webview";
    /**
     * Configures AppsFlyer analytics.
     */
    features?: {
        appsFlyer?: AppsFlyerConfig;
        locationDelegation?: LocationDelegationConfig;
        playBilling?: PlayBillingConfig;
        firstRunFlag?: FirstRunFlagConfig;
    };
    /**
     * The URL host for the TWA, e.g. https://foo.com
     */
    host: string;
    /**
     * The URL to the icon to use for the app.
     */
    iconUrl: string;
    /**
     * Whether to include source code in the Android package.
     */
    includeSourceCode: boolean;
    /**
     * Setting to true will enable a feature that prevents non-ChromeOS devices.
     */
    isChromeOSOnly?: boolean;
    /**
     * Setting to true will make the app compatible with Meta Quest devices.
     */
    isMetaQuest?: boolean;
    /**
     * The name of the app used on the Android launch screen. This may be the same as name or may be a shortened version of that name to account for less available display space.
     */
    launcherName: string;
    /**
     * The URL to the maskable icon to use for the app.
     */
    maskableIconUrl?: string;
    /**
     * The URL to a monochrome icon to use for the app.
     */
    monochromeIconUrl?: string;
    /**
     * The Android app name.
     */
    name: string;
    /**
     * The color used for the navbar.
     */
    navigationColor: string;
    /**
     * The color used for the navbar in dark mode.
     */
    navigationColorDark?: string;
    /**
     * The color used for the navbar divider.
     */
    navigationDividerColor?: string;
    /**
     * The color used for the navbar divider in dark mode.
     */
    navigationDividerColorDark?: string;
    /**
     * 
     */
    orientation?: "default" | "any" | "natural" | "landscape" | "portrait" | "portrait-primary" | "portrait-secondary" | "landscape-primary" | "landscape-secondary";
    /**
     * The Android package ID to generate, e.g. com.mycompany.foo
     */
    packageId: string;
    /**
     * The URL to a service account JSON file used in communicating with Google Play APIs.
     */
    serviceAccountJsonFile?: string;
    /**
     * The share target from the web manifest.
     */
    shareTarget?: ShareTarget;
    /*
     * App shortcuts
     */
    shortcuts?: WebManifestShortcutJson[];
    /**
     * Details about the signing key. 
     * If .signingMode = "none", this will be ignored.
     * If .signingMode = "new", this must contain the signing details, but .signing.file will be ignored.
     * If .signingMode = "mine", this must contain the signing details and key file.
     */
    signing?: SigningOptions | null;
    /**
     * The signing operation to perform. "new" means create a new signing key. "none" means don't sign. "mine" means use the uploaded signing information.
     * If "new" in specified, then .signing must contain the details of the signing key.
     * If "mine" is specified, then .signing must contain the .signing.file and details of the signing key.
     */
    signingMode: "new" | "none" | "mine";
    /**
     * How long the splash screen should fade out in milliseconds
     */
    splashScreenFadeOutDuration: number;
    /**
     * The start url relative to the host.
     */
    startUrl: string;
    /**
     * The app theme color, e.g. #2f3d58. See https://developers.google.com/web/updates/2015/08/using-manifest-to-set-sitewide-theme-color
     */
    themeColor: string;
    /**
     * The app theme color dark.
     */
    themeColorDark?: string;
    /**
     * The URL to the web manifest.
     */
    webManifestUrl: string;
    /**
     * The navigation scope that the browser considers to be within the app. If the user navigates outside the scope, it reverts to a normal web page inside a browser tab or window. Must be a full URL. Required and used only by Meta Quest devices.
     */
    fullScopeUrl?: string;
    /**
     * The minimum [Android API Level](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels) required for the application to run. Defaults to `19`. Should be `23`, if `isMetaQuest` is `true`.
     */
    minSdkVersion?: number;
    /**
     * The URL of the PWA as input to pwabuilder.com
     */
    pwaUrl: string;
}