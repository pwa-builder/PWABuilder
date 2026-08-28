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
  NetworkFirst,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

self.skipWaiting();
clientsClaim();

// Precache everything the build produced (app shell, JS, CSS, icons).
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// SPA navigation fallback: serve the cached index.html for in-app routes so the
// app boots offline no matter which route was requested.
const navigationHandler = createHandlerBoundToURL('index.html');
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

// Demonstrate Background Sync: queued POSTs to /sync-demo are replayed when
// connectivity returns. Used by the Superpowers playground.
const bgSyncPlugin = new BackgroundSyncPlugin('nimbus-sync-queue', {
  maxRetentionMinutes: 24 * 60,
});
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/sync-demo') && request.method === 'POST',
  new NetworkFirst({ plugins: [bgSyncPlugin] }),
  'POST'
);

// --- Push notifications -----------------------------------------------------
// The playground uses the Notifications API directly, but a real push handler
// makes the SW a complete example.
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
      icon: '/assets/icons/icon_192.png',
      badge: '/assets/icons/icon_48.png',
      data: payload.url || '/',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => 'focus' in c);
      if (existing) {
        existing.navigate(target);
        return existing.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});

// Allow the page to trigger an immediate activation after an update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
