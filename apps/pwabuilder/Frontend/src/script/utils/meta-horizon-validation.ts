import { PackageOptions, ShareTarget, ShortcutItem } from './interfaces';
import { validateAndroidPackageId, validateUrl, AndroidSigningOptions } from './android-validation';

/**
 * Settings for Meta Horizon Store package generation. Mirrors the backend
 * MetaHorizonPackageOptions interface in apps/pwabuilder-meta-horizon/models/metaHorizonPackageOptions.ts.
 */
export interface MetaHorizonPackageOptions extends PackageOptions {
    analysisId?: string | null;
    additionalTrustedOrigins?: string[];
    appVersion: string;
    appVersionCode: number;
    backgroundColor: string;
    display: 'standalone' | 'fullscreen' | 'fullscreen-sticky';
    enableNotifications: boolean;
    enableMicrophone?: boolean;
    enableXRScene?: boolean;
    enableSiteSettingsShortcut?: boolean;
    fallbackType: 'customtabs' | 'webview';
    features: {
        appsFlyer?: { enabled: boolean; appsFlyerId: string };
        locationDelegation?: { enabled: boolean };
        playBilling?: { enabled: boolean };
        horizonBilling?: { enabled: boolean; horizonOSAppMode?: '2D' | 'immersive' };
        horizonPlatformSDK?: { enabled: boolean };
        firstRunFlag?: { enabled: boolean; queryParameterName: string };
        arCore?: { enabled: boolean };
    };
    host: string;
    horizonOSAppMode?: '2D' | 'immersive';
    metaHorizonAppId?: string;
    iconUrl: string;
    includeSourceCode: boolean;
    launcherName: string;
    maskableIconUrl?: string | null;
    monochromeIconUrl?: string | null;
    name: string;
    navigationColor: string;
    navigationColorDark?: string;
    navigationDividerColor?: string;
    navigationDividerColorDark?: string;
    orientation?:
    | 'default'
    | 'any'
    | 'natural'
    | 'landscape'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary';
    packageId: string;
    pwaUrl: string;
    shareTarget?: ShareTarget;
    shortcuts?: ShortcutItem[];
    signing?: AndroidSigningOptions | null;
    signingMode: 'new' | 'none' | 'mine';
    splashScreenFadeOutDuration: number;
    startUrl: string;
    themeColor: string;
    themeColorDark?: string;
    webManifestUrl: string;
    fullScopeUrl: string;
    minSdkVersion?: number;
}

export type MetaHorizonPackageValidationError = {
    field: keyof MetaHorizonPackageOptions | keyof AndroidSigningOptions | null;
    error: string;
};

