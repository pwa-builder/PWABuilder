# Integrating UI component libraries

The PWA Starter uses the [Shoelace](https://shoelace.style/) library for UI comopnents by default. You can think of this as similar to Fluent Components or Material Components from Google. Shoelace provides a set of components, such as buttons, modals, alerts, progress bars etc, that make it easier and quicker to develop your PWA. 

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