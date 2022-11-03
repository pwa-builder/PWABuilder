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

With our site redesign that was released in early October, some of you may have noticed our new manifest editor component! We wanted a guided experience that would make this daunting process much easier for our user. Being that its a component, it is also something that we will be able to reuse across our toolings when the time is right. We will continue to improve this experience, adding more information about each field even step by step instructions on how to implement them. The best part is, all of this will happen without even having to leave pwabuilder.com!

## How does it work
After entering a URL on the [home page of PWABuilder](https://www.pwabuilder.com), you will see our new report card page. After all the test are done running, you should be able to click on the button in the "Manifest" section that will say "Edit Your Manifest". If your site does not have a manifest yet, do not worry! PWABuilder will have started a manifest for you using information we were able to collect about your site. You will be able to edit and download this manifest all the same. 

<img src="/posts/introducing-manifest-editor/edit-your-manifest.png" alt="The Manifest section of the PWABuilder report card page with the Edit Your Manifest button located on the right side." />

After clicking on that button you will be greated with the Manifest Editor! Right now we have seperated each field into five categories: Info, Settings, Platform, Screenshots and Icons. There is also an additional tab labeled "Code" where you can see your manifest updating with your changes in real time! 


<img src="/posts/introducing-manifest-editor/manifest-editor.png" alt="The Manifest Editor open on the Info tab. This is the appearance of the Manifest editor when you first open it." />

If there are any problems with any of your manifest fields, you will see a red exclamation mark next to the tab with the error. Following that mark, you'll see the field highlighted red with a specific error message describing your issue. In order to update a field, simply change the value in the given input box and you can double check the "Code" tab to make sure that change was reflected. 

<img src="/posts/introducing-manifest-editor/fix-an-error.gif" alt="The Manifest editor open on the Info tab with an error. The error is fixed and verified on the code tab." />

If you want to learn more information about each manifest field, simply click the info icon next to the field name to be taken to documentation about the field. There are also links at the bottom of the manifest editor modal that lead to PWABuilder Studio, our VS Code Extenstion, where you can recieve a guided manifest editing experience right inside of your code editor and also general manifest documentation just for ease of access.

Once you are happy with the state of your manifest you can click the "Download Manifest" button in the bottom section. This will automatically download the manifest as it is in the "Code" tab with the name `manifest.json`. You will still need to upload this to your code base and make sure it is linked properly in your `index.html`.

## What's to come?
Like all of our tooling, the manifest editor is going to be recieving regular updates and continuously improving. 

As I mentioned before, we are currently working on making those info tooltips a bit more detail and instructive. We want to not only tell you _what_ a manifest field is via documentation but _why_ it is important for a PWA to include this field and _how_ to implement it. 

In the past, we recieved dozens of GitHub issues weekly that were just simple manifest errors. With our manifest validation library and this new editing experience, the goal is to make sure you are aware of these errors before you even get to the packaging step. 

In the new year, you can expect the "Icons" and "Screenshots" tab to recieve an update. We are already getting feedback about how we can make these processes more intuitive and working to create a solution that will create an effortless experiences for icon and screenshot generation.
