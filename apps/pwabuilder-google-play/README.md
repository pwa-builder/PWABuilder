# Android Packaging Service

This is PWABuilder's Android platform that generates an Android app package from a Progressive Web App using Android's Trusted Web Activity technology.

We utilize [Google's Bubblewrap](https://github.com/googlechromelabs/bubblewrap) to generate and sign an Android app package.

This tool generates a zip file containing both an `.apk` file (for testing) and an `.aab` file (for submission to Google Play Store).

This app uses [PWABuilder's Android Build Box](https://github.com/pwa-builder/docker-android-build-box) docker image, which contains the necessary Android SDK Build Tools to execute Bubblewrap.

# Issues

Please use our [main repository for any issues/bugs/features suggestion](https://github.com/pwa-builder/PWABuilder/issues/new/choose).

# Running Locally

Steps:

1. Configure environment files: In apps/pwabuilder-google-play/env/test.env, set the paths for your JDK and AndroidTools.

2. Launch the service: In Visual Studio Code, open the Run and Debug panel, select the “Attach: Google Play Service” configuration, and press F5 to start the Android Package generator API.

3. Visit `localhost` to see the CloudAPK testing interface.

If you don't want to use the testing interface, you may also generate a package manually by sending a POST to `/generateAppPackage` with the following JSON body:

```json
{
  "additionalTrustedOrigins": [],
  "appVersion": "1.0.0.0",
  "appVersionCode": 1,
  "backgroundColor": "#3f51b5",
  "display": "standalone",
  "enableNotifications": false,
  "enableSiteSettingsShortcut": true,
  "fallbackType": "customtabs",
  "features": {
    "locationDelegation": {
      "enabled": true
    },
    "playBilling": {
      "enabled": false
    }
  },
  "host": "https://sadchonks.com",
  "iconUrl": "https://sadchonks.com/kitteh-512.png",
  "includeSourceCode": false,
  "isChromeOSOnly": false,
  "launcherName": "Chonks",
  "maskableIconUrl": null,
  "monochromeIconUrl": null,
  "name": "Sad Chonks",
  "navigationColor": "#3f51b5",
  "navigationColorDark": "#3f51b5",
  "navigationDividerColor": "#3f51b5",
  "navigationDividerColorDark": "#3f51b5",
  "orientation": "default",
  "packageId": "com.sadchonks",
  "serviceAccountJsonFile": null,
  "shareTarget": {
    "action": "/share-target/",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  },
  "shortcuts": [
    {
      "name": "New Chonks",
      "short_name": "New",
      "url": "/?shortcut",
      "icons": [
        {
          "sizes": "128x128",
          "src": "/favicon.png"
        }
      ]
    }
  ],
  "signing": null,
  "signingMode": "none",
  "splashScreenFadeOutDuration": 300,
  "startUrl": "/saved",
  "themeColor": "#3f51b5",
  "themeColorDark": "#0d1117",
  "webManifestUrl": "https://sadchonks.com/manifest.json"
}
```

The response will be a zip file containing the generated app.

# More info

Once an Android app package has been generated, follow the steps on [Next Steps](Next-steps.md).

# Deploy

Deploys are automatically pushed to cloudapk/staging slot. To deploy to production, swap staging and production.
