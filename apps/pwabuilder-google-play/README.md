# Google Play Packaging Service

This is PWABuilder's Google Play platform that generates a Google Play-ready app package (an `.aab` file) from a Progressive Web App using Android's Trusted Web Activity technology.

We utilize [Google's Bubblewrap](https://github.com/googlechromelabs/bubblewrap) to generate and sign an Android app package.

This tool generates a zip file containing both an `.apk` file (for testing) and an `.aab` file (for submission to Google Play Store).

This app uses [PWABuilder's Android Build Box](https://github.com/pwa-builder/docker-android-build-box) docker image, which contains the necessary Android SDK Build Tools to execute Bubblewrap.

## Issues

Please use our [main repository for any issues/bugs/features suggestion](https://github.com/pwa-builder/PWABuilder/issues/new/choose).

## Running Locally

Steps:

1. Configure environment files: In apps/pwabuilder-google-play/env/test.env, set the paths for your JDK and AndroidTools.

2. Launch the service: In Visual Studio Code, open the Run and Debug panel, select the “Attach: Google Play Service” configuration, and press F5 to start the Android Package generator API.

3. Visit `localhost` to see the testing interface.

The response will be a zip file containing the generated app.

Alternatively, you can build and run the service using Docker:

```bash
npm run docker:build
npm run docker:run
```

This will start the docker container. Open a browser to localhost:5779 to see the testing interface.

## More info

Once a Google Play app package has been generated, follow the steps on [Next Steps](Next-steps.md).

## Deploy

Deploys are automatically pushed to cloudapk/staging slot. To deploy to production, swap staging and production.
