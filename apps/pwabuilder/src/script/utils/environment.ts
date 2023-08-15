export const env = {
  isProduction: false,
  manifestCreatorUrl: '',
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
  tokensCampaignRunning: false
};

//@ts-ignore
if (import.meta.env.PROD) {
  env.isProduction = true;
  env.api = 'https://pwabuilder-apiv2-node.azurewebsites.net/api';
  env.manifestCreatorUrl =
    'https://pwabuilder-manifest-creator.azurewebsites.net/api/create';
  env.windowsPackageGeneratorUrl =
    'https://pwabuilder-winserver.centralus.cloudapp.azure.com/msix/generatezip';
  env.androidPackageGeneratorUrl =
    'https://pwabuilder-cloudapk.azurewebsites.net';
  env.iosPackageGeneratorUrl =
    'https://pwabuilder-ios.azurewebsites.net/packages/create';
  env.oculusPackageGeneratorUrl =
    'https://pwabuilder-oculus-linux-docker-app.azurewebsites.net/packages/create';
  env.imageGeneratorUrl =
    'https://appimagegenerator-prod-dev.azurewebsites.net';
  env.safeUrlFetcher =
    'https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl';
  env.webPackageGeneratorFormUrl =
    'https://pwabuilder-web-platform.azurewebsites.net/form';
  env.zipCreatorUrl = 'https://azure-express-zip-creator.azurewebsites.net/api';
  env.validateGiveawayUrl = 'https://pwabuilder-tokens-giveaway.azurewebsites.net/api';
} else {
  env.api = 'https://pwabuilder-apiv2-node.azurewebsites.net/api';
  env.manifestCreatorUrl =
    'https://pwabuilder-manifest-creator.azurewebsites.net/api/create';
  env.windowsPackageGeneratorUrl =
    'https://pwabuilder-winserver.centralus.cloudapp.azure.com/msix/generatezip';
  env.androidPackageGeneratorUrl =
    'https://pwabuilder-cloudapk.azurewebsites.net';
  env.iosPackageGeneratorUrl =
    'https://pwabuilder-ios.azurewebsites.net/packages/create';
  env.oculusPackageGeneratorUrl =
    'https://pwabuilder-oculus-linux-docker-app.azurewebsites.net/packages/create';
  env.imageGeneratorUrl = 'https://appimagegenerator-prod-dev.azurewebsites.net';
  env.safeUrlFetcher =
    'https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl';
  env.webPackageGeneratorFormUrl =
    'https://pwabuilder-web-platform.azurewebsites.net/form';
  env.zipCreatorUrl = 'https://azure-express-zip-creator.azurewebsites.net/api';
  env.validateGiveawayUrl = 'https://pwabuilder-tokens-giveaway.azurewebsites.net/api';
}
