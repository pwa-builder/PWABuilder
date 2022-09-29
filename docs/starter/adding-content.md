# Adding New Pages and Routing

The PWA Starter is a [Single-Page Application](https://developer.mozilla.org/en-US/docs/Glossary/SPA) and uses a client-side router to navigate between pages. 

To this end, we use [Vaadin Router](https://vaadin.github.io/router/vaadin-router/demo/#vaadin-router-getting-started-demos), which is a simple, declarative router that allows you to define a route, such as `/about`, and it's corresponding web-component. 

The starter makes use of both pre-built ([Fluent Components](https://docs.microsoft.com/en-us/fluent-ui/web-components/)) and custom web components ([Lit](https://lit.dev/)) to define both entire pages, and the smaller, functional components that make up those pages.

If you've never used web components before and want to learn more, check out this [primer](https://www.fast.design/docs/resources/why-web-components) on what they can bring to your web project.

## Routing Basics
The PWA Starter uses *client-side routing* to navigate between pages, which allows for navigating without reloading our refreshing the view.

As far as progressive web apps are concerned, this allows for a user experience that is more consistent with expectations for native applications.

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
        action: async () => { // load our component asynchronously
          await import('./pages/app-about.js'); 
        },
      },
    ],
  } as any, // temporarily cast to any because of a Type bug with the router
]);
```

In this snippet, we have a `app-home` component that lives at `/`, and a `app-about` component that lives at `/about`. 

The bare minimum you need to declare a route is a `path` and `component`, but the starter also makes use of several other properties:

| Property |Usage |
| :------|------ |
| **path** (*Required*)  |The path we want to use to define our route. For example: `/about`|
| **component** (*Required*) |The component we want associated with our route. For example: `app-about` |
| **animate** | Whether or not to animate between pages during navigation. You can configure this animation with CSS. Learn more [here.](https://vaadin.github.io/router/vaadin-router/demo/#vaadin-router-animated-transitions-demos)   |
| **children** | The children array for our path. For example, if our `/about` route had a child with the path `/faq`, that page could be found at `/about/faq`|
| **action** | The action to take when navigating to this page. For example, the PWA Starter uses this to asynchronously load our pages. |


If you wanted a simpler approach to routing, it could look more like this:


```typescript
const router = new Router(this.shadowRoot?.querySelector('#routerOutlet'));
router.setRoutes([
      { path: '/', component: 'app-home' },
      { path: '/about', component: 'app-about'}])
```

?> **Note** In this case, you would need to import your components in your `app-index.ts` file if you aren't going to load them asynchronously.

Next, we'll take a look at adding a new page to the starter:

## Adding Pages

To add a new page to your PWA, you will need to create a new component, and then add that component to your router code.

#### Creating the Page Component

1. Navigate to the `src/pages/` directory.

2. Create a new typscript file called `new-page.ts`

3. Add the basics of a new custom component:

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('new-page')
export class AppSettings extends LitElement {
    static styles = [
        css`
          <CSS for your page goes here>
        `
    ];

    render() {
        return html`
          <HTML for your page goes here>
        `;
    }
}
```

If you're new to Lit or web components in general, check out the [Lit tutorial](https://lit.dev/tutorials/intro-to-lit/) to learn more.

#### Adding the Route

Next we just need to add the route in our `firstUpdated()` function in `src/app-index.ts`.

We can add to our existing list of paths in our `chlildren` property:

```typescript
{
  path: '/new-page',
  component: 'new-page',
  action: async () => { 
    await import('./pages/new-page.js'); 
  },
}
```

And our overall `setRoutes()` function will now look like this: 

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
        action: async () => { // load our component asynchronously
          await import('./script/app-about.js'); 
        },
      },
      {
        path: '/new-page',
        component: 'new-page',
        action: async () => { 
          await import('./script/new-page.js'); 
        },
      }
    ],
  } as any, // temporarily cast to any because of a Type bug with the router
]);
```

That's it! Our new page is added.