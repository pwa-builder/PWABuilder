import { MetaHorizonPackageJob } from '../../models/meta-horizon-package-job';
import { generatePackageId, sanitizeDname } from '../../utils/android-validation';
import { env } from '../../utils/environment';
import { findSuitableIcon, findBestAppIcon } from '../../utils/icons';
import { ManifestContext } from '../../utils/interfaces';
import {
    MetaHorizonPackageOptions,
    validateMetaHorizonOptions,
} from '../../utils/meta-horizon-validation';
import { getHeaders } from '../../utils/platformTrackingHeaders';

export let hasGeneratedMetaHorizonPackage = false;

export async function enqueueMetaHorizonPackageJob(
    options: MetaHorizonPackageOptions
): Promise<string> {
    const validationErrors = validateMetaHorizonOptions(options);
    if (validationErrors.length > 0 || !options) {
        throw new Error(
            'Invalid Meta Horizon options. ' + validationErrors.map(a => a.error).join('\n')
        );
    }

    const headers = { ...getHeaders(), 'content-type': 'application/json' };
    const referrer = sessionStorage.getItem('ref');
    const url = `${env.metaHorizonPackageGeneratorUrl}/enqueuePackageJob${referrer ? '?ref=' + encodeURIComponent(referrer) : ''}`;
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(options),
        headers: new Headers(headers),
    });

    if (response.ok) {
        hasGeneratedMetaHorizonPackage = true;
        return await response.text(); // job ID
    }

    const err = new Error(
        `Error enqueueing Meta Horizon package job.\nStatus code: ${response.status}\nError: ${response.statusText}`
    );
    //@ts-ignore
    err.response = response;
    throw err;
}

export async function getMetaHorizonPackageJob(jobId: string): Promise<MetaHorizonPackageJob> {
    const jobFetch = await fetch(
        `${env.metaHorizonPackageGeneratorUrl}/getPackageJob?id=${encodeURIComponent(jobId)}`
    );
    if (!jobFetch.ok) {
        throw new Error(`Error fetching Meta Horizon package job status: ${jobFetch.statusText}`);
    }
    return await jobFetch.json();
}

export async function downloadMetaHorizonPackageZip(jobId: string): Promise<Blob> {
    const zipFetch = await fetch(
        `${env.metaHorizonPackageGeneratorUrl}/downloadPackageZip?id=${encodeURIComponent(jobId)}`
    );
    if (!zipFetch.ok) {
        throw new Error(`Error downloading Meta Horizon package ZIP: ${zipFetch.statusText}`);
    }
    return await zipFetch.blob();
}

export function emptyMetaHorizonPackageOptions(): MetaHorizonPackageOptions {
    return {
        appVersion: '1.0.0.0',
        appVersionCode: 1,
        backgroundColor: '#ffffff',
        display: 'standalone',
        enableNotifications: false,
        enableMicrophone: false,
        enableXRScene: false,
        enableSiteSettingsShortcut: true,
        fallbackType: 'customtabs',
        features: {
            locationDelegation: { enabled: false },
            playBilling: { enabled: false },
            horizonBilling: { enabled: false, horizonOSAppMode: 'immersive' },
            horizonPlatformSDK: { enabled: false },
            arCore: { enabled: false },
        },
        host: '',
        horizonOSAppMode: 'immersive',
        metaHorizonAppId: '',
        iconUrl: '',
        includeSourceCode: false,
        launcherName: '',
        maskableIconUrl: '',
        monochromeIconUrl: '',
        name: '',
        navigationColor: '#ffffff',
        navigationColorDark: '#000000',
        navigationDividerColor: '#ffffff',
        navigationDividerColorDark: '#000000',
        orientation: 'default',
        packageId: '',
        pwaUrl: '',
        shortcuts: [],
        signing: {
            file: null,
            alias: '',
            fullName: '',
            organization: '',
            organizationalUnit: '',
            countryCode: '',
            keyPassword: '',
            storePassword: '',
        },
        signingMode: 'none',
        splashScreenFadeOutDuration: 300,
        startUrl: '',
        themeColor: '#ffffff',
        themeColorDark: '#000000',
        webManifestUrl: '',
        fullScopeUrl: '',
        minSdkVersion: 23,
    };
}

