---
layout: post
title: Building Memos AI - A Developer's Perspective
excerpt: Come take a look at how you can leverage artificial intelligence on the web with MemosAI, a smart, note-taking application built by PWABuilder engineer Justin Willis.
description: This blog takes a look at MemosAI, a Progressive Web App that demonstrates how you can effectively make use of artificial intelligence on the web.
date: 2023-10-18
updatedDate: 2023-10-18
trending: true
featured: true
image: posts/memos-ai/hero.png
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

![Short live demo](/posts/memos-ai/record-new-note.png)

Hello! I recently released an app I've been working on, [Memos AI](https://www.recordergo.app), and I wanted to talk a bit about how I built this app. Before we dive in, let’s touch on exactly what Memos AI is. Memos AI is a voice memos app that uses artificial intelligence to automatically take notes for you during lectures, meetings, and more. Memos AI will:

* Transcribe speech
* Summarize that transcription
* Take notes based on that transcript
* and more!

Memos AI was built with the [PWA Starter](https://github.com/pwa-builder/pwa-starter), which is PWABuilder's starter template for building new Progressive Web Apps. If you want to get started yourself, take a look at the [PWA Starter Quick Start](https://docs.pwabuilder.com/#/starter/quick-start).

If you want to try the app out for yourself before reading, head to [Memos AI](https://www.recordergo.app) to use the app live.

Now, let's dive into how Memos AI makes use of AI on the web!

## AI on the Web 

When I started building Memos AI, I evaluated some existing AI solutions that are available for web apps. I was surprised to see multiple open-source options for running AI inference client-side! This, when combined with things like the [OpenAI API](https://openai.com/blog/openai-api/) or Azure for more compute heavy issues, can come together to provide high-quality AI experiences in a PWA. 

For Memos AI, the main AI feature is speech-to-text. I wanted to go with a "cloud by default" approach for the best performance across all devices, but with the option for a user to run the AI features client side, on their own device. This ensures that users on mobile devices or less powerful devices overall are not left out of the experience.

### Live Speech-To-Text

#### In the Cloud
For the live speech-to-text transcript, I am using the [Azure Speech SDK](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-sdk) which supports JavaScript both in the browser and in Node. The Azure Speech SDK supports [live client-side speech-to-text](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-recognize-speech?pivots=programming-language-javascript#recognize-speech-from-a-microphone), in the browser, using the users mic on their device. This made it incredibly easy to implement in my app with just some JavaScript:

![Code for setting up a Speech Recognizer](/posts/memos-ai/setup.png)

This code sets up a `Speech Recognizer`, that I can then use to run live client-side speech-to-text by calling the `startContinuousRecognitionAsync` method. 

![Code for starting live transcription](/posts/memos-ai/start.png)

This works perfectly in my web components based app as it's just standard JavaScript that would work in any framework.

#### Client-Side
As mentioned above, I found existing solutions for running AI inference client-side in a web app, including the [transformers.js](https://github.com/xenova/transformers.js/) which enables the ability to run AI models from HuggingFace client-side in your browser!

While it is possible, I did not set this up to do live speech-to-text, but instead to run on a recorded blob from the note, which I generated with the [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder). I then pass this blob to a Web Worker (so as not to block the UI while it is transcribing), which then does local speech-to-text using the following code:

![Alt text](/posts/memos-ai/local.png)
 
As I mentioned, this code is running in a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), which is a built-in way to run code on a different thread than the main UI thread. This ensures that our UI stays responsive while doing heavy work in a worker thread.

And that is how I implemented AI in Memos AI! 

For the rest of the app, I used our [PWA Starter](https://aka.ms/pwa-starter), with [Fluent Web Components](https://learn.microsoft.com/en-us/fluent-ui/web-components/) for the UI. For animations between pages, I am using the built-in [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) which enables native, built-in animated page transitions. 

If you want to learn more about view transitions check out our latest post on the view transitions API [here](https://blog.pwabuilder.com/posts/mimic-native-transitions-in-your-progressive-web-app/) for more detail.

Thanks!