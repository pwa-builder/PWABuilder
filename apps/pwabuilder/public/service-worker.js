// This is the source code for the service worker of pwabuilder
// It is processed during production builds to inject the precache manifest and other assets.

import {
    imageCache,
    staticResourceCache
} from "workbox-recipes";
import { precacheAndRoute } from "workbox-precaching";
import { ExpirationPlugin } from "workbox-expiration";

// Precache the our versioned files. This variable is injected by the build process. See vite.config.ts for more info.
const allStaticAssets = (self.__WB_MANIFEST || []);
const assetsToPrecache = allStaticAssets.filter(entry => entry.url.startsWith("assets/code/"));
try {
    console.log("Service worker precaching", assetsToPrecache);
    precacheAndRoute(assetsToPrecache);
} catch (e) {
    console.warn("Service worker warning: error during precache", e);
}

// Static resource recipe: https://developers.google.com/web/tools/workbox/modules/workbox-recipes#static_resources_cache
// This is a stale-while-revalidate strategy for CSS, JS, and web workers.
// By default, this recipe matches styles, scripts, and workers.
// We override matchCallback to also include fonts and our JSON strings
const staticResourceDestinations = [
    "style",
    "script",
    "worker",
    "font"
];
staticResourceCache({
    matchCallback: (e) =>  staticResourceDestinations.some(dest => dest === e.request.destination),
    plugins: [
        new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: daysToSeconds(7) // 7 days. This helps us weed out old static assets, e.g. /code/build-432abc.js
        })
    ]
});

// Image cache recipe: https://developers.google.com/web/tools/workbox/modules/workbox-recipes#image_cache
// This is a cache-first strategy for all images. We specify a max number of images and max age of image.
imageCache({
    maxAgeSeconds: daysToSeconds(14),
    maxEntries: 50,
    matchCallback: (e) => {
        const host = e.request.url ? new URL(e.request.url).host : "";
        return e.request.destination === "image" && host !== "web.vortex.data.microsoft.com"; // Don't cache web.vortex.data.microsoft.com images - this is OneDS .gif image tracker
    }
});

/**
 * Converts the specified number of days to seconds.
 * @param {number} days
 * @returns {number} The number of seconds.
 */
function daysToSeconds(days) {
    return days * 24 * 60 * 60;
}