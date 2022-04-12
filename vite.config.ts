import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    assetsDir: "code",
  },
  plugins: [
    VitePWA({
      // you can remove base and scope pwa plugin will use the base on vite: defaults to /
      base: "/",
      scope: "/",
      registerType: "autoUpdate",
      manifest: false,
      workbox: {
        globDirectory: 'dist',
        globPatterns: [
          '**/*.{html,js,css,png,webp,jpg}'
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})