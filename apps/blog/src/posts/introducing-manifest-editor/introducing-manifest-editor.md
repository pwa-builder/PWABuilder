---
layout: post
title: The Manifest Editor
excerpt: Introducing a new way to generate and edit your manifest.
description: Introducing a new way to generate and edit your manifest.
date: 2022-11-03
updatedDate: 2022-11-03
trending: true
featured: true
image: posts/introducing-manifest-editor/manifest-editor.png
isPost: true
backUrl: '/'
author:
  name: Jaylyn Barbee
  title: PWABuilder SWE
tags:
  - post
  - PWA
  - manifest
  - pwabuilder.com
---

With our site redesign that was released in early October, some of you may have noticed the new manifest editor component! We wanted a guided experience that would make this daunting process much easier for our users. Being that it is a component, we will be able to reuse it across [PWABuilder](https://www.pwabuilder.com/) toolings when the time is right. We will continue to improve this experience, add more information about each field, and provide step by step instructions on how to implement them. The best part is, all of this will happen without having to leave [pwabuilder.com](https://www.pwabuilder.com/)!

## How does it work
After entering a URL on the [home page of PWABuilder](https://www.pwabuilder.com), you will see the new report card page. Wait until all the test are done running. You can then click on the button in the "Manifest" section that says "Edit Your Manifest". If your site does not have a manifest yet, do not worry! PWABuilder will automatically generate a manifest for you using the information collected from your site. You will be able to edit and download this manifest right away. 

<img src="/posts/introducing-manifest-editor/edit-your-manifest.png" alt="The Manifest section of the PWABuilder report card page with the Edit Your Manifest button located on the right side." />

Once you clicked the "Edit Your Manifest" button, you will be greeted with the manifest editor! There are five sections in the editor: Info, Settings, Platform, Screenshots, and Icons. Plus an additional tab labeled "Code" where you can see your manifest updating with your changes in real time! 


<img src="/posts/introducing-manifest-editor/manifest-editor.png" alt="The Manifest Editor open on the Info tab. This is the appearance of the Manifest editor when you first open it." />

If there are problems with any of your manifest members, you will see a red exclamation mark next to the tab with the error. Follow the mark to find the member highlighted red with error message describing the issue. To update the member, simply change the value in the input box. You can double check the "Code" tab to make sure the change was reflected. 

<img src="/posts/introducing-manifest-editor/error.png" alt="The Manifest editor open on the Info tab with an error. The error is fixed and verified on the code tab." />

If you want to learn more about the manifest members, simply click the info icon next to the name to explore documentation. If you would like to receive a guided manifest editing experience, use the links at the bottom of the manifest editor modal to try out [PWABuilder Studio VSCode Extension](https://docs.pwabuilder.com/#/studio/quick-start).

Once you are happy with the state of your manifest you can click the "Download Manifest" button at the bottom. This will automatically download the manifest from the "Code" tab with the name `manifest.json`. You will still need to upload this to your code base and make sure it is linked properly in your `index.html`.

## What's to come?
Like all of our tooling, the manifest editor will be regularly updated and continuously improved. 

As I mentioned before, we are currently working on making those info tooltips a bit more detailed and instructive. We want to not only show you _what_ a manifest member is via documentation but also _why_ it is important for a PWA to include this member and _how_ to implement it. 

In the past, we received dozens of GitHub issues weekly that were simple manifest errors. With the manifest validation library and this new editing experience, the goal is to make sure you are aware of these errors before you even get to the packaging step. 

In the new year, you can expect updates to the "Icons" and "Screenshots" tabs. We are already getting feedback about how we can make these processes more intuitive. And we are working to create a solution that will provide an effortless experiences for icon and screenshot generation.
