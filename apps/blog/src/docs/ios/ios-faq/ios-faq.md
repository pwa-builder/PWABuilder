---
layout: doc
title: iOS FAQ
excerpt: Answers to frequently asked questions about PWABuilder's iOS platform
description: Answers to frequently asked questions about PWABuilder's iOS platform
date: 2021-10-27
updatedDate: 2021-10-27
trending: false
featured: false
recommended: false
isDocumentation: true
backUrl: '/docs'
image: docs/ios/ios-appstore-documentation/StoreLogo.png
author:
  name: PWA Builder documentation
tags:
  - docs
  - Documentation
  - iOS
---

## How can I tell if my PWA was launched from the iOS app?

At runtime, your PWA will have a `app-platform` cookie. This cookie's value will be set to `iOS App Store`.

## Can I publish to the App Store without a Mac?

No, not currently. You'll need Xcode to build your project, which is only available on Mac.

However, there are 3rd party build services, such as [AppVeyor](https://www.appveyor.com/pricing/) or [GitHub Actions with Xcode Archive](https://github.com/marketplace/actions/xcode-archive), that can build Xcode projects as part of your continuous integration (CI) pipeline. 

Additionally, there are inexpesive services, such as [Macincloud](https://www.macincloud.com/), which let you remote into a Mac with Xcode already installed. You can use those services to build your PWA iOS app package.

## What PWA features can I use on iOS?

Unlike Google Play and Microsoft Store, Apple's App Store doesn't natively support PWAs.

To bridge this gap, your PWA runs in a [WKWebView](https://developer.apple.com/documentation/webkit/wkwebview) hosted inside a native Swift app. Generally, features that work in iOS Safari will work in your PWA.

This includes [service worker support](https://love2dev.com/blog/apple-ships-service-workers/).

To get a glimpse of general PWA support on iOS, we recommend [Maximiliano Firtman's posts on the subject](https://firt.dev/tags/ios/).

## How do updates work?

Since your PWA is being loaded in a web view, pushing changes to your web app will automatically be reflected in your iOS app. No App Store resubmission required.

If you need to make changes to the iOS app itself -- for example, adding new iOS-specific capabilities, or otherwise modifying your app template -- only then you'll need to submit an update to your App Store listing.

## Can I publish my PWA to the *Mac* Store?

Yes. While this template is designed for the iOS App Store, you can additionally publish to the Mac App Store.

In [App Store Connect](https://appstoreconnect.apple.com/apps), choose your app. Then under `Pricing & Availability`, enable `Make this app available for MacOS App Store`:

![image](https://user-images.githubusercontent.com/312936/138754831-17de3a87-5a8a-47c3-8137-331125ced1e0.png)

## Can I debug my PWA app on an iOS device?

You can open Safari Dev Tools while your PWA is running in your iPhone simulator.

1. Open your .xcworkspace file in Xcode.
2. Click ▶ to run your PWA inside the iPhone simulator.
3. Open Safari
4. In the top menu bar, choose `Develop` -> `Simulator [device name]` -> `[Your PWA's URL]`
![image](https://user-images.githubusercontent.com/312936/138755619-c7a0cb7a-c96d-4640-a808-3aae24e9b1ef.png)
5. Safari's dev tools will open, allowing you to debug your PWA, execute arbitrary JS, set breakpoints, etc.

## Can I customize my source code?

Yes, certainly. Open your project in Xcode and make your changes as usual.

## Can I use iOS capability X?

Yes. To use iOS capabilities, such as `Sign In with Apple`, `Apple Wallet`, `HealthKit`, or other iOS-specific capabilities, you should specify those capabilities while creating your Bundle ID.

Then, make changes to the code to make use of that ability.

## How is this different from the old PWABuilder iOS platform?

Some time ago, PWABuilder had an iOS platform based on the now-deprecated UIWebView. The template lacked a number of PWA integrations, and because it used deprecated technology, couldn't take advantage of new WebKit capabilities, such as service worker support via [App-Bound Domains](https://webkit.org/blog/10882/app-bound-domains/).

This new template is a fresh take on a PWA iOS app using modern iOS technologies.

## How is this different than Apache Cordova?

Apache Cordova is a broader platform that aims to expose native capabilities to your web app through a special runtime and plugins. For example, you might use Cordova to package your PWA, then make special calls from your PWA's JavaScript to interact with native functionality.

PWA's iOS platform is more narrow in scope, aiming to make your PWA run well, as-is, with as many PWA capabilities as we can build, on iOS. PWABuilder's iOS platform is more like a polyfill for PWAs on iOS: giving you some PWA functionality where iOS is lacking. We make it easy to publish your PWA to the iOS App Store without any changes to your PWA code.

If Cordova's broader approach is the right tool for your PWA on iOS, by all means use it.

## Need more help?

If you're stuck, the PWABuilder team would be glad to point you in the right direction. [Open an issue](https://github.com/pwa-builder/PWABuilder/issues/new?assignees=&labels=ios-platform,question%20%3Agrey_question%3A&body=Type%20your%20question%20here.%20Please%20include%20the%20URL%20to%20your%20PWA.%0A%0A%3E%20If%20my%20answer%20was%20in%20the%20docs%20all%20along%2C%20I%20promise%20to%20give%20%245%20USD%20to%20charity.) and we'll help walk you through it.
