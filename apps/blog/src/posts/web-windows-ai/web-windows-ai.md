---
layout: post
title: Let's build AI enhanced Progressive Web Apps on Windows
excerpt: Building AI enhanced PWAs!
description: This post covers the latest around on-device AI on the Web and how to build AI enhanced PWAs on Windows.
date: 2024-07-08
updatedDate: 2024-07-08
trending: true
featured: true
image: posts/whats-new-in-pwa/whats-new-header.png
isPost: true
backUrl: '/'
author:
  name: Justin Willis
  twitter: Justinwillis96
  title: Senior Software Engineer
  tagline: Seattle based Software Engineer with a passion for the Web
  image: /author_images/justin_image.jpg
tags:
  - post
  - AI
  - PWAs
---

# Build PWAs on and for Windows!

Are you a Web Developer? Do you use Windows or are you interested in switching to Windows? Let's dive into how you can use Windows to have the **BEST Web Development experience**. We will set up a dev environment with **WSL (Windows Subsystem for Linux)** and discuss how it brings a familiar dev environment to your PC. Then, we'll explore the details of how **PWAs (Progressive Web Applications)** work on Windows. Finally, if you make it to the end, we'll quickly get started building a new PWA on Windows!

## Setting up your Dev Environment

### Installing Windows Subsystem for Linux (WSL)

WSL allows developers to install a Linux distribution (such as Ubuntu, Debian, Arch, etc.) and use Linux applications, utilities, and command-line tools directly on Windows, with low overhead. To install WSL:
1. Open PowerShell in administrator mode.
2. Enter the following command: `wsl --install`
3. Restart your machine.
4. This command will enable the necessary features to run WSL and install the Ubuntu distribution of Linux.
5. The first time you launch a newly installed Linux distribution, a console window will open, and you'll see a message asking you to wait for the distro to finish installing.

## Why WSL?

WSL enables several key experiences for web developers:
- Node.js and other Node-based tools are sometimes built with the assumption that there will be a Unix-based environment, which means they may not work well on Windows. WSL fixes this.
- Node.js can be slow on Windows, especially around NPM installs. WSL provides a solution to this.
- WSL allows you to test your PWA in browsers on Linux, right from your PC. Learn more

## Progressive Web Applications on Windows

Progressive Web Applications are first-class on Windows. PWAs
- Are deeply integrated, with PWAs in the Microsoft Store, showing up in normal app settings, synced across your Windows devices and more
- Have access to all the capabilities a large majority of application types need, including:
- File System Access
- Custom Titlebars
- Windows Widgets
- Shortcuts
- Taskbar badging
- Sharing: Both receiving shared content from other apps, and sharing content from a PWA to other apps, using the native share UI on Windows.
- Push Notifications
- Background Data Syncing
- Low Latency Inking
- Device Haptics
- Bluetooth
- GPU Access
- USB
- WebAssembly

- Run natively on both arm64 and x86/64 devices, with no extra developer effort needed.
- Automatic, seamless updates
- Can be installed directly from the browser or from the store
and much more. 

### PWAs in the Microsoft Store
The Microsoft Store has full support for PWAs, just like other app types such as UWP. This gives Web Developers another channel to get new users, with no specific changes needed for the store. With this, you can build a PWA and engage with users through the channel you are used to, the browser, BUT you can also take that same app, with no changes, and ship it to the Microsoft Store. This also gives you access to other benefits from the Microsoft Store, such as:
- Showing up in searches in the Store
- The ability to advertise your PWA to users with Microsoft Store ADs
- The ability to get ratings and reviews of your app, something that can be key to improving your app, and something that cannot be easily gotten through the browser. 

Getting your PWA in the Microsoft Store is also easy! First, grab the URL to your PWA. Second, go to https://www.pwabuilder.com, enter your URL and click Start. PWABuilder will then check if your PWA is store-ready (same requirements your PWA needs to be installed in the browser) and give you a button to click to package your PWA for the Microsoft Store, along with instructions for testing and publishing.

## Let's build a new PWA!

Alright, now that we have talked about how to best set up your dev environment and how awesome PWAs are on Windows, let's start building a new PWA!

AI is all the hype nowadays, and AI on the web has made some huge strides recently! [ONNX Runtime](https://onnxruntime.ai/docs/get-started/with-javascript/web.html) has full support for running models like Whisper locally, on your device, from your PWA. It can run these models on either your CPU or the GPU (using WebGPU). With Whisper for example, which is an AI model that can automatically transcribe speech to text, you can build speech-to-text powered PWAs that share no data with the cloud.

To help developers get started with building Whisper powered speech-to-text PWAs, we decided to create a new starter template, the PWA Whisper Starter https://github.com/pwa-builder/pwa-whisper-starter! You may be familiar with our PWA Starter https://github.com/pwa-builder/pwa-starter, which is a template that gives you everything you need to start building PWAs. This new starter gives you everything you need to build PWAs, but also with
Fluent Web Components: The Fluent Web Components project gives you UI components, like buttons, dialogs, tabs etc that implement Fluent Design! This means you can build PWAs that follow the Fluent Design look and feel that you would get from a native app on Windows.
Whisper + Transformers.js: Transformers.js https://huggingface.co/docs/transformers.js/index, in a basic way, is a wrapper around Onnx Runtime that makes it easy to run different models, all locally on your device. In the starter, you get this library and all the code you need to do speech-to-text using Whisper, enabling you to focus on your actual app!

To get started building a new PWA using the Whisper Starter, follow these steps:
1. Ensure you have [Node](https://nodejs.org/en) installed.
2. Open your terminal and run `npm install -g @pwabuilder/cli
3. Next, run `pwa create -t=whisper myWhisperPWA`. This will create a new template app for you, with all the dependencies you need etc.
4. After that, just follow the instructions in the output of the CLI to get started developing!

and with that, you can start building your app! Check out https://docs.pwabuilder.com/#/starter/quick-start for more docs and details.


You made it to the end! As you can see, Windows is an amazing platform for not only building PWAs, but also has incredible support for PWAs itself! WSL brings a familiar Linux environment to Windows and allows you to build high quality PWAs using the tools you are familiar with. Combine that with the first-class support for PWAs in Windows itself and in the Microsoft Store, powerful laptops, and other tools like VSCode, Windows terminal etc, and Windows is ready to be your web development platform.

