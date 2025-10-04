import { GooglePlayPackageJob } from "../../models/GooglePlayPackageJob";
import {
    validateAndroidOptions,
    AndroidPackageOptions,
    generatePackageId,
    sanitizeDname
} from '../../utils/android-validation';
import { env } from '../../utils/environment';
import { findSuitableIcon, findBestAppIcon } from '../../utils/icons';
import { ManifestContext } from '../../utils/interfaces';
import { getHeaders } from '../../utils/platformTrackingHeaders';

export let hasGeneratedAndroidPackage = false;

export async function enqueueGooglePlayPackageJob(androidOptions: AndroidPackageOptions): Promise<string> {
    const validationErrors = validateAndroidOptions(androidOptions);
    if (validationErrors.length > 0 || !androidOptions) {
        throw new Error(
            'Invalid Android options. ' + validationErrors.map(a => a.error).join('\n')
        );
    }

    let headers = { ...getHeaders(), 'content-type': 'application/json' };

    const referrer = sessionStorage.getItem('ref');
    const generateAppUrl = `${env.androidPackageGeneratorUrl}/enqueuePackageJob${referrer ? '?ref=' + encodeURIComponent(referrer) : ''}`;
    const response = await fetch(generateAppUrl, {
        method: 'POST',
        body: JSON.stringify(androidOptions),
        headers: new Headers(headers),
    });

    if (response.ok) {
        hasGeneratedAndroidPackage = true;
        return await response.text(); // Get the job ID from the response body.
    } else {
        let err = new Error(`Error enqueueing Google Play package job.\nStatus code: ${response.status}\nError: ${response.statusText}`);
        //@ts-ignore
        err.response = response;
        throw err;
    }
}

/**
 * Gets the Google Play package job with the specified ID. Throw an error if the job couldn't be found or if the job fetch otherwise failed.
 */
export async function getGooglePlayPackageJob(jobId: string): Promise<GooglePlayPackageJob> {
    const jobFetch = await fetch(`${env.androidPackageGeneratorUrl}/getPackageJob?id=${encodeURIComponent(jobId)}`);
    if (!jobFetch.ok) {
        throw new Error(`Error fetching Google Play package job status: ${jobFetch.statusText}`);
    }

    return await jobFetch.json();
}

/**
 * Downloads a Google Play package zip file resulting from a completed package job.
 * @param jobId The ID of the completed package job.
 * @returns The zip file as a Blob.
 */
export async function downloadGooglePlayPackageZip(jobId: string): Promise<Blob> {
    const zipFetch = await fetch(`${env.androidPackageGeneratorUrl}/downloadPackageZip?id=${encodeURIComponent(jobId)}`);
    if (!zipFetch.ok) {
        throw new Error(`Error downloading Google Play package ZIP: ${zipFetch.statusText}`);
    }
    return await zipFetch.blob();
}

export function emptyAndroidPackageOptions(): AndroidPackageOptions {
    return {
        appVersion: '1.0.0.0',
        appVersionCode: 1,
        backgroundColor: '#ffffff',
        display: 'standalone',
        enableNotifications: false,
        enableSiteSettingsShortcut: true,
        fallbackType: 'customtabs',
        features: {
            locationDelegation: {
                enabled: false
            },
            playBilling: {
                enabled: false
            }
        },
        host: '',
        iconUrl: '',
        includeSourceCode: false,
        isChromeOSOnly: false,
        isMetaQuest: false,
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
            storePassword: ''
        },
        signingMode: 'none',
        splashScreenFadeOutDuration: 300,
        startUrl: '',
        themeColor: '#ffffff',
        themeColorDark: '#000000',
        webManifestUrl: '',
        fullScopeUrl: '',
        minSdkVersion: 23
    };
}

