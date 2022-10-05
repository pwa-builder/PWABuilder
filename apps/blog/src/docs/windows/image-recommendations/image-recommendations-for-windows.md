---
layout: doc
title: Image recommendations for Windows PWA packages
excerpt: Everything you need to know on how to control the look & feel of your icons on the Windows platform
description: Your PWA for Windows should have a square, 512x512 or larger PNG image but sometimes more
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

Your PWA for Windows should have a square, 512x512 or larger PNG image from which PWABuilder will generate the [recommended Windows app images](https://docs.microsoft.com/en-us/windows/uwp/design/style/app-icons-and-logos).

Optionally, you can supply PNG images of the right sizes in your web manifest, and PWABuilder will use those instead.

## Overview

Your PWA can be enhanced on Windows by supplying the images with specific dimensions in your web app manifest. We recommend choosing one of the options below:

### Level 1: Basic image support

- 512x512 - base image from which to generate missing images

This is the easiest developer option, but it's also the most basic and won't stand out from other apps on Windows.

In PWABuilder's Windows platform options, you specify the URL of a square, 512x512 or larger PNG image. This is the base image from which PWABuilder will generate all Windows app images.

### Level 2: Tiles

Your [web app manifest icons](https://www.w3.org/TR/appmanifest/#icons-member) should  include images with these dimensions:

- 44x44 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon)
- 71x71 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile)
- 150x150 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile)
- 350x150 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile)
- 310x310 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile)
- 50x50 - [store logo](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo)
- 620x300 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen)

At this level, your web app manifest contains [tile images](https://docs.microsoft.com/en-us/windows/uwp/design/style/app-icons-and-logos#icon-types-locations-and-scale-factors) for the default (1x) display scale. Each of the images must be in PNG format and [purpose `any`](https://www.w3.org/TR/appmanifest/#purpose-member).

### Level 3: Tiles with display scales

Your [web app manifest icons](https://www.w3.org/TR/appmanifest/#icons-member) should  include images with these dimensions:

- 44x44 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon)
- 55x55 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon) 1.25x display scale
- 66x66 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon) 1.5x display scale
- 88x88 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon) 2x display scale
- 176x176 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon) 4x display scale
- 71x71 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile)
- 89x89 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile) 1.25x display scale
- 107x107 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile) 1.5x display scale
- 142x142 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile) 2x display scale
- 284x284 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile) 4x display scale
- 150x150 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile)
- 188x188 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile) 1.25x display scale
- 225x225 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile) 1.5x display scale
- 300x300 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile) 2x display scale
- 600x600 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile) 4x display scale
- 350x150 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile)
- 388x188 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile) 1.25x display scale
- 465x225 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile) 1.5x display scale
- 620x300 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile) 2x display scale
- 1240x600 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile) 4x display scale
- 310x310 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile)
- 388x388 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile) 1.25x display scale
- 465x465 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile) 1.5x display scale
- 620x620 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile) 2x display scale
- 1240x1240 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile) 4x display scale
- 50x50 - [store tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo)
- 63x63 - [store tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo) 1.25x display scale
- 75x75 - [store tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo) 1.5x display scale
- 100x100 - [store tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo) 2x display scale
- 200x200 - [store tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo) 4x display scale
- 620x300 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen)
- 775x375 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen) 1.25x display scale
- 930x450 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen) 1.5x display scale
- 1240x600 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen) 2x display scale
- 2480x1200 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen) 4x display scale

For level 3, your web app manifest should contain tile images for all Windows display scale sizes. 

Display scales are user-configurable in Windows:

<img loading="lazy" alt="A screenshot of the different scale sizes" src="/docs/windows/image-recommendations/windows-image-display-scales.png" />

Additionally, on Windows devices with high DPI and high resolution displays, Windows may enable a certain display scale by default. For example, on many Microsoft Surface laptops, a display scale of 200% or higher is enabled by default.

Having icons for these sizes becomes more important as more devices ship with high density and high resolution displays.

### Level 4: Tiles, display scales, and target sizes

