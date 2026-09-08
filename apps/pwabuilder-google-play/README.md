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

### Android build input security

Packaging options are untrusted, including options loaded from queued jobs. The
HTTP validator checks DNS hosts (also accepting HTTPS prefixes, ports, IDNs, and
legacy path prefixes) and the runtime types of Gradle scalar inputs. The worker
revalidates before project generation and only forwards supported manifest fields
and features to Bubblewrap.

`scripts/patch-bubblewrap-gradle.mjs` patches Bubblewrap 1.25.0's Gradle template
and shortcut URL serializer. Strings are encoded as single-quoted Groovy literals,
not interpolated GStrings; numbers and booleans are type-checked at the template
boundary. The patch checks the dependency version and complete source hashes and
fails closed on unreviewed changes. Remove it only after an upstream release
secures the same sinks and the regression tests pass.

The patch runs during installation, build, and npm start/dev. Docker deliberately
installs with `--ignore-scripts`, then applies it through `npm run build`. Do not
deploy an install made with `--ignore-scripts` without running the build. Run
`npm test` for validation, real-template rendering, patch lifecycle, and isolated
HTTP-route regressions; these do not execute Gradle or contact production.

This code fix does not isolate the build process from the service's identity,
other jobs, or signing material. Following a reported production code execution,
pause packaging and involve incident response: replace affected workers, review
queued jobs and build artifacts, investigate identity/storage access, and rotate
potentially exposed credentials and signing material as appropriate. Deploy the
patched image to every slot/worker before resuming. Separately move builds into
per-job, non-root sandboxes without backend credentials or managed-identity access;
keep signing and artifact publication outside those sandboxes. Running as non-root
alone does not remove managed-identity access.
