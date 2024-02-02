---
layout: post
title: Web Apps on macOS Sonoma got a proper install experience
excerpt: This post guides us how we detected Web Apps availability on macOS platform.
description: How we enabled Sonoma's Web Apps support for PWA Install component.
date: 2024-02-01
updatedDate: 2024-02-01
trending: true
featured: true
image: posts/macos-pwa-install/pic-1-wide.jpg
isPost: true
backUrl: '/'
author:
  name: Gleb Khmyznikov
  twitter: khmyznikov
  title: Software Engineer
  image: /author_images/gleb_image.jpg
  tagline: Eastern Europe based Software Engineer who loves PC hardware, gaming handhelds, classic cars and web technologies.
tags:
  - post
  - macOS
  - WebApps
---

<figure>
  <video preload="none" controls poster="/posts/macos-pwa-install/pic-1-wide.jpg">
    <source src="/posts/macos-pwa-install/video.webm" type="video/webm">
  </video>
  <figcaption>Installing PWA on macOS Safari</figcaption>
</figure>

### Backstory

Traditionally for Apple, the company has been slow to adopt new web technologies. However, with the release of macOS Sonoma, Apple has made a big step forward in supporting Web Apps in general and Progressive Web Applications specifically. This is great news for developers and users alike, as it means that PWAs will be more accessible on Mac than ever before.

But, also traditionally for Apple, there is no built-in browsers experiences for prompting PWA installation on Safari. This is where the [pwa-install](https://github.com/khmyznikov/pwa-install) component comes in. It's a simple, lightweight, framework agnostic web-component that provides a native-like installation experience for PWAs on iOS/iPadOS and now on macOS Sonoma. It's easy to use and works with any PWA or simple Web App, so you can get started right away.

![PWA Install Instructions](/posts/macos-pwa-install/pic-3.jpg)

Why easy installation matters? Progressive Web Applications offer a lot of flexibility and user engagement. One of the main selling points is their app-like presence on your device. However, not every browser has made it easy to install them. This update is set to make the installation of PWAs feel more native, especially for users on macOS Safari.

### Implementation

But how it was archived? Safari on macOS Sonoma supports the Web App Manifest, which is a JSON file that describes the Web App metadata. This includes the app's name, description, icons, and more. The pwa-install component uses this information to create a native-like installation experience for PWAs on iOS/iPadOS and macOS Sonoma.

But here's a catch: Safari on macOS don't provide any API to detect Web Apps availability. So we had to use a workaround to detect Web Apps availability on macOS platform.

[Here's how it works](https://github.com/khmyznikov/pwa-install/blob/cf73d0c382fd87aa6b5a5cc40f0474150efe3487/src/utils.ts#L24):

```js
static isAppleDesktop(): boolean {
    // check if it's a mac
    const userAgent = navigator.userAgent.toLowerCase();
    if (navigator.maxTouchPoints || !userAgent.match(/macintosh/))
        return false;
    // check safari version >= 17
    const version = /version\/(\d{2})\./.exec(userAgent)
    if (!version || !version[1] || !(parseInt(version[1]) >= 17))
        return false;
    // hacky way to detect Sonoma
    const audioCheck = document.createElement('audio').canPlayType('audio/wav; codecs="1"') ? true : false;
    const webGLCheck = new OffscreenCanvas(1, 1).getContext('webgl') ? true : false;

    return audioCheck && webGLCheck;
}
```
Combined the user agent and specific for Safari on Sonoma feature detections, we can detect Web Apps availability on macOS platform. We had to run previous and current macOS version with latest Safari 17 side by side and with help of [tool like this](https://browserleaks.com/features) we were able to detect the difference we can use.

### Installation

This isn't just about Safari on MacOS. The component keeps the user experience consistent no matter the device.

| &nbsp;&nbsp;iOS&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Android |
| --- | --- | --- |
|![iOS install prompt](/posts/macos-pwa-install/pic-4.jpg)|![iOS install instructions](/posts/macos-pwa-install/pic-5.jpg)|![Android Gallery](/posts/macos-pwa-install/pic-6.jpg)|

![Chrome Prompt](/posts/macos-pwa-install/pic-7.jpg)

Adding this component to your project is simple. The [readme](https://github.com/khmyznikov/pwa-install?tab=readme-ov-file#install) includes a one-line npm install command, import instructions, and basic HTML for adding the component to a app. There's even a live [demo](https://khmyznikov.com/pwa-install/) to show you exactly how it should look and work.
React polyfill is also available for those who use React. Another modern framework users can use the component as a web component.

What's Coming Soon for PWA Installation? Samsung Internet and Firefox Mobile are the next browsers to get the pwa-install component. This will make it even easier for users on Android devices to install PWAs from their favorite browsers.

### Conclusion

The pwa-install component is improving the install process for PWAs, particularly with the latest Safari update for MacOS Sonoma. This update promises to make the experience feel more native for Apple users. Whether you're aiming to reach MacOS, iOS, or wider audiences, the component is essential for seamless PWA installations.

Jump into the [demo](https://khmyznikov.com/pwa-install/), see the new features for yourself, and if you like the progress, feel free to [contribute](https://github.com/khmyznikov/pwa-install) features or translations through pull requests.