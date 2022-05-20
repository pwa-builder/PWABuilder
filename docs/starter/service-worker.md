# Service Workers in the PWA Starter

The PWA Starter uses Workbox to generate a pre-configured service worker without any set-up on your end.

If you just want basic service worker functionality, the PWA Starter default should be just fine.

If you would like to further configure your service worker, this article will cover how to configure Workbox properties to your liking, and how to use a custom service worker with the PWA Starter stack.

## Generated Worker

To adjust how your service worker is generated, you can configure the Workbox plugin in `vite.config.ts`. The configuration that the PWA Starter ships with looks like this:

```typescript
workbox: {
  globDirectory: 'dist',
  globPatterns: [
    '**/*.{html,js,css,png,webp,jpg}'
  ],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/unpkg\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'unpkg-libs-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ]
}
```

With this configuration, our service worker will precache any file that matches a file type of `html`, `js`, `css`, `png`, `webp`,or `jpg`.

It will also cache any responses from unpkg.com at runtime, where our Fluent web components are sourced from.

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


If you just want to ensure your PWA works offline and improve performance, then a service worker generated through Workbox will work just fine.

However, if you want to write custom service worker code and make use of certain web capabilities, you will need to create your own service worker.

## Custom Worker

If you want to add custom functionality to your service worker, you just need to adjust your `vite.config.ts` to the proper VitePWA specifications and then create your own service worker file.

#### Update Your Config

Here's a sample `vite.config.ts` that allows for a custom service worker. Feel free to copy paste to get started:

```typescript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    sourcemap: true,
    assetsDir: "code",
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      strategies: "injectManifest",
      injectManifest: {
        swSrc: 'src/sw.js',
        swDest: 'dist/sw.js',
        globDirectory: 'dist',
        globPatterns: [
          '**/*.{html,js,css,svg,png,webp,jpg}',
        ]
      },
      
      devOptions: {
        enabled: true
      }
    })
  ]
})
```

The important thing to notice here is that we replaced the `workbox` property with an `injectManifest` property. We also set `strategies: "injectManifest"`, which will tell VitePWA that we plan to provide our own service worker. 

For this configuration, we also provide the `globDirectory`, `globPatterns`, and `runtimeCaching` properties to define precaching, which will still be injected into our service worker for us.

?> **Note** You could also define a runtime caching strategy or the other properties listed above, but we've left them out for simplicity.

We also provide source service worker location and a destination with `swSrc` and `swDest`, respectively.

Next, we need to create our new service worker.

#### Create a Service Worker

Create a `sw.js` file in our `src` directory, and let's add some example functionality to it. We can tell our custom service worker to listen for push events and display a notification:

```typescript
self.addEventListener('push', () => {
  event.waitUntil(
    registration.showNotification("Hello!", {
      body: "This is a push notification!",
    })
  );
});
```

VitePWA and Workbox will inject our precaching information alongside our custom code at build time, and now you have a service worker with custom functionality!

It is important to note that our custom service worker uses the same name as the generated service worker, so we don't have to update our registration in `index.html`:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(
      import.meta.env.MODE === 'production' ? '/sw.js' : '/sw.js?dev-sw'
    );
  }
</script>
```

## Resources

If you're new to service workers, and want to learn some basics about how they work, checkout some of these articles:

* [*How do Service Workers work?*](https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/core-concepts/04?id=how-do-service-workers-work)

* [*Caching Your App Data*](https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/05)

* [*Best Practices for PWA Reliability*](https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/platforms-practices/04)