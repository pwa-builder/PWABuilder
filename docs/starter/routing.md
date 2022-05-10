# Routing

The PWA Starter is a [Single-Page Application](https://developer.mozilla.org/en-US/docs/Glossary/SPA) and therefore uses a client-side router to navigate between pages. For this purpose, we use the [Vaadin Router](https://vaadin.github.io/router/vaadin-router/demo/#vaadin-router-getting-started-demos). The router is a simple, declarative router that allows you to define a route, such as `/about`, and it's corresponding web-component. 

## What is Client-Side Routing?
Client-Side Routing is a way to navigate between pages without reloading the page, emulating a platform-specific (native) application.

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

3. Finally, add `<a href="/settings">` to your `/src/script/pages/app-home.ts` in the [`render` function](https://github.com/pwa-builder/pwa-starter/blob/main/src/script/pages/app-home.ts#L104).

4. Lets now run your app and check our work. Open your [terminal](https://www.hanselman.com/blog/whats-the-difference-between-a-console-a-terminal-and-a-shell) and run `npm run dev`. Your app will now open in the browser, at which point you should see your new link you can click. This will then navigate you to your new page!









