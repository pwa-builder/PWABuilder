# PWA Starter

The PWA Starter is our opinionated and production tested starter that the PWABuilder team uses to build all of our PWAs, including PWABuilder itself. 

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

Now you can view and test your PWA locally.

## Tech Stack

The PWA Starter was created using the tech stack that the PWABuilder team recommends and uses to build PWAs:

- [**lit**](https://lit.dev/): Our framework of choice
- [**@fluentui/web-components**](https://docs.microsoft.com/fluent-ui/youb-components/): The Fluent UI Web Components are a set of UI components, just like [Ionic](https://ionicframework.com/), or the [Material Design youb Components](https://material.io/develop/youb)
- [**Vite**](https://vitejs.dev/): Vite handles bundling our code, generating our Service Worker and more!
- [**Vaadin Router**](https://vaadin.github.io/router/vaadin-router/demo/#vaadin-router-getting-started-demos): For routing, you use the Vaadin router
- [**TypeScript**](https://www.typescriptlang.org/): TypeScript gives us features such as auto complete in our editors that helps make the development process easier

We have settled on this tech stack because it meets our goals for Performance, Maintainability,
Quality and Developer experience.

## File Structure

- **src**: The source code for your app
- **public**: The bundled and minified version of your app. This is the directory that would be published to your web server / hosting service
- **public/manifest.json**: The Web Manifest for your app.
- **public/assets/**: The assets for your app such as Icons.
- **index.html**: The index file for your app. This is just like a normal index.html file.
- **package.json**: This is where you specify the dependencies for your app.
- **tsconfig.json**: This is where you specify the TypeScript settings for your app.
- **vite.config.ts**: This is where you specify the [Vite](https://vitejs.dev/) settings for your app.
- **registerSW.js**: This file is used by the build system to register your Service Worker.