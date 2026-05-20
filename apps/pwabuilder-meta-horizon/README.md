# Meta Horizon Packaging Service

This is PWABuilder's Meta Horizon platform that generates a Meta Horizon Store-ready app package (an `.aab` file) from a Progressive Web App using Android's Trusted Web Activity technology, configured for Meta Quest headsets.

We utilize [Meta's fork of Bubblewrap](https://github.com/meta-quest/bubblewrap) (`@meta-quest/bubblewrap-core`) to generate and sign an Android app package targeting Horizon OS. See the [Meta Horizon PWA packaging documentation](https://developers.meta.com/horizon/documentation/web/pwa-packaging/) for full guidance on the Bubblewrap CLI options used by this service.

This tool generates a zip file containing both an `.apk` file (for sideloading and testing on a Quest device) and an `.aab` file (for submission to the Meta Horizon Store).

This app uses [PWABuilder's Android Build Box](https://github.com/pwa-builder/docker-android-build-box) docker image, which contains the necessary Android SDK Build Tools to execute Bubblewrap.

## Issues

Please use our [main repository for any issues/bugs/features suggestions](https://github.com/pwa-builder/PWABuilder/issues/new/choose).

## Running Locally

Steps:

1. Configure environment files: in `apps/pwabuilder-meta-horizon/env/test.env`, set the paths for your JDK and AndroidTools.

2. Launch the service: open the Run and Debug panel in VS Code, select "Launch Program", and press F5 to start the Meta Horizon package generator API.

3. Visit `localhost` to see the testing interface.

The response will be a zip file containing the generated app.

Alternatively, you can build and run the service using Docker:

```bash
npm run docker:build
npm run docker:run
```

This will start the docker container. Open a browser to `localhost:5859` to see the testing interface.

## More info

Once a Meta Horizon Store app package has been generated, follow the steps on the [Meta Horizon PWA packaging documentation](https://developers.meta.com/horizon/documentation/web/pwa-packaging/) to publish to the Meta Horizon Store.

## Deploy

Deploys are automatically pushed to the Meta Horizon staging slot. To deploy to production, swap staging and production.
