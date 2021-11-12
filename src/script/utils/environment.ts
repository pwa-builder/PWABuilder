export const env = {
  manifestFinderUrl: '',
  manifestCreatorUrl: '',
  serviceWorkerUrl: '',
  api: '',
  windowsPackageGeneratorUrl: '',
  androidPackageGeneratorUrl: '',
  imageGeneratorUrl: '',
  safeUrlFetcher: '',
  webPackageGeneratorUrl: '',
  webPackageGeneratorFormUrl: '',
  ratingUrl: ''
}

if((window as any).ENV == "production"){
  console.log("in production");
  env.manifestFinderUrl = 'https://pwabuilder-manifest-finder.azurewebsites.net/api/findmanifest';
  env.manifestCreatorUrl = 'https://pwabuilder-manifest-creator.azurewebsites.net/api/create'
  env.serviceWorkerUrl = 'https://pwabuilder-serviceworker-finder.centralus.cloudapp.azure.com';
  env.api = 'https://pwabuilder-tests.azurewebsites.net/api';
  env.windowsPackageGeneratorUrl = 'https://pwabuilder-win-chromium-platform.centralus.cloudapp.azure.com/msix/generatezip';
  env.androidPackageGeneratorUrl = 'https://pwabuilder-cloudapk.azurewebsites.net';
  env.imageGeneratorUrl = 'https://appimagegenerator-prod.azurewebsites.net/api/image';
  env.safeUrlFetcher = 'https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl';
  env.webPackageGeneratorUrl = 'https://pwabuilder-web-platform.azurewebsites.net/';
  env.webPackageGeneratorFormUrl = 'https://pwabuilder-web-platform.azurewebsites.net/form';
  env.ratingUrl = 'https://pwabuilder-url-logger-api.azurewebsites.net/api/analyses/getaveragescores';
} else {
  console.log("not in production");
  env.manifestFinderUrl = 'https://pwabuilder-manifest-finder.azurewebsites.net/api/findmanifest';
  env.manifestCreatorUrl = 'https://pwabuilder-manifest-creator.azurewebsites.net/api/create'
  env.serviceWorkerUrl = 'https://pwabuilder-serviceworker-finder.centralus.cloudapp.azure.com';
  env.api = 'https://pwabuilder-tests-dev.azurewebsites.net/api'; // changed
  env.windowsPackageGeneratorUrl = 'https://pwabuilder-win-chromium-platform.centralus.cloudapp.azure.com/msix/generatezip';
  env.androidPackageGeneratorUrl = 'https://pwabuilder-cloudapk-pre.azurewebsites.net'; // changed 
  env.imageGeneratorUrl = 'https://appimagegenerator-pre.azurewebsites.net'; // changed
  env.safeUrlFetcher = 'https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl';
  env.webPackageGeneratorUrl = 'https://pwabuilder-web-platform.azurewebsites.net/';
  env.webPackageGeneratorFormUrl = 'https://pwabuilder-web-platform.azurewebsites.net/form';
  env.ratingUrl = 'https://pwabuilder-url-logger-api.azurewebsites.net/api/analyses/getaveragescores';
}