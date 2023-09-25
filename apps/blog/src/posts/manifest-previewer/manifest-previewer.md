---
layout: post
title: Visualizing your web manifest
excerpt: Building your progressive web app and wondering what's the purpose of this json file?
description: A crucial part of building a PWA is creating its manifest.json file. However, this is not always an easy task... Besides a name and icons, what else should you include? Why do you need a background color if you already have that in your CSS stylesheets? Which are the different display modes, and which one should you use?  
date: 2021-08-17
trending: false
featured: true
image: posts/manifest-previewer/name-windows.png
isPost: true
backUrl: '/'
author:
  name: Maria José Solano
  twitter: https://www.linkedin.com/in/mariasolano151822
  title: Software engineering intern
tags:
  - post
  - PWA
---

We have all been there. Staring at this mysterious `json` object that seems so important for a progressive web app. Besides a name and icons, what else should you include? Why do you need a background color if you already have that in your CSS stylesheets? Which are the different display modes, and which one should you use?  

During the last 3 months, I've been working on a project that addresses these questions: the <a href="https://www.npmjs.com/package/@pwabuilder/manifest-previewer" target="_blank">PWABuilder Manifest Previewer</a><span aria-hidden="true">.</span> This is a <a href="https://blog.pwabuilder.com/posts/building-pwas-with-web-components!/" target="_blank">web component</a> that takes your web manifest and shows you what the different manifest values look like on different operating systems. As an example, here's the manifest visualizer showing the <a href="https://www.w3.org/TR/appmanifest/#name-member" target="_blank">name</a> attribute appears on the Windows start menu:
<img src="/posts/manifest-previewer/name-windows.png" alt="Name preview - Windows" width="500px" />

And this is by just knowing the name and icon defined on the manifest! You can also experience the same visualization on Android and iOS: 
<img src="/posts/manifest-previewer/name-collage.png" alt="Name preview - Android iOS" width="700px" />

Similarly, the component can also help you picture what your <a href="https://web.dev/splash-screen/" target="_blank">splash screen</a> will look like, since this loading display is constructed by referring to the name, icons, and background indicated on the manifest. But wait, why do you need to specify a background color again if you have your CSS stylesheets for that? This is because when the splash screen is displayed to the user, your application (and hence styles) is still loading. With help of the web manifest, this loading state is smoother and customized to your PWA.
<img src="/posts/manifest-previewer/splashscreen.png" width="500px" alt="Manifest Preview Splash Screen"/>

Besides understanding the impact of changing values in the web manifest, you can also get an idea of what the experience is for users installing your application. Attributes like the name, site url, icons and screenshots are used to describe your application in installation dialogs:
<img src="/posts/manifest-previewer/install-collage.png" alt="Installation dialogs" width="900px" />

The manifest previewer can also help you visualize your application's store listing, given that with your web manifest you can assign categories to your PWA, include screenshots that show a peak of the user experience, and give details about your app via the `description` attribute. Here's the visualization in the <a href="https://blogs.windows.com/windowsexperience/2021/06/24/building-a-new-open-microsoft-store-on-windows-11/" target="_blank">new Microsoft Store</a><span aria-hidden="true">:</span>
<img src="/posts/manifest-previewer/categories.png" width="500px" alt="Manifest Categories Preview"/>

This web component also showcases some of the most modern features of PWAs, like making your app a <a href="https://web.dev/web-share-target/">web share target</a> so that users can share media data to your application directly from the platform's share menu:
<img src="/posts/manifest-previewer/share-target.png" width="700px" alt="Share Target Preview"/>

And that's not all! This web component also includes previews for the `short_name`, `display`, `theme_color`, `shortcuts`, and many other manifest attributes. You can see them all now on <a href="https://www.pwabuilder.com/" target="_blank">the PWABuilder site</a><span aria-hidden="true">,</span> since the team is the first proud user of this component, and it is using it to help their users have a better experience when getting their applications ready to be published to the Microsoft Store. Currently the team is only enabling the preview on Windows, but the Android and iOS will be added in the near future.

You can also integrate the manifest visualizer to your own application, since this component is a standalone tool and can be <a href="https://www.npmjs.com/package/@pwabuilder/manifest-previewer" target="_blank">downloaded</a> from `npm`. To learn more about how to use it, check out <a href="https://github.com/pwa-builder/manifest-previewer#pwabuilder---manifest-previewer" target="_blank">the documentation</a> and customize it according to your needs, from using your own colors to using the explanation messages that you desire.

Before I wrap up, I will take a brief detour and get a bit sentimental: Thanks to everyone in the PWABuilder team. You’ve made my internship this summer amazing, and I truly admire your passion and dedication for what you do. More than builders, you’re creators, enhancers, and innovators. Keep doing what you’re doing. 

And that’s all for today fellow PWA builders. I hope that this post fulfilled its goal and you’re now excited and eager to experiment with what you can do with your manifest.json file. Fortunately you don’t need to read long and boring documentation, you can visualize it with the manifest previewer web component! 