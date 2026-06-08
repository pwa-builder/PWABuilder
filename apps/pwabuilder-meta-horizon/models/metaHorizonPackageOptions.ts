import { AppsFlyerConfig } from "@meta-quest/bubblewrap-core/dist/lib/features/AppsFlyerFeature.js";
import { ArCoreConfig } from "@meta-quest/bubblewrap-core/dist/lib/features/ArCoreFeature.js";
import { FirstRunFlagConfig } from "@meta-quest/bubblewrap-core/dist/lib/features/FirstRunFlagFeature.js";
import { HorizonBillingConfig } from "@meta-quest/bubblewrap-core/dist/lib/features/HorizonBillingFeature.js";
import { HorizonPlatformSDKConfig } from "@meta-quest/bubblewrap-core/dist/lib/features/HorizonPlatformSDKFeature.js";
import { LocationDelegationConfig } from "@meta-quest/bubblewrap-core/dist/lib/features/LocationDelegationFeature.js";
import { PlayBillingConfig } from "@meta-quest/bubblewrap-core/dist/lib/features/PlayBillingFeature.js";
import { ShareTarget, WebManifestShortcutJson } from "@meta-quest/bubblewrap-core/dist/lib/types/WebManifest.js";
import { SigningOptions } from "./signingOptions.js";

/**
 * Options for generating a Meta Horizon Store app package.
 *
 * The Meta Horizon platform builds a Trusted Web Activity APK / AAB targeting Meta Quest
 * headsets, so most of the fields mirror the Google Play TWA options. Notable additions
 * are Horizon-specific fields like `horizonOSAppMode`, `enableXRScene`, `enableMicrophone`,
 * and Horizon-specific feature configs (`horizonBilling`, `horizonPlatformSDK`, `arCore`).
 */
export type MetaHorizonPackageOptions = {
    /**
     * The ID of the PWABuilder analysis that is associated with this Meta Horizon app package creation. May be null if the package creation was triggered outside of PWABuilder.
     */
    analysisId: string | null;
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
     * Whether to grant the app the Android microphone permission. Useful for PWAs that use the Web Speech / WebRTC APIs from inside the Quest browser.
     */
    enableMicrophone?: boolean;
    /**
     * Whether to grant the app the Horizon OS USE_SCENE permission so the PWA can use the WebXR scene mesh / spatial anchors.
     */
    enableXRScene?: boolean;
    /**
     * Whether to show "site settings" / "app settings" shortcut for installed apps.
     */
    enableSiteSettingsShortcut?: boolean;
    /**
     * Fallback behavior. "customtabs" = use Chrome's Custom Tabs feature as a fallback. "webview" = use a embedded web view as a fallback behavior.
     */
    fallbackType?: "customtabs" | "webview";
    /**
     * Optional feature configurations.
     */
    features?: {
        appsFlyer?: AppsFlyerConfig;
        locationDelegation?: LocationDelegationConfig;
        playBilling?: PlayBillingConfig;
        horizonBilling?: HorizonBillingConfig;
        horizonPlatformSDK?: HorizonPlatformSDKConfig;
        firstRunFlag?: FirstRunFlagConfig;
        arCore?: ArCoreConfig;
    };
    /**
     * The URL host for the TWA, e.g. https://foo.com
     */
    host: string;
    /**
     * Horizon OS app mode. Controls how the PWA is presented inside Horizon OS — `'2D'` runs the
     * PWA as a flat panel app, `'immersive'` runs it as an immersive WebXR experience.
     * Mirrors the bubblewrap `horizonOSAppMode` field. Defaults to `'immersive'`.
     */
    horizonOSAppMode?: "2D" | "immersive";
    /**
     * The Meta Horizon application ID (a numeric string from Meta Developer Dashboard, e.g. the
     * number visible in the URL when viewing the app on the App Manager page:
     * developers.meta.com/horizon/manage/applications/`<this id>`/).
     *
     * In the generated Android project, this is emitted as the `com.meta.horizon.platform.ovr.OCULUS_APP_ID`
     * AndroidManifest meta-data and is REQUIRED for in-app purchases / Meta Horizon Store APIs to
     * work at runtime. Defaults to `'0'` in bubblewrap if not provided. Note: this is distinct from
     * `packageId`, which is the Android applicationId (e.g. `com.mycompany.foo`).
     */
    metaHorizonAppId?: string;
    /**
     * The URL to the icon to use for the app.
     */
    iconUrl: string;
    /**
     * Whether to include source code in the Meta Horizon package.
     */
    includeSourceCode: boolean;
    /**
     * The name of the app used on the launcher. This may be the same as name or may be a shortened version of that name to account for less available display space.
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
     * Screen orientation hint.
     */
    orientation?: "default" | "any" | "natural" | "landscape" | "portrait" | "portrait-primary" | "portrait-secondary" | "landscape-primary" | "landscape-secondary";
    /**
     * The Android package ID to generate, e.g. com.mycompany.foo
     */
    packageId: string;
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
     * The app theme color, e.g. #2f3d58.
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
     * The navigation scope that the browser considers to be within the app. If the user navigates outside the scope, it reverts to a normal web page inside a browser tab or window. Must be a full URL. Required for Meta Horizon devices.
     */
    fullScopeUrl: string;
    /**
     * The minimum [Android API Level](https://developer.android.com/guide/topics/manifest/uses-sdk-element#ApiLevels) required for the application to run. Defaults to `23` for Meta Horizon (Quest minimum).
     */
    minSdkVersion?: number;
    /**
     * The URL of the PWA as input to pwabuilder.com
     */
    pwaUrl: string;

    /**
     * Optional information to include with telemetry events fired during this package creation.
     */
    analyticsInfo?: {
        platformId?: string | null;
        platformIdVersion?: string | null;
        correlationId?: string | null;
        referrer?: string | null;
    } | null;
}
