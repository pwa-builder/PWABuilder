---
layout: post
title: The New PWABuilder Report Card
excerpt: Introducing a new way to analyze and package PWAs
description: Introducing a new way to analyze and package PWAs
date: 2022-10-06
updatedDate: 2022-10-06
trending: true
featured: true
image: posts/new-report-card/new-report-card.png
isPost: true
backUrl: '/'
author:
  name: Josh Sach
  title: PWABuilder PM
tags:
  - post
  - PWA
  - packaging
  - pwabuilder.com
---

Today marks a big day in the history of the PWABuilder site. Over the past decade the PWABuilder team has been constantly iterating on our site’s user experience and user interface. It’s has been our mission to ensure that PWA developers have all the resources and tools at their fingertips to deliver high quality experiences to their customers across a variety of platforms and devices. 

Today with our refreshed experience we are one step closer to our goal of helping developers ship high-quality experiences to their customers.

## The Refreshed Report Card

<img src="/posts/new-report-card/new-report-card.png" alt="New Report Card" role="presentation"/>

Once you enter a URL into the site for analysis you will now see this new report card view. We optimized this view with clarity and actionability in mind. The report card page is now broken up into six distinct cards. These six cards will always be present throughout your development journey. The progress rings will be illuminated red if you have any action items preventing you from packaging. The rings will be yellow if you have completed all required items and green if you’ve completed all required and recommended items.  

### Your App Preview

<img src="/posts/new-report-card/app-preview.png" alt="App preview" role="presentation"/>

On the top left you can now see a preview of your app’s icon, URL, description, theme color, and even the ability to retest your site. Retesting your site is a critical function for developers who are actively updating their manifest, service worker, and security. With this button developers now have an easy way to ensure that they are testing and editing the most current version of their site. 

### Package For Supported Stores

<img src="/posts/new-report-card/stores.png" alt="Package for stores" role="presentation"/>

The top right card is where developers can generate store uploadable packages for the various platforms we support. Additionally, developers can generate test packages if their PWAs do not meet the requirements to package for the stores. Test packages are intended to help developers get a more hands-on experience with their PWAs as they iterate through the various design options and help developers opt for the most native looking settings on their intended platforms.

### Actionable Items / The To-Do List

<img src="/posts/new-report-card/todo.png" alt="Action Items" role="presentation"/>

We know the PWA journey can be overwhelming; fix this, change that, consider this, that’s where the actionable items section steps in. This section provides you with actionable items to improve on. Action items with the red stop sign will need to be addressed in order to generate packages for the various supported platforms. The yellow yield sign on the other hand will not block you from packaging for the supported platforms but are highly recommended elements to include as including them will drive up the native feel of your PWA to your end users.

### Manifest

<img src="/posts/new-report-card/manifest.png" alt="Manifest" role="presentation"/>

The manifest and service worker section items are broken down into three categories, required, recommended, and optional. Clicking on the “Edit Your Manifest” button will direct you to the manifest editor where you can edit the fields mentioned above. 

### Service Worker

<img src="/posts/new-report-card/sw.png" alt="Service Worker" role="presentation"/>

Clicking on the “Generate Service Worker" button will pop up the new and simplified service worker modal. 

<img src="/posts/new-report-card/sw-modal.png" alt="Service Worker modal" role="presentation"/>

Here you can easily choose one of three prepackaged service workers to handle offline events in your PWA. Note you can always build additional complexities on top of the out of the box service workers we provide you.

### Security

<img src="/posts/new-report-card/security.png" alt="Security" role="presentation"/>

The security modal will scan your site for three required components of a secure store ready PWA. The three required components are HTTPS, a valid SSL certificate, and ensuring that your site does not serve mixed content. If you are having issues or need help with getting your site to comply with the security three required security components click on the “security documentation” link for more information on how to make your PWA more secure.

## Get Started Today

Go to [pwabuilder.com](https://pwabuilder.com/) to try out the new experience and let us know what you think by tweeting at [@pwabuilder](https://twitter.com/pwabuilder) with your feedback.

Running into issues? Have ideas or suggestions? Please open an issue on our [GitHub](https://github.com/pwa-builder/pwabuilder).

Looking for an open source project to contribute to? Checkout our issues on GitHub. The [help wanted](https://github.com/pwa-builder/PWABuilder/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted+%3Araising_hand%3A%22) issues are a great way to get started.

Do you have an amazing app you want to showcase or just want to talk to other devs building PWAs? Come join us on our [Discord server](https://aka.ms/pwabuilderdiscord). 


