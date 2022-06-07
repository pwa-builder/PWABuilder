---
layout: doc
title: Finding your Windows Publisher info
excerpt: How to get the 3 important details to create your MSIX package
description: How to get the 3 important details to create your MSIX package
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

In order to publish your PWA in the Microsoft Store, you'll need 3 things:

1. `Package ID`
2. `Publisher ID`
3. `Publisher display name`

To get this information, go to [Windows Partner Center](https://partner.microsoft.com/dashboard) and click on your app. (Don't have an app yet? [Create one](/docs/publish-a-new-app-to-the-microsoft-store/).)

Choose `Product Management` -> `Product Identity`:

<img loading="lazy" alt="The partner center showing the required data" src="/docs/windows/finding-publisher-info/required-data-from-partner-center.png" />

You'll see the Package ID, Publisher ID, and publisher display name. You'll need all three of these to publish in the Store.

On PWABuilder when generating your Windows app, add these values to the Windows package options:

<img loading="lazy" alt="Publisher and package info in PWABuilder" src="/docs/windows/finding-publisher-info/required-data-in-pwabuilder.png" /> 

## Need more help?

Having trouble getting your package info? You can [open an issue](https://github.com/pwa-builder/pwabuilder/issues) and we'll help walk you through it.
