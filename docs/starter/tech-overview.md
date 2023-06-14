# Technology Overview

The PWA Starter is designed to keep dependencies minimal and to keep the structure of the project easy to navigate and develop on. This article will take you through what dependencies the Starter uses and how to navigate the directory structure of the template.

## Dependency Overview

The starter uses a few lightweight libraries ease the development of your progressive web app. 

A breakdown of those dependencies:

### Core Dependencies

#### Lit

Lit is the library that we use to build our custom web components for the Starter. Lit adds some simple boilerplate that makes it easy to build standardized web components. 
If you're new to web components, check out this [resource.](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

All of our pages are components themselves, and are built using Lit. 

Learn more about Lit [here.](https://lit.dev/)

#### Shoelace

In addition to custom components built with Lit, the Starter also makes use of prebuilt UI components.

The starter uses [Shoelace](https://shoelace.style/) for its user interface.

#### @thepassle/app-tools router

For routing, the Starter uses the `@thepassle/app-tools` router, a lightweight client-side router that works easily with web components.

Learn more [here.](https://github.com/thepassle/app-tools/tree/master/router#readme)

### Development Dependencies

#### Vite
The Starter uses Vite as part of its build process. 

Vite handles our code bundling and development server, and exposes PWA-specific functionality through the VitePWA plugin.

Learn more [here.](https://vitejs.dev/)

#### Azure Static Web Apps CLI
The Starter uses the Azure Static Web Apps CLI to enable you to deploy your PWA to Azure, along with local performance testing etc.

Learn more [here.](https://azure.github.io/static-web-apps-cli/)


## Project Structure

The PWA Starter has a simple directory structure to separate different pieces of your progressive web app, giving a good starting point for organizing your development. Each file and directory included in the Starter is as follows:

| Path | Description  |
| :-----|-----|
| **src/components/** | Our UI components live here. The template starts with just one: `header.ts`. |
| **src/pages/** | Our page components live here. The template starts with an `app-home` page and an `app-about` page |
| **public** | Your apps Static assets, such as images, fonts etc |
| **public/manifest.json** | The Web Manifest for your app.|
| **public/assets/** | The assets for your app such as icons and other media.  |
| **index.html** | The index file for your app. This is just like a normal index.html file. |
| **package.json** | This is where you specify the dependencies for your app. |
| **tsconfig.json** | This is where you specify the TypeScript settings for your app. |
| **vite.config.ts** | This is where you specify the [Vite](https://vitejs.dev/) settings for your app. |
| **registerSW.js** | This file is used by the build system to register your Service Worker.|
| **dist** | The bundled and minified version of your app. This is the directory that would be published to your web server / hosting service |

## Alternate UI Options

The PWA Starter uses the [Shoelace](https://shoelace.style/) library for UI components by default. You can think of this as similar to Fluent Components or Material Components from Google. Shoelace provides a set of components, such as buttons, modals, alerts, progress bars etc, that make it easier and quicker to develop your PWA. 

However, you do not have to use Shoelace with the Starter, any Web Components based UI libraries will work great with our Web Components based setup. Let's go through some of the popular ones and how to integrate them into the starter.

* Note: This documentation assumes you have `npm` and `node` installed. If you are not familar with these tools, check the [Node documentation](https://nodejs.org/en/).


#### Fluent Web Components

To use the [Fluent UI Web Components](https://github.com/microsoft/fluentui/tree/master/packages/web-components) we need to:

- Install the Components by running `npm install @fluentui/web-components` 
- Now, instead of importing components from Shoelace, you can change the imports to use the Fluent Web Components.    For example, to use the FluentAnchor component, you would put this import `import { FluentAnchor } from '@fluentui/web-components';` at the top of your component file.
- For a list of all the Fluent Web Components, check [here](https://docs.microsoft.com/en-us/fluent-ui/web-components/components/overview) in their documentation.

You will notice that this pattern is going to be very similar for the below libraries.

#### Vaadin Web Components
To use the [Vaadin Web Components](https://github.com/vaadin/web-components) we need to:

- Vaadin ships each of their components seperately to NPM. Because of this, we need to install each component we want to use. For example, want to use the `vaadin-grid` component? Run `npm install @vaadin/vaadin-grid`.
- We can then import that component, just as we do with Shoelace components, by adding `import '@vaadin/grid/vaadin-grid.js';` to the top of our file.
- For the full list of Vaadin Web Components, check [here](https://github.com/vaadin/web-components#core-components).

#### Spectrum Web Components
To use the [Spectrum Web Components](https://opensource.adobe.com/spectrum-web-components/getting-started/) we need to: 

- As with Vaadin, the Spectrum components need to be installed seperately. For example, want to use the `sp-accordion` component? Run `npm install @spectrum-web-components/accordion`.
- We can then import that component, just as we do with Shoelace components, by adding `import '@spectrum-web-components/accordion/sp-accordion.js';` to the top of our file.
- For the full list of Spectrum Web Components, check [here](https://github.com/vaadin/web-components#core-components).
