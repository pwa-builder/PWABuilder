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
  webPackageGeneratorFormUrl: '',
  zipCreatorUrl: '',
  validateGiveawayUrl: '',
  tokensCampaignRunning: false,
};

//@ts-ignore
if (import.meta.env.PROD) {
  env.isProduction = true;
  env.api = '/api';
  env.manifestCreatorUrl =
    '/api/manifests/create';
  env.imageProxyUrl = '/api/images/getSafeImage';
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
  env.webPackageGeneratorFormUrl =
    'https://pwabuilder-web-platform.azurewebsites.net/form';
  env.zipCreatorUrl = 'https://azure-express-zip-creator.azurewebsites.net/api';
  env.validateGiveawayUrl =
    'https://pwabuilder-tokens-giveaway.azurewebsites.net/api';
} else {
  env.api = '/api';
  env.manifestCreatorUrl =
    '/api/manifests/create';
  env.imageProxyUrl = '/api/images/getSafeImage';
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
  env.webPackageGeneratorFormUrl =
    'https://pwabuilder-web-platform.azurewebsites.net/form';
  env.zipCreatorUrl = 'https://azure-express-zip-creator.azurewebsites.net/api';
  env.validateGiveawayUrl =
    'https://pwabuilder-tokens-giveaway.azurewebsites.net/api';
}
