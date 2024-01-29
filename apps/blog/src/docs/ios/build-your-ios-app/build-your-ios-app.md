---
layout: doc
title: Build Your iOS App
excerpt: How to build and publish your iOS app package to the App Store
description: How to build and publish your iOS app package to the App Store
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

Once you've built your iOS app using [PWABuilder](https://www.pwabuilder.com), you're ready for your next steps:

1. **Build your project** in Xcode
2. **Test your app**: Run your project in Xcode to try out your PWA on an iPhone simulator or physical iOS device.
3. **Submit your app to the iOS App Store**

What you'll need:

- A **Mac with Xcode installed** (For details, see [our FAQ](/docs/ios-faq#can-i-publish-to-the-app-store-without-a-mac).)
- An **[Apple Developer Account](/docs/publish-your-pwa-to-the-ios-app-store#1-sign-into-your-apple-developer-account)** to publish your app to the App Store.

Each step is explained below.

## 1. Build your project in Xcode

Your zip file contains a `src` folder containing the source code for your iOS app. You'll [need a Mac with Xcode installed](/docs/ios-faq#can-i-publish-to-the-app-store-without-a-mac) to build this project.

Unzip the `src` folder and open a terminal in `src` and execute the following command:

`pod install`

> 💁‍♂️ *Heads up*: 
> 
> If you get an error running `pod install`, you'll need to first run this command: `sudo gem install cocoapods`. Once completed, you can run `pod install`.

Then, open the `src/[your PWA name].xcworkspace` file.

This will open the project in Xcode. In Xcode, click `Product` > `Build` to build your project.

## 2. Test your app an iPhone simulator

With the project opened in Xcode, click ▶️ to run your PWA in an iPhone simulator. You may also choose other iOS simulators to try our your app on those devices.

If you need to debug your PWA while it's running inside an iOS device, click ▶️, then launch Safari. In the top menu bar, choose `Develop` -> `Simulator [device name]` -> `[Your PWA's URL]`. Safari Dev Tools will open, allowing you to execute arbitrary JS, set breakpoints, etc. See [PWABuilder iOS FAQs](/docs/ios-faq) for more info.

## 3. Upload your app to the iOS App Store

Once you've built and tested your app, it's ready to be uploaded to the iOS App Store.

See [Publish your PWA to the iOS App Store](/docs/publish-your-pwa-to-the-ios-app-store) for a step-by-step guide to publishing your PWA iOS package to the iOS App Store.

## Need more help?

Check out our [PWABuilder iOS FAQs](/docs/ios-faq) for answers to frequently asked questions about PWABuilder's iOS platform.

If you're stuck, we're here to help. You can [open an issue](https://github.com/pwa-builder/PWABuilder/issues/new?assignees=&labels=ios-platform,question%20%3Agrey_question%3A&body=Type%20your%20question%20here.%20Please%20include%20the%20URL%20to%20your%20PWA.%0A%0A%3E%20If%20my%20answer%20was%20in%20the%20docs%20all%20along%2C%20I%20promise%20to%20give%20%245%20USD%20to%20charity.) and we'll help walk you through it.