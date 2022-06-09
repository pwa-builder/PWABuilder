---
layout: post
title: PWA Inking Enable 2D inking for the web!
excerpt: There are many ways to enable inking on the web, but they all involve their challenges to set up. Do you need to support 2D drawing or 3D rendering?
description: There are many ways to enable inking on the web, but they all involve their challenges to set up. Do you need to support 2D drawing or 3D rendering? How will you minimize rendering latency? How should the drawing respond to browser events like window resizing, tab switching, or zooming? What kinds of input do you want to handle? What do you want to do with a finished drawing?
date: 2021-07-15
updatedDate: 2021-07-15
trending: true
featured: false
image: pwa-linking.png
author:
  name: Killian McCoy
tags:
  - post
  - Inking
  - Microsoft Edge
  - Windows
---

<img src="https://media.giphy.com/media/gfrRt9TzYCv24qaoCl/giphy.gif" alt="GIF of the pwa-inking component working" width="480" height="408">

There are many ways to enable inking on the web, but they all involve their challenges to set up. Do you need to support 2D drawing or 3D rendering? How will you minimize rendering latency? How should the drawing respond to browser events like window resizing, tab switching, or zooming? What kinds of input do you want to handle? What do you want to do with a finished drawing?

The [PWABuilder](https://pwabuilder.com/) team built a solution that enables a basic inking experience for the modern web and addresses the above considerations. We are excited to announce the 1.0 version of [the pwa-inking component](https://github.com/pwa-builder/pwa-inking) is now available!

## pwa-inking is a web component that

- Uses a desynchronized 2D HTML canvas.
- Optimizes canvas redraws through [the requestAnimationFrame() api](https://docs.w3cub.com/dom/window/requestanimationframe/) and [the requestIdleCallback() api](https://w3c.github.io/requestidlecallback/) functions.
- Resizes and refocuses with the browser.
- Supports pointer (mouse, touch, and pen) events.
- Offers 4 inking experiences: pen, pencil, highlighter, and eraser.
- Allows you to copy your drawing to the clipboard and save it as a png through the native device file system

In other words, pwa-inking can let users draw a picture as quickly as they can doodle it with a finger and then save it to their phone camera roll! And developer can make it happen by adding only a few lines of code to their existing web apps

## Why would I use this?

- **modern** using the latest web APIs to keep your web apps fast while handling and rendering user input: touch, pen, and mouse friendly!
- **ready to go** wherever you want to use it in your web apps, right on your homepage or nested in another web component.
- **customizable** through CSS shadow parts and you can set any configuration of the included tools you want to use.
- **free to use and open-source** because why not!

## Getting Started

### Install it

You can install this component through npm or a script tag. If you are already using npm, we recommend installing the pwa-inking npm package. Otherwise, the script tag works fine for simple use cases.

### Script tag

1. Add this script tag in the head of your index.html

### NPM

1. Run this command in your project directory:

   ```js
   npm install @pwabuilder/pwa-inking
   ```

2. Add this import statement to your script file:

   ```js
   import @pwabuilder/pwa-inking
   ```

### Pick your starter

This component can be used with or without an included toolbar:

### Canvas with toolbar

![A screenshot of the pwa-inking component with the default toolbar.](https://miro.medium.com/max/552/1*HHqkPoDIS_D4GwdqApaZZg.png)

A screenshot of the pwa-inking component with the default toolbar.

The default and recommended experience is to add an inking-component with a nested inking-toolbar to get the most functionality for the least amount of code:

[Try the component with the default toolbar live!](https://pwa-inking.glitch.me/) | [See the code for the component with the default toolbar](https://glitch.com/edit/#!/pwa-inking?path=index.html%3A1%3A0)

### Canvas without toolbar

![A screenshot of the pwa-inking component without a toolbar.](https://miro.medium.com/max/1400/1*5WhYet8qVnf-Fk1Ag28NQQ.png)

A screenshot of the pwa-inking component without a toolbar.

Some advanced users might want to implement their own toolbar or control the canvas purely through JavaScript, so the inking-canvas can also be used alone and controlled via [the components exposed API](https://github.com/pwa-builder/pwa-inking/#inking-canvas):

[Try the component without a toolbar live!](https://pwa-inking-canvas-only.glitch.me/) | [See the code for the component without a toolbar](https://glitch.com/edit/#!/pwa-inking-canvas-only?path=index.html%3A20%3A41)

## Customize it

### Pick your tools

![A screenshot of pwa-inking with a custom toolbar positioned in the bottom right corner.](https://miro.medium.com/max/1400/1*ODsQMpBzUQ7J5uhaHP011w.png)

A screenshot of pwa-inking with a custom toolbar positioned in the bottom right corner.

Only want some of the tools? You can specify the toolbar contents and even change its position and orientation on the canvas:

[See the component live with a custom positioned toolbar](https://pwa-inking-customized-toolbar.glitch.me/) | [See the code for the component with a custom positioned toolbar](https://glitch.com/edit/#!/pwa-inking-customized-toolbar?path=index.html%3A25%3A55)

### Modify the CSS

![A screenshot of pwa-inking with customized styles on the toolbar and the canvas.](https://miro.medium.com/max/1400/1*wZh-EIkILOfXC9fAuX4U6Q.png)

A screenshot of pwa-inking with customized styles on the toolbar and the canvas.

The canvas and the toolbar tool styles are completely customizable through [the CSS shadow parts feature in CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/::part):

[See the component fully customized live](https://pwa-inking-styling-samples.glitch.me/) | [See the code for fully customizing the component](https://glitch.com/edit/#!/pwa-inking-styling-samples?path=index.html%3A29%3A20)

## Limitations

At the time of this release, browsers do not fully support features that impact the inking experience.

### Pointer event properties

Some [pointer event properties](https://w3c.github.io/pointerevents/#pointerevent-interface) that could be used to influence stroke behavior are available today but do not yet report meaningful data. These include:

- tangentialPressure
- tiltX
- tiltY
- twist

The pointer event properties utilized in this release to influence stroke size are _width_ and _pressure_.

### Low latency canvas

The 2D canvas contexts of this web component rely on the availability of [the desynchronized attribute](https://developers.google.com/web/updates/2019/05/desynchronized) to support low latency.

If a browser does not recognize this attribute, then the canvas contexts are established without it.

A [Chromium bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1085015#c38) related to image extraction of the low latency canvas is preventing this web component copy & save features from working on impacted platforms. The fix has been applied the Chromium source code, but many Chromium-based browsers (including the stable versions of Edge and Chrome) have not received it yet. We have a [GitHub issue](https://github.com/pwa-builder/pwa-inking/issues/31) tracking this.

### requestIdleCallback()

The ability to process inking component events in a way that yields to other activity on the main thread is made possible through [the requestIdleCallback() function](https://w3c.github.io/requestidlecallback/), but it is not widely supported across browsers yet.

If a browser does not support this API, the impacted inking component calls are run instead as [IIFE (immediately invoked function expressions)](https://developer.mozilla.org/en-US/docs/Glossary/IIFE).

### Clipboard API

The canvas state is copied as a png image to the browser clipboard through [the Clipboard API](https://w3c.github.io/clipboard-apis/).

If a browser does not support _navigator.clipboard_ or _ClipboardItem_, then a failure toast (and console error message if you clone and run the source code locally) will appear when a user clicks the copy button.

## What next

We are still planning our roadmap and we would love to hear from you! Let the PWABuilder team know what you think of this version and what you think should come next.

Find us on [our Twitter (@pwabuilder)](https://twitter.com/pwabuilder) and engage with us on [our GitHub repo](https://github.com/pwa-builder/).

Thanks for reading!

```js
module.exports = {
  eleventyComputed: {
    eleventyNavigation: {
      name: (data) => data.title,
      excerpt: (data) => data.excerpt,
      description: (data) => data.description,
    },
  },
}
```
