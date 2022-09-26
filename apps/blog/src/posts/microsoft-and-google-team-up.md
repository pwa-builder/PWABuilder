---
layout: post
title: Microsoft and Google team up to make PWAs better in the Play Store
excerpt: We’re glad to announce a new collaboration between Microsoft and Google for the benefit of the web developer community.
description: description
date: 2020-07-09
updatedDate: 2020-07-09
trending: false
featured: true
image: microsoft-google.png
isPost: true
backUrl: '/'
author:
  name: Judah Gabriel Himango
  twitter: https://twitter.com/JudahGabriel
  title: Software Engineer APS W+D 
tags:
  - post
  - Microsoft
  - Google
  - PlayStore
---

![hero-image](https://cdn-images-1.medium.com/max/800/1*6L9UnfO5V3UBpJ3RwaW1Vw.png)
<span class="figcaption_hack">Web shortcuts on Android — now available to PWA developers through PWABuilder</span>

We’re glad to announce a new collaboration between Microsoft and Google for the benefit of the web developer community. Microsoft’s [PWABuilder](https://pwabuilder.com) and Google’s [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) are now working together to help developers publish PWAs in the Google Play Store.

[PWABuilder.com](https://pwabuilder.com) is Microsoft’s open source developer tool that helps you build high quality PWAs and publish them in app stores.

Bubblewrap is Google’s command line utility and library to generate and sign Google Play Store packages from Progressive Web Apps.

Earlier this year we started working together with Google to make PWABuilder utilize Bubblewrap under the hood. Today, **we’re announcing two great new features for PWA developers borne out of our collaboration:**

1. **Web shortcuts support:** PWAs packaged for Google Play via PWABuilder will now support the new [web shortcuts standard](https://w3c.github.io/manifest/#shortcuts-member<span aria-hidden="true">.</span>
2. **Advanced Android features & customization:** PWABuilder now supports the full range of trusted web activity options that makes your PWA shine on Android devices. From PWABuilder, you can customize the appearance of the Android status bar and nav bar in your PWA, customize your Android splash screen, change your launcher name, use an existing signing key, utilize deeper push notification support, configure your package’s ID and versioning, fallback behavior and more.

All of this was a result of the collaboration between Google and Microsoft, with
your PWAs reaping the benefit. More details below.

## Web Shortcuts Support

Shortcuts are a [new web standard](https://w3c.github.io/manifest/#shortcuts-member) that enables installed PWAs to have app shortcuts, a contextual list of common actions that users can quickly jump to:

![alt](https://cdn-images-1.medium.com/max/800/1*kexmUlkc6zF4VwlTzqBgBw.png)
<span class="figcaption_hack">Twitter is using web shortcuts to enable quick actions like New Tweet, Notifications, DMs. This feature is now available in Edge Canary and Chrome Canary.</span>

Web shortcuts integrate into the operating system — such as Windows’ task bar and start menu, or Android’s home screen— enabling users to quickly access your app’s core functionality.

**Today we’re pleased to announce support for shortcuts in PWABuilder**. Thanks to our collaboration with Google’s Bubblewrap, PWAs you package for the Google Play Store through pwabuilder.com will now receive full support for shortcuts. 😎

The support happens automatically; no extra work required. [Shortcuts you define in your web app manifest](https://w3c.github.io/manifest/#shortcuts-member) will work in your Google Play Store APK package as one might expect them to. As users discover and install your PWA in the Google Play Store, they’ll be able to easily re-engage with your app through web shortcuts.

To try it out, go to pwabuilder.com and put in the URL to a PWA with shortcuts, such as [https://sadchonks.com](https://sadchonks.com)<span aria-hidden="true">:</span>

![alt](https://cdn-images-1.medium.com/max/800/1*ZqsttjST0-y717XcAlj01w.png)

Click start to analyze the URL and then click “Build My PWA”:

![alt](https://cdn-images-1.medium.com/max/800/1*Hdy8J1PRcNsP3-hNR82jOg.png)

You’re asked which app stores to publish in. Choose Android to package for the Google Play Store:

![alt](https://cdn-images-1.medium.com/max/800/1*9sX2c657nWoeU7VDWpYy8g.png)

![alt](https://cdn-images-1.medium.com/max/800/1*4BxPF0GM2DN4G1VGSzu4gg.png)

This will generate an APK package that can be uploaded to the Google Play Store. And when it’s installed on Android, your app shortcuts will just work. For example, you can long-press on your app’s tile to see the web shortcuts:

![alt](https://cdn-images-1.medium.com/max/800/1*lS8bi-z_ZcA1oyvmFvIfuA.png)
<span class="figcaption_hack">Web shortcuts working on Android in a PWA published to the Google Play Store</span>

You can read up more about your PWA’s web shortcuts on Android over at the [shortcuts with trusted web activities explainer](https://web.dev/app-shortcuts/#trusted-web-activity-support)<span aria-hidden="true">.</span>

## **Android Features & Customization**

When we rolled out our initial collaborative work with Google’s Bubblewrap this spring, PWABuilder didn’t have a way to customize the Android package it generated. While this was fine for some basic scenarios, like publishing to the Google Play Store for the first time, it fell short in other ways.

To address this, we’ve updated PWABuilder to allow for full customization of your Android app package:

![alt](https://cdn-images-1.medium.com/max/800/1*yL7vPAg4L5B4hkkPKPM2SA.png)
<span class="figcaption_hack">PWABuilder Android options. When you package your PWA for Android, we give you a
bunch of ways to customize the appearance and functionality of your Android app</span>

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
  maskable icons on Android, see [https://web.dev/maskable-icon](https://web.dev/maskable-icon/)<span aria-hidden="true">.</span>
- **Monochrome icon URL**: Optional. The monochrome icon to use for your app. Android can use this to fill your icon with a certain color based on user preferences, theme or color mode, or high contrast configurations. We populate this with a [purpose: monochrome](https://w3c.github.io/manifest/#purpose-member) icon from your app manifest<span aria-hidden="true">.</span>
- **Fallback behavior:** When the full TWA experience isn’t available, how should your app proceed, whether with a web view or [Chrome’s Custom Tabs feature](https://developer.chrome.com/multidevice/android/customtabs)<span aria-hidden="true">.</span> We default to the latter.
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

To access this functionality, put a URL into pwabuilder.com<span aria-hidden="true">,</span> then: <br> **Build My PWA -> Android -> Options**

![alt](https://cdn-images-1.medium.com/max/800/1*Ui2YKhWlbvIYgrlESMAPDg.png)
<span class="figcaption_hack">Choosing Options here will open the Android package options discussed above</span>

## Final thoughts

Both web shortcuts and Android package customization are possible thanks to the collaboration between Google and Microsoft. We are working together to make the
web a more capable app platform.

In addition to the above, we’re also collaborating with Google on [Project Fugu](https://docs.google.com/spreadsheets/d/1de0ZYDOcafNXXwMcg4EZhT0346QM-QFvZfoD8ZffHeA/edit#gid=557099940) to incubate new web platform features, with PWAs front and center, toward the goal of standardization so everyone benefits. We’ve highlighted some Project Fugu capabilities in our [web platform demo showcase](https://components.pwabuilder.com/)<span aria-hidden="true">.</span>

We hope you enjoy these capabilities in PWABuilder! Please give it a try over at [pwabuilder.com](https://pwabuilder.com)<span aria-hidden="true">.</span>
