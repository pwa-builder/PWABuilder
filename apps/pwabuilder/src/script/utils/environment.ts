export const env = {
  isProduction: false,
  manifestFinderUrl: '',
  manifestCreatorUrl: '',
  serviceWorkerUrl: '',
  api: '',
  windowsPackageGeneratorUrl: '',
  androidPackageGeneratorUrl: '',
  iosPackageGeneratorUrl: '',
  oculusPackageGeneratorUrl: '',
  imageGeneratorUrl: '',
  safeUrlFetcher: '',
  webPackageGeneratorUrl: '',
  webPackageGeneratorFormUrl: '',
  ratingUrl: '',
  zipCreatorUrl: '',
};

if ((window as any).ENV == 'production') {
  env.isProduction = true;
  env.manifestFinderUrl =
    'https://pwabuilder-manifest-finder.azurewebsites.net/api/findmanifest';
  env.manifestCreatorUrl =
    'https://pwabuilder-manifest-creator.azurewebsites.net/api/create';
  env.serviceWorkerUrl =
    'https://pwabuilder-serviceworker-finder.centralus.cloudapp.azure.com';
  env.api = 'https://pwabuilder-tests.azurewebsites.net/api';
  env.windowsPackageGeneratorUrl =
    'https://pwabuilder-winserver.centralus.cloudapp.azure.com/msix/generatezip';
  env.androidPackageGeneratorUrl =
    'https://pwabuilder-cloudapk.azurewebsites.net';
  env.iosPackageGeneratorUrl =
    'https://pwabuilder-ios.azurewebsites.net/packages/create';
  env.oculusPackageGeneratorUrl =
    'https://pwabuilder-oculus-linux-docker-app.azurewebsites.net/packages/create';
  env.imageGeneratorUrl =
    'https://appimagegenerator-prod.azurewebsites.net/api/image';
  env.safeUrlFetcher =
    'https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl';
  env.webPackageGeneratorUrl =
    'https://pwabuilder-web-platform.azurewebsites.net/';
  env.webPackageGeneratorFormUrl =
    'https://pwabuilder-web-platform.azurewebsites.net/form';
  env.ratingUrl =
    'https://pwabuilder-url-logger-api.azurewebsites.net/api/analyses/getaveragescores';
  env.zipCreatorUrl = 'https://azure-express-zip-creator.azurewebsites.net/api';
} else {
  env.manifestFinderUrl =
    'https://pwabuilder-manifest-finder.azurewebsites.net/api/findmanifest';
  env.manifestCreatorUrl =
    'https://pwabuilder-manifest-creator.azurewebsites.net/api/create';
  env.serviceWorkerUrl =
    'https://pwabuilder-serviceworker-finder.centralus.cloudapp.azure.com';
  env.api = 'https://pwabuilder-tests-dev.azurewebsites.net/api'; // changed
  env.windowsPackageGeneratorUrl =
    'https://pwabuilder-winserver.centralus.cloudapp.azure.com/msix/generatezip';
  env.androidPackageGeneratorUrl =
    'https://pwabuilder-cloudapk-pre.azurewebsites.net'; // changed
  env.iosPackageGeneratorUrl =
    'https://pwabuilder-ios.azurewebsites.net/packages/create';
  env.oculusPackageGeneratorUrl =
    'https://pwabuilder-oculus-linux-docker-app.azurewebsites.net/packages/create';
  env.imageGeneratorUrl = 'https://appimagegenerator-pre.azurewebsites.net'; // changed
  env.safeUrlFetcher =
    'https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl';
  env.webPackageGeneratorUrl =
    'https://pwabuilder-web-platform.azurewebsites.net/';
  env.webPackageGeneratorFormUrl =
    'https://pwabuilder-web-platform.azurewebsites.net/form';
  env.ratingUrl =
    'https://pwabuilder-url-logger-api.azurewebsites.net/api/analyses/getaveragescores';
  env.zipCreatorUrl = 'https://azure-express-zip-creator.azurewebsites.net/api';
}
