import pkg from 'workbox-build';
const { injectManifest } = pkg;

injectManifest({
    globDirectory: 'dist',
    globPatterns: [
      '**/*.{html,js,css,png,webp,jpg}',
    ],
    swSrc: 'dist/pwabuilder-sw.js',
    swDest: 'dist/pwabuilder-sw.js',
  });
