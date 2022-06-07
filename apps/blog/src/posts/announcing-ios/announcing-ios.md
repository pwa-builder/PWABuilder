---
layout: post
title: Publish your PWA to the iOS App Store
excerpt: Announcing PWABuilder's new iOS platform. Publish your PWA to the App Store and gain new iPhone and iPad users.
description: Announcing PWABuilder's new iOS platform. Publish your PWA to the App Store and gain new iPhone and iPad users.
date: 2021-10-28
updatedDate: 2021-10-28
trending: true
featured: true
image: posts/announcing-ios/ios-announcement.png
isPost: true
backUrl: '/'
author:
  name: Judah Gabriel Himango
  twitter: https://twitter.com/judahgabriel
  title: PWABuilder Engineer
tags:
  - post
  - iOS
  - PWA
  - Apple
  - App Store
---

<img src="/posts/announcing-ios/ios-announcement.png" alt="IOS Announcement Banner" role="presentation"/>

Today, the [PWABuilder](https://www.pwabuilder.com) team is happy to announce the release of our new iOS platform preview. Publish your Progressive Web Apps (PWAs) to the iOS App Store using our new open source tooling.

Try it now:

1. Go to [PWABuilder.com](https://www.pwabuilder.com) and enter the URL of a PWA. (e.g. https://sadchonks.com<span aria-hidden="true">)</span>
2. Click `Next` to advance to the publish page.
3. In the new iOS publish section, choose `Store Package`: <br><a href="http://www.pwabuilder.com/publish?site=https://webboard.app" target="_blank"><img style="margin-left: 0; margin-top: 10px; margin-bottom: 10px; max-height: 150px;" loading="lazy" src="/posts/announcing-ios/ios-publish-section.png" alt="Screenshot of the new iOS publishing section on PWABuilder" /></a>
4. You'll be prompted for metadata about your app, such as app name, URL, icons, and more. By default, we populate these based on your PWA's web app manifest. <br><img loading="lazy" src="/posts/announcing-ios/ios-options.png" alt="Screenshot of IOS metadata options" style="max-height: 300px; margin-left: 0; margin-bottom: 10px;" />
5. Click `Generate` to download your iOS app package.
6. Your download will contain [instructions](https://docs.pwabuilder.com/#/builder/app-store?id=building-your-app) for submitting the package to the iOS App Store.

## What is it?

A web view-based project that enables PWA functionality. 

Our platform creates a native Swift app with a [WebKit web view](https://developer.apple.com/documentation/webkit/wkwebview) to load your PWA while enabling some PWA features, such as service workers, theme color, background color, app icons, in-scope URLs, and more.

It pulls values from your PWA's manifest as these defaults, allowing you to override them in the PWABuilder iOS options dialog seen above. If your PWA manifest doesn't have the all the right-sized images for the iOS app, the platform will generate these images for you, scaling down from a large, square, `any` purpose PNG icon from your manifest.

It packages this all together as an Xcode project workspace that you can [build in Xcode](https://docs.pwabuilder.com/#/builder/app-store?id=building-your-app) and [publish to the iOS App Store](https://docs.pwabuilder.com/#/builder/app-store?id=publishing).

## Why should I use this?

We've trained a generation of users to look for apps in app stores. By publishing your PWA to the iOS App Store, you broaden your audience. 

Additionally, using our iOS platform, your PWA becomes a first-class citizen on iOS devices. Your app shows up on the user's homescreen without clunky Safari "Add to Home Screen" flows.

## What do I need?

To generate an iOS app, you just need a PWA. Or more specifically, a web app with a [manifest](https://www.w3.org/TR/appmanifest/)<span aria-hidden="true">.</span>

To build the project, you'll [need a Mac with Xcode installed](https://github.com/pwa-builder/pwabuilder-ios/issues/9)<span aria-hidden="true">.</span>

To publish your PWA to the iOS App Store, you'll [need an Apple Developer account](https://docs.pwabuilder.com/#/builder/faq?id=ios).

See [our FAQ](https://docs.pwabuilder.com/#/builder/faq?id=ios) for details.

## What can it do?

This early preview of our iOS platform includes the following functionality (click to expand):

<details>
  <summary>Service worker support</summary>  

We utilize [App-Bound Domains](<a href="https://webkit.org/blog/10882/app-bound-domains/">) to enable service workers to function when your PWA is run on supported platforms (iOS 14 and above). 

</details>

<details>
  <summary>URL capture</summary>  
  
By default, PWABuilder's iOS platform generates a URL capture-ready app. If a user installs your app, you can have your app's URLs open in your PWA, rather than in the browser. 


To enable this, deploy an [Apple App-Site Association file](https://developer.apple.com/documentation/xcode/supporting-associated-domains) to your web server. Your app already contains the necessary configuration to utilize link capture. See [our iOS Platform FAQ](https://docs.pwabuilder.com/#/builder/faq?id=ios) for more info.

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

<img loading="lazy" src="/posts/announcing-ios/ios-splash.png" style="max-height: 300px" alt="IOS Splash Screen" role="presentation"/>

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

## What **can't** it do (yet)

<details>
  <summary>Push Notifications</summary>  
  
We currently don't support push notifications. We have partial support in the platform for enabling push notifications via Firebase, but the code is currently commented out, and PWABuilder has no UI for letting you input your push notification details.

If Push Notification support is important to you, [upvote this issue](https://github.com/pwa-builder/pwabuilder-ios/issues/6)<span aria-hidden="true">.</span>

Also, consider [publishing to the Microsoft Store](https://docs.pwabuilder.com/#/builder/windows), where your PWA can use Push Notifications and other PWA capabilities using web standards-based code, and without the need of native wrappers.
  
</details>

<details>
  <summary>Shortcuts</summary>  
  
We currently don't support web manifest shortcuts. We'd be glad to accept a PR for this. 😊

In the meantime, if Shortcut support is important to you, [upvote this issue](https://github.com/pwa-builder/pwabuilder-ios/issues/7)<span aria-hidden="true">.</span>
  
</details>

<details>
  <summary>Display mode</summary>  

Currently, display mode is ignored when building your PWA iOS package.

We are considering supporting at least `fullscreen` and `standalone`, and possibly `minimal-ui`. 

If this is important to you, [update this issue](https://github.com/pwa-builder/pwabuilder-ios/issues/8)<span aria-hidden="true">.</span>
  
</details>

<details>
  <summary>iOS-specific integrations</summary>  
  
Our template doesn't include support for iOS-specific functionality like Apple Pay, Sign In with Apple, HealthKit, etc. 

But that doesn't mean you can't add them. 

To add support for iOS-specific functionality, you'd enable the capability when [creating your Bundle ID](https://docs.pwabuilder.com/#/builder/app-store?id=_2-create-a-bundle-id), then update your Xcode project to take advantage of the new capability. See [our FAQ](https://docs.pwabuilder.com/#/builder/faq?id=ios) for more info. 

We also be glad to accept PRs enabling such functionality into [our iOS project template code](https://github.com/pwa-builder/pwabuilder-ios/tree/main/Microsoft.PWABuilder.IOS.Web/Resources/ios-project-src)<span aria-hidden="true">.</span>
  
</details>

## Does this mean Apple loves PWAs now?

No. 

[Microsoft Store supports PWAs](/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/) as first-class apps. Google Play [does as well](/posts/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store)<span aria-hidden="true">.</span> 

While WebKit is [making progress on PWA support](https://webkit.org/blog/11989/new-webkit-features-in-safari-15/)<span aria-hidden="true">,</span> at the time of this writing, [PWAs remain a second-class citizen on iOS](https://firt.dev/ios-14.5/)<span aria-hidden="true">.</span> The iOS App Store's support for PWAs is non-existent, requiring a web view-based solution like PWABuilder's.

Additionally, because [iOS doesn't allow 3rd party browser engines](https://infrequently.org/2021/08/webkit-ios-deep-dive/)<span aria-hidden="true">,</span> your PWA is limited to WebKit's PWA capabilities, which are currently lagging behind other browser engines.

Given the web's increasing capabilities and the industry's shift to the web, most recently including powerful apps like [VS Code](https://code.visualstudio.com/blogs/2021/10/20/vscode-dev) and [Photoshop](https://web.dev/ps-on-the-web/) moving to the web, we hope to see Apple improve PWA support in WebKit, iOS, and the App Store.

## Will Apple approve my PWA?

PWABuilder doesn't guarantee that your app will be accepted into Apple's App Store.

In 2019, Apple released [new guidelines for HTML5 apps in the App Store](https://developer.apple.com/news/?id=09062019b)<span aria-hidden="true">.</span> The new guidelines appear to forbid certain kinds of web apps (e.g. gambling, lotteries, etc.) from the iOS App Store.

The PWABuilder team attempted to clarify with Apple their general stance on PWAs in the iOS App Store. Despite several meetings, we were unable to get an official answer from Apple.

Since that time, a few members of the PWABuilder open source community successfully published PWAs in the iOS App Store. Thus, we are releasing our new iOS platform with the knowledge that Apple may not approve some PWAs, especially if they are little more than traditional websites in an app frame.

**Our recommendation is to build a great PWA.** PWAs that provide real value to users, PWAs that are more than just websites, PWAs that look, feel, and behave like real apps. Single page apps (SPAs) that avoid full server page loads, responsive apps that work well on many form factors. These are more likely to pass certification and get into the app store. Provide value to your users, and app stores will want your PWA.

## I have a PWA and I'd like to publish to iOS

Check out our PWABuilder iOS documentation:

- [PWABuilder iOS platform overview](https://docs.pwabuilder.com/#/builder/app-store)
- [How to build and test your iOS PWA](https://docs.pwabuilder.com/#/builder/app-store?id=building-your-app)
- [Publishing your PWA to the iOS App Store](https://docs.pwabuilder.com/#/builder/app-store?id=publishing)
- [iOS PWAs frequently asked questions (FAQs)](https://docs.pwabuilder.com/#/builder/faq?id=ios)

If you need help or have questions, you can [open an issue on our GitHub repo](https://github.com/pwa-builder/pwabuilder/issues)<span aria-hidden="true">.</span>

## A special thank you

A great big thank you to PWA enthusiast, open sourcer, and [HostMe](https://www.hostmeapp.com/) developer [Gleb Khmyznikov](https://github.com/khmyznikov)<span aria-hidden="true">.</span> In the true open source spirit, Gleb, along with several members of the PWABuilder open source community, contributed open source iOS projects they had successfully published to the iOS App Store. Gleb suggested we could fork his project for a fresh PWABuilder iOS platform based on latest iOS technologies. 

Gleb encouraged us, provided us help and documentation, and [his code](https://github.com/khmyznikov/ios-pwa-wrap)<span aria-hidden="true">,</span> an outgrowth of his work at [HostMe](https://www.hostmeapp.com/)<span aria-hidden="true">,</span> serves as the foundation for PWABuilder's iOS platform. Gleb, you rock! Thank you for your code, your encouragement, your technical help, your answers to our questions over the last few months. ♥

## Summary

PWABuilder's iOS platform preview is live! Go try it out on [pwabuilder.com](https://www.pwabuilder.com)<span aria-hidden="true">.</span> 

If you've got questions, bug reports, feature requests, [open an issue on our Github repo](https://github.com/pwa-builder/pwabuilder/issues)<span aria-hidden="true">.</span> You can also reach on Twitter: [@pwabuilder](https://twitter.com/pwabuilder)<span aria-hidden="true">.</span>