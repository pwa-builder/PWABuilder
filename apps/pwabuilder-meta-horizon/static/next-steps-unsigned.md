# Next steps for getting your PWA into the Meta Horizon Store
You've successfully generated a Meta Horizon Store app package (`.apk` file) for your PWA. 🥽

You chose to generate an *unsigned* package, so there are a few additional steps. If you'd rather generate a signed package, you can do so by re-running PWABuilder's Meta Horizon packaging dialog and choosing a signing mode.

Your next steps:

1. Sign your APK.
2. Generate `assetlinks.json` and deploy it to your server.
3. Test your package on a Meta Quest device or emulator.
4. Upload your `.aab` file to the Meta Horizon Store.

Each step is explained below.

## 1. Sign your APK

You instructed PWABuilder to generate an *unsigned* APK. Before you can submit to the Horizon Store, you'll need to sign it.

To sign your APK, you can either re-run PWABuilder and ask it to generate a signed APK / AAB, or you can [manually sign it](https://developer.android.com/studio/publish/app-signing) with a new or existing key.

💁‍♂️ *Heads up*: If you create a new signing key, make sure you keep it and its credentials in a safe place. You'll need it again to upload future versions of your app to the Meta Horizon Store.

## 2. Generate and deploy `assetlinks.json`

While this step is optional, skipping it will cause the Quest browser to display a URL bar inside your app.

A [Digital Asset Links](https://developers.google.com/web/updates/2019/08/twas-quickstart#creating-your-asset-link-file) file proves you own your PWA's domain.

Once you've signed your APK, you can use the signing key to generate `assetlinks.json` - your digital asset links file.

Once generated, upload it to your server at `https://example.com/.well-known/assetlinks.json`. (Replace example.com with your PWA's URL.)

💁‍♂️ *Heads up*: **Digital asset links are required for your PWA to load without a URL bar inside the Trusted Web Activity**.

## 3. Test your APK on a Meta Quest device

Once you sign your `.apk` file, you can sideload it onto a Meta Quest headset for testing.

You can use [Meta Quest Developer Hub](https://developers.meta.com/horizon/documentation/) or `adb install` to push your APK to the headset.

## 4. Upload your `.aab` file to the Meta Horizon Store

Your signed `.aab` file can be submitted via the [Meta Horizon Developer Center](https://developers.meta.com/horizon/).

For full guidance on submission, see the [Meta Horizon PWA packaging documentation](https://developers.meta.com/horizon/documentation/web/pwa-packaging/).

## Need more help?

If you're stuck and need help, we're here to help. You can [open an issue](https://github.com/pwa-builder/pwabuilder/issues) and we'll help walk you through it.
