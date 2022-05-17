# Adding Content

The PWA Starter is a [Single-Page Application](https://developer.mozilla.org/en-US/docs/Glossary/SPA) and uses a client-side router to navigate between pages. The starter uses [Vaadin Router](https://vaadin.github.io/router/vaadin-router/demo/#vaadin-router-getting-started-demos), which is a simple, declarative router that allows you to define a route, such as `/about`, and it's corresponding web-component. 

The starter makes use of both pre-built ([Fluent Components]()) and custom web components ([Lit]()) to define both entire pages, and the smaller, functional components that make up those pages.

If you've never used web components before and want to learn more, check out this [primer](https://www.fast.design/docs/resources/why-web-components) on what they can bring to your web project.

## Routing
The PWA Starter uses *client-side routing* to navigate between pages, which allows for navigating without reloading our refreshing the view.

As far as progressive web apps are concerned, this allows for an unbroken user experienced that is more consistent with expectations for native applications.

In the case of the PWA Starter, each page is it's own custom web component, and they are mapped to URLs using [Vaadin Router](https://vaadin.github.io/router/vaadin-router/demo/#vaadin-router-getting-started-demos).

#### Setting Routes

All of the routing logic for the PWA Starter can be found in `src/app-index.ts`, which is our root index component that we include in our normal `index.html` file.

Let's take a look at this block of code within `firstUpdated()` function contained in `app-index.ts`, where we use the `setRoutes()` function to define our PWA's navigation:

```typescript
const router = new Router(this.shadowRoot?.querySelector('#routerOutlet')); 
router.setRoutes([
  {
    path: '', // our root path
    animate: true,
    children: [ // the children of this path
      { path: '/', component: 'app-home' }, // our default URL
      {
        path: '/about', // while this route will take us to the app-about component
        component: 'app-about',
        action: async () => {
          await import('./script/pages/app-about.js');
        },
      },
    ],
  } as any, // temporarily cast to any because of a Type bug with the router
]);
```

In this snippet, we have a `app-home` component that lives at `/`, and a `app-about` component that lives at `/about`. 

We also use of the `children` property to add structure as routing grows more complicated, but for simple scenarios, all you need to declare a route is a `path` and `component` property.

For example, a similar but simpler set up could look like:

```typescript
const router = new Router(this.shadowRoot?.querySelector('#routerOutlet'));
router.setRoutes([
      { path: '/', component: 'app-home' },
      { path: '/about', component: 'app-about'}])
```

## Adding a new Page

1. First, you need to add a new route to our router config. This is done by opening our app-index.ts file (/src/app-index.ts), scrolling to [this line](https://github.com/pwa-builder/pwa-starter/blob/main/src/app-index.ts#L68) and adding the following code. You can learn more about the routes array [here](https://vaadin.github.io/router/vaadin-router/demo/#:~:text=COPY-,Child%20Routes,-Each%20route%20can):

```typescript
{
  path: '/settings',
  component: 'app-settings',
  action: async () => {
    await import('./script/pages/app-settings.js');
  }
},
```
The `path` is the path we would want this page on. For example, with this code, when the user is on the settings page, the URL would be `https://myapp.app/settings`. The `component` is the name of the web-component we want to use. For example, with this code, we want to use the `app-settings` web-component. Finally, the `action` will import our page when the user navigates to it. This enables route based [code splitting](https://developer.mozilla.org/en-US/docs/Glossary/Code_splitting) ensuring your app only loads the javascript for a page when the user actually navigates to it.

2. Next, you need to add a new web-component to our project to be our new page. Open `/src/script/pages/` and add a new file called `app-settings.ts`. The name for this file comes from our code that we added above. In this file, we will add the following code, which is a [lit](https://lit.dev/) based Web Component.

```typescript

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-settings')
export class AppSettings extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    render() {
        return html``;
    }
}
```

Check out [this tutorial](https://lit.dev/tutorials/intro-to-lit/) in the Lit documentation to learn more about this code.

3. Finally, add `<fluent-anchor href="/settings">Settings</fluent-anchor>` to your `/src/script/pages/app-home.ts` in the [`render` function](https://github.com/pwa-builder/pwa-starter/blob/main/src/script/pages/app-home.ts#L104).

4. Lets now run your app and check our work. Open your [terminal](https://www.hanselman.com/blog/whats-the-difference-between-a-console-a-terminal-and-a-shell) and run `npm run dev`. Your app will now open in the browser, at which point you should see your new link you can click. This will then navigate you to your new page!

<div class="docs-image">
  <img src="/assets/starter/routing/settings-button.png" alt="" width=600>
</div>









