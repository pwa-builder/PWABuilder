// This is the "Offline page" service worker

// Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener('install', (event) => {
  const offlinePage = new Request('offline.html', {
    headers: { 'Content-Type': 'text/html' }
  });
  event.waitUntil(
    fetch(offlinePage).then((response) => {
      return caches.open('pwabuilder-offline').then((cache) => {
        console.log('[PWA Builder] Cached offline page during install: ' + response.url);
        return cache.put(offlinePage, response);
      });
    }));
});

// If any fetch for an html file fails, it will show the offline page.
self.addEventListener('fetch', (event) => {
  if (event.request.destination === "document") {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.error('[PWA Builder] Network request Failed. Serving offline page. ' + error);
        return caches.open('pwabuilder-offline').then((cache) => {
          return cache.match('offline.html');
        });
      }));
  }
});

// This is an event that can be fired from your page to tell the SW to update the offline page
self.addEventListener('refreshOffline', (response) => {
  return caches.open('pwabuilder-offline').then((cache) => {
    console.log('[PWA Builder] Offline page updated from refreshOffline event: ' + response.url);
    return cache.put(offlinePage, response);
  });
});
