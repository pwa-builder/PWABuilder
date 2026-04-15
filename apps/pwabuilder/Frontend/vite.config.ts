import { defineConfig, PluginOption } from 'vite';
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(async () => {
    const { visualizer } = await import('rollup-plugin-visualizer');

    return {
        base: "/",
        server: {
            host: "0.0.0.0",
            port: 5173,
            proxy: {
                "/api": {
                    target: "http://localhost:5777",
                    changeOrigin: true,
                    secure: false
                }
            }
        },
        build: {
            sourcemap: true,
            assetsDir: "code",
            outDir: "../wwwroot"
        },
        plugins: [
            // JS bundle visualizer. Dynamically imported above so Node/Vite
            // doesn't attempt to `require()` an ESM-only package.
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
            })
        ]
    };
});
