export const env = {
    isProduction: false,
    manifestCreatorUrl: '',
    imageProxyUrl: '',
    api: '',
    windowsPackageGeneratorUrl: '',
    androidPackageGeneratorUrl: '',
    iosPackageGeneratorUrl: '',
    oculusPackageGeneratorUrl: '',
    imageGeneratorUrl: '',
    safeUrlFetcher: '',
    validateGiveawayUrl: '',
    tokensCampaignRunning: false,
};

//@ts-ignore
if (import.meta.env.PROD) {
    env.isProduction = true;
    env.api = '/api';
    env.manifestCreatorUrl =
        '/api/manifests/create';
    env.imageProxyUrl = '/api/images/getSafeImageForAnalysis';
    env.windowsPackageGeneratorUrl =
        'https://pwabuilder-windows-docker.azurewebsites.net/msix/generatezip';
    env.androidPackageGeneratorUrl =
        'https://pwabuilder-cloudapk.azurewebsites.net';
    env.iosPackageGeneratorUrl = '/api/iospackage/create';
    env.oculusPackageGeneratorUrl =
        'https://pwabuilder-oculus-linux-docker-app.azurewebsites.net/packages/create';
    env.imageGeneratorUrl =
        'https://appimagegenerator-prod-dev.azurewebsites.net';
    env.safeUrlFetcher =
        '/api/images/getSafeImageForAnalysis';
    env.validateGiveawayUrl =
        'https://pwabuilder-tokens-giveaway.azurewebsites.net/api';
} else {
    env.api = '/api';
    env.manifestCreatorUrl =
        '/api/manifests/create';
    env.imageProxyUrl = '/api/images/getSafeImageForAnalysis';
    env.windowsPackageGeneratorUrl =
        'https://localhost:5001/msix/generatezip';
    env.androidPackageGeneratorUrl =
        'http://localhost:5858';
    env.iosPackageGeneratorUrl = '/api/iospackage/create';
    env.oculusPackageGeneratorUrl =
        'https://pwabuilder-oculus-linux-docker-app.azurewebsites.net/packages/create';
    env.imageGeneratorUrl =
        'https://appimagegenerator-prod-dev.azurewebsites.net';
    env.safeUrlFetcher =
        '/api/images/getSafeImageForAnalysis';
    env.validateGiveawayUrl =
        'https://pwabuilder-tokens-giveaway.azurewebsites.net/api';
}
