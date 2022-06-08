---
layout: doc
title: Generating your Android package
excerpt: Everything you need to know about testing and generating your Android app with PWABuilder
description: Everything you need to know about testing and generating your Android app with PWABuilderPlay Store
date: 2021-09-17
updatedDate: 2021-09-17
trending: false
featured: false
isDocumentation: true
backUrl: '/docs/android-platform-documentation/'
image: docs/android/next-steps-documentation/StoreLogo.png
author:
  name: PWA Builder documentation
tags:
  - docs
  - Documentation
  - Android
---

To learn more about how PWABuilder generates a Trusted Web Activity from your PWA, check out [our post](/posts/microsoft-and-google-team-up) on this collaborative effort.

## Generating your Android application with PWABuilder

First, go to pwabuilder.com and put in the URL to your PWA, such as [https://sadchonks.com](https://sadchonks.com):

![A screenshot of PWABuilder that shows where to enter your URL](/docs/android/generating-your-android-package/enter-url.png)

and then tap start to analyze your PWA.

![A screenshot of the analyzing page in PWABuilder analyzing a PWA.](/docs/android/generating-your-android-package/analyzing.png)

You are now at the report card page! If your app is already a PWA your scores will all be green, if not, thats ok! You can [use PWABuilder to help convert your web app to a PWA](/docs/converting-your-web-app-to-a-progressive-web-app-with-pwabuilder/). You can now tap the next button to continue to the packaging page!

![A screenshot of the report card page in PWABuilder. This PWA has great scores across the Manifest, Service Worker and Security](/docs/android/generating-your-android-package/report_card.png)

You can now tap the Store Package button on the Android platform to generate your Android app.

![A screenshot of the Android platform card on PWABuilder that shows the Store Package button](/docs/android/generating-your-android-package/android-card.png)

Next you will see a list of the different options for the Android platform that are covered in more detail below.

![A screenshot of the Android platform options UI in PWABuilder. This UI enables you to edit many details of your Android application](/docs/android/generating-your-android-package/options.png)

When you are ready, tap the Generate button to generate your Android app, and then the Download button when it pops up to download the generated App and associated files.

![A screenshot of the Download button on PWABuilder. You can tap this button to download your generated app](/docs/android/generating-your-android-package/download.png)

After generating your Android app, see our [Android Next Steps documentation](/docs/android/next-steps-documentation/) for more information on how to test your application and then publish to the Google Play Store!

## Android Features & Customization

When we rolled out our initial collaborative work with Google’s Bubblewrap this spring, PWABuilder didn’t have a way to customize the Android package it generated. While this was fine for some basic scenarios, like publishing to the Google Play Store for the first time, it fell short in other ways.

To address this, we’ve updated PWABuilder to allow for full customization of your Android app package

With this new functionality, you can customize your PWA for Android:

- **Package ID:** The Android identifier unique to your app
- **App name:** The full name of your app. We prepopulate this with the [app name](https://w3c.github.io/manifest/#name-member) from your PWA’s app manifest.
- **Launcher name**: The name of your app in the Android launcher. This is typically the same as app name, or a shortened version of it. We prepopulate this with [short_name](https://w3c.github.io/manifest/#short_name-member) from your PWA’s app manifest.
- **App version**: This is the version string displayed to end users, e.g. “1.0.0.0”
- **App version code**: This is an integer used as a private, internal version of your app.
- **Host, Start URL, Manifest URL**: The URLs used to launch your PWA in the Android app. We prepopulate these for you from your app manifest.
- **Status bar color, Nav bar color**: The color of the Android status bar and navigation bar in your PWA. You can also hide these bars by setting Display to
  Fullscreen. We prepopulate this using colors from your app manifest.
- **Nav bar color:** Same as above, but for the Android navigation bar. Also can be hidden by setting Display to Fullscreen.
- **Splash screen color:** The background color of the splash screen that will be used when creating your Android app. We prepopulate this with the theme color
  specified in your app manifest.
- **Splash screen fade out time:** How long to fade out the splash screen in milliseconds. We default to 300ms.
- **Icon URL**: URLs for the icon to use for your app. We recommend a 512x512 icon.
- **Maskable icon URL**: Optional. The icon to use on Android devices that show rounded corner icons. Typically, this icon should have some padding around the
  icon’s content, enabling the icon to be safely rounded without losing fidelity. We populate this with a [purpose: maskable](https://w3c.github.io/manifest/#purpose-member icon from your app manifest. If one can’t be found, we use the icon. For more information about
  maskable icons on Android, see [https://web.dev/maskable-icon](https://web.dev/maskable-icon/).
- **Monochrome icon URL**: Optional. The monochrome icon to use for your app. Android can use this to fill your icon with a certain color based on user preferences, theme or color mode, or high contrast configurations. We populate this with a [purpose: monochrome](https://w3c.github.io/manifest/#purpose-member) icon from your app manifest.
- **Fallback behavior:** When the full TWA experience isn’t available, how should your app proceed, whether with a web view or [Chrome’s Custom Tabs feature](https://developer.chrome.com/multidevice/android/customtabs). We default to the latter.
- **Display mode:** <br> **— Standalone** means your PWA takes up all the area except Android status bar and Navigation bar. <br> **— Fullscreen** hide both
  bars. This is intended for immersive experiences likes games and media playback.
- **Notifications**: If enabled, your PWA will use [Android Notification Delegation](https://github.com/GoogleChromeLabs/svgomg-twa/issues/60) for push
  notifications, meaning your installed PWA can send push notifications without browser permission prompts. You should enable this if your PWA sends push
  notifications.
- **Signing key:** How the APK app package will be digitally signed: <br> **— None:** your app package won’t be signed. Unsigned packages will be signed by
  the Google Play Store. This is Google’s recommendation, and our default.<br> **— New:** PWABuilder will create a new signing key for you. The signing key will
  be included in your zip download. Choosing this will let you fill in details like password, alias, and more.<br> **— Mine:** Upload an existing .keystore
  file to use for signing the app package. This should be used if you are updating an existing app in the Store. You’ll be prompted to specify your existing key
  passwords and alias.

Whew! As you can see, you can customize nearly every aspect of your PWA Android app package.