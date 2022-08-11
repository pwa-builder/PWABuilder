--- 
layout: doc 
title: Simulate your PWA on Windows 11 
excerpt: This guide shows you how to use and customize the PWA simulator 
description: Visualize your PWA on Windows 11 before packaging for the Microsoft Store 
date: 2021-08-03 
trending: false 
featured: false 
image: docs/windows/pwa-simulator/store-preview.png 
isDocumentation: true 
backUrl: '/docs' 
author: 
  name: PWA Builder documentation 
tags: 
  - docs 
  - Documentation 
  - Windows 
---

Have you ever wondered if it would be possible to see how your PWA looks on Windows 11 before packaging for the Microsoft Store? The new PWA simulator enables you to preview your PWA experience on Windows 11 and see how your application will look in the Microsoft Store and even on the start menu to your users. You can also utilize the code editor within the simulator to edit manifest values real-time and see how changes in your manifest will impact your end users experience on Windows 11. This can help for you to understand what steps you can take to improve your PWA before you package it for distribution on the Microsoft Store. This guide shows you how to use *PWA simulator*, a [web component](https://medium.com/pwabuilder/building-pwas-with-web-components-33f986bf8e4c) that allows you to simulate your PWA on Windows 11 based on your app's `manifest.json` file. Below is the simulation of PWABuilder Using the link below you can now input the link to your PWA and see how your application will appear on a Windows 11 device. Want to try it out with your own URL? Then you can visit the [component's demo site](https://thankful-field-01d77ed10.azurestaticapps.net/) and enter the URL to your PWA! 

## Installation 
The component can be [downloaded](https://www.npmjs.com/package/@pwabuilder/pwa-simulator) from `npm` with `npm i @pwabuilder/pwa-simulator`. Typings are also included in the package. 

## Using this component 

### Modes 
The `pwa-simulator` can be used in 2 ways: 1. *You can enter the PWA's URL in the initially rendered form*, and via the [\`pwabuilder-manifest-finder\` API](https://github.com/pwa-builder/pwabuilder-manifest-finder), the component fetches the corresponding web manifest. ![URL simulator form](/docs/windows/pwa-simulator/url-form.png) 2. *The site's URL can be passed as a property to the component*, together with the web manifest. Note that the PWA's URL is still needed in this mode to display the icons and other images. ![Mode 2 example](/docs/windows/pwa-simulator/mode2-code.png) 

## Configuration 
All properties are optional and have default values, but for the optimal experience these should be modified as needed. Note that in the HTML markup, property names should be all in lowercase. For more information refer to [lit's documentation](https://lit.dev/docs/components/properties/#attributes). 
- `siteUrl`: The PWA's URL. If not defined, the component will initially display a form to input the site's URL (see mode 1 above). 
- `manifest`: The input manifest object. The `siteUrl` property should be defined if a manifest is given as input. 
- Default: ![Manifest template](/docs/windows/pwa-simulator/manifest-template.png) 
- `hideEditor`: If true, the code editor is hidden and only the simulator window is displayed. 
- Default: `false` 
- `explanations`: Object containing the explanation messages that are displayed when the user interacts with the simulator. 
- `initial` is the starting message (can be used to suggest an initial action to the user). 

`appWindow`, `startMenu`, `jumpList` and `store` are all shown when the respective window is open. If a value isn't specified, the default message is used. 

- `Default`: ![Explanations messages](/docs/windows/pwa-simulator/descriptions.png) 

- `explanationDisplayTime`: The duration (in milliseconds) of the explanation message display, after which it fades out. - Default: 5000 (5 seconds) 

## Styling 
The simulator exposes the parts below for customization with the [CSS ::part()pseudo-element](https://css-tricks.com/styling-in-the-shadow-dom-with-css-shadow-parts/): 
- `background`: The simulator's main container. 
- `content`: The container of both the text editor and platform window. 
- `input-form`: The form for entering the PWA's URL. 
- `input-title`: The title of the form for entering the PWA's URL. 
- `input-field`: The text field for entering the PWA's URL. 
- `input-button`: The button that submits the form for entering the PWA's URL. 

The following [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) can also be provided: 
- `--font-family`: The component's main font family. 
- `--font-color`: The component's main font color. 
- `--background`: The CSS background of the entire component. 
- `--pwa-background-color`: Fallback background color to use in case it is not defined in the manifest. 
- `--pwa-theme-color`: Fallback theme color to use in case it is not defined in the manifest. 

## Next steps 
In the future, the PWABuilder team hopes to integrate the Windows 11 simulator into the manifest editor on the PWABuilder site. This would enable developers to see and feel the PWA Windows 11 experience as they are editing their manifest for store packaging. Have feedback on what you want to see built out next in the Windows 11 simulator? Open a [feature request](https://github.com/pwa-builder/pwa-simulator) on GitHub and make sure to mention the Windows 11 simulator with your recommendations. Ready to get started packaging your PWA, head over to [pwabuilder.com ](https://www.pwabuilder.com/) to package your PWA today! ## Need help? Are you having trouble using this component, encountered a bug, or just have a question concerning its customization? Then feel free to [open an issue](https://github.com/pwa-builder/pwa-simulator) and we'll do our best to help!
