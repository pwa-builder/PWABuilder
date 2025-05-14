import { defineConfig, PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    sourcemap: true,
    assetsDir: "code",
  },
  plugins: [
    visualizer({
      filename: "dist/pwabuilder-bundle-stats.html",
      brotliSize: true
    }) as PluginOption,
  ]
})
