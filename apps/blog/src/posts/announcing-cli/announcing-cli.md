---
layout: post
title: Use the PWABuilder CLI to Create a New Progressive Web App
excerpt: Announcing PWABuilder's new CLI. Create, develop, and test from an easy-to-use PWA template.
description: Announcing PWABuilder's new CLI. Create, develop, and test from an easy-to-use PWA template.
date: 2023-09-19
updatedDate: 2023-09-19
trending: true
featured: true
image: posts/announcing-cli/hero.png
isPost: true
backUrl: '/'
author:
  name: Zach Teutsch
  twitter: https://twitter.com/devteutsch
  title: PWABuilder Engineer
tags:
  - post
  - CLI
  - PWA Starter
  - PWA
  - PWA template
---

PWABuilder is launching a brand new CLI that can create a new templated [Progressive Web App](https://docs.pwabuilder.com/#/home/pwa-intro) for you and have you developing in just seconds. 

The CLI makes use of our existing [PWA Starter template](https://docs.pwabuilder.com/#/home/pwa-intro) to give you a lightweight groundwork to start building your first progressive web app on. We wanted to make sure that developers can dive in with development as quickly and as smoothly as possible.

You’ll need [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to get started, and you can install the CLI globally with this command:

```
npm install -g @pwabuilder/cli
```

From there, it’s just one command to create your first app:

```
pwa create my-first-pwa
```

<img src="/posts/announcing-cli/pwa-create.png" alt="PWABuilder CLI create command output after executing."></img>

And then one more command to start running and developing your app, with live-reload for changes!

```
pwa start
```

Your PWA will then open in the browser window!

<img src="/posts/announcing-cli/open-pwa.png" alt="PWA Starter open in a new browser window."></img>

For more guidance on using the CLI, check out our documentation [here.](https://docs.pwabuilder.com/#/starter/quick-start) For feedback and issues, head over to our [Github repo](https://github.com/pwa-builder/PWABuilder). We’re always open ideas and direct contributions from the community!