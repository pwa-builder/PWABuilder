import type { AndroidPackageOptions } from '../../models/androidPackageOptions.js';

export function validOptions(): AndroidPackageOptions {
    return {
        analysisId: null,
        appVersion: '1.0.0',
        appVersionCode: 1,
        backgroundColor: '#ffffff',
        display: 'standalone',
        enableNotifications: false,
        fallbackType: 'customtabs',
        host: 'example.com',
        iconUrl: 'https://example.com/icon.png',
        includeSourceCode: false,
        launcherName: 'Example',
        name: 'Example',
        navigationColor: '#000000',
        packageId: 'com.example.app',
        pwaUrl: 'https://example.com/',
        signingMode: 'none',
        signing: null,
        splashScreenFadeOutDuration: 0,
        startUrl: '/',
        themeColor: '#ffffff',
        webManifestUrl: 'https://example.com/manifest.json',
    };
}