export function createMetaHorizonPackageOptionsFromManifest(
    manifestContext: ManifestContext
): MetaHorizonPackageOptions {
    const maniUrl = manifestContext.manifestUrl;
    const pwaUrl = manifestContext.siteUrl;
    const manifest = manifestContext.manifest;

    if (!pwaUrl) {
        throw new Error("Can't find the current URL");
    }
    if (!maniUrl) {
        throw new Error('Cant find the manifest URL');
    }

    const appName = manifest.short_name || manifest.name || 'My PWA';
    const packageName = generatePackageId(new URL(pwaUrl).hostname);
    const display = manifest.display === 'fullscreen' ? 'fullscreen' : 'standalone';

    const manifestIcons = manifest.icons || [];
    const icon = findBestAppIcon(manifestIcons);
    if (!icon) {
        throw new Error(
            "Can't find a suitable icon to use for the Meta Horizon package. Ensure your manifest has a square, large (512x512 or better) PNG icon."
        );
    }

    const maskableIcon =
        findSuitableIcon(manifestIcons, 'maskable', 512, 512, 'image/png') ||
        findSuitableIcon(manifestIcons, 'maskable', 192, 192, 'image/png') ||
        findSuitableIcon(manifestIcons, 'maskable', 192, 192, undefined);
    const monochromeIcon =
        findSuitableIcon(manifestIcons, 'monochrome', 512, 512, 'image/png') ||
        findSuitableIcon(manifestIcons, 'monochrome', 192, 192, 'image/png') ||
        findSuitableIcon(manifestIcons, 'monochrome', 192, 192, undefined);
    const navColorOrFallback = manifest.theme_color || manifest.background_color || '#000000';

    const manifestUrlOrRoot = maniUrl.startsWith('data:application/manifest+json,')
        ? pwaUrl
        : maniUrl;

    const fullScopeUrl = new URL(manifest.scope || '.', manifestUrlOrRoot).toString();

    const shareTarget = manifest.share_target;
    if (shareTarget) {
        const toParseFiles = shareTarget.params?.files;
        if (toParseFiles) {
            for (const files of toParseFiles) {
                if (files.accept) {
                    const goodFiles: string[] = [];
                    files.accept.forEach(accept => {
                        if (!accept.startsWith('.')) {
                            goodFiles.push(accept);
                        }
                    });
                    files.accept = goodFiles;
                }
            }
        }
    }

    return {
        appVersion: '1.0.0.0',
        appVersionCode: 1,
        backgroundColor: manifest.background_color || manifest.theme_color || '#FFFFFF',
        display: display,
        enableNotifications: true,
        enableMicrophone: false,
        enableXRScene: false,
        enableSiteSettingsShortcut: true,
        fallbackType: 'customtabs',
        features: {
            locationDelegation: { enabled: false },
            playBilling: { enabled: false },
            horizonBilling: { enabled: false, horizonOSAppMode: 'immersive' },
            horizonPlatformSDK: { enabled: false },
            arCore: { enabled: false },
        },
        host: new URL(pwaUrl).host,
        horizonOSAppMode: 'immersive',
        metaHorizonAppId: '',
        iconUrl: getAbsoluteUrl(icon.src, manifestUrlOrRoot),
        includeSourceCode: false,
        launcherName: (manifest.short_name || appName || 'My PWA').substring(0, 30),
        maskableIconUrl: getAbsoluteUrl(maskableIcon?.src, manifestUrlOrRoot),
        monochromeIconUrl: getAbsoluteUrl(monochromeIcon?.src, manifestUrlOrRoot),
        name: appName,
        navigationColor: navColorOrFallback,
        navigationColorDark: navColorOrFallback,
        navigationDividerColor: navColorOrFallback,
        navigationDividerColorDark: navColorOrFallback,
        orientation: manifest.orientation || 'default',
        packageId: packageName,
        shortcuts: manifest.shortcuts || [],
        signing: {
            file: null,
            alias: 'my-key-alias',
            fullName: `${sanitizeDname(manifest.short_name) || sanitizeDname(manifest.name) || 'App'} Admin`,
            organization: sanitizeDname(manifest.name) || 'PWABuilder',
            organizationalUnit: 'Engineering',
            countryCode: 'US',
            keyPassword: '',
            storePassword: '',
        },
        signingMode: 'new',
        splashScreenFadeOutDuration: 300,
        startUrl: getStartUrlRelativeToHost(manifest.start_url, new URL(manifestUrlOrRoot)),
        themeColor: manifest.theme_color || '#FFFFFF',
        themeColorDark: manifest.theme_color || '#000000',
        shareTarget: manifest.share_target,
        webManifestUrl: maniUrl,
        pwaUrl: manifestContext.siteUrl,
        fullScopeUrl: fullScopeUrl,
        minSdkVersion: 23,
    };
}

function getAbsoluteUrl(relativeUrl: string | undefined, manifestUrl: string): string {
    if (!relativeUrl) {
        return '';
    }
    return new URL(relativeUrl, manifestUrl).toString();
}

function getStartUrlRelativeToHost(
    startUrl: string | null | undefined,
    manifestUrl: URL | string
) {
    const absoluteStartUrl = new URL(startUrl || '/', manifestUrl);
    return absoluteStartUrl.pathname + (absoluteStartUrl.search || '');
}