Your [web app manifest icons](https://www.w3.org/TR/appmanifest/#icons-member) should  include images with these dimensions:

- 44x44 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon)
- 55x55 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon) 1.25x display scale
- 66x66 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon) 1.5x display scale
- 88x88 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon) 2x display scale
- 176x176 - [app icon](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#app-icon) 4x display scale
- 71x71 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile)
- 89x89 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile) 1.25x display scale
- 107x107 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile) 1.5x display scale
- 142x142 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile) 2x display scale
- 284x284 - [small tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#small-tile) 4x display scale
- 150x150 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile)
- 188x188 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile) 1.25x display scale
- 225x225 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile) 1.5x display scale
- 300x300 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile) 2x display scale
- 600x600 - [medium tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#medium-tile) 4x display scale
- 350x150 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile)
- 388x188 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile) 1.25x display scale
- 465x225 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile) 1.5x display scale
- 620x300 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile) 2x display scale
- 1240x600 - [wide tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#wide-tile) 4x display scale
- 310x310 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile)
- 388x388 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile) 1.25x display scale
- 465x465 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile) 1.5x display scale
- 620x620 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile) 2x display scale
- 1240x1240 - [large tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#large-tile) 4x display scale
- 50x50 - [store tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo)
- 63x63 - [store tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo) 1.25x display scale
- 75x75 - [store tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo) 1.5x display scale
- 100x100 - [store tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo) 2x display scale
- 200x200 - [store tile](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#store-logo) 4x display scale
- 620x300 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen)
- 775x375 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen) 1.25x display scale
- 930x450 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen) 1.5x display scale
- 1240x600 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen) 2x display scale
- 2480x1200 - [splash screen](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#splash-screen) 4x display scale
- 16x16 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 20x20 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 24x24 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 30x30 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 32x32 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 36x36 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 40x40 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 44x44 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 48x48 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 60x60 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 64x64 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 72x72 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 80x80 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 96x96 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager
- 256x256 - [target size](https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md#target-size-images) for taskbar, start menu, task manager

In level 4, you supply images for tiles with display scales and target size images for display in various surfaces in Windows, including taskbar, start menu, task manager, ALT+Tab task switcher, and more. 

This provides the best experience for your users, but also requires the most developer effort.

## Image level summary

We recommend you choose one of the levels described above. **Keep in mind that if you don't supply one or more of the above image sizes in your web manifest, PWABuilder will generate it for you**. 

For example, if you don't supply a 284x284 (small tile 4x display scale) image in your web manifest, PWABuilder will create it for you by scaling down the large, square PNG image you supplied in the PWABuilder options dialog.

If PWABuilder generating all the images is acceptable for your app, then you may proceed with Level 1 or Level 2. But if you want control over which icons show up in Windows -- not just using some scaled image variant -- you should choose Level 3 or 4.

Consider, for example, how your app icon might show different content depending on the available surface area:

- Small surface: App icon (44x44) in taskbar, showing a small, abbreviated logo: <br><img loading="lazy" alt="The small size icon" src="/docs/windows/image-recommendations/windows-image-app-icon.png" />

- Larger surface: Medium tile (150x150) in start menu, showing the full logo of the app:<br><img loading="lazy" alt="The medium size icon" src="/docs/windows/image-recommendations/windows-image-medium-tile.png" />

- Wide surface: Wide tile in start menu, showing a more articulated app icon:<br><img loading="lazy" alt="The wide size icon" src="/docs/windows/image-recommendations/windows-image-wide-tile.png" />

Notice how the _content_ of the icon changed. This is possible only through the use of higher levels of icon support. Thus, **we recommend developers choose higher levels to give the best experience for your Windows users.**

## Icon descriptions

Below you'll find a description of each app icon and where they show up in Windows.

### App icon

<img loading="lazy" alt="The normal app icon" src="/docs/windows/image-recommendations/windows-image-app-icon.png" />

Shown in start menu, task bar, task manager.

- 44x44 
- 55x55 (1.25x scale)
- 66x66 (1.5x scale)
- 88x88 (2x scale)
- 176x176 (4x scale)

### Small tile
<img loading="lazy" alt="The small tile icon" src="/docs/windows/image-recommendations/windows-image-small-tile.png" />

Shown in the start menu when the user set your app's tile to small size.

- 71x71
- 89x89 (1.25x scale)
- 107x107 (1.5x scale)
- 142x142 (2x scale)
- 284x284 (4x scale)

### Medium tile
<img loading="lazy" alt="The medium tile icon" src="/docs/windows/image-recommendations/windows-image-medium-tile.png" />

Shown in the start menu when the user sets your app's tile to medium size.

- 150x150
- 188x188 (1.25x scale)
- 225x225 (1.5x scale)
- 300x300 (2x scale)
- 600x600 (4x scale)

### Wide tile
<img loading="lazy" alt="The wide tile icon" src="/docs/windows/image-recommendations/windows-image-wide-tile.png" />

Shown in the start menu when the user sets your app's tile to wide size.

- 310x150
- 388x188 (1.25x scale)
- 465x225 (1.5x scale)
- 620x300 (2x scale)
- 1240x600 (4x scale)

### Large tile
<img loading="lazy" alt="The large tile icon" src="/docs/windows/image-recommendations/windows-image-large-tile.png" />

Shown in the start menu when the user sets your app's tile to large size.

- 310x310
- 388x388 (1.25x scale)
- 465x465 (1.5x scale)
- 620x620 (2x scale)
- 1240x1240 (4x scale)

### Store logo
<img loading="lazy" alt="The store logo icon" src="/docs/windows/image-recommendations/windows-image-store-logo.png" />

Shown in app installer, Windows Partner Center, the "Report an app" option in the Store, and the "Write a review" option in the Store. 

- 50x50
- 63x63 (1.25x scale)
- 75x75 (1.5x scale)
- 100x100 (2x scale)
- 200x200 (4x scale)

### Splash screen
<img loading="lazy" alt="The splash screen asset" src="/docs/windows/image-recommendations/windows-image-splash.png" />

Shown as the splash screen for your app. Currently supported only in classic package. In the future, we may add support for the modern hosted app package as well.

- 620x300 
- 775x375 (1.25x scale)
- 930x450 (1.5x scale)
- 1240x600 (2x scale)
- 2480x1200 (4x scale)

### Target size images

In addition to the standard scale factor sizes described above, we also recommend creating "target-size" assets. We call these assets target-size because they target specific sizes, such as 16 pixels, rather than specific scale factors, such as 400. Target-size assets are for Windows surfaces that don't use the scaling plateau system.

Shown in start jump list, shortcuts, control panel:

<img loading="lazy" alt="Icon sizes for jump lists, shorcuts and the control panel" src="/docs/windows/image-recommendations/windows-image-target-size.png" width="250px" />

- 16x16 (recommended)
- 20x20
- 24x24 (recommended)
- 30x30
- 32x32 (recommended)
- 36x36
- 40x40
- 48x48 (recommended)
- 60x60
- 64x64
- 72x72
- 80x80
- 96x96
- 256x256 (recommended)

<h2 id="windows-light-mode-icons">Windows Light Mode icons</h2>

Windows lets users to change their OS theme to Windows Light Mode. Consider the default Windows theme (dark mode):

<img loading="lazy" alt="The dark mode icon" src="/docs/windows/image-recommendations/windows-os-dark-mode.png" />

Contrasted with Windows Light Mode:

<img loading="lazy" alt="The light mod icon" src="/docs/windows/image-recommendations/windows-os-light-mode.png" />

In the above image, notice how the Store app icon is _darker_ when the OS is in Light Mode.

By default, your app will have the same icon for both light and dark modes. 

But if you wish to have a different app icon in Windows Light Mode, you can use the new [W3C `color_scheme` proposal](https://github.com/w3c/image-resource/issues/26) on icons with sizes 16x16, 20x20, 24x24, 30x30, 32x32, 36x36, 40x40, 44x44, 48x48, 60x60, 64x64, 72x72, 80x80, 96x96, 256x256:

```json

{
    "src": "/images/icon16x16.png",
    "sizes": "16x16",
    "color_scheme": "light"
},
{
    "src": "/images/icon20x20.png",
    "sizes": "20x20",
    "color_scheme": "light"
},
{
    "src": "/images/icon24x24.png",
    "sizes": "24x24",
    "color_scheme": "light"
},
{
    "src": "/images/icon30x30.png",
    "sizes": "30x30",
    "color_scheme": "light"
},
{
    "src": "/images/icon32x32.png",
    "sizes": "32x32",
    "color_scheme": "light"
},
{
    "src": "/images/icon36x36.png",
    "sizes": "36x36",
    "color_scheme": "light"
},
{
    "src": "/images/icon40x40.png",
    "sizes": "40x40",
    "color_scheme": "light"
},
{
    "src": "/images/icon44x44.png",
    "sizes": "44x44",
    "color_scheme": "light"
},
{
    "src": "/images/icon48x48.png",
    "sizes": "48x48",
    "color_scheme": "light"
},
{
    "src": "/images/icon60x60.png",
    "sizes": "60x60",
    "color_scheme": "light"
},
{
    "src": "/images/icon64x64.png",
    "sizes": "64x64",
    "color_scheme": "light"
},
{
    "src": "/images/icon72x72.png",
    "sizes": "72x72",
    "color_scheme": "light"
},
{
    "src": "/images/icon80x80.png",
    "sizes": "80x80",
    "color_scheme": "light"
},
{
    "src": "/images/icon96x96.png",
    "sizes": "96x96",
    "color_scheme": "light"
},
{
    "src": "/images/icon256x256.png",
    "sizes": "256x256",
    "color_scheme": "light"
}
```

If you supply those images in your manifest, your app will use them when Windows is in Light Mode. If you don't provide those images, your app will have the same icon across both Windows Light and Dark modes.

## Unsupported Windows image types

[High contrast icons](https://docs.microsoft.com/en-us/windows/uwp/app-resources/tailor-resources-lang-scale-contrast#contrast) and [accent color icons](https://blog.mzikmund.com/2015/09/en-accent-color-in-windows-10-app-taskbar-icons/) are currently unsupported in the PWABuilder Windows platform. 

Please [open an issue](https://github.com/pwa-builder/pwabuilder/issues) if support is important to you.

## Unplated icons

PWABuilder assumes your icon works as an [unplated icon](https://docs.microsoft.com/en-us/windows/uwp/design/style/app-icons-and-logos#unplated-assets), building your app with support for showing your icon as unplated in Windows. PWABuilder currently doesn't support changing this behavior. 

If support for showing only plated icons in Windows is important for your app, please [open an issue](https://github.com/pwa-builder/pwabuilder/issues).

## Summary

PWABuilder requires you to have a large, square, PNG image from which it will generate all 80 recommended Windows app images for you.

Optionally, you can supply one or more Windows images yourself by adding an image of the right dimensions to your web manifest.

Questions or comments? Feel free to [open an issue on Github](https://github.com/pwa-builder/pwabuilder/issues), we'd be glad to help.
