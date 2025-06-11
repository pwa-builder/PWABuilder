import { UserConfig, defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(() => {
    const config: UserConfig = {
        appType: "custom",
        root: "Frontend",
        publicDir: "public",
        base: "/",
        build: {
            emptyOutDir: true,
            manifest: true,
            outDir: "../wwwroot",
            assetsDir: "",
            rollupOptions: {
                input: "Frontend/src/app-index.ts"
            },
            target: ["esnext"],
            cssMinify: true,
            lib: false
        },
        server: {
            strictPort: true
        },
        plugins: [
            VitePWA({
                strategies: "injectManifest",
                injectManifest: {
                    swSrc: 'public/sw.js',
                    swDest: 'dist/sw.js',
                    globDirectory: 'dist',
                    globPatterns: [
                        '**/*.{html,js,css,json,png}',
                    ],
                },
                injectRegister: false,
                manifest: false,
                devOptions: {
                    enabled: true
                }
            })
        ]
    };

    return config;
});

  
