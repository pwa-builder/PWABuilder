import { precacheAndRoute } from 'workbox-precaching';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Add custom service worker logic, such as a push notification serivce, or json request cache.
self.addEventListener('message', (event: MessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cache test calls
// https://developers.google.com/web/tools/workbox/modules/workbox-strategies#stale-while-revalidate
registerRoute(
  ({ url }) =>
    url.origin === 'https://pwabuilder-tests.azurewebsites.net' ||
    url.origin ===
      'https://pwabuilder-serviceworker-finder.centralus.cloudapp.azure.com',
  new StaleWhileRevalidate({})
);

registerRoute(
  ({ url }) =>
    url.origin ===
    'https://appimagegenerator-prod.azurewebsites.net/api/image/base64',
  new CacheFirst({
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
  'POST'
);

registerRoute(
  ({ url }) => url.href === 'https://pwa-screenshots.azurewebsites.net',
  new CacheFirst({
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  })
);

try {
  //@ts-ignore
  precacheAndRoute(self.__WB_MANIFEST);
} catch (err) {
  console.info('if you are in development mode this error is expected: ', err);
}
