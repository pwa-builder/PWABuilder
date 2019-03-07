//This is the "Offline page" service worker

// Add this below content to your HTML page, or add the js file to your page at the very top to register service worker
if (navigator.serviceWorker && navigator.serviceWorker.controller) {
  console.log('[PWA Builder] active service worker found, no need to register');
}
else {
  // Check for service worker support and
  // register the ServiceWorker if we have it
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('pwabuilder-sw.js', {
      scope: './'
    }).then((reg) => {
      console.log('Service worker has been registered for scope: ' + reg.scope);
    });
  }
}


