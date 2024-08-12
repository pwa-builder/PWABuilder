---
layout: doc
title: Next steps for getting your PWA into the Microsoft Store
excerpt: You've successfully generated a Microsoft Store app package, let's see how to publish it now
description: You've successfully generated a Microsoft Store app package, let's see how to publish it now
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
  - Microsoft Store
---

You've successfully generated a Microsoft Store app package for your PWA. 😎 

Your next steps:
1. **Test your app**: run `install.ps1` to install your app on your Windows machine.
2. **Submit your app packages to the Microsoft Store**: upload the `.appxbundle` and `.msixbundle` files to the Microsoft Store.

Each step is explained below.

## 1. Test your app on your Windows machine

Your zip file contains `install.ps1`. This is a PowerShell script that installs your app and lets you test it before submitting to the Store.

Right-click `install.ps1` and choose `Run with PowerShell`.

> 💁‍♂️ *Heads up*: 
> 
> If you get an error saying, *"install.ps1 cannot be loaded because running scripts is disabled on this system"*, you can fix this by opening PowerShell as Administrator, then entering the command `Set-ExecutionPolicy bypass` Once completed, you'll be able to run `install.ps1`.

The install script will install and launch your PWA app. Once complete, you'll find your app in the Start Menu.

## 2. Submit your app packages to the Microsoft Store

Your zip file [contains 2 app packages](/docs/what-is-a-classic-package/): 

- `{app name}.msixbundle` - the main app package
- `{app name}.classic.appxbundle` - app package that allows users on older versions of Windows (below 10.0.19041, May 2020 Update) to run your app. See our [classic app package explainer](/docs/what-is-a-classic-package/) for details.

Both packages can be submitted directly to the Microsoft Store through the [Windows Partner Center](https://partner.microsoft.com/dashboard)

When you're ready to publish to the Store, you can either
- [Publish a new app in the Store](/docs/publish-a-new-app-to-the-microsoft-store/) 
- [Update an existing app in the Store](/docs/update-an-existing-app-in-the-microsoft-store/)

Once you submit your app, it will be reviewed. Once approved -- typically within 24 hours -- your PWA will be available in the Microsoft Store and accessible to ~1 billion Windows users worldwide. 😎

## Recommended images for Windows

To help make your PWA shine on Windows, check out our [Windows app images explainer](/docs/image-recommendations-for-windows-pwa-packages/) for details about what image sizes you should include in your web app manifest for the best experience on Windows.

## Promote your app with a "Get this app in the Microsoft Store" badge

Once you've published your app in the Store, help your users find it. Go to the [app badges site](https://developer.microsoft.com/en-us/microsoft-store/badges/) and generate a "Get this app on the Microsoft Store" badge and add the badge to your site. 

The badge allows users on Windows to install your app with a single click.

## Need more help?

If you're having trouble with your app store submission, be sure to read [fixing package errors](/docs/image-recommendations-for-windows-pwa-packages/).

If you're still hitting issues, we're here to help. You can [open an issue](https://github.com/pwa-builder/pwabuilder/issues) and we'll help walk you through 
