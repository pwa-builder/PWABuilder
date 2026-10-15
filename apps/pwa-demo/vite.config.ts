import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  // Override for project Pages: npm run build -- --base=/PWABuilder/
  base: '/',
  build: {
    sourcemap: true,
    assetsDir: 'code',
    target: ['esnext'],
    cssMinify: true,
    lib: false,
  },
  // Bundle web workers as ES modules so we can use import syntax inside them.
  worker: {
    format: 'es',
  },
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{html,js,css,json,png,svg,ico,woff2}'],
        // The bundled WebAwesome CSS can exceed the default 2 MiB limit.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      injectRegister: false,
      manifest: false,
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
