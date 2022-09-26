# Service Workers in the PWA Starter

The PWA Starter uses [VitePWA](https://vite-plugin-pwa.netlify.app/) and [Workbox](https://developers.google.com/web/tools/workbox/) as our Service Worker solution. This ensures your PWA loads offline, and is still fast on slower network connections.


## Getting Started

Your Service Worker can be found in `public/sw.js` in the Starter. This file is where you will add your custom Service Worker code, and also contains `workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);`, which is how Workbox "injects" its caching code to ensure your PWA loads offline.

Let's add some example functionality to it. We can tell our custom service worker to listen for push events and display a notification:

```typescript
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js'
);

self.addEventListener('push', () => {
  event.waitUntil(
    registration.showNotification("Hello!", {
      body: "This is a push notification!",
    })
  );
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
```

VitePWA and Workbox will inject our precaching information alongside our custom code at build time, and now you have a service worker!

?> **Note** Workbox uses a "precache manifest" to track what files need to be precached and when they need to be updated. 
In this instance, Workbox is injecting this manifest in the last line, where we see the `self.__WB_MANIFEST` placeholder.

It is important to note that your Service Worker file-name should always be `sw.js` so our registration
code (shown below) can find it. If you change the name of your Service Worker file, be sure to also change the filepath [here](https://github.com/pwa-builder/pwa-starter/blob/main/index.html#L38).

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(
      '/sw.js'
    );
  }
</script>
```

## Advanced Options

To adjust how your service worker is generated, you can configure the Workbox plugin in `vite.config.ts`. The configuration that the PWA Starter ships with looks like this:

```typescript
VitePWA({
  strategies: "injectManifest",
  injectManifest: {
    swSrc: 'public/sw.js',
    swDest: 'dist/sw.js',
    globDirectory: 'dist',
    globPatterns: [
      '**/*.{html,js,css,json,png}',
    ],
  },
  devOptions: {
    enabled: true
  }
})
```

With this configuration, our service worker will precache any file that matches a file type of `html`, `js`, `css`, `png`.

Here's a breakdown of the properties we use to configure our service worker generation:

| Property |Usage |
| :------|------ |
| **globDirectory** |The directory to use when searching for files to precache. In our case, our output directory is `dist`.|
| **globPatterns** |Array of glob patterns to match files on. In our case, we are matching all files in all subdirectories of file type html, css, js, png, webp, or jpg. |
| **runtimeCaching** | Parent property for defining runtime caching behavior. You can specify multiple, but the PWA Starter just defines one.    |
| **urlPattern** | The request URL pattern to match for runtime caching. We are matching requests to unpkg.com, where we source the Fluent Components.|
| **handler** | The strategy to use while caching and fetching content. The options are: <br><br> `CacheFirst` Check the cache first, and go to the network as back up. <br><br> `NetworkFirst` Check the network first, and go to the cache as back up. <br><br> `CacheOnly` Only check the cache. <br><br> `NetworkOnly` Only check the network. <br><br> `StaleWhileRevalidate` Go to the cache first, but update the cache in the background to keep cache content fresh. |
| **cacheName** | Name for our cache. |
| **expiration** | Define circumstances for content in our cache to expire. <br><br> `maxEntries` is the maximum number of cache entries to keep. <br><br> `maxAgeSeconds` is the maximum age of a cache in seconds. |
| **cacheableResponse** | Defines the type of responses we want to cache. |

## Resources

If you're new to service workers, and want to learn some basics about how they work, checkout some of these articles:

* [*How do Service Workers work?*](https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/core-concepts/04?id=how-do-service-workers-work)

* [*Caching Your App Data*](https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/05)

* [*Best Practices for PWA Reliability*](https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/platforms-practices/04)