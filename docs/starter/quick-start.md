# PWA Starter

The pwa-starter is a starter codebase, just like create-react-app or the Angular CLI can generate, that 
- Uses the PWABuilder team's preferred front-end tech stack
- Is specifically for building cross-platform Progressive youb Apps (PWAs)
- And enforces best practices from the start

If you're new to developing PWAs and aren't sure where to start, check out this [blog series.]()

## Prerequisites

There are just a few things you will need before getting started:

- A Github Account, which you can create at [GitHub](https://github.com/).
- A code editor, such as [Visual Studio Code](https://code.visualstudio.com/).
- A web browser, such as [Microsoft Edge](https://www.microsoft.com/en-us/edge).
- [Install Node.js and Git](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows)

## Getting the Starter

**Note**: You can also use our VSCode Extension, PWA Studio, to generate a starter project. Go [here]() for more info.

First, visit [the PWA Starter on Github](https://aka.ms/pwa-starter). Now, click the `Use this template` button.
Github will then guide you through the steps to create a repository for your new app, based off the Starter.

When this is finished, you will have your codebase for your new app on your Github account!

## Starting Development

Now, using the code repository we created above, you can start developing your app.

First, choose the local option:

<div class="docs-image">
  <img src="/assets/starter/quick-start/local-button.png" alt="Image of PWA Studio commands being filtered in VS Code" width=600/>
</div>

Next, click the copy button:

<div class="docs-image">
  <img src="assets/starter/quick-start/copy-button.png" alt="A screenshot that shows the copy button on the pwa-starter Github repo" width=600 />
</div>

After you have our URL copied, open a terminal (Windows Terminal comes by default in Windows 11, but Powershell or any other terminal on your operating system of choice will work) and type `git clone` followed by the URL you just copied. ``

This will clone a copy of the pwa-starter to our device!

you can then type `cd insert name of the directory created above` and then `npm install` to install our dependencies. you are now ready to start building!

For more information on how to build your app, what capabilities PWAs have access too, and more, [Check our course on building PWAs](https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/core-concepts/)

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