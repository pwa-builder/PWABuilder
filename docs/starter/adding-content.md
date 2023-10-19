# Adding New Pages and Routing

The PWA Starter is a [Single-Page Application](https://developer.mozilla.org/en-US/docs/Glossary/SPA) and uses a client-side router to navigate between pages. 

To this end, we use the router found in [@thepassle/app-tools](https://github.com/thepassle/app-tools/tree/master/router), which is a simple, declarative router that allows you to define a route, such as `/about`, and it's corresponding web-component. 

The starter makes use of both pre-built ([Fluent Components](https://docs.microsoft.com/en-us/fluent-ui/web-components/)) and custom web components ([Lit](https://lit.dev/)) to define both entire pages, and the smaller, functional components that make up those pages.

If you've never used web components before and want to learn more, check out this [primer](https://www.fast.design/docs/resources/why-web-components) on what they can bring to your web project.

## Routing Basics
The PWA Starter uses *client-side routing* to navigate between pages, which allows for navigating without reloading our refreshing the view.

As far as progressive web apps are concerned, this allows for a user experience that is more consistent with expectations for native applications.

In the case of the PWA Starter, each page is it's own custom web component, and they are mapped to URLs using [@thepassle/app-tools](https://github.com/thepassle/app-tools/tree/master/router#usage).

### Setting Routes

All of the routing logic for the PWA Starter can be found in `src/app-index.ts`, which is our root index component that we include in our normal `index.html` file.

Let's take a look at the router config contained in `src/router.ts`, where we define our PWA's navigation:

```typescript
export const router = new Router({
  routes: [
    {
      path: resolveRouterPath(),
      title: 'Home',
      render: () => html`<app-home></app-home>`
    },
    {
      path: resolveRouterPath('about'),
      title: 'About',
      plugins: [
        lazy(() => import('./pages/app-about/app-about.js')),
      ],
      render: () => html`<app-about></app-about>`
    }
  ]
});
```

In this snippet, we have a `app-home` component that lives at `/`, and a `app-about` component that lives at `/about`. 

We provide a function called `resolveRouterPath` that allows our paths to be automatically adjusted for any root URL we build our app with. We call `resolveRouterPath('about')` if we want an About page at `<base-url>/about`.

The bare minimum properties you need to declare a route is a `path`, a `component`, and a `render` function but the starter also makes use of several other properties:

| Property |Usage |
| :------|------ |
| **path** (*Required*)  |The path we want to use to define our route. For example: `/about`|
| **component** (*Required*) |The component we want associated with our route. For example: `app-about` |
| **render** (*Required*) | The function to execute when navigating to this page. For example, because the PWA Starter is built with web components, all we need to pass is the component itself, such as `<app-home></app-home>. |
| **plugins** | An array of plugins that we may want to use in our router. The `@thepassle/app-tools` router supports plugins, which are bits of functionality you can add to the router. By default, we use the `lazy` plugin to `lazy-load` our pages, however there are [other plugins you can add](https://github.com/thepassle/app-tools/tree/master/router#composable)


Next, we'll take a look at adding a new page to the starter:

## Adding Pages

To add a new page to your PWA, you will need to create a new component, and then add that component to your router code.

### Creating the Page Component

1. Navigate to the `src/pages/` directory.

2. Create a new typescript file called `new-page.ts`

3. Add the basics of a new custom component:

```typescript
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

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

### Adding the Route

Next we just need to add the route in our router config defined in `src/router.ts`.

We can add to our existing list of paths in our router config:

```typescript
{
  path: resolveRouterPath('new-page'),
  title: 'new page',
  plugins: [
    lazy(() => import('./pages/new-page.js')),
  ],
  render: () => html`<new-page></new-page>`
}
```

And our overall config will now look like this: 

```typescript
export const router = new Router({
  routes: [
    {
      path: resolveRouterPath(),
      title: 'Home',
      render: () => html`<app-home></app-home>`
    },
    {
      path: resolveRouterPath('about'),
      title: 'About',
      plugins: [
        lazy(() => import('./pages/app-about/app-about.js')),
      ],
      render: () => html`<app-about></app-about>`
    },
    {
      path: resolveRouterPath('new-page'),
      title: 'new page',
      plugins: [
        lazy(() => import('./pages/new-page.js')),
      ],
      render: () => html`<new-page></new-page>`
    }
  ]
});
```

That's it! Our new page is added.