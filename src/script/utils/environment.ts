export const env = {
  manifestFinderUrl:
    'https://pwabuilder-manifest-finder.azurewebsites.net/api/findmanifest',
  serviceWorkerUrl:
    'https://pwabuilder-serviceworker-finder.centralus.cloudapp.azure.com',
  api: 'https://pwabuilder-api-pre.azurewebsites.net',
  testAPIUrl: 'https://pwabuilder-tests-dev.azurewebsites.net/api',
  windowsPackageGeneratorUrl:
    'https://pwabuilder-win-chromium-platform.centralus.cloudapp.azure.com/msix/generatezip',
  androidPackageGeneratorUrl: 'https://pwabuilder-cloudapk.azurewebsites.net',
  iosPackageGeneratorUrl: 'https://pwabuilder-ios.azurewebsites.net/packages/create',
  imageGeneratorUrl:
    'https://appimagegenerator-prod.azurewebsites.net/api/image',
  safeUrlFetcher:
    'https://pwabuilder-safe-url.azurewebsites.net/api/getsafeurl',
  webPackageGeneratorUrl: 'https://pwabuilder-web-platform.azurewebsites.net/',
  ratingUrl:
    'https://pwabuilder-url-logger-api.azurewebsites.net/api/analyses/getaveragescores',
};
