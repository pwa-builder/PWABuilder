// Nimbus service worker.
//
// Registered as an ES module (see index.html), so it uses `import` instead of
// `importScripts`. vite-plugin-pwa (injectManifest strategy) bundles this file
// and injects the precache manifest at build time via `self.__WB_MANIFEST`.

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import {
  StaleWhileRevalidate,
  CacheFirst,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

self.skipWaiting();
clientsClaim();

const appRoot = self.registration.scope;
const appUrl = (path = '') => new URL(path, appRoot).href;

// Precache everything the build produced (app shell, JS, CSS, icons).
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// SPA navigation fallback: serve the cached index.html for in-app routes so the
// app boots offline no matter which route was requested.
const navigationHandler = createHandlerBoundToURL(appUrl('index.html'));
registerRoute(
  new NavigationRoute(navigationHandler, {
    denylist: [/^\/api\//, /\/[^/?]+\.[^/]+$/],
  })
);

// WebAwesome theme + icon assets are loaded from jsDelivr. Cache-on-use so the
// UI stays styled after the first visit, even fully offline.
registerRoute(
  ({ url }) => url.origin === 'https://cdn.jsdelivr.net',
  new StaleWhileRevalidate({
    cacheName: 'nimbus-cdn',
    plugins: [
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
);

// Google Fonts (if referenced) — long-lived, immutable.
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'nimbus-fonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  })
);

// --- Push notifications -----------------------------------------------------
// Note tools use local notifications. This handler is available for deployments
// that add a push subscription backend; Nimbus itself does not sync notes.
self.addEventListener('push', (event) => {
  let payload = { title: 'Nimbus', body: 'Something new happened.' };
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    if (event.data) {
      payload.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: appUrl('assets/icons/icon_192.png'),
      badge: appUrl('assets/icons/icon_48.png'),
      data: notificationUrl(payload.url),
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = notificationUrl(event.notification.data);
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.startsWith(appRoot) && 'focus' in c);
      if (existing) {
        existing.navigate(target);
        return existing.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});

// Keep notifications in this Pages app rather than another project on the origin.
function notificationUrl(value) {
  if (typeof value !== 'string') return appRoot;
  try {
    const url = new URL(value, appRoot);
    return url.href.startsWith(appRoot) ? url.href : appRoot;
  } catch {
    return appRoot;
  }
}

// Allow the page to trigger an immediate activation after an update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