export function validateMetaHorizonOptions(
    options: Partial<MetaHorizonPackageOptions> | null | undefined
): MetaHorizonPackageValidationError[] {
    const errors: MetaHorizonPackageValidationError[] = [];
    if (!options) {
        errors.push({ field: null, error: 'No options specified' });
        return errors;
    }

    // Package ID rules are the same as Android.
    validateAndroidPackageId(options.packageId).forEach(e =>
        errors.push({ field: e.field as keyof MetaHorizonPackageOptions, error: e.error })
    );

    if (!options.name || options.name.trim().length === 0) {
        errors.push({ field: 'name', error: 'Must have a valid app name' });
    } else if (options.name.length < 3 || options.name.length > 50) {
        errors.push({ field: 'name', error: 'Name must be between 3 and 50 characters in length' });
    }

    if (options.launcherName && (options.launcherName.length < 3 || options.launcherName.length > 30)) {
        errors.push({
            field: 'launcherName',
            error: 'Launcher name must be between 3 and 30 characters in length',
        });
    }

    if (!options.appVersion || options.appVersion.trim().length === 0) {
        errors.push({ field: 'appVersion', error: 'Must have a valid app version' });
    }

    if (!options.appVersionCode || options.appVersionCode > 2100000000) {
        errors.push({
            field: 'appVersionCode',
            error: 'App version code must be between 1 and 2,100,000,000',
        });
    }

    if (!options.backgroundColor) {
        errors.push({ field: 'backgroundColor', error: 'Must have a background color' });
    }

    if (
        options.display !== 'standalone' &&
        options.display !== 'fullscreen' &&
        options.display !== 'fullscreen-sticky'
    ) {
        errors.push({
            field: 'display',
            error: "Display must be 'standalone', 'fullscreen', or 'fullscreen-sticky'",
        });
    }

    if (options.fallbackType !== 'customtabs' && options.fallbackType !== 'webview') {
        errors.push({
            field: 'fallbackType',
            error: "Fallback type must be 'customtabs' or 'webview'",
        });
    }

    if (!options.host) {
        errors.push({ field: 'host', error: 'Host must be specified' });
    } else {
        const hostWithProtocol = options.host.startsWith('https') ? options.host : `https://${options.host}`;
        if (validateUrl(hostWithProtocol)) {
            errors.push({ field: 'host', error: 'Host URL must be a valid URL' });
        }
    }

    if (!options.iconUrl) {
        errors.push({ field: 'iconUrl', error: 'Must have an icon URL' });
    } else if (validateUrl(options.iconUrl, options.webManifestUrl)) {
        errors.push({ field: 'iconUrl', error: 'Icon URL is invalid' });
    }

    if (!options.launcherName || options.launcherName.trim().length === 0) {
        errors.push({ field: 'launcherName', error: 'Must have an app launcher name' });
    }

    if (!options.webManifestUrl) {
        errors.push({ field: 'webManifestUrl', error: 'Must have a manifest URL' });
    } else {
        if (validateUrl(options.webManifestUrl)) {
            errors.push({ field: 'webManifestUrl', error: 'Manifest URL is invalid' });
        } else if (!options.webManifestUrl.startsWith('https://')) {
            errors.push({ field: 'webManifestUrl', error: 'Manifest URL must be an absolute HTTPS URL' });
        }
    }

    if (options.maskableIconUrl && validateUrl(options.maskableIconUrl, options.webManifestUrl)) {
        errors.push({ field: 'maskableIconUrl', error: 'Maskable icon URL is invalid' });
    }

    if (options.monochromeIconUrl && validateUrl(options.monochromeIconUrl, options.webManifestUrl)) {
        errors.push({ field: 'monochromeIconUrl', error: 'Monochrome icon URL is invalid' });
    }

    if (!options.navigationColor) {
        errors.push({ field: 'navigationColor', error: 'Navigation color is required' });
    }

    if (!options.fullScopeUrl) {
        errors.push({ field: 'fullScopeUrl', error: 'Full scope URL is required for Meta Horizon' });
    } else if (validateUrl(options.fullScopeUrl)) {
        errors.push({ field: 'fullScopeUrl', error: 'Full scope URL must be a valid URL' });
    }

    // Horizon-specific: app mode must be one of the supported values when set.
    if (options.horizonOSAppMode && options.horizonOSAppMode !== '2D' && options.horizonOSAppMode !== 'immersive') {
        errors.push({
            field: 'horizonOSAppMode',
            error: "Horizon OS app mode must be either '2D' or 'immersive'",
        });
    }

    // metaHorizonAppId must be numeric when set, and required when Horizon Billing is enabled.
    if (options.metaHorizonAppId && !/^\d+$/.test(options.metaHorizonAppId)) {
        errors.push({
            field: 'metaHorizonAppId',
            error: 'Meta Horizon app ID must be a numeric string from the Meta Developer Dashboard.',
        });
    }
    if (options.features?.horizonBilling?.enabled && !options.metaHorizonAppId) {
        errors.push({
            field: 'metaHorizonAppId',
            error: 'Meta Horizon app ID is required when Horizon Billing is enabled.',
        });
    }

    if (options.signingMode === 'mine' || options.signingMode === 'new') {
        if (!options.signing) {
            errors.push({ field: 'signing', error: 'Signing information must be supplied.' });
        } else {
            const requiredSigningFields: Array<keyof AndroidSigningOptions> = ['alias'];
            if (options.signingMode === 'mine') {
                requiredSigningFields.push('file', 'keyPassword', 'storePassword');
            } else if (options.signingMode === 'new') {
                requiredSigningFields.push('fullName', 'organization', 'organizationalUnit', 'countryCode');
            }
            requiredSigningFields
                .filter(prop => !options.signing![prop])
                .forEach(prop =>
                    errors.push({ field: prop, error: `${prop.toString()} must be specified` })
                );

            if (options.signing.keyPassword && options.signing.keyPassword.length < 6) {
                errors.push({ field: 'keyPassword', error: 'Key password must be at least 6 characters' });
            }
            if (options.signing.storePassword && options.signing.storePassword.length < 6) {
                errors.push({ field: 'storePassword', error: 'Key store password must be at least 6 characters' });
            }
            if (
                options.signingMode === 'new' &&
                options.signing.countryCode &&
                options.signing.countryCode.length !== 2
            ) {
                errors.push({ field: 'countryCode', error: 'Signing key country code must be 2 letters' });
            }
        }
    }

    if (
        options.splashScreenFadeOutDuration === null ||
        options.splashScreenFadeOutDuration === undefined ||
        options.splashScreenFadeOutDuration < 0
    ) {
        errors.push({
            field: 'splashScreenFadeOutDuration',
            error: 'Splash screen fade duration must be 0 or greater',
        });
    }

    if (!options.startUrl) {
        errors.push({
            field: 'startUrl',
            error:
                "Start URL must be specified. If your start URL is the same as Host, you can use '/' as the start URL.",
        });
    } else if (validateUrl(options.startUrl, options.webManifestUrl)) {
        errors.push({ field: 'startUrl', error: 'Start URL is invalid' });
    }

    if (!options.themeColor) {
        errors.push({ field: 'themeColor', error: 'Theme color must be specified' });
    }

    return errors;
}
