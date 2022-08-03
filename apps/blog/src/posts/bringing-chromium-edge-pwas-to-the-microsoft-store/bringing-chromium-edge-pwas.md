---
layout: post
title: Bringing Chromium Edge PWAs to the Microsoft Store
excerpt: PWAs work great on Windows! As with EdgeHTML PWAs in the store, the new Chromium Edge-based PWAs also feels completely native to Windows!
description: It's great!
date: 2020-10-20
updatedDate: 2020-10-20
trending: false
featured: true
image: posts/bringing-chromium-edge-pwas-to-the-microsoft-store/BringingChromiumEdgePWAsMicrosoftStore.jpg
isPost: true
backUrl: '/'
author:
  name: Justin Willis
  twitter: https://twitter.com/Justinwillis96
  title: Software Engineer APS W+D 
tags:
  - post
  - Chromium
  - Edge
  - PWAs
---

The Microsoft Store was the [first app store](https://blogs.windows.com/msedgedev/2018/02/06/welcoming-progressive-web-apps-edge-windows-10/#Vsxe9rFMkrMQbXiJ.97) to support Progressive Web Apps. PWAs have since become one of the leading ways to distribute apps to users on Windows. However, a lot has changed on the web platform since that original blog post, with modern technologies and APIs such as Web Assembly, Web Bluetooth, Web USB, Web Share, Web Shortcuts, and more enabling developers to ship increasingly advanced apps on the web. Also, Microsoft Edge itself has changed since that original blog post, including the announcement of the new Edge, [which uses the the open source Chromium engine](https://blogs.windows.com/windowsexperience/2018/12/06/microsoft-edge-making-the-web-better-through-more-open-source-collaboration/)<span aria-hidden="true">.</span> We know that developers are excited to use the full power of the new Edge with their PWAs in the Microsoft Store and because of this, today we are extremely excited to announce the first Preview of the new [PWABuilder](https://pwabuilder.com) Windows platform! This significant update enables you to easily start packaging your Progressive Web Apps, using the new Chromium-based Edge, for the Microsoft Store!

## The benefits of moving to the new Edge

PWAs work great on Windows! As with EdgeHTML PWAs in the store, the new Chromium Edge-based PWAs also feel completely native to Windows!

Chromium Edge PWAs run in Windows of their own, just like any other application on Windows. They also show up in your Start menu (complete with Icons for expanded tiles), in your taskbar(where they are also pinnable just like any other app on Windows) in your Apps & Features settings etc. The user can open your PWA without Edge having to be open and interact with it as they normally would with apps on Windows.

## Web Standard APIs

Thanks to contributions from the Edge team and the broader Chromium community, PWAs on Windows can now utilize the latest Web APIs to enable a truly native feeling app. While we previously supported advanced functionality through the UWP APIs, we are now fully embracing Web Standards APIs and ensuring those APIs work great on Windows. Through initiatives such as [Project Fugu](https://web.dev/fugu-status/)<span aria-hidden="true">,</span> we have been able to bring all the common functionality developers used UWP APIs for before to standard Web APIs:

[Shortcuts (previously called Jumplists)](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/webappmanifests#use-shortcuts-to-provide-quick-access-to-features)

[Protocol handling](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/URLProtocolHandler/explainer.md)

[URI handling](https://github.com/WICG/pwa-url-handler/blob/master/explainer.md)

[File Type Associations](https://github.com/WICG/file-handling/blob/master/explainer.md)

[Share Target](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/webappmanifests#identify-your-app-as-a-share-target)

[Web Bluetooth](https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web)

[Web Share](https://components.pwabuilder.com/demo/web_share)

[File System Access API](https://web.dev/file-system-access/)

[App Badging](https://web.dev/badging-api/)

And many more!

The new Edge also has support for all your favorite web APIs such as Web Components, WebGL 2.0, the Clipboard API and more!

This is only a brief look at the capabilities available in the New Edge but as you can see, by just using standard web APIs your PWA is able to light up on Windows and provide the user with a familiar user experience.

## Compatibility

No one likes writing code that is only supported on one browser or platform. Even worse, what if a browser does not support an API that is key to your app experience? While the UWP APIs we previously encouraged developers to use only worked on Windows, these new web standards-based APIs will also run great in the Edge browser, other Chromium based browsers, Android and even ChromeOS!

## Always up-to-date

We also know that developers appreciate stable but fast update cycles, and we know that it is key for Edge to stay up to date so that you always have a secure and performant browser experience. Because PWAs in the Microsoft Store will now be using the new Edge, they will be updated with the Edge browser! This ensures that your PWA is always powered by an up-to-date version of Edge. We should also point out that this is a key advantage for PWAs over Electron or Webview based apps, as there is nothing the developer needs to do for their PWA to be running on a an up-to-date version of Edge.

This, along with the fact that your PWA in the store is also always up to date whenever you publish to the web, means that shipping an update to your app just means publishing an updated version to your web server as you would with any website! There is no change or update to the Microsoft Store package necessary, meaning users should always be on the latest version of your app.

## Shared State!

Finally, state (such as Cookies, Local Storage, IndexedDB and more) are shared between the Edge browser on the user's Windows device and your PWA from the Microsoft Store. So, if a user has already logged in to your PWA in your browser, that will extend to your PWA installed from the Microsoft Store.

## Devtools make building great PWAs easier!

![screenshot1](/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/devtools.png)

The PWABuilder team have always been big fans of the Chromium Devtools and we are extremely excited for you to be able to use the new Edge devtools to debug your Microsoft Store PWAs. You get the full Chromium Devtools, including its integrated PWA tooling!

Along with Devtools, we also wanted to give a shout out to edge://inspect! Edge://inspect enables you to easily test your PWA running in Edge on remote devices from your Windows 10 PC. For example, I can use edge://inspect to debug my PWA while it is running on my Surface Duo!

![screenshot2](/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/inspect.png)

## Key Differences from the EdgeHTML package

With the move to this new package, there are some features that worked in the EdgeHTML package that this new Chromium Edge based package is currently missing. These features are:
- No support for Live Tiles
- No splash screen
- Missing Analytics in the Partner Center

This does not mean that these features may never come, or that these features will definitely come, just that they are missing during the preview. We will keep the community updated as we continute to iterate on the preview.

## Things to be aware of

- If your PWA is already in the Microsoft Store using the EdgeHTML package and a user is logged in, the user will need to re-authenticate in the new Edge package.
- A user needs to have Microsoft Edge installed. If Microsoft Edge is not installed the user will be prompted to install Edge first before installing the app. As we continue our roll-out of Edge, we expect less and less users to hit this.

Now let's dive into how you can package your PWA with the Preview release of the new Edge package and PWABuilder!

## Package your PWA with new Edge PWA platform!

Alright, lets walk through how you can use [PWABuilder](https://pwabuilder.com) to try the Preview release of this new Edge PWA package for the Microsoft Store! As always, our goal with PWABuilder is to make things as easy as possible, and with enormous amounts of help from the Edge team, we have designed what we hope is straightforward way to package your PWA for the Microsoft Store (and other stores such as Google Play at the same time!).

First, go to [https://pwabuilder.com](https://pwabuilder.com) and put in the URL to your PWA. We are going to use [https://webboard.app](https://webboard.app)<span aria-hidden="true">,</span> a PWA I have built, as an example.

![screenshot3](/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/enter_url.png)

Hit start when you are ready and PWABuilder will start analyzing your PWA to make sure it is store ready!

![screenshot4](/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/analyzing.png)

You are now at the report card page! If your app is already a PWA your scores will all be green, if not, thats ok! You can [use PWABuilder to help convert your web app to a PWA](/docs/converting-your-web-app-to-a-progressive-web-app-with-pwabuilder/)<span aria-hidden="true">.</span> You can now tap the next button to continue to the packaging page!

![screenshot5](/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/report_card.png)

Now that we are here, you can tap the Store Package button in the Windows section to generate a Store Ready package, or tap Test Package to test your PWA on your device before publishing to the store! To publish an app to the Microsoft Store you will need to choose the Store Package button.

![screenshot6](/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/publish_page.png)

![screenshot7](/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/options.png)

You are now very close to being ready to submit to the Microsoft Store! All you need to do is [fill out the info](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md) in the modal shown above, tap Generate and then the Download button when its done generating.  You now have your PWA packaged for submission to the Microsoft Store! If you need help submitting this package to the Microsoft Store, we have documentation <a href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/next-steps.md#2-submit-your-app-packages-to-the-microsoft-store" aria-label="link to documentation on how to submite your PWA to the Microsoft Store">here</a> to walk you through the process.

> BONUS: Want to ship your PWA to the Surface Duo too? You can use the Android Platform shown above to package your PWA for the Google Play store, enabling users to install your PWA onto their Surface Duo! This also includes full support for the [Dual Screen APIs](https://blogs.windows.com/msedgedev/2020/09/14/introducing-dual-screen-foldable-web-apis/)<span aria-hidden="true">,</span> enabling your PWA to leverage the full capability of both screens on the Duo!

### To test this new package, the PWABuilder team has also published 3 of our own PWAs to the Microsoft Store (and the Google Play Store!) that you can try on your own device!

- [Chavah Messianic Radio](https://www.microsoft.com/store/productId/9NHKJB6LPPTV) made by [Judah Gabriel](https://twitter.com/JudahGabriel?s=20) also available in the [Play Store](https://play.google.com/store/apps/details?id=com.messianicradio&hl=en&gl=US)
- [Apple Crusher](https://www.microsoft.com/store/productId/9PL4CF3HX9DG) made by [David Rousset](https://twitter.com/davrous?s=20) also available in the [Play Store](https://play.google.com/store/apps/details?id=com.myapp.Apples_Crusher&hl=en&gl=US)
- [SimpleEdit](https://www.microsoft.com/store/productId/9NQW566N4866) made by [Justin Willis](https://twitter.com/Justinwillis96) also available in the [Play Store](https://play.google.com/store/apps/details?id=net.azurestaticapps.thankful_tree_07da4921e.twa&hl=en&gl=US)

These apps all run on both Windows and Android with the same codebase between the Windows and Android versions, and SimpleEdit also has special support the Surface Duo! With this, PWAs now enable you to ship one app, from one codebase, that runs on both Windows and Android including Surface Duo!

![screenshot8](/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/app_windows.png)

### SimpleEdit running on Windows

![screenshot9](/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/app_android.png)

### SimpleEdit running on the Surface Duo

Both the Microsoft Edge and PWABuilder teams are extremely excited to share this Preview of new Edge PWAs in the Microsoft Store with developers today. We are eager to see developers leverage the full capabilities of the new Edge in their PWAs and ship awesome experiences to the Microsoft Store! As you try the preview, please feel free to let us know <a href="https://github.com/pwa-builder/PWABuilder" aria-label="link to submit feedback and issues">here</a> if you run into any issues or have any questions. Thanks again!