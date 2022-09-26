---
layout: post
title: Building PWAs with Web Components!
excerpt: Looking to build a Progressive Web App but not sure where to start?
description: There are MANY ways to build great Progressive Web Apps, but today I wanted to share an approach that we have been exploring, building PWAs with Web Components based solutions!
date: 2021-01-11
updatedDate: 2021-01-11
trending: false
featured: true
image: web-components.png
isPost: true
backUrl: '/'
author:
  name: Justin Willis
  twitter: https://twitter.com/Justinwillis96
  title: Software Engineer APS W+D 
tags:
  - post
  - web-components
---

![An image of 3 people working together to build a Progressive Web App!](https://miro.medium.com/max/2232/1*qtBDuHwNbYU5vGz-Z6dYHQ.png)

There are MANY ways to build great [Progressive Web Apps](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/)<span aria-hidden="true">,</span> but today I wanted to share an approach that we have been exploring, building [PWAs](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/) with [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) based solutions! Specifically, we will be discussing the following technology stack:

- [lit-element](https://lit-element.polymer-project.org/)<span aria-hidden="true">:</span> Our framework. Lit-element gives us a way to write code that feels remarkably familiar to popular frameworks like React but that compiles down to browser native Web Components with a tiny runtime that provides things such as performant asynchronous rendering.
- S[hadow DOM, CSS Variables, Shadow Parts](https://lit-element.polymer-project.org/guide/styles#shadow-dom)<span aria-hidden="true">:</span> Modern CSS is incredibly powerful, especially when combining the Shadow DOM, CSS variables and the Shadow Parts APIs. We will discuss how this provides everything we normally were using a CSS pre-processor, but without the extra complication that a CSS pre-processor adds to your build steps!
- [Rollup](https://www.rollupjs.org/guide/en/)<span aria-hidden="true">:</span> Rollup is a ΓÇ£bundlerΓÇ¥ or build tool that will make working with NPM modules easy while also helping ensure our code is ready for production. It allows us to do things such as minify our code, run Workbox (another tool I will introduce next) and other build steps.
- [Workbox](https://developers.google.com/web/tools/workbox/)<span aria-hidden="true">:</span> Workbox is a tool that makes working with [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) easy!
- [TypeScript](https://www.typescriptlang.org/)<span aria-hidden="true">:</span> TypeScript gives us features such as auto complete in our editors that helps make the development process easier, along with being perfect for working in a team because you can provide types for your APIs, making your code almost self-documenting.
- [Project Fugu](https://web.dev/fugu-status/)<span aria-hidden="true">:</span> Project Fugu is an initiative involving Microsoft, Google, Samsung and many others that aims to bring all the capabilities of native apps to the Web! The APIs that this project has already brought to browsers like Edge, such as the Wake Lock API, Web Bluetooth, the File System Access API and more act as our ΓÇ£native toolkitΓÇ¥ in this tech stack. The cool thing though is that all of these APIs are built into the browser and work just like any other JavaScript API you may have used, such as the Geolocation API.
- [PWABuilder](https://www.pwabuilder.com/)<span aria-hidden="true">:</span> PWABuilder is there to help you get your PWA store ready and then easily ship your PWA to those stores! We provide easy ways to evaluate the quality (performance, security, Web Manifest content etc) of your PWA, improve if necessary (such as [adding screenshots](https://medium.com/pwabuilder/making-screenshots-easy-on-pwabuilder-5cc25343cfa6?source=friends_link&sk=b0a3411611466d9007617d7b9c625f73) and other necessary content to your Web Manifest) and then easily package your PWA for app stores. For example, with just a few button clicks you can have a package that is ready to ship to both the [Google Play Store](https://medium.com/pwabuilder/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store-b59710e487?source=friends_link&sk=a633482f2510eba814b1949219c74d6d) and the [Microsoft Store](https://medium.com/pwabuilder/bringing-chromium-edge-pwas-progressive-web-apps-to-the-microsoft-store-c0bd07914ed9?source=friends_link&sk=04ca8b2ae2bd094b04ef6b53780b5698)<span aria-hidden="true">!</span>

> A quick note before we dive into the content: Our goal with sharing this with the community is not to say this is the only way to build web apps, or that it is even the absolute best way to build web apps, instead we wanted to share what works well for us in the hopes that it can help drive your teamΓÇÖs decisions around what works well for you and your application.

## Setting our Goals

When you are going to build a new app (of any kind) there are a series of decisions that must be made up front. These decisions normally involve picking a technology stack based on some set of goals for the project. With PWAs this becomes even more important as there are many frameworks, libraries, build tools and more to choose from and these choices can have large impacts on your PWA as you develop it. For example, if loading performance is a key metric for your application then the framework that you choose to build the application in at the beginning can have a significant impact on loading performance farther down the road. For the PWABuilder team our key goals look something like the below:

- Performance: Our current tech stack and codebase produces large bundles which can take seconds to not only load over the network (before our service worker has cached anything) but also to be parsed by the browser, which must happen before code can start executing. This is not only not great for our users, but also is not a shining example of best practices on the web.
- Maintainability: Our current build is made up of multiple tools, a large [WebPack](https://webpack.js.org/) config with many plugins, a CSS pre-processor, multiple CSS libraries and utilities, Polyfills, Redux for state management etc. This not only is a large reason of why we have the bundle size issues discussed above but also has had a substantial impact on development speed for the front end as we end up debugging our tooling or codebase more than building the quality features we know developers want. As we have rebuilt our backend over the last year, along with other PWAs we have built outside of pwabuilder.com we have seen that simplicity is key to maintainability.
- Quality: As with any software project, the harder the codebase is to work on, the buggier it tends to be. Because of the above two challenges, we have also had to deal with a fair bit of tech debt. We think with our new focus on simplicity we can move much faster while still maintaining a high level of quality.
- Developer experience: Maintaining a familiar developer experience is also incredibly important to us as it allows both community members and new members on the PWABuilder team to easily jump into the project and understand what is going on.

Based on the above we have found that browser native, Web Components based solutions combined with tooling that is focused on simplicity and sticking to web standards gives us the easiest path to meeting these goals. Let's dive into the details of this approach!

## Web Components? lit-element?

[Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)! How do I build a whole app with them? Don't I need something like [React](https://reactjs.org/) or [Angular](https://angular.io/) to build the app? Let's answer those questions and more!

### What are Web Components?

First, let's touch on what [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) are. Web Components are a collection of Web APIs that allow you to build components. You can think of this as the same as components you build with something like React or Angular, but there are some key differences with Web Components. They are currently supported in all browsers besides Internet Explorer.

![browser support table for web components. All modern browsers are supported, including Safari](https://miro.medium.com/max/4386/1*OacB87rEsMNfIO213Evt3g.png)

### What is lit-element?

[Lit-element](https://lit-element.polymer-project.org/) is a library / framework that makes it easy to build Web Components. Lit-element gives us a way to write code that feels very familiar to popular frameworks like React but with Web Components. It also includes a tiny runtime that provides things such as performant asynchronous rendering. Also, [lit-element](https://lit-element.polymer-project.org/) is now only one of many Web Components based frameworks / libraries that are available. We also recommend checking out [fast-element](https://www.fast.design/docs/fast-element/getting-started/) and [Stencil](https://stenciljs.com/)<span aria-hidden="true">!</span>

### Why Web Components?

### \- Performance

First, components built with either React or Angular are not native components understood by browsers. Because of this, you need to ship a large runtime (the core of both React and Angular) of some sort that can run these components in the browser. Note that this is a basic explanation of how these frameworks work, there are of course many details in the actual implementations, but these details are not truly relevant to our discussion today. This runtime cost is a huge part of the loading performance issues that apps built with these frameworks commonly have.

With Web Components based frameworks you avoid this large runtime cost as the browser natively understands Web Components, but without sacrificing developer experience. This enables frameworks to still ship features such as performant async rendering but without the code associated with just running the components. For example, let's use [BundlePhobia cost of adding a npm package](https://bundlephobia.com/) to evaluate the cost of React, Angular and lit-element:

**_React:_**

- minified: 121.1 kB
- minified + GZip: 39.4 kB
- Load time on a 3G connection (one of the most common network connections): 0.79s

![React is 121.1kb minified and 39.4kb minified and compressed with GZIP](https://miro.medium.com/max/1248/1*OL6sRwxqirZ38UaE8LWRWQ.png)

**_Angular:_**

- Minified: 289.9 kB
- Minified + GZip: 88.7 kB
- Load time on a 3G connection (one of the most common network connections): 1.77s

![Angular is 289.9kb minified and 88.7kb minified and compressed with GZIP](https://miro.medium.com/max/1248/1*wq4qBl1RDOsYz8CAANqXjQ.png)

and then lit-element, a Web Components based solution:

- Minified: 23.2 kB
- Minified + GZip: 7.4 kB
- Load time on a 3G connection (one of the most common network connections): 148ms

![lit-element is 23.2kb minified and 7.4kb minified and compressed with GZIP](https://miro.medium.com/max/1248/1*KF4SeH5lcXPnZ77h6y_Ibw.png)

Lit-element is awesome here as the developer experience is extremely similar to React but with a much smaller bundle size!

### Maintainability / Stability

Web Components, by their nature of being Web Standards, are inherently going to be more stable than any custom code. For example, the Geolocation API is a web standard and because of this, once it was implemented in a browser it has consistently worked since and we can count on it continuing to work far into the future because of the webs guarantee on not breaking existing websites. There are of course drawbacks with this approach, such as it taking longer for Web Standards to be implemented compared to the React team implementing a new feature in React. However, this is a tradeoff that we feel is fair in return for a good guarantee on long term stability.

## Styling with Web Components

Continuing with our Web Standards first approach, modern CSS now has built in APIs / features in browsers that give us all the features we normally use a CSS pre-processor such as [SASS](https://sass-lang.com/) for:

[Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)<span aria-hidden="true">:</span> CSS now has CSS variables! CSS variables work great with Web Components and work extremely similar to variables in SASS.

[Style Encapsulation](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)<span aria-hidden="true">:</span> Shadow DOM is part of the Web Components spec and helps fix the classic CSS cascade issue. Shadow DOM enables you to encapsulate your styles "inside" of your component, ensuring that CSS elsewhere in your app does not accidentally override CSS in your component. However, using both CSS Variables and the Shadow Parts API we can enable specific pieces of our components to be style-able from outside of the component. This is helpful when you want a component to have certain styles customizable but still have default styles too.

## Build Tools

Luckily, by basing the rest of our tech stack on Web Standards it also makes setting up our build tools easy!

### Bundler

For our bundling we use Rollup which is described on the [Rollup Website](https://www.rollupjs.org/) as:

> Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application. It uses the new standardized format for code modules included in the ES6 revision of JavaScript, instead of previous idiosyncratic solutions such as CommonJS and AMD. ES modules let you freely and seamlessly combine the most useful individual functions from your favorite libraries.

As you can guess, lit-element also uses standard built-in ES modules and because of this it works seamlessly with Rollup! Rollup also runs other tasks that are important for our builds:

- [Minification of our code](https://www.npmjs.com/package/rollup-plugin-terser)
- [Removing console logs](https://github.com/rollup/plugins/tree/master/packages/strip)
- We use the [node-resolve plugin](https://www.npmjs.com/package/@rollup/plugin-node-resolve) to ensure we can easily use modules from NPM that may not be distributed as an ES module.
- [Workbox](https://developers.google.com/web/tools/workbox/) (covered below)

### Workbox (Service Worker)

We use [Workbox](https://developers.google.com/web/tools/workbox/)<span aria-hidden="true">,</span> which is a tool that makes working with [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) easy! Workbox enables you to build fully customized offline experiences for your app while also simplifying many of the complicated parts of Service Workers, such as pre-caching. We also use the Workbox Rollup plugin which makes it super easy to do pre-caching of our assets which not only is a huge part of the offline experience, but also ensures that our PWAs load even faster after the user has loaded the app at least once! Better performance AND an offline experience with only a few lines of code is always awesome!

## Project Fugu

Native APIs! This is an area where PWAs (and Web Apps in general) have lacked in the past and because of this we saw the rise of awesome tools such as [Cordova](https://cordova.apache.org/)<span aria-hidden="true">,</span> [Ionic Native](https://ionicframework.com/native)<span aria-hidden="true">,</span> [Electron](https://www.electronjs.org/) and more! However, with the rise of [Project Fugu](https://web.dev/fugu-status/) web standard PWAs, with no native toolkit of any kind installed and using plain JavaScript APIs, can do almost all the same things a Native app can! For example, in the latest stable Edge and Chrome PWAs can:

- [Share and receiving shared content](https://web.dev/web-share/)<span aria-hidden="true">:</span> Using the Web Share API your PWA can tie into the native share UI of the users Operating System. Using the Share Target API your PWA can receive content shared from another app. For example, I can share an image straight from the native Photos app on Windows to a PWA.
- [File System Access API](https://web.dev/file-system-access/)<span aria-hidden="true">:</span> If you have built a hybrid Web App you are familiar with how hard it is to integrate with the file system, but no more! The File System Access API gives you all the functionality native apps have! With a permission grant from the user, you can then read or save changes directly to files and folders on the userΓÇÖs device!
- [Periodic Sync API](https://web.dev/periodic-background-sync/)<span aria-hidden="true">:</span> This allows PWAs to sync data in the background, just like a native app. This ensures that your users always have the latest data on their device.

And this is just a tiny bit of what's possible! For the full list check the Project Fugu status page! [New capabilities status (web.dev)](https://web.dev/fugu-status/)

## Get started building a PWA with this tech stack!

If your goals are similar to ours and you want to give this tech stack a try you should check out the [PWABuilder pwa-starter](https://github.com/pwa-builder/pwa-starter)<span aria-hidden="true">.</span> This starter includes everything we discussed above and has everything set to what we think are good defaults. Also, if you are looking for a tutorial feel free to check out [this video](https://youtu.be/QQtukwF6BOc) for a walk through on using the starter.

Alright, that is how we are building PWAs fully with web components! Remember to check out the starter above if this tech stack interests you and please feel free to add any feedback as an issue on the repo. And, once your PWA is ready to go donΓÇÖt forget to come back to [PWABuilder](https://www.pwabuilder.com/) to get your PWA in the app stores! The [PWABuilder](https://www.pwabuilder.com/) team is going to be rebuilding PWABuilder with this tech stack for 2021, and we are very excited to show you the results when we are done! The web and the amazing community around it have us excited to see where PWAs go this year!
