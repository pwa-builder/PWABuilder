---
layout: post
title: "Building Memos AI: A Developer Perspective"
excerpt: 
description: 
date: 2023-10-18
updatedDate: 2023-10-18
trending: true
featured: true
image: posts/announcing-cli/pwa-create.png
isPost: true
backUrl: '/'
author:
  name: Justin Willis
  twitter: https://twitter.com/justinwillis96
  title: PWABuilder Engineer
tags:
  - post
  - PWA Starter
  - AI
---

Hello! I recently released an app I've been working on, Memos AI, and I wanted to talk a bit about how I built this app. Before we dive in, let’s touch on exactly what Memos AI is. Memos AI is a voice memos app that uses artificial intelligence to automatically take notes for you during lectures, meetings etc. Memos AI will:

* Transcribe speech
* Summarize that transcription
* Take notes based on that transcript
* and more!

With that out of the way, what are we going to cover exactly? Let's touch on: 

* Why I went with a Progressive Web App 
* My tech stack, and why 
* AI on the Web 
* Publishing 
* Let's dive in! 

## Why a PWA (Progressive Web Application) 

PWAs are web apps that are installable on a user's device and can be used like any other native app. They offer several benefits over traditional web apps, including: 

* Faster loading times: PWAs are cached on the user's device, which means that they load much faster than traditional web apps. 
* Better offline support: PWAs can work offline, which is important for users who don't have a reliable internet connection. 
* More engaging user experience: PWAs can be installed on the user's home screen and can be used like any other native app. This makes them more engaging and easier to use. 
* Available in App Stores: PWAs can be published to the Microsoft Store, the Google Play Store and other stores, unlike traditional web apps. 
* PWAs also offer benefits over a native app. For example: 
* Cross-Platform out of the box: PWAs offer one of the only true "build once, run everywhere" experiences. You can take your single codebase and deploy it to the web AND the app stores with no code changes. 
arm64 support: PWAs run natively on both arm and x86/64 devices, with no extra effort needed from the developer 
* Wide Reach: Progressive Web Apps allow you to reach users wherever they already are, whether that is in their web browser, or in an app store. 

## Tech Stack 

Ahh the age-old tech stack discussion. First, as you always should with a tech stack discussion, lets discuss what my user goals are for Memos AI: 

* TRULY cross-platform: Not only should Memos AI work on any OS, it should also work on ANY device, no matter how powerful that device is, or what its network connection is like 
* Fast, on any device and any network connection 
* Simple: I am a fan of simplicity over almost everything, in most cases atleast. Simplicity, from my experience, leads to fast apps that work better for users. 
 
With this in mind, I decided on the following stack: 

* The PWABuilder PWA Starter for the app itself. 
* An Azure Web App for Containers for my backend. My server is a simple Express based Node.js server running in a Docker container. 
* For transcriptions: The Azure Speech SDK for live transcriptions, and the OpenAI Whisper model, through the OpenAI API, for final transcriptions. 

## AI on the Web 

On my journey of building this app, I evaluated the exiting AI solutions that are available for web apps. I was happily surprised to see multiple open-source options for running AI inference client-side, which when combined with things like the OpenAI API for more compute heavy issues, can come together to provide high-quality AI experiences in a PWA. 
 
For example, to do summarization client-side, and cut down on my OpenAI API costs, I am using https://github.com/xenova/transformers.js/ which enables you to run AI models from HuggingFace client-side in your browser with just a tiny bit of JavaScript! 

[image will go here showing the code]
 
## Publishing 

For publishing, I wanted to take full advantage of the fact that my app is cross-platform. I deployed to the web first, using Azure Static Web Apps. Static Web Apps, especially when used with Github Actions, makes it incredibly easy to deploy a web app. You get HTTPS out of the box, and other features such as: 

* Azure Functions support 
* Easy Database connection 
* Pre-Configured authentication 
* Available CDN 

I then decided that my first store I would publish to is the Microsoft Store. Using PWABuilder, it was as easy as grabbing the URL that Azure Static Web Apps created for my app, going to https://www.pwabuilder.com/, and clicking a few buttons. PWABuilder then gave me an MSIX that you can submit to the Microsoft Store, just like a UWP app. And just like that, my app, still with only a single codebase, is in the Microsoft Store. 
And that’s it! To get started building a new app like I did here, go to https://www.pwabuilder.com/ and click "Start a new PWA". 