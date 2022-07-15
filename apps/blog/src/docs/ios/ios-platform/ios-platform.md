---
layout: doc
title: iOS Platform
excerpt: Publish your PWA to the iOS App Store
description: Publish your PWA to the iOS App Store
date: 2021-10-26
updatedDate: 2021-10-28
trending: false
featured: true
recommended: true
isDocumentation: true
backUrl: '/docs'
image: docs/ios/ios-platform/ios-store-logo.png
author:
  name: Judah Gabriel Himango
tags:
  - docs
  - Documentation
  - iOS
---

<img src="/docs/ios/ios-platform/ios-store-logo.png" style="max-height: 250px;" alt="Ios Store Logo"/>

The PWABuilder iOS platform is an experimental project that utilizes a Webkit-based web view (WKWebView) to load your PWA on iOS and enable some PWA functionality. 

When you use PWABuilder to package your PWA for iOS, your download will include an Xcode project customized for your PWA. Once downloaded, see [Build Your iOS App](/docs/build-your-ios-app) for your next steps.

## What can it do?

<details>
  <summary>Service worker support</summary>  

We utilize [App-Bound Domains](<a href="https://webkit.org/blog/10882/app-bound-domains/">) to enable service workers to function when your PWA is run on supported platforms (iOS 14 and above). 

</details>

<details>
  <summary>Shortcuts</summary>  
  
If you've defined [app shortcuts](https://web.dev/app-shortcuts/) in your web manifest, they'll automatically work in your iOS app. See [this issue](https://github.com/pwa-builder/pwabuilder-ios/issues/7) for more details.
  
</details>
  
<details>
  <summary>URL capture</summary>  
  
By default, PWABuilder's iOS platform generates a URL capture-ready app. If a user installs your app, you can have your app's URLs open in your PWA, rather than in the browser. 

To enable this, deploy an [Apple App-Site Association file](https://developer.apple.com/documentation/xcode/supporting-associated-domains) to your web server. Your app already contains the necessary configuration to utilize link capture. See [our iOS Platform FAQ](/docs/ios-faq) for more info.
  
</details>

<details>
  <summary>Permitted navigation scopes</summary>  
  
When you generate your iOS app in PWABuilder, you can specify a list of permitted URLs that are considered in-scope for the app:

<img loading="lazy" src="/posts/announcing-ios/ios-permitted-urls.png" style="margin-left: 0; max-height: 250px;" alt="Screenshot of the iOS publish section on PWABuilder" />

This can be useful when your PWA needs to work with 3rd party URLs, such as `Login with Google` or other authentication providers.
  
</details>

<details>
  <summary>Status bar customization</summary>  
  
The iOS status bar -- containing your iPhone's reception bars, battery level, and more -- can be customized when shown in your app. By default, we set the status bar color to your manifest's `theme_color`, or white if you don't have a `theme_color` supplied.

As a future enhancement, we may allow you to hide the status bar -- useful in `display: fullscreen` PWAs like games -- as well as change the status bar foreground color.
  
</details>

<details>
  <summary>Splash screen from manifest props</summary>  
  
While your app initializes and the web view loads your PWA, users will see a splash screen. The splash screen will be a solid background color, with your app's icon centered and a progress bar beneath it:

<img loading="lazy" src="/posts/announcing-ios/ios-splash.png" style="max-height: 300px" />

The splash screen background color is taken from your manifest's `background_color`. The icon is from your manifest's `icons`, and the progress bar color is styled using your manifest's `theme_color`.

When your app finishes initializing and your PWA is done loading into the web view, the splash screen disappears and your PWA takes the fore.
  
</details>

<details>
  <summary>iOS app awareness from JS code</summary>  
  
In your PWA, you can detect if you're running in the iOS app by looking for an `app-platform` cookie, its value set to `iOS App Store`.
  
</details>

<details>
  <summary>Mac Store support</summary>  
  
When publishing your iOS app, you can opt-in to publishing to the Mac App Store as well. Your app will be available to M1 devices running macOS 11 or later.
  
</details>

## PWABuilder iOS documentation

Once you've downloaded your iOS app package from PWABuilder, you should [build and test your app](/docs/build-your-ios-app).

After building and testing your app, [publish your PWA to the iOS App Store](/docs/publish-your-pwa-to-the-ios-app-store).

Finally, we recommend reading our [PWABuilder iOS FAQ](/docs/ios-faq).

## A special thanks

A great big thank you to PWA enthusiast, open sourcer, and [HostMe](https://www.hostmeapp.com/) developer [Gleb Khmyznikov](https://github.com/khmyznikov). In the true open source spirit, Gleb, along with several members of the PWABuilder open source community, contributed open source iOS projects they had successfully published to the iOS App Store. Gleb suggested we could fork his project for a fresh PWABuilder iOS platform based on latest iOS technologies. 

Gleb encouraged us, provided us help and documentation, and [his code](https://github.com/khmyznikov/ios-pwa-wrap), an outgrowth of his work at [HostMe](https://www.hostmeapp.com/), serves as the foundation for PWABuilder's iOS platform. Gleb, you rock! Thank you for your code, your encouragement, your technical help, your answers to our questions over the last few months. ♥

## Disclaimer

PWABuilder's iOS platform is experimental, and PWABuilder doesn't guarantee that your app will be accepted into Apple's App Store.

In 2019, Apple released new [guidelines for HTML5 apps in the App Store](https://developer.apple.com/news/?id=09062019b). The new guidelines appear to state that certain kinds of web apps (gambling, lotteries, etc.) may not be accepted into the App Store.

The PWABuilder team attempted to clarify with Apple their stance on PWAs in their App Store. Despite several meetings, we were unable to receive an official answer from Apple.

Since that time, a few members of the PWABuilder open source community successfully published PWAs in the iOS app store via web view-based apps. Thus, we are releasing our new iOS platform with the knowledge that Apple may not approve some PWAs, especially if they are little more than traditional websites in an app frame.

**Our recommendation is to build a great PWA.** PWAs that provide real value to users, PWAs that are more than just websites, PWAs that look and feel like real apps. These are more likely to pass certification and get into the app store. Provide value to your users, and app stores will _want_ your PWA.
