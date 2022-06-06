# PWA Starter Quick Start

The PWA Starter is the PWABuilder team's opinionated and production tested progressive web app template. We use the starter to build all of our PWAs, including PWABuilder itself. 

The PWA Starter uses a lightweight, fast, and extensible stack that allows you to quickly get started with developing a new PWA.

The starter is specifically focused on cross-platform PWA development and comes with a basic manifest and service worker functionality through [Workbox.](https://developers.google.com/web/tools/workbox/)

If you're new to developing PWAs and aren't sure where to start, check out this [blog series.](https://microsoft.github.io/win-student-devs/#/)

## Prerequisites

There are just a few things you will need before getting started:

- A Github Account, which you can create at [GitHub](https://github.com/).
- A code editor, such as [Visual Studio Code](https://code.visualstudio.com/).
- A web browser, such as [Microsoft Edge](https://www.microsoft.com/en-us/edge).
- [Node.js](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

## Cloning the Starter

?> **Note** You can also use our VSCode Extension, PWA Studio, to generate a starter project. Go [here](#/studio/quick-start) for more info.

To use the starter:

1. Visit the [PWA Starter repository.](https://github.com/pwa-builder/pwa-starter)

2. Click the green `Use this template` button.

3.  Provide a repository name and other options you wish to include.

4. Click `Create repository from template`.

5. You will be redirected to your new repository!

Next, you just need to clone the repository to start developing. If you need help, check out these [docs.](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)

## Deploying Locally

To run your progressive web app locally:

1. Open a terminal of your choice at the root of your PWA Starter repo.

2. Install dependencies with `npm`:

```
npm install
```

3. After your packages are installed, deploy your PWA locally with this command:

```
npm start
```

4. Check the terminal for the proper URL to find your PWA, it should take the form of `localhost:<PORT NUMBER>`.

Go to that URL to view and test your PWA locally.

## Technologies Used

The PWA Starter uses only a handful of libraries in order to remain lightweight and performant, but also while remaining easy and efficient to develop on. 


#### Lit
Lit is the library that we use to build our custom web components for the Starter. Lit adds some simple boilerplate that makes it easy to build standardized web components. 
If you're new to web components, check out this [resource.](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

All of our pages are components themselves, and are built using Lit. 

Learn more about Lit [here.](https://lit.dev/)

#### Fluent Web Components
In addition to custom components built with Lit, the Starter also makes use of prebuilt UI components.

The starter uses [Fluent Web Components](https://docs.microsoft.com/en-us/fluent-ui/web-components/) for its user interface.

#### Vite
The Starter uses Vite as part of its build process. 

Vite handles our code bundling and development server, and exposes PWA-specific functionality through the VitePWA plugin.

Learn more [here.](https://vitejs.dev/)

#### Vaadin Router
For routing, the Starter uses Vaadin Router, a lightweight client-side router that works easily with web components.

Learn more [here.](https://vaadin.github.io/router/vaadin-router/demo/#vaadin-router-getting-started-demos)


## Navigating the Starter

If you need help navigating the file structure of the starter, here's a breakdown of the initial directory structure.

| Path | Description  |
| :-----|-----|
| **src/script/components/** | Our UI components live here. The template starts with just one: `header.ts`. |
| **src/script/pages/** | Our page components live here. The template starts with an `app-home` page and an `app-about` page |
| **public** | The bundled and minified version of your app. This is the directory that would be published to your web server / hosting service |
| **public/manifest.json** | The Web Manifest for your app.|
| **public/assets/** | The assets for your app such as icons and other media.  |
| **index.html** | The index file for your app. This is just like a normal index.html file. |
| **package.json** | This is where you specify the dependencies for your app. |
| **tsconfig.json** | This is where you specify the TypeScript settings for your app. |
| **vite.config.ts** | This is where you specify the [Vite](https://vitejs.dev/) settings for your app. |
| **registerSW.js** | This file is used by the build system to register your Service Worker.|