---
layout: post
title: What's New in PWA - November 2023
excerpt: See what's going on in the world of Progressive Web Apps!
description: This article covers what's new for Progressive Web Apps over the last year or so - from numbers on adoption to new APIs and more.
date: 2023-11-22
updatedDate: 2023-11-22
trending: true
featured: true
image: posts/whats-new-in-pwa/whats-new-header.png
isPost: true
backUrl: '/'
author:
  name: Zach Teutsch
  twitter: devteutsch
  title: PWABuilder Engineer
  tagline: I like to go to music festivals and code!
  image: /placeholder-person.png
tags:
  - post
  - PWA
  - App Capabilities
---

<img src="/posts/whats-new-in-pwa/whats-new-header.png" alt="Cover photo displaying the text 'What's New in PWA'" style="display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;"></img>

Welcome to What's New in PWA! This post will cover what is new in the world of Progressive Web Apps and PWABuilder over the last year or so. We'll take a look at some of the latest browser capabilities, go over some numbers on PWA adoption, and spotlight some Progressive Web Apps we've recently encountered through the PWABuilder service.

Let's jump into the latest browser capabilities.

## New Browser Capabilities

The last year has seen browser capabilities continue to expand to support more flexible Progressive Web Apps. Let's highlight a few that have made Progressive Web Apps more flexible.

### Window Controls Overlay

<img src="/posts/whats-new-in-pwa/wco.png" alt="Visual of space opened up by using Window Controls Overlay."></img>

Window Controls Overlay is a newer feature that allows your Progressive Web App to look more like a native application by allowing usage of the space normally reserved for the browser's window controls. This feature is available in both Edge and Chrome.

Learn more about [Window Controls Overlay](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/window-controls-overlay).

### Windows 11 Widgets 

<img src="/posts/whats-new-in-pwa/windows11-widgets.png" alt="Showcase of where widgets live on Windows 11."></img>

Progressive Web Apps running on Edge can now define widgets for the Widgets Board on Windows 11. This is another great way for your app to integrate more fully on a native operating system.

Learn more about [creating Widgets for Windows 11](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/widgets).

### Edge Side Panel

<img src="/posts/whats-new-in-pwa/side-panel.png" alt="PWA running in the Edge Side Panel."></img>

Progressive Web Apps running on Edge can now make use of the Edge Side Panel, which allows your app to run side-by-side with other content. This is great for productivity apps and apps that may be used in conjunction with other content.

Learn more [about the Edge Side Panel](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/sidebar).

## PWA By The Numbers

All of the following data is sourced from [the Web Almanac](https://almanac.httparchive.org/en/2022/), a crowd sourced project for tracking web development trends. We'll be taking a look at some of the data associated with progressive web apps, such as service worker and app capabilities usage.

### Service Worker Usage

First, let's take a look at service workers. Right now, **just under 2 percent** of all websites employ the use of a service worker. However, this number increases when looking at only the most popular websites. For the top 10,000 sites, service worker usage is around **8 percent**. This makes sense, as more popular sites are more likely to to have the support required to update to the latest web technologies.

Let's also take a look at what service worker features are being utilized:

* Around **50 percent** of apps with service workers are using the `fetch` event.
* Around **56 percent** are using notification based events, such as `notificationclick` and `push`.
* Syncing events aren't as widely used, with only around **5 percent** of apps using the `sync` event, and only **.01 percent** using the `periodicsync` event.

To see more servicer worker or PWA data, head over to the [Web Almanac.](https://almanac.httparchive.org/en/2022/pwa)

### App Capabilities Usage

Though many app capabilities aren't exclusive to Progressive Web Apps, their usage is still a good indicator of how developers are making use of the modern web. Let's take a look at some of the most popular app capabilities in order:

1. Async Clipboard API - **10 percent**
2. Web Share API - **9 percent**
3. Media Session API - **7.5 percent**
4. Device Memory API - **6 percent**

To see more app capabilities data, head over to the [Web Almanac.](https://almanac.httparchive.org/en/2022/capabilities)

## App Spotlight

Tons of apps make their way through the PWABuilder service every day. Let's spotlight a few of the most recent apps that have been submitted.

### MelodyRex

<img src="/posts/whats-new-in-pwa/melody-rex.png" alt="Melody Rex practice page"></img>

MelodyRex is a productivity tool that helps musicians track practice times, set goals, and more. It includes a metronome and social capabilities for interacting with your practice partners.

Some things I like about this app:

* Proper use of offline support with a service worker
* Effective use of notifications
* Simple but effective UI and nice user experience features, such as a guided tutorial with tooltips.

Check out [MelodyRex in the Microsoft Store.](https://apps.microsoft.com/detail/9NH3T38RCBT5)

### JAM HEARTS

<img src="/posts/whats-new-in-pwa/jam-hearts.png" alt="Jam Hearts game open in the browser."></img>

JAM HEARTS is a game Progressive Web App that's just a great example of how great a simple game can be on the web. It's fun and easy to play on any platform.

Some things I like about this app:

* UI is visually pleasing and simple, and looks nice on any platform.
* Design choices resemble a native application
* Offline support

Check out [JAM HEARTS in the Microsoft Store.](https://apps.microsoft.com/detail/jam-hearts/9NZXCZHV095C)