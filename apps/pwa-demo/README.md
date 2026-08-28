# Nimbus

**Nimbus** is an offline-first "pocket studio" Progressive Web App built to show off
what the modern web platform can do. It is the official demo app for
[PWABuilder](https://www.pwabuilder.com) — the app behind the home page's
"try a demo URL" experience.

Nimbus is installable, works fully offline, uses web workers to keep the UI
responsive, and exercises a large slice of the device and capability APIs
catalogued at [whatpwacando.today](https://whatpwacando.today).

Built from the [PWABuilder pwa-starter](https://github.com/pwa-builder/pwa-starter)
template with **Lit**, **Web Awesome**, **Vite**, and **Workbox**.

## What it demonstrates

| Area | Highlights |
| --- | --- |
| **Installable PWA** | Rich web app manifest with icons, screenshots, shortcuts, share target, and display overrides |
| **Offline-first** | Workbox service worker precaches the full app shell (including self-hosted icons) and falls back to the SPA on navigation |
| **Web Workers** | Live note analytics run off the main thread; camera filters are processed on an `OffscreenCanvas` in a worker |
| **Persistent storage** | Notes are saved to **IndexedDB**; storage persistence is requested via the Storage API |
| **File System Access** | Export/import notes directly to and from disk |
| **Background Sync** | Queued `POST`s replay automatically when connectivity returns |
| **Push & notifications** | Notification permission + local notification demo, with push handlers wired in the SW |

### Pages

- **Home** — overview, install prompt, and live online/offline status.
- **Notes** — a markdown notepad backed by IndexedDB with a Web Worker computing
  word/character/reading-time analytics as you type. Export/import via the File
  System Access API.
- **Sketch** — a pressure-sensitive drawing canvas using Pointer Events. Save,
  share, download, and draw full-screen.
- **Capture** — take photos with the camera (`getUserMedia`), apply real-time
  filters processed off-thread on an `OffscreenCanvas`, and geotag them.
- **Superpowers** — a playground of 22 interactive capability cards, each
  feature-detected and demoed live: Web Share, Clipboard, Vibration, Battery,
  Network Information, Geolocation, Notifications, Wake Lock, Device Orientation,
  Text-to-Speech, Speech Recognition, Contact Picker, App Badging, Fullscreen,
  Idle Detection, Web Bluetooth, Web NFC, Gamepad, Web Audio, Media Session,
  Local Font Access, and Background Sync. Unsupported APIs degrade gracefully
  with a clear "Unsupported" badge.
- **About** — what Nimbus is and links back to PWABuilder, the pwa-starter, and
  whatpwacando.today.

## Getting started

```bash
npm install
npm run dev      # start the Vite dev server
```

## Build & preview

```bash
npm run build    # copy icons -> type-check -> vite build (emits the service worker)
npm run preview  # serve the production build locally
```

> The service worker and offline behavior only run against a production build
> (`npm run build && npm run preview`), not the dev server.

## Icons (offline-safe)

Web Awesome normally resolves icons from the Font Awesome Kit CDN, which fails
offline (and 403s on Pro-only weights). To keep Nimbus fully offline-capable,
the icons it uses are **self-hosted**:

- `scripts/copy-icons.mjs` copies just the Font Awesome Free SVGs the app
  references into `public/assets/fa/{solid,brands}`. It runs automatically as
  the first step of `npm run build` and fails loudly if a referenced icon is
  missing.
- `src/app-index.ts` registers a custom **default** Web Awesome icon library
  whose resolver maps every icon to those self-hosted folders.

If you add a new `<wa-icon>` to the app, add its name to the appropriate list in
`scripts/copy-icons.mjs`.

## Tech stack

- [Lit](https://lit.dev) web components
- [Web Awesome](https://webawesome.com) component library
- [Vite](https://vitejs.dev) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app)
- [Workbox](https://developer.chrome.com/docs/workbox) service worker
- TypeScript (strict)

## License

MIT — see the repository root.