export function createAndroidPackageOptionsFromManifest(manifestContext: ManifestContext): AndroidPackageOptions {
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
    // Use standalone display mode unless the manifest has fullscreen specified.
    const display =
        manifest.display === 'fullscreen' ? 'fullscreen' : 'standalone';

    const manifestIcons = manifest.icons || [];
    const icon = findBestAppIcon(manifestIcons);
    if (!icon) {
        throw new Error(
            "Can't find a suitable icon to use for the Android package. Ensure your manifest has a square, large (512x512 or better) PNG icon."
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
    const navColorOrFallback =
        manifest.theme_color || manifest.background_color || '#000000';

    // Support URL-encoded manifests. See https://github.com/pwa-builder/PWABuilder/issues/1926
    // When URL-encoded manifest is the manifest URL, we can resolve relative paths using the PWA URL itself.
    // For example, consider this manifest declaration:
    //    <link rel="manifest" href="data:application/manifest+json,..." />
    // The manifestUrl will be "data:application/manifest+json,..."
    // In this case, we can't do new URL("/foo.png", "data:application/manifest+json") - it will throw an error.
    // Instead, we can resolve the absolute URL using the PWA URL itself.
    const manifestUrlOrRoot = maniUrl.startsWith(
        'data:application/manifest+json,'
    )
        ? pwaUrl
        : maniUrl;

    const fullScopeUrl = new URL(manifest.scope || '.', manifestUrlOrRoot).toString();

    // Need to remove file endings, like .png, from the share_target config
    // so that Android can parse it correctly.
    // https://github.com/pwa-builder/PWABuilder/issues/3846

    const shareTarget = manifest.share_target;
    if (shareTarget) {
        const toParseFiles = shareTarget.params?.files;

        let goodFiles: string[] = [];

        if (toParseFiles) {
            for (const files of toParseFiles) {
                if (files.accept) {
                    files.accept.forEach((accept) => {
                        if (accept.startsWith(".") === false) {
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
        backgroundColor:
            manifest.background_color ||
            manifest.theme_color ||
            '#FFFFFF',
        display: display,
        enableNotifications: true,
        enableSiteSettingsShortcut: true,
        fallbackType: 'customtabs',
        features: {
            locationDelegation: {
                enabled: false,
            },
            playBilling: {
                enabled: false,
            },
        },
        host: new URL(pwaUrl).host,
        iconUrl: getAbsoluteUrl(icon.src, manifestUrlOrRoot),
        includeSourceCode: false,
        isChromeOSOnly: false,
        isMetaQuest: false,
        launcherName: (manifest.short_name || appName || 'My PWA').substring(0, 30), // launcher name should be the short name. If none is available, fallback to the full app name.
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
            keyPassword: '', // If empty, one will be generated by CloudAPK service
            storePassword: '', // If empty, one will be generated by CloudAPK service
        },
        signingMode: 'new',
        splashScreenFadeOutDuration: 300,
        startUrl: getStartUrlRelativeToHost(
            manifest.start_url,
            new URL(manifestUrlOrRoot)
        ),
        themeColor: manifest.theme_color || '#FFFFFF',
        themeColorDark: manifest.theme_color || '#000000',
        shareTarget: manifest.share_target,
        webManifestUrl: maniUrl,
        pwaUrl: manifestContext.siteUrl,
        fullScopeUrl: fullScopeUrl,
        minSdkVersion: 23  // Setting minSdkVersion to 23 by default as Google Play Console no longer accepts lower versions
    };
}

/**
 * Resolves a relative URL to an absolute URL based on the manifest URL.
 * If relativeUrl is null, this will return an empty string.
 * @param relativeUrl The relative URL to make absolute.
 * @param manifestUrl The absolute URL to the web manifest.
 */
function getAbsoluteUrl(
    relativeUrl: string | undefined,
    manifestUrl: string
): string {
    if (!relativeUrl) {
        return '';
    }

    return new URL(relativeUrl, manifestUrl).toString();
}

function getStartUrlRelativeToHost(
    startUrl: string | null | undefined,
    manifestUrl: URL | string
) {
    // Example with expected output:
    // - IN: startUrl = "./index.html?foo=1"
    // - IN: manifestUrl = "https://www.foo.com/subpath/manifest.json"
    // - OUT: "/subpath/index.html?foo=1"

    // The start URL we send to the CloudAPK service should be a URL relative to the host.
    const absoluteStartUrl = new URL(startUrl || '/', manifestUrl);

    return absoluteStartUrl.pathname + (absoluteStartUrl.search || '');
}


