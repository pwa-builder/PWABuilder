# Introduction to Service Workers

Service workers are one of the key components of a progressive web app, and are a requirement for your PWA to be installable and work properly offline.

This article will provide an overview of service worker basics and what they can do for your PWA.

## Overview

Service workers are a specific type of [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) that serve as a proxy between your application and the network. All requests that go to or from your PWA will pass through the service worker first. 
This allows your service worker to handle requests in situations where the network may be unavailable.

Service workers are event-driven and run separately from your applications primary thread. Instead of blocking the user interface, a service worker will listen for events (like a `fetch` event, for example) and handle it asynchronously.

Some common use cases for service workers:

* Pre-caching assets

* Handling asset requests, such as deciding when to use the cache or go to the network

* Handling web notification related events, such as notification clicks and push events

* Syncing your application in the background

## Creating a Worker

To add a service worker to your project, create a `sw.js` file at the root of your project and leave it empty for now.

Technically, an empty service worker will be enough for your app to be installable, but it won't provide any offline functionality.

?> **Note** You can name your service worker whatever you'd like, but `sw.js` is a commonly used convention.

#### Scope
You can place a service worker anywhere in your project, but it will only have access to assets that are at or below it's current directory level. This is called your service workers ***scope***.

A service worker that lives at the root of your project will have a scope that encompasses the entirety of your application.

#### Registration

After you've placed your `sw.js` file at its desired scope, you can register your service worker in your application's index.

Add this snippet to the body of your application's `index.html`:

```html
<script>
  if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('sw.js')
  }
</script>
```

## Example Worker

Let's take a look at a basic service worker that we could add to our PWA.

We'll step through it in pieces, but you can find the full source code [here.](https://github.com/pwa-builder/PWABuilder/tree/main/docs/assets/code-examples/example-sw.js)

#### Pre-caching During the *Install* Event

Service workers that are being installed for the first time emit an `install` event.

We can add a listener for this event to pre-cache essential resources for our application. This will allow our application's assets to be available when used offline.

```js
const CACHE_NAME = 'cool-cache';

// Add whichever assets you want to pre-cache here:
const PRECACHE_ASSETS = [
    '/assets/',
    '/src/'
]

// Listener for the install event - pre-caches our assets list on service worker install.
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(PRECACHE_ASSETS);
    })());
});
```

When the `install` event is emitted, this snippet will open a new cache with name `CACHE_NAME` and pre-cache any assets included in the `PRECACHE_ASSETS` list.

#### Claiming Clients During the *Activate* Event

After the install event, the next step in the service worker lifecycle is *activation*. An `activate` event is emitted immediately after installation is completed.

We can use this event to have our service worker take control of instances of our app that are already running. This is called *claiming a client*:

```js
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
```

By default, a newly activated service worker won't claim any clients until they are reloaded.

Using `self.clients.claim()` in our activation listener tells our service worker to take control of new clients right away.

#### Defining A Fetch Strategy
Once the service worker is pre-caching assets, we need to provide some functionality for retrieving those assets.

We listen to the `fetch` event to allow us to intercept and handle requests for assets:

```js
self.addEventListener('fetch', event => {
  event.respondWith(async () => {
      const cache = await caches.open(CACHE_NAME);

      // match the request to our cache
      const cachedResponse = await cache.match(event.request);

      // check if we got a valid response
      if (cachedResponse !== undefined) {
          // Cache hit, return the resource
          return cachedResponse;
      } else {
        // Otherwise, go to the network
          return fetch(event.request)
      };
  });
});
```

This snippet showcases using a *Cache-First* strategy to fetch resources. When the service worker intercepts a request, it will check the cache first for a response, and then go to the network if it fails to get a response.

The Cache-First strategy is basic and has some cons (for example, updating stale resources), but works great for simple, beginner use cases.

## Security

Service workers have to be served from a secure, HTTPS-enabled endpoint in order to function. Because service workers are essential to progressive web apps, all PWAs must therefore be served on HTTPS to work properly.

For testing purposes, service workers will function without HTTPS when served from `localhost`, but if you want to distribute your PWA, you will need to secure your application.

If you are unfamiliar with creating certificates to secure an endpoint, you can use an app hosting service that comes with HTTPS enabled by default. 

One option is to use the [Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/) to host your application with Azure. The PWA Starter template supports the CLI by default, and you can find documentation on publishing the starter with the CLI [here.](/starter/publish?id=azure-static-web-apps)


## Next Steps

If you're looking to get more in depth information about service workers, check out [this resource](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

If you want to get started developing a new PWA, take a look at the [documentation for the PWA Starter](/starter/quick-start), which is PWA template that comes with a functional service worker built in.