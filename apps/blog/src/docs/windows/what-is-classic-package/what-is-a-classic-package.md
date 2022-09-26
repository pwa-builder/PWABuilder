---
layout: doc
title: What is a classic package
excerpt: Why 2 different MSIX files?
description: PWABuilder's Windows platform generates 2 versions of your app, know why
date: 2021-06-24
updatedDate: 2021-06-24
trending: false
featured: false
image: docs/windows/windows-store-documentation/StoreLogo.png
isDocumentation: true
backUrl: '/docs'
author:
  name: PWA Builder documentation
tags:
  - docs
  - Documentation
  - Windows
---

PWABuilder's Windows platform generates 2 versions of your app: 

- Modern package that works on newer versions of Windows.
- Classic package that works on older versions of Windows, with fewer bells and whistles.

## Modern package

The modern package, `{app name}.msixbundle`, uses the [Hosted App Model](https://blogs.windows.com/windowsdeveloper/2020/03/19/hosted-app-model/) to install your PWA as a Windows app hosted by Edge. This app works only on Windows version 10.0.19041, May 2020 Update and newer. 

## Classic package

The classic package, `{app name}.classic.appxbundle`, runs on older versions of Windows, versions prior to 10.0.19041, May 2020 Update. This version still uses the new Edge, but it doesn't rely on the Hosted App Model. Instead, it uses a bootstrapper app which instructs Edge to install and launch the PWA.

The classic package still runs in the new Chromium-based Edge, but lacks deep integration with the OS.

## Versioning

The modern package should have a version greater than the classic package. For example, if your modern package is version `2.0.0`, the classic package should be `1.9.0`. 

Be aware that your app version cannot begin with zero.

Additionally, app version must contain 3 sections.

- `0.5.2` - ❌ Invalid, versions cannot start with zero
- `1.5.2.1` - ❌ Invalid, the 4th section is reserved for Store use
- `1.5.2` - ✔ Valid

## Submitting your app to the Store

When you submit your app to the Microsoft Store, you'll [upload both modern and classic app packages](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/publish-new-app.md#add-packages). Users will be offered to download whichever version their OS can support.