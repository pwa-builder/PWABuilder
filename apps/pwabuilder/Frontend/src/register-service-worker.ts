// Registration belongs only to the public entry, never the authentication callback.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', (): void => {
    void navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .catch(error => console.warn('Unable to register service worker.', error));
  });
}
