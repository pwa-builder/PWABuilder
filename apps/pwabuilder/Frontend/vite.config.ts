import { defineConfig, PluginOption } from 'vite';
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    sourcemap: true,
    assetsDir: "code",
    outDir: "../wwwroot"
  },
  plugins: [
    // JS bundle visualizer. Will generate a file called `dist/pwabuilder-bundle-stats.html` that contains a visual representation of the bundles created.
    visualizer({
      filename: "dist/pwabuilder-bundle-stats.html",
      brotliSize: true
    }) as PluginOption,

    // VitePWA plugin to process our service worker.
    VitePWA({
      // you can remove base and scope pwa plugin will use the base on vite: defaults to /
      base: "/",
      scope: "/",
      registerType: "autoUpdate",
      injectRegister: "inline",
      manifest: false, // We supply our own web app manifest
      strategies: "injectManifest", // inject the list of versioned files ("manifest") into our service worker
      filename: "service-worker.js",
      workbox: {
        mode: "production",
        swDest: "service-worker.js",
        globDirectory: "dist",
        cleanupOutdatedCaches: true,
        globPatterns: [
          "code/*.js"
        ]
      },
      devOptions: {
        type: "module",
        enabled: false // don't inject service worker in dev mode
      }
    }),
  ]
})
