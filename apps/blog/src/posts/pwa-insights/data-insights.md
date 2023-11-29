---
layout: post
title: Only 37% of PWAs implement service workers - A quick review of the PWA ecosystem
excerpt: Presenting some data and insights derived from PWABuilder.com
description: This blog presents a snapshot of data from Aug - Oct 2023 of all the PWAs that have been through the flow of PWABuilder.com and what we can learn from them.
date: 2023-11-15
updatedDate: 2023-11-02
trending: true
featured: true
image: posts/pwa-insights/titleimage.png
isPost: true
backUrl: '/'
author:
  name: Amrutha Srinivasan
  title: PWABuilder Engineer
tags:
  - post
  - PWA
  - Insights
---


Every day, [PWABuilder](https://pwabuilder.com/) analyzes thousands of PWAs. This gives us unique visibility about current trends in PWAs based on how developers use PWAs features. In this article, we present insights gathered from a 3-month snapshot of analyzed PWAs on PWABuilder.com (Aug 2023 – Oct 2023).  
During this period, we recorded a total of 11,064 unique URLs that went through the flow of PWABuilder. That’s a lot of Progressive Web Apps! 
Manifests and service workers are the heart and soul of a PWA. They distinguish your PWA from being just another website. A manifest defines how your PWA looks and behaves when installed on a device. Service workers are essentially JavaScript workers that run in the background and are used for features like notifications, offline support, background sync, and many more. They can also be used just to fetch data from APIs for the website or pretty much hold any logic that needs to run on the site.

Learn more about [manifests](https://docs.pwabuilder.com/#/home/pwa-intro?id=web-app-manifests) and [service workers](https://docs.pwabuilder.com/#/home/sw-intro) from our documentation. 

## Service Worker Analysis

Out of the 11064 PWAs, about 4140 (37%) of them had service workers that were detected by our site. 
 
 ![A pie chart that shows the number of PWAs with and without service workers](/posts/pwa-insights/SW.png)

What does this tell us? Well, for one thing, it shows that there is a lot of interest and potential in building PWAs, as evidenced by the large number of URLs that came to PWABuilder. However, it also reveals that there is a gap between the desire to create PWAs and the actual implementation of the core PWA features. Only about 37% of the PWAs had service workers, which means that  majority of them are missing out on the benefits of offline support, push notifications, background sync, and more. It is also a fair argument that not all PWAs need all of these features. Lately a lot of the major browsers have done away with mandating service workers for installability which could also mean developers see less value in building and maintaining service workers unless there is a business reason to use them.

### Manifests and app capabilities

While service workers are optional in a PWA, the web manifest is not. They hold a lot of crucial information that is needed for the PWA to behave more app-like such as icons, file handlers, link handlers and so much more. Of the 11064 URLs, about 58% (6417) of them had a detected manifest. 

 ![A graph of the number of PWAs that have each app capability enabled](/posts/pwa-insights/appcap.png)

 We took 6 of the app capabilities into account to try and analyze how often they are being used in PWAs these days. 
 A quick description of all of these capabilities:

 * [File handlers](https://developer.mozilla.org/docs/Web/Manifest/file_handlers) (1.4%):  In a PWA, the file_handlers member specifies the types of files the PWA can handle. When installed, the browser uses this to associate the PWA with specific file types at the OS level. 
 * [Launch handlers](https://developer.mozilla.org/docs/Web/API/Launch_Handler_API) (6.9%): In a PWA, the launch_handler field specifies how the PWA should be launched and navigated to. 
 * [Protocol handlers](https://developer.mozilla.org/docs/Web/Manifest/protocol_handlers) (2.4%): In a PWA, protocol handlers are used to register the PWA to handle certain allowed protocols. A protocol is a string that allows clients to identify a resource on the web, such as http or mailto. When a PWA is installed, it can register to handle specific protocols, such as mailto or geo.
 * [Share target](https://docs.pwabuilder.com/#/home/native-features?id=web-share-api) (3.8%):  A share target is a feature in a Progressive Web App (PWA) that allows the app to receive shared content from other apps. This is done by adding a share_target member to the web app manifest, which specifies how the app should handle shared data. It allows for seamless integreation of the PWA with the native sharing capabilities of the device. 
 * [Shortcuts](https://docs.pwabuilder.com/#/home/native-features?id=shortcuts) (16.3%): Shortcuts in a Progressive Web App (PWA) allow users to quickly access specific features or pages within the app. These shortcuts can be added to the web app manifest and are displayed when a user long-presses or right-clicks on the app icon on their device.
 * [Widgets](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/widgets) (0.7%): Widgets are small applications that can be embedded within a larger application or operating system. They are designed to provide quick access to frequently used information or functionality. In the context of an app manifest, widgets are defined in the PWA manifest file using the widgets manifest member.

## Insights from the data

* As mentioned before, only 58% of the URLs had a valid, detectable manifest. Manifests are required for installability of the PWA. In other words, a website cannot be a PWA unless it at least has a manifest. This number is not suprising though as it's highly likely that developers who land on PWABuilder.com are at different stages in their PWA building journey. While some developers may be at the point where they already have a PWA that they need to package for an app store, others might be using PWABuilder as an educational tool to learn more about PWAs or how to convert their existing app into a PWA. 
  
* It seems like  shortcuts are among the more popular features that developers like to use. Shortcuts are relatively easy to add, and are a quick way (or should a say, a shortcut), to add a feature that makes the PWA more app like. On the other hand, features such as share_target, file_handlers and widgets require more work to enable and are also only relevant for certain scenarios so it's understandable why they are not as popular. 

* The number of PWAs with widgets might seem low, but it was actually a surprise to me as widgets are relatively a newer feature. Earlier this year, Facebook was one of the first well-known PWAs to add widgets to their manifest. Widgets are an easy way to increase engagement across different surfaces on an operating system. The uptick in widgets is a positive indicator of increasing awareness among developers. 

* There are 159 apps with detected protocol handlers, but upon a closer look, a large number of them were in fact empty arrays. It’s likely that the developers are using manifest templates that already contain protocol handlers but are not actually using them. 

 
## Parting thoughts

From the data, it seems like overall, developers are showing interest in adding app capabilities to improve the native-like experience of their PWA. As a developer, it's also important to understand and use these capabilities consciously only where it makes sense and avoid feature overload. Apps like this [music player PWA](https://xamuzik.com/) are great examples of how to use app capabilities. This app has used many of the capabilities, not only the ones listed above but others as well (handle_links, edge_side_panel, display_override). It's always great to find PWAs built by developers in the community that exemplify what a great app-like experience can be!

If you'd like to know more about the data or are curious about any insights that are not presented here, feel free to let us know on our [Discord](https://aka.ms/pwabuilderdiscord)!