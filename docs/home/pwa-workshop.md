# Progressive Web App Workshop

This is an in-depth introduction to PWA development using the PWABuilder toolchain. This workshop is hands on and may take 1 to 1.5 hours to complete. If you are new to Progressive Web Apps, take a look at the [*Beginner's Guide to Progressive Web Apps*](/home/pwa-intro) before starting here.

The workshop will walk you through turning the PWA Starter template into a simple web app, deploying the app, and then adding some basic PWA functionality to the app.

The source code and solutions for this workshop are available on [GitHub](https://github.com/pwa-builder/pwa-journal-workshop). The solutions are broken into three sections for various checkpoints in the workshop.

### Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript.
- A modern web browser like [Microsoft Edge](https://aka.ms/learn-pwa/workshop/edge). PWAs are supported on most modern browsers but to facilitate this workshop we will be using [Microsoft Edge](https://aka.ms/learn-pwa/workshop/edge).
- A code editor such as [Visual Studio Code](https://aka.ms/learn-pwa/workshop/vscode).
- An [Azure account](https://aka.ms/learn-pwa/workshop/azure.microsoft.com/free/students/) if you want to deploy your app to a secure endpoint.
- [Git](https://git-scm.com/downloads) to clone sample solutions.
- [Node.js](https://nodejs.org/en/) to run the sample solutions.
- A [Microsoft account](https://aka.ms/learn-pwa/workshop/outlook.live.com/owa) that you can register as a developer account to publish your app to the Microsoft Store. You will need to pay $19 for account services to publish your app to the Microsoft Store. Note that if you have Visual Studio Enterprise subscription, you get a promo code to publish your apps for free.

### Workshop Outline

[**Step 0 - Setting Up:**](/home/pwa-workshop?id=_0%ef%b8%8f%e2%83%a3-setting-up) Set up your environment for development and download the tools you'll need.

[**Step 1 - Create a New PWA:**](/home/pwa-workshop?id=_1%ef%b8%8f%e2%83%a3-create-a-new-pwa) Learn how to use PWABuilder Studio to create a new PWA with a development-ready template.

[**Step 2 - Add Content:**](/home/pwa-workshop?id=_2%ef%b8%8f%e2%83%a3-add-content) Turn the PWA Starter template into a journaling app.

[**Step 3 - Deploy Your PWA:**](/home/pwa-workshop?id=_3%ef%b8%8f%e2%83%a3-deploy-your-pwa) Deploy your PWA to Azure.

[**Step 4 - Edit Your Manifest:**](/home/pwa-workshop?id=_4%ef%b8%8f%e2%83%a3-working-with-manifests) Take a look at and edit the PWA Starter's default web manifest.

[**Step 5 - Learn about Service Workers:**](/home/pwa-workshop?id=_5%ef%b8%8f%e2%83%a3-service-workers) Learn about the lifecycle of service workers and how they can enable offline capabilities.

[**Step 6 - Enable Push Notifications:**](/home/pwa-workshop?id=_6%ef%b8%8f%e2%83%a3-enable-push-notifications) Add a web capability to your PWA by enabling push notifications.

[**Step 7 - Package Your PWA:**](/home/pwa-workshop?id=_7%ef%b8%8f%e2%83%a3-package-your-pwa) See how to package your finalized PWA for app stores.


## 0️⃣ Setting Up

First things first, let's get your development environment ready. You will be installing the tools needed to build the Progressive Web App. And you will create a repository to keep track our coding progress.

### Install tools

Make sure you go to the following resources to install the tools you need:
- [Microsoft Edge](https://aka.ms/learn-pwa/workshop/edge)
- [Visual Studio Code](https://aka.ms/learn-pwa/workshop/vscode)
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/)
- [Azure account](https://aka.ms/learn-pwa/workshop/azure.microsoft.com/free/students/)

### Create a repository

1. If you don't have a GitHub account, go ahead and [join GitHub](https://aka.ms/learn-pwa/workshop/github.com/join). Then, [create a new public repository](https://aka.ms/learn-pwa/workshop/github.com/new) named **repose**. If you've never made a GitHub repository before, check out the [documentation](https://aka.ms/learn-pwa/workshop/docs.github.com/get-started/quickstart/create-a-repo) for more information. Make sure to select **Public** and to initialize the repository **without** a **README**.

2. You will push the directory created in the next step to this repository.

## 1️⃣ Create A New PWA

In this step, we will first talk about what is a PWA, and then we will create a new PWA using PWABuilder Studio.

### What is a PWA?

A [Progressive Web App (PWA)](/home/pwa-intro) is a traditional web app that is progressively enhanced using open web technologies, to make sure it delivers the best possible experience on every device, based on available capabilities.

Progressive Web Apps use [service workers](/home/sw-intro), [manifests](https://aka.ms/learn-pwa/workshop/docs.microsoft.com/microsoft-edge/progressive-web-apps-chromium/how-to/web-app-manifests), and other web platform features in combination with [progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) to give users an experience on par with platform-specific (Windows, Android, etc.) apps.

You can learn more about PWAs in the [Beginner's Guide to Progressive Web Apps](/home/pwa-intro).

### Create a PWA using PWABuilder Studio

There are many ways to create a new web app. However, if you are designing your web app with progressive enhancement and platform-specific features in mind, you should consider using a template with ready-to-go configurations that can help you quickly get started. Enter [PWABuilder Studio](/studio/quick-start) VSCode Extension!

Let's install the extension and follow these [steps](/studio/quick-start) to create a new PWA.

1. Tap on the PWABuilder Studio icon on the left side of the VSCode Window

1. Click the Start new PWA button on the bottom bar of VSCode.

1. Enter the repository name "repose" and hit enter.

1. Your PWA will open in its own Window, with all the dependencies installed and ready to start coding.

<div class="docs-image">
   <img src="/assets/home/workshop/1-command-bar-startnew.png" alt="">
</div>

### Exploring the generated solution

Before you start coding, let's explore the generated solution. The PWABuilder Studio extension was created based on the PWABuilder [pwa-starter](https://aka.ms/learn-pwa/workshop/github.com/pwa-builder/pwa-starter) project. It uses the following tech stack:

- [**lit**](https://lit.dev/): PWABuilder team's framework of choice. This means you will also be using lit as a web component framework to build your PWA.
- [**Shoelace Components**](https://shoelace.style/): Shoelace Components is a set of UI web components, like [Ionic](https://ionicframework.com/), or the [Material Design Web Components](https://material.io/develop/web). This provides a set of modern UI components that are ready to use and can be easily customized.
- [**Vite**](https://vitejs.dev/): Vite handles bundling the code, generating the Service Worker and more! We will dig a little deeper into this later when we talk about the Service Worker and cache strategy.
- [**The Passle Router**](https://github.com/thepassle/app-tools/tree/master/router#readme): For routing, the Starter uses the `@thepassle/app-tools` router, a lightweight client-side router that works easily with web components.
- [**TypeScript**](https://aka.ms/learn-pwa/workshop/www.typescriptlang.org/): TypeScript gives you features such as auto complete in your code editor that helps make the development process easier and faster.

Next, let's look at the file structure of the generated solution.

| files/folders | description |
| ------------- | ----------- |
| `public` | This folder contains all the files that are served to the browser such as your app icons, screenshots, and other creative assets. |
| `index.html` | This is the main HTML file that is served to the browser and the entry point of your source code. |
| `public/manifest.json` | This is the manifest file that is used to configure your PWA. |
| `src` | This folder contains all the source code for your app. |
| `src/app-index.ts` | This file is the main entry point for your app code. You can find your service worker registration here as well. |
| `src/router.ts` | This file contains the configuration for our router. |
| `src/components` | This folder contains reusable components of your app. |
| `src/pages` | This folder contains different pages of your app. Each page owns their css styles in the default setup. |
| `src/styles` | This folder contains css stylesheets. |
| [`package.json`](https://nodejs.org/en/knowledge/getting-started/npm/what-is-the-file-package-json/) | This is the file that holds metadata relevant to your project and it is used for managing dependencies, scripts, versions, and more. |
| `tsconfig.json` | This is the configuration file for TypeScript. |
| `vite.config.ts` | This is the `vite` config file that knows how to build and bundle the code. It contains `workbox` config which controls how caching is handled.  |

### Run the generated PWA

To run the solution, simply type the following command in the terminal of VSCode or your terminal of choice:

```bash
npm run dev
```

### Push the solution to GitHub

Remember that Git repository you created in the last step? Let's now push our solution to it using the following command from your project directory:

```bash
git remote add origin https://github.com/<your_git_username>/<your_repo_name | repose.git>
git branch -M main
git push -u origin main
```

You can double check your project push/pull remote configuration by using the following command:

```bash
git remote -v
```

## 2️⃣ Add Content

In this step, we will update the source files of the generated solution to add core functionalities such as mood tracking and journaling. 

?> **Note** The goal of this workshop is NOT to teach web development. You can skip this step if you want to go straight to learning about progressive web app functionalities. The completed journaling app is available on GitHub  at [`solutions/01-journaling-app`](https://github.com/pwa-builder/pwa-journal-workshop/tree/main/solutions/01-journaling-app).

Make sure you have the solution running with this command `npm run dev`. So that as you save your changes, you can see them reflected in the browser. You can always stop the server by pressing the `ctrl + c` key combination.

### What you will do and next steps

Let's quickly look at what you need to do in this step:
- You will update `index.html` file to include title and metadata for Repose app.
- You will completely redesign the homepage including some custom CSS styles and creatives as background images.
- You will create reusable components such as `hero-decor` that renders as the hero section background. They are used in multiple pages like `app-index.ts` and `app-journal.ts`. You can also use it in other pages as you create them.
- You will update the existing `header` component to `menu` component.
- You will create new pages called `app-journal.ts` and `app-form.ts` that include journaling functionality.
- You will add assets and utility files as needed.

Something to consider for the next steps if you are building a production ready app: Instead of using `localforage`, which stores journal entries in indexDB of your local browser's storage, you should consider using a more persistent storage solution.

## 3️⃣ Deploy Your PWA

In this step, we will deploy our PWA to an HTTPS endpoint.

### What are the building blocks of a PWA?

Let's first talk about the three core building blocks for PWA development:

**[HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/https)** - makes your PWA secure. We will describe how to deploy our PWA to an HTTPS endpoint in this step.

**[Web App Manifest](https://aka.ms/learn-pwa/workshop/docs.microsoft.com/microsoft-edge/progressive-web-apps-chromium/how-to/web-app-manifests)** - makes your PWA installable. We will describe how to add a web app manifest to the PWA in [step 4](/home/pwa-workshop#working-with-manifests).

**[Service Workers](https://aka.ms/learn-pwa/workshop/docs.microsoft.com/microsoft-edge/progressive-web-apps-chromium/how-to/service-workers)** - makes your PWA reliable and network-independent. We will describe how to register a service worker for the PWA in [step 5](/home/pwa-workshop#service-workers).

### HTTPS options

1. Use a hosting service that supports HTTPS by default. Cloud Providers like [Azure](https://aka.ms/learn-pwa/workshop/azure.microsoft.com) offer options like [Azure App Service](https://aka.ms/learn-pwa/workshop/azure.microsoft.com/services/app-service/web) that can help. You will deploy Repose to an [Azure Static Web App](https://aka.ms/learn-pwa/workshop/azure.microsoft.com/services/app-service/static) in this step.

2. Use your own hosting provider and create the required certificates using free services like [Let’s Encrypt](https://letsencrypt.org/docs/).

**Note:** that browsers, such as Microsoft Edge, will let you use http://localhost (non-HTTPS) to preview and test your PWA locally - for debugging purposes only.

### Deploying to an Azure Static Web App

1. Build the distributable package by running this command `npm run build`. This will create a `dist` directory with all necessary files.

2. The Starter comes with a deploy script that will trigger the static web app CLI. Run this command: `npm run deploy`.

3. Log in to your Azure account when prompted.

4. Ensure you use the default settings for your app, which can be found in the swa-cli.config.json file in the root of your app.

5. Once the deployment is complete, you will see a URL to your deployed app. Open the URL in a new browser tab and you should see your deployed Repose app!

## 4️⃣ Working With Manifests

In this step, we will modify the `manifest.json` file in the `public` folder to make our PWA installable.

### What should the web app manifest look like?

```json
  {
  "id": "/",
  "scope": "/",
  "lang": "en-us",
  "name": "Repose intelligent daily mood journal",
  "display": "standalone",
  "start_url": "/",
  "short_name": "Repose",
  "theme_color": "#B6E2D3",
  "description": "Repose is a mental health journal app that serves as your personal mood tracking companion and helps you organize and reflect upon your daily thoughts.",
  "orientation": "any",
  "background_color": "#FAE8E0",
  "dir": "ltr",
  "related_applications": [],
  "prefer_related_applications": false,
  "display_override": ["window-controls-overlay"],
  "icons": [
    {
      "src": "assets/icons/512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "assets/icons/192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/48x48.png",
      "sizes": "48x48",
      "type": "image/png"
    },
    {
      "src": "assets/icons/24x24.png",
      "sizes": "24x24",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "assets/screenshots/screen.png",
      "sizes": "1617x1012",
      "type": "image/png"
    }
  ],
  "features": [
    "Cross Platform",
    "fast",
    "simple"
  ],
  "categories": [
    "social"
  ],
  "shortcuts": [
    {
      "name": "New Journal",
      "short_name": "Journal",
      "description": "Write a new journal",
      "url": "/form",
      "icons": [{ "src": "assets/icons/icon_192.png", "sizes": "192x192" }]
    }
  ],
  "widgets": [
    {
      "name": "Starter Widget",
      "tag": "starterWidget",
      "ms_ac_template": "widget/ac.json",
      "data": "widget/data.json",
      "description": "A simple widget example from pwa-starter.",
      "screenshots": [
        {
          "src": "assets/screenshots/widget-screen.png",
          "sizes": "500x500",
          "label": "Widget screenshot"
        }
      ],
      "icons": [
        {
          "src": "assets/icons/48x48.png",
          "sizes": "48x48"
        }
      ]
    }
  ]
}
```

### How does everything work together?

#### Members

A PWA can be customized by using manifest members like in the previous example. A minimum manifest file should contain the following:

```json
{
    "name": "My Sample PWA",
    "lang": "en-US",
    "start_url": "/"
}
```

To read more about the members of a manifest file. You can refer to [MDN docs](https://developer.mozilla.org/docs/Web/Manifest#members).

#### Deploying the manifest

Web app manifests are deployed in HTML pages using a `<link>` element in the `<head>` of a document. This was taken care of during the PWA generation process by PWABuilder Studio so that you don't have to manually add it. You can find this `<link rel="manifest" href="/manifest.json" />` element in `index.html` file.

#### See it in action

After saving the manifest file and deploying it to your Azure static web app, you should see this button in the browser's address bar:

<div class="docs-image">
   <img src="assets/home/workshop/4-install.png" alt="Install Repose PWA">
</div>

## 5️⃣ Service Workers

In this step, we will take a look at how service worker is registered. Note that you don't need to make any code changes in this step. Make sure you open the [`vite.config.ts` file](https://github.com/pwa-builder/pwa-journal-workshop/tree/main/solution/03-repose-PWA/vite.config.ts) as we walk through the configurations.

### What is a service worker?

[Service Workers](/home/sw-intro) are a special type of Web Worker with the ability to intercept, modify, and respond to all network requests using the `Fetch API`. Service Workers can access the `Cache API`, and asynchronous client-side data stores, such as `IndexedDB`, to store resources.

### How do service workers work?

From a development perspective, you need to know two concepts:

**[Service Worker Registration:](/home/sw-intro)**

Like all Web Workers, the Service Worker must be authored in its own file. The location of that file (relative to the root of the app) defines the scope of its authority. Service Workers can only intercept or manage requests to pages within their scope. Placing the file at the root of your app ensures your service worker will manage all pages within it.

**[Service Worker Lifecycle:](/home/sw-intro#example-worker)**

1. Registration: The browser registers the service worker, kicking off the Service Worker lifecycle.

2. Installation: The browser triggers `install` as the first event to the Service Worker. It can use this for pre-caching resources (e.g., populate cache with long-lived resources like logos or offline pages).

3. Activation: The browser sends the `activate` event to indicate that the service worker has been installed. This service worker can now do clean up actions (e.g., remove old caches from prior version) and ready itself to handle functional events. If there is an old service worker in play, you can use `self.clients.claim()` to immediately replace the old service worker with your new one.

### How is service worker registered in PWABuilder Studio generated projects?

Good news! With PWABuilder Studio, you don't need to create or register a service worker. The service worker is automatically created and registered for you based on the configuration you provide in the `vite.config.ts` file. PWABuilder Studio utilizes [`vite-plugin-pwa` to setup `workbox`](https://vite-plugin-pwa.netlify.app/workbox/) with [a few lines of code](https://github.com/pwa-builder/pwa-journal-workshop/tree/main/solution/03-repose-PWA/vite.config.ts).

**Default PWABuilder Studio VitePWA plugin config:**

| property | value | description |
| --- | --- | --- |
| `registerType` | `autoUpdate` | when new content is available, the new service worker will update caches and reload all browser windows/tabs with the application open automatically, it must take the control for the application to work properly. |
| `manifest` | `false` |  Whether to add the `crossorigin="use-credentials"` attribute to `<link rel="manifest">` |
| `workbox` | *based on mode* | [`generateSW` config options](https://developer.chrome.com/docs/workbox/modules/workbox-build/#generatesw-mode); [`injectManifest` config options](https://developer.chrome.com/docs/workbox/modules/workbox-build/#injectmanifest-mode)|

Behind the scenes, `vite-plugin-pwa` is using [workbox-build](https://developer.chrome.com/docs/workbox/reference/workbox-build/) module to build the service worker. By default, it chooses the `generateSW` strategy which invokes the workbox `generateSW` mode. You will find this mode most useful when you want to 1) pre-cache files and 2) have simple runtime caching needs. The other mode is `injectManifest` which is useful when you want more control over your service worker, for instance, when you want to use other features like `WebPush`. You can read more on how to choose the mode in the [workbox-build docs](https://developer.chrome.com/docs/workbox/modules/workbox-build/#which-mode-to-use). Let's will keep the default `generateSW` mode for now. This is achieved through the default `VitePWA` configuration `strategies: 'generateSW'`. But you will switch to `injectManifest` mode in the [next step](6-notifications.md) when you enable notification feature.

### What is `CacheFirst` strategy?

There are a handful of `handler` options you can pass into `runtimeCaching` as part of `VitePWA` configuration. The `CacheFirst` strategy is one of them. PWABuilder Studio uses this strategy by default and it enables offline support. The `CacheFirst` strategy is an implementation of a [cache-first](https://developer.chrome.com/docs/workbox/caching-strategies-overview/#cache-first-falling-back-to-network) request strategy. It is useful for assets that have been revisioned, such as URLs like `/styles/example.a8f5f1.css`, since they can be cached for long periods of time.

For matching requests, the process goes like this:

1. The request hits the cache. If the asset is in the cache, serve it from there.

2. If the request is not in the cache, go to the network.

3. Once the network request finishes, add it to the cache, then return the response from the network.

### Where can I see the service worker code?

You can see the minified version of service worker code in the `dist` and `dev-dist` directory.

To get a closer look at the full file, head over to Source tab in your browser. Expand folder `@vite-plugin-pwa` and you will see `virtual:pwa-register` that contains some of the lifecycle events we talked about in the previous section.

## 6️⃣ Enable Push Notifications

In this step, we will talk about how to add advanced capabilities such as notifications to our PWA.

### Update `workbox-build` module

You will need to update the [`vite.config.ts` file](https://github.com/pwa-builder/pwa-journal-workshop/blob/main/solutions/03-add-notifications/vite.config.ts) to utilize `injectManifest` strategy.

This time, the `vite-plugin-pwa` plugin will first build the custom service worker via `rollup` and then, with previous build result will call to workbox `injectManifest` method. It allows you to create you own [service worker file](https://github.com/pwa-builder/pwa-journal-workshop/blob/main/solutions/03-add-notifications/public/sw.js). So let's create a new `sw.js` file in the project's `./public/` folder. Update both `sw.js` and `vite.config.ts` files to have the same code as shown in solution [03-add-notifications](https://github.com/pwa-builder/pwa-journal-workshop/tree/main/solutions/03-add-notifications).

### Display notifications in action center

PWAs can display notifications by using the [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API). You will create a [notification component](https://github.com/pwa-builder/pwa-journal-workshop/blob/main/solutions/03-add-notifications/src/script/components/notification.ts) in Repose app to enable this feature.

#### Request permission to display notifications

You will first need to check if Notifications API is supported and request a user's permission to display notifications. You can do this by adding the following code to notification component:

```typescript
  private requestNotificationPermission() {
    if ("Notification" in window) {
      console.log("Notifications API is supported");

      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    } else {
      console.log("Notifications API is not supported");
    }
  }
```

#### Display a notification

Once you know that the API is supported and the user has accepted notifications, you can display a notification by creating a Notification object. Here is a function that will display a notification to remind the user to drink some water:

```typescript
  private displayNotification() {
    const notifTitle = "Hi";
    const notifBody = "It's time to drink some water 💦";
    const notifImg = `assets/media/toast.jpg`;
    const options = {
      body: notifBody,
      icon: notifImg,
    };
    new Notification(notifTitle, options);
  }
```

Make sure you add the image to `./public/assets/` folder. And take a look at the sample code in the solution [03-notifications](https://github.com/pwa-builder/pwa-journal-workshop/tree/main/solutions/03-add-notifications) to add notification component to the Repose app.

## 7️⃣ Package Your PWA

In this step, we will audit the PWA to make sure it is installable and ready for publishing. We will also package the PWA to make it ready for distribution to app stores.

### Audit with PWABuilder Studio

You can do this directly in VSCode with the PWABuilder Studio extension. Navigate to the extension pane and checkout each section - web manifest, service worker, and store ready checklist. It looks like this:

<div class="docs-image">
   <img src="assets/home/workshop/7-checklist.png" alt="PWABuilder Studio checklist">
</div>

You can also perform the audit through other tools such as [PWABuilder](https://aka.ms/learn-pwa/workshop/30days-3.5?id=audit-with-pwabuilder) and [Lighthouse in Edge dev tools](https://aka.ms/learn-pwa/workshop/30days-3.5?id=audit-performance-with-lighthouse-and-devtools).

### Packaging

There are a couple of ways to package your PWAs. You can follow the steps below to package with PWABuilder Studio extension:

1. First, associate your PWA with a URL. Hit `ctrl-shift-P` in VS Code. Search for `PWABuilder: Set App URL`. Select `Yes` and provide the URL of the Azure Static Web App you deployed in step 3.

2. Hit `ctrl-shift-P` in VS Code again. Search for `PWABuilder: Package your PWA`. Select the platform you would like to package your PWA for and follow the prompts. Congratulations, your PWA package will be generated!

You can also package your PWA via [pwabuilder.com](https://aka.ms/learn-pwa/workshop/pwabuilder.com) site. Here are the [steps of packaging from PWABuilder docs](/builder/windows#packaging).

### Submit your app to the Microsoft Store

Let's use Microsoft Store as an example and see how you can submit your app!

#### Register with Windows Dev Center

1. Head over to [Windows Dev Center](https://aka.ms/learn-pwa/workshop/developer.microsoft.com/windows) and click Register. You will be taken to the [store registration page](https://aka.ms/learn-pwa/workshop/developer.microsoft.com/microsoft-store/register). Click the SIGN UP button.

<div class="docs-image">
   <img src="assets/home/workshop/7-win-dev-center.png" alt="Windows dev center">
</div>

<div class="docs-image">
   <img src="assets/home/workshop/7-store-register.png" alt="Register as Windows developer">
</div>

2. You will now be redirected to a login page. Login with your Microsoft account (@hotmail, @outlook, etc.). If you don't have a Microsoft account, you can create one from [here](https://aka.ms/learn-pwa/workshop/outlook.live.com/owa).

3. Once you are logged in, you should be redirected to Microsoft Partner Center site on Registration - Account Info page. Follow the setup steps to create your account. Select 'Individual' as account type if you plan to submit apps as yourself.

<div class="docs-image">
   <img src="assets/home/workshop/7-partner-center-registration.png" alt="Partner Center registration page">
</div>

4. After you finish your input on basic information, you will land on the Registration - Payment page. If you are registered as a student ambassador, you should have access to Visual Studio Enterprise subscription. This provides a promo code so you can save $19 in the registration process. To do this, head over to [Visual Studio subscriptions page](https://aka.ms/learn-pwa/workshop/my.visualstudio.com/Benefits) and log in with the account with the Visual Studio Enterprise subscription benefit. Browse the page to find Windows Developer Account benefit and click View Code button. Copy the code in the format of XXXXX-XXXXX-XXXXX-XXXXX-XXXXX.

<div class="docs-image">
   <img src="assets/home/workshop/7-vs-benefits.png" alt="Visual Studio benefits">
</div>

5. Input the promo code copied from last step or pay with your preferred method on the Registration - Payment page of Microsoft Partner Center site.

<div class="docs-image">
   <img src="assets/home/workshop/7-partner-center-payment.png" alt="Partner Center payment page">
</div>

6. Now review your account information, accept the terms and conditions of the App Developer Agreement, and click Finish button on the Registration - Review page.

#### Reserve your app

1. After you registered with Partner Center, head over to your [dashboard](https://aka.ms/learn-pwa/workshop/partner.microsoft.com/dashboard/home).

1. Navigate to `Apps and Games`. Depends on your visit history of the page, either click `Create a new app` button or click `+ New Product` button and select `App`.

1. Provide the name of your app. **Make sure this name is the same you listed in your manifest. When it comes time to upload your app bundles, it will check if the bundle matches the name of the registered app.**

1. Once the name is reserved, you will be able to access your package information via `Product Identity` tab. Record `Package ID`, `Publisher ID`, and `Publisher Display Name` as these will be required either you are packaging through PWABuilder Studio or PWABuilder site.

#### Submit to the Store

1. Head back to your [dashboard](https://aka.ms/learn-pwa/workshop/partner.microsoft.com/dashboard/home) in Partner Center and select the listing you created from the list.

1. Click `Start your submission` and select the `Packages` section. Drag and drop the packages generated. Click `Save`.

1. Fill in the rest of your app submission sections to finish submitting to the store. Note that it will take up to 48 hours for the review process to complete.


### Conclusion

Congratulations! You have finished this workshop from generating a PWA to submitting it to the Microsoft Store. You can continue to grow your PWA skills by exploring the resources such as [30 Days of PWA](https://aka.ms/learn-pwa/30days-blog) or [Microsoft Edge docs on PWA](https://aka.ms/learn-pwa/workshop/docs.microsoft.com/microsoft-edge/progressive-web-apps-chromium).
