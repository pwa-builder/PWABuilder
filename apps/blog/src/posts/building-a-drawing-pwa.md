---
layout: post
title: Building a drawing PWA with PWABuilder!
excerpt: Looking to build a Progressive Web App but not sure where to start?
description: There are many ways to enable inking on the web, but they all involve their challenges to set up. Do you need to support 2D drawing or 3D rendering? How will you minimize rendering latency? How should the drawing respond to browser events like window resizing, tab switching, or zooming? What kinds of input do you want to handle? What do you want to do with a finished drawing?
date: 2020-07-30
updatedDate: 2020-07-30
trending: true
featured: false
image: drawing.png
isPost: true
backUrl: '/'
author:
  name: Justin Willis
  twitter: https://twitter.com/Justinwillis96
  title: Software Engineer APS W+D 
tags:
  - post
  - Inking
---

Looking to build a Progressive Web App but not sure where to start? Or maybe you have already started on your PWA but your users have told you it still feels like a website. These are two common scenarios that developers commonly find themselves in, but where do you go from there? [PWABuilder](https://twitter.com/pwabuilder?s=20) of course! In today's post I wanted to walk you through building a PWA from scratch with PWABuilder and talk about how PWABuilder can help you improve the app-like experience of your PWA. Let's jump in!

## What are we going to build?

Today we are going to build a drawing app! This PWA will feature low latency drawing, work completely offline, have a great Install from the browser experience, and be available both in the browser and the Google Play Store! We will also be using some modern web APIs from [Project Fugu](https://docs.google.com/spreadsheets/d/1de0ZYDOcafNXXwMcg4EZhT0346QM-QFvZfoD8ZffHeA/edit#gid=557099940) where it makes sense to ensure that our PWA feels native to the user.

## The PWABuilder pwa-starter

One of the biggest challenges when getting started building anything on the web is choosing your ΓÇ£tech stack, or what technologies you are going to use to build your app. In the web development world we have a wide range of choices when deciding how to build your PWA, which is great, but can also make it very hard to ensure that you are getting started with the best possible base to build off of. To make this choice easier, [https://pwabuilder.com](https://pwabuilder.com) gives you a starter that gives you the tech stack that the PWABuilder team recommends for building great PWAs. That tech stack includes the following:

- [lit-element](https://github.com/Polymer/lit-element)<span aria-hidden="true">:</span> We chose lit-element as the web framework of choice for this starter as it meets our goals of simplicity and a great developer experience while also exceeding our goals for performance. The developer experience is remarkably like React but also brings all the benefits of using web components, including incredibly small bundle size and fast rendering. PWAs built with lit-element tend to also provide a fast, smooth experience for your users that is easy on memory usage and battery life.
- [rollup.js](https://rollupjs.org/)<span aria-hidden="true">:</span> We chose rollup as the bundler for this starter. We are big fans of rollup because of their focus on making it easy to work with standard es-modules and web standards in general. For example, to lazy load some code with rollup you just use await import(ΓÇÿmy-moduleΓÇÖ) ,which is web standard syntax for [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports) and rollup automatically knows how to bundle this correctly!
- [TypeScript](https://www.typescriptlang.org/index.html)<span aria-hidden="true">:</span> To help make sure that your PWA is easy to maintain over time we chose to use TypeScript as the default. TypeScript also improves the developer experience of lit-element even further by enabling [decorators](https://github.com/Polymer/lit-element#overview)<span aria-hidden="true">!</span>
- [Workbox](https://developers.google.com/web/tools/workbox/)<span aria-hidden="true">:</span> We make heavy use of Workbox for our available service workers on [PWABuilder](https://medium.com/pwabuilder/making-service-workers-easy-13516ae21123) and that extends to this starter! The starter comes set up out of the box to use Workbox's pre-caching service worker. This enables your PWA to work offline, load much faster and requires no extra effort from the developer.

To get a copy of the starter, you can go to [https://pwabuilder.com](https://pwabuilder.com) and hit the Get Started button as shown below.

![A screenshot of the PWABuilder home page that shows where the button to get a copy of the starter is.](https://miro.medium.com/max/1880/1*4GyVnx7rmib46OuOCXz3aw.png)

This will give you the option to either grab the starter from Github or download a zipped copy. Once you have the starter, make sure you have [Node and npm installed](https://github.com/pwa-builder/pwa-starter#prequisites) and then just run \`npm install\` and \`npm run dev\` to get started developing! This will start up TypeScript and a live-reload enabled dev server so that your changes automatically show up in the browser, ensuring a quick developer experience.

## Building the App

### Getting Started

Now that we have our dev environment set up, we can start building the app! First, lets get a little more familiar with the codebase. If you look in [src/script](https://github.com/pwa-builder/pwa-starter/tree/master/src/script) you will see a \`pages\` and a \`components\` folder. The pages folder holds each page in our app and our components folder holds components that we are using across multiple places in the app. Our ΓÇ£root page in this case is the [app-index.ts file](https://github.com/pwa-builder/pwa-starter/blob/master/src/script/pages/app-index.ts)<span aria-hidden="true">.</span> This page acts as the entry point for the app and includes our [router](https://vaadin.github.io/vaadin-router/vaadin-router/demo/#vaadin-router-getting-started-demos) configuration, which handles all the navigation in our app. For this app we will need just our home page, so we can leave the default router configuration. Before we leave this file I want to touch on the code-splitting that is built into the starter. In each route object you will see an action function. This action function uses dynamic imports, which are built into the browser, to only import the code for each page when that page is navigated too, ensuring that your app stays fast as it grows in size and complexity.

Before we move on to the next step, the pwa-starter actually already covers 2 of our requirements we set for this app: Working completely offline and having an app store like install experience. For the offline experience, the pwa-starter uses the [Rollup Workbox plugin](https://gitlab.com/bennyp/rollup-plugin-workbox#README) and the [PWABuilder pwa-update component](https://github.com/pwa-builder/pwa-update#pwa-update) which handles making sure your apps assets are cached correctly for offline usage of the app. For the app store like install experience from the browser the starter makes use of the [PWABuilder pwa-install component](https://components.pwabuilder.com/component/install_pwa)<span aria-hidden="true">.</span>

![A screenshot of the pwa-install component](https://miro.medium.com/max/1258/1*j8WR8edEudyF-JJ4QBv2-Q.png)

### Fast, low-latency Inking

With those two requirements out of the way, lets move on to the main functionality of our app; a low-latency, highly performant, full-featured drawing experience! Thanks to PWABuilder, we are going to achieve this with just a few lines of code. For this, lets go back to [https://components.pwabuilder.com/](https://components.pwabuilder.com/) and grab the [pwa-inking component](https://components.pwabuilder.com/component/inking). If we tap the ΓÇ£Install Component on this page and then tap the ΓÇ£with script tag button in the dropdown the script tag to add this component to our app will be copied to our clipboard.

![A screenshot of the dropdown on the install component button for the inking component.](https://miro.medium.com/max/1406/1*fHhm63SyILYTVjeO47q-LQ.png)

We can now paste that script tag into our [index.html file](https://github.com/pwa-builder/pwa-starter/blob/master/index.html)<span aria-hidden="true">.</span> Once we have that script tag, we can now use the component.

_Note: For more info on installing the pwa-inking component,_ [_check this out_](https://github.com/pwa-builder/pwa-inking#install)<span aria-hidden="true">_._</span>

As the [docs](https://github.com/pwa-builder/pwa-inking#canvas-with-default-toolbar) show, we now just need to add these three lines of code:

![Some HTML for the inking component](https://miro.medium.com/max/1916/1*qJ6pKIbNxNLuQM_gRYoBAA.png)

to our [home page](https://github.com/pwa-builder/pwa-starter/blob/master/src/script/pages/app-home.ts) and boom, we now have highly performant drawing experience right in our app! With these couple of lines of code, we now have three of our five requirements for this app done!

### Project Fugu

Lets now tackle our fourth requirement, making use of some of the APIs from [Project Fugu](https://docs.google.com/spreadsheets/d/1de0ZYDOcafNXXwMcg4EZhT0346QM-QFvZfoD8ZffHeA/edit#gid=557099940) to enhance the user experience of our app. One API from Project Fugu that makes sense for this app is the [Wake Lock API](https://components.pwabuilder.com/demo/wake_lock) . This API solves a common user experience issue with web apps such as ours, the fact that after some time the users device may go to sleep and shut off the screen, not exactly something we want for a drawing app like ours. Historically, a key user experience feature like this was not possible on the web, but with the awesome work going on in Project Fugu we can now achieve this functionality. Let's add this method to our [home page](https://github.com/pwa-builder/pwa-starter/blob/master/src/script/pages/app-home.ts):

![Some JavaScript that requests a wake lock](https://miro.medium.com/max/2584/1*2hBXPB5GRU3_af2x91OyLw.png)

We also need to add the following [property](https://lit-element.polymer-project.org/guide/properties#declare-with-decorators)<span aria-hidden="true">:</span>

![Some JavaScript that sets a property for the wake lock controller](https://miro.medium.com/max/1400/1*xGruBOHgmUHTvlQj2Gn7lQ.png)

to our home page. You can read more about properties in lit-element <a href="https://lit-element.polymer-project.org/guide/properties#declare-with-decorators" aria-label="link to more about properties in lit-element">here</a>. We now just need to call the \`setupWakeLock\` method in the [firstUpdated lifecycle method](https://lit-element.polymer-project.org/guide/lifecycle#firstupdated) and we are good to go. The wake lock will be released by the browser when the user closes the app. And just like that, our fourth requirement for our app is done!

## Deploying your PWA and publishing to the App Stores!

We are now at the point where we are ready to deploy our PWA! For the deployment, we will be making use of [Azure Static Web App hosting](https://azure.microsoft.com/en-us/services/app-service/static/) to deploy our PWA. The PWABuilder pwa-starter includes everything you need out of the box to deploy, so all we need to do is make sure our PWA is in Github and then follow the instructions <a href="https://azure.microsoft.com/en-us/services/app-service/static/" aria-label="link to instructions on how to deploy your PWA">here</a>. Because we are using Azure Static Web App hosting, this also sets us up to very easily use [Azure Functions to build a backend API](https://docs.microsoft.com/en-us/azure/static-web-apps/add-api) for our app if we want in the future. At this point we should have our URL, which is all we need for the next step of packaging our app for the Google Play Store!

### Google Play Store

Normally, this would be the hardest part of building a PWA. Historically, PWAs have not been able to publish to the Google Play Store and instead strictly relied on the browser for distribution. Recently this changed with the introduction of [Trusted Web Activities](https://developers.google.com/web/android/trusted-web-activity) on Android. Trusted Web Activities give us the opportunity to publish our high quality PWA to the Google Play Store. Because we used the PWABuilder pwa-starter, our app already handles working offline, has a fully filled out Web Manifest and is ready to be published. To learn how to package your PWA with PWABuilder, check out [our latest post on this topic](https://medium.com/pwabuilder/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store-b59710e487?source=friends_link&sk=a633482f2510eba814b1949219c74d6d)<span aria-hidden="true">,</span> its just a few button clicks!

### Microsoft Store

Currently you can also use PWABuilder to package your PWA for the Microsoft Store! All you need to do is choose the Windows platform Instead of the Android platform:

![A screenshot that shows where the Windows platform is](https://miro.medium.com/max/6480/1*8J_dVkSyB8fZGmtjp0-z0Q.png)

One important thing to note here is that currently, your package for the Microsoft Store will be using Legacy Edge. We realize this is far from ideal and we want to ensure that PWAs in the Microsoft Store work just as well as they do directly in the new Chromium based Edge. Because of this, we are now hard at work on allowing Chromium based Edge PWAs in the Microsoft Store!

![A screenshot of the tweet for the work we are doing on Chromium Based Edge PWAs in the Microsoft Store](https://miro.medium.com/max/2410/1*FDXqw35rGMEMgohH1nWitw.png)

[https://twitter.com/pwabuilder/status/1288543429350301699?s=20](https://twitter.com/pwabuilder/status/1288543429350301699?s=20)

And just like that, we have now built a fast Progressive Web App that delivers a great user experience AND even shipped that PWA to the Google Play and Microsoft Store! For another idea to further enhance your PWA, check out our [latest post](https://medium.com/pwabuilder/making-screenshots-easy-on-pwabuilder-5cc25343cfa6?source=friends_link&sk=b0a3411611466d9007617d7b9c625f73) on using PWABuilder to add screenshots to your Web Manifest. Also, we recently released a [post that deep dives into the inking experience](https://medium.com/pwabuilder/pwa-inking-enable-2d-inking-for-the-web-1bd41916b4bc?source=friends_link&sk=a17712de131403ab584f98dab016184e) we used today
