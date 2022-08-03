---
layout: post
title: Announcing PWA Studio, the VS Code extension for building Progressive Web Apps!
excerpt: The PWA Studio VSCode extension brings everything you need to build high quality PWAs, right to your VSCode!
description: The PWA Studio VSCode extension brings everything you need to build high quality PWAs, right to your VSCode!
date: 2022-02-01
updatedDate: 2022-02-01
trending: true
featured: true
image: posts/announcing-vscode/vscode-release-graphic.png
isPost: true
backUrl: '/'
author:
  name: Justin Willis
  twitter: https://twitter.com/Justinwillis96
  title: Software Engineer
tags:
  - post
  - PWA
  - Windows
  - Android
  - iOS
---

<img alt="vscode release graphic" src="/posts/announcing-vscode/vscode-release-graphic.png" />

Today, the PWABuilder project is excited to release a brand new VSCode Extension, the PWA Studio! 
The PWA Studio VSCode extension brings everything you need to build high quality PWAs, right to your VSCode. 

You can:

-	Start building a new PWA, with all the best practices, excellent developer experience and exceptional performance that you expect, in seconds using the PWABuilder pwa-starter.
-	Learn how to publish your app to the Web with Azure Static Web Apps
-	Add a Web Manifest and Service Worker to your existing web app
-	Package your PWA for the Microsoft Store, Google Play, and Apple App Store
-	Generate Icons for your PWA
-	Validate that your PWA is installable in the browser and is ready to publish to the app stores
-	Learn more about the features of the Web Manifest to enable new features in your PWA
-	Use our snippets to quickly and easily implement native features that can improve the User Experience of your PWA
These features turn VSCode into the best development environment for Progressive Web Apps, ensuring you have tools for every step of your PWA development journey.

## Get Started
First, you need to install the extension. Visit the [VSCode Marketplace](https://aka.ms/install-pwa-studio) to install<span aria-hidden="true">.</span>
The quickest way to get started with the extension is by opening the PWABuilder panel. This can be done by clicking the PWABuilder icon on the left side of VSCode:
![The PWABuilder icon on the left side of the VSCode Window](https://raw.githubusercontent.com/pwa-builder/pwabuilder-vscode/main/resources/icon-view.png)

You should then see our three sections: Web Manifest, Service Worker, and your Store Ready Checklist. If all three views have the top item checked off, then your PWA is ready to go:

![The Web Manifest tree view in VSCode](https://raw.githubusercontent.com/pwa-builder/pwabuilder-vscode/main/resources/validate.png)

If you are missing one of the items, no problem! The extension will provide you with a button to generate the needed asset:

![The Generate Service Worker button](https://raw.githubusercontent.com/pwa-builder/pwabuilder-vscode/main/resources/sw-button.png)

Finally, the extension also provides buttons at the bottom of VSCode to provide quick access to all of our features:

![The quick actions](https://raw.githubusercontent.com/pwa-builder/pwabuilder-vscode/main/resources/quick-actions.png)

## Build a new PWA with the PWA Studio
Lets go through an example of what the extension is capable of! Today we are going to start building a brand new PWA in about 2 minutes with the extension and the [PWABuilder pwa-starter](https://aka.ms/pwa-starter)<span aria-hidden="true">.</span> You will get:
-	A ready to go codebase that follows best practices from the start: No more spending time choosing which framework to use, which build system to use, which styling system to use etc. Just start building with the PWABuilder team’s recommended setup. Enjoy Web Components? We proudly use [Lit](https://lit.dev) for incredible performance, fast load times and a React-like developer experience.
-	A Service Worker setup using [Workbox](https://developers.google.com/web/tools/workbox/) that ties in with the Rollup powered build system. This ensures that your PWA always works offline.
-	A full featured Web Manifest, including Icons, with everything that you need to ensure your PWA can be installed from the browser AND is ready to publish to the app stores.
-	Everything needed to publish to [Azure Static Web Apps](https://azure.microsoft.com/services/app-service/static/)

### Steps   
1) Open a new VSCode Window
2) Tap the PWABuilder Icon on the left side of VSCode
![The PWABuilder icon on the left side of the VSCode Window](https://raw.githubusercontent.com/pwa-builder/pwabuilder-vscode/main/resources/icon-view.png)

3) Tap the `Start a new PWA` button in the bottom left corner
![The Start a new PWA button on the left side of the VSCode Window](https://raw.githubusercontent.com/pwa-builder/pwabuilder-vscode/main/resources/main-view.png)

And that’s it! A new PWA will then open in its own VSCode window with all the dependencies installed and ready to start coding. Just run tap `Run` at the top of VSCode and then `Start Debugging` to start building your new PWA!
![The Start a new PWA button on the left side of the VSCode Window](https://raw.githubusercontent.com/pwa-builder/pwabuilder-vscode/main/resources/pwa-starter.png)

What kind of apps can you build with the extension and the starter? Anything! Check [our demos](https://github.com/pwa-builder/pwa-starter#sample-pwas-built-with-the-starter) for some awesome apps built using the starter. Build a new PWA with the extension and starter? Let us know at our [Github](https://github.com/pwa-builder/PWABuilder)

This experience becomes even more awesome when you use the [Edge VSCode Extension](https://docs.microsoft.com/microsoft-edge/visual-studio-code/microsoft-edge-devtools-extension) to debug your PWA in VSCode!

Convinced and ready to turn your VSCode into the best development environment for PWAs? [Go here]( https://marketplace.visualstudio.com/items?itemName=PWABuilder.pwa-studio) to install the extension and get started today! Running into issues? Have any ideas or suggestions? Feel free to open an issue on our [Github](https://github.com/pwa-builder/PWABuilder)  . Also, looking for an open-source project to contribute to? Check out [this link](https://github.com/pwa-builder/PWABuilder/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted+%3Araising_hand%3A%22) to see all our “help wanted” bugs and features. Just reply to the issue and someone from the team will respond. Thanks for making PWABuilder awesome! 

You can also learn more at the [PWA Studio Documentation.](https://docs.pwabuilder.com/#/studio/quick-start)
