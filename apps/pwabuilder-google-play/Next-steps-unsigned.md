# Next steps for getting your PWA into the Google Play Store
You've successfully generated a Google Play Store app package (`.apk` file) for your PWA. 😎

You chose to generate an *unsigned* package, so there are a few additional steps. If you'd rather generated a signed package, you can do so in [PWABuilder's Android Options dialog](https://medium.com/pwabuilder/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store-b59710e487#6325).

Your next steps:
1. Sign your APK.
2. Generate `assetlinks.json` and deploy to your server.
3. Test your package on an Android device or Android emulator.
4. Upload your `apk` file to the Google Play Store.

Each step is explained below.

## 1. Sign your APK

You instructed PWABuilder to generate an *unsigned* APK. Before you can test your APK, you'll need to sign it.

To sign your APK, you can either [instruct PWABuilder to generate a signed APK](https://medium.com/pwabuilder/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store-b59710e487#b5dc), or you can [manually sign it](https://developer.android.com/studio/publish/app-signing) with a new or existing key.

💁‍♂️ *Heads up*: If you create a new signing key, make sure you keep it and its credentials in a safe place. You'll need it again to upload future versions of your app.

## 2. Generate and deploy `assetlinks.json`

While this step is optional, skipping it will cause Android to display a browser addres bar in your app. 

A [Digital Asset Links](https://developers.google.com/web/updates/2019/08/twas-quickstart#creating-your-asset-link-file) file proves you own your PWA's domain.

Once you've signed your APK, you can use the signing key to generate `assetlinks.json` - your digital asset links file. To generate it, follow the [steps outlined here](https://developers.google.com/web/updates/2019/08/twas-quickstart#creating-your-asset-link-file).

Once you've generated `assetlinks.json`, upload it to your server at `https://example.com/.well-known/assetlinks.json`. (Replace example.com with your PWA's URL.)

💁‍♂️ *Heads up*: **Digital asset links are required for your PWA to load without the browser address bar**. If you're seeing a browser address bar in your app on Android, you likely forgot to generate your digital asset links file.

## 3. Test your APK on an Android device or Android emulator
Once you sign your `.apk` file, it can run on an Android device and you can submit to the Google Play Store.

To test your app, install your app by downloading and opening the `.apk` file on an Android device.

Alternately, if you don't have a physical Android device, you can use an Android emulator such as the free [Android Emulator included in Android Studio](https://developer.android.com/studio/run/emulator). Run the emulator and open the `.apk` file to install your app. You can also drag and drop the `.apk` file onto the Android emulator to install it.

## 4. Upload your `.apk` file to the Google Play Store

Your `.apk` file can be submitted to the Play Store through the [Google Play Console](https://developer.android.com/distribute/console).

Once you submit your app, it will be reviewed. Once approved, your PWA will be available in the Google Play Store. 😎

💁🏽‍♀️ *Heads up*: when you submit your app to Google Play, you may receive a warning about your APK being unoptimized:
<img src="https://user-images.githubusercontent.com/33334535/87479049-1071ac80-c62b-11ea-8f56-e25ce2cc3d1d.png" load="lazy" />

This warning can be safely ignored. For more information, see [this thread](https://github.com/pwa-builder/CloudAPK/issues/23).

## Need more help?

If you're stuck and need help, we're here to help. You can [open an issue](https://github.com/pwa-builder/pwabuilder/issues) and we'll help walk you through it.