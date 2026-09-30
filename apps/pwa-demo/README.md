# Nimbus

**Nimbus** is an offline-first notebook: keep thoughts, sketches, and photos
together. It is built as a demo PWA for [PWABuilder](https://www.pwabuilder.com)
using the [pwa-starter](https://github.com/pwa-builder/pwa-starter) stack:
Lit, Web Awesome, TypeScript, Vite, and Workbox.

## The notebook

The home screen is your notebook, not a launcher for separate demo apps.
Create, search, pin, edit, share, and export notes. **Add sketch** opens a
pressure-sensitive drawing pad; **Add photo** opens the camera, image picker,
and worker-powered filters. Both attach images directly to the active note.
Each attachment can be downloaded or removed independently.

The editor has **Write** and **Preview** tabs. Write edits the original Markdown;
Preview renders headings, emphasis, lists, task lists, links, quotes, fenced code,
and tables locally, including offline. Switching tabs never changes the saved
source. Preview HTML is sanitized with DOMPurify, links open in a separate tab,
and task checkboxes are read-only. Remote Markdown images still require a
network connection; attached sketches/photos remain available offline.

**Note tools** integrates useful web capabilities into the note:

| Action | Web capability |
| --- | --- |
| Dictate / read aloud | Speech recognition and synthesis |
| Insert contact / add location | Contact Picker and Geolocation |
| Keep screen awake | Screen Wake Lock |
| Notify me now | Service-worker notifications linking back to a specific note |
| Protect local notes | Storage persistence and quota estimates |
| Share / copy text | Web Share (including images), Clipboard |
| Pin note | Pinned notes sort first; supported installed apps show a pinned-note count badge |
| Focus | Distraction-free editor layout |

Unavailable device features are disabled; errors and permission denials are
shown in the UI. Dictation may require a network and use the browser's online
speech service. Notifications are immediate, not scheduled reminders.
Unrelated hardware demos and the mock Background Sync request have been removed:
Nimbus has no cloud-sync backend.

## Data and backups

Notes and attachment `Blob`s are stored together in IndexedDB. Existing Nimbus
text notes need no migration. Previously saved photos remain available under
**Add photo > Previously saved photos**. Removing an attachment does not delete
the original legacy-gallery photo.

Saving is automatic, and writes/deletes are ordered. Failed writes are reported
with a retry action; do not close Nimbus before retrying or exporting a backup.
Browser-local storage is not a backup and may be cleared by the user or browser.

**Export** creates a `.nimbus.json` backup containing text, metadata, and embedded
image bytes. It uses the File System Access save picker when supported, with a
download fallback. **Import** accepts these backups as new notes, plus `.txt`
and `.md` files. File sharing falls back to a complete backup if the browser
cannot share images; text-only sharing falls back to the clipboard.

The manifest includes note, sketch-note, and photo-note shortcuts, text Share
Target, file handling, and a `web+nimbus` protocol handler. Navigation uses
query strings: `/?view=about`, `/?note=ID`, and `/?tool=sketch` (or `photo`,
`tools`). Shortcuts use `/?new=1`, `/?new=sketch`, and `/?new=photo`.
Old path-based bookmarks are recognized if a service worker or host serves the
app shell, but are not valid first-visit links on GitHub Pages.

## Development

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Use Node.js 22 or newer. The tests use Node's test runner and `fake-indexeddb`
to cover legacy records, image persistence, transaction failures, deletion,
and backup round trips. The build type-checks and creates a static `dist`.
`npm run test:pages` builds root and `/PWABuilder/` variants and runs Playwright
against plain static servers with no SPA fallback. Install its browser once
with `npx playwright install chromium`. The suite covers cold deep links,
refresh, back/forward, browsers with and without the Navigation API, scoped
service workers, and offline assets. `tests/notebook.browser.js` also
runs in an isolated context and covers in-note media, camera cleanup,
permission errors, dictation, failed-save recovery, offline reload, mobile
layout, and note-switch/delete races. Camera and speech are mocked, so the
regression suite does not request access to real hardware.

For offline verification, use the production preview: visit once online, wait
for the service worker to control the page, then reload with the browser offline.
Notes, attachments, sketching, and photo filters work without a network.
Device-dependent APIs still require browser support and permission.

## Offline assets

Web Awesome styles and the used Font Awesome Free icons are bundled/self-hosted.
`scripts/copy-icons.mjs` copies the selected icon set into
`public/assets/fa/{solid,brands}` during builds. Add new icon names to that script.
The service worker precaches the app, lazy-loaded media editors, workers, and
assets. HTTPS or localhost is required for PWA features.

## GitHub Pages

**This repository already publishes `docs.pwabuilder.com`** through
`.github/workflows/docs-github-pages.yml`. GitHub Pages has one site per
repository: do not add a competing workflow that deploys only Nimbus, because
it would replace the documentation site.

To publish alongside the existing docs at `https://docs.pwabuilder.com/nimbus/`:

1. Keep the existing documentation build and Pages upload/deploy steps.
2. After building the docs, set up Node.js 22 and run `npm ci` and
   `npm run build -- --base=/nimbus/` in `apps/pwa-demo`.
3. Copy the contents of `apps/pwa-demo/dist` into `docs/nimbus` before the
   existing workflow uploads `docs/`. This publishes both apps in one artifact.
4. Extend that workflow's push-path filter to include `apps/pwa-demo/**` and the
   workflow file itself, in addition to `docs/**`. Keep its `main` trigger.
5. Merge and run the existing Pages workflow. Its existing custom domain and
   Pages configuration do not need to change.

For a separate origin such as a dedicated Nimbus subdomain, use a separate
Pages repository/site rather than changing the docs site's custom domain.
The root/project-site build examples below apply to that separate site.

Build for the URL where the app will be served (the base must start and end
with `/`):

```sh
# Custom domain or an organization/user site, at the origin root:
npm run build

# Project site, e.g. https://pwa-builder.github.io/PWABuilder/:
npm run build -- --base=/PWABuilder/
```

Publish the **contents of `apps/pwa-demo/dist`** as the Pages artifact, not the
source folder. The repo path is case-sensitive. In a GitHub Actions Pages
workflow, run `npm ci` and the chosen build command in `apps/pwa-demo`, then
upload its `dist` using `actions/upload-pages-artifact` and deploy it using
`actions/deploy-pages`. A custom domain uses the root build when this app is
served at `/`.

All new links request the deployed index document. For example, About becomes
`/PWABuilder/?view=about`, so direct visits and refreshes return HTTP 200 without
rewrites, generated route pages, or a `404.html` workaround. The Navigation API
enhances same-document navigation where supported; other browsers follow normal
links and use their native history. Unsaved-note protections remain active.

Vite's base controls bundled assets, self-hosted icons, HTML links, and
service-worker registration/scope. The static manifest uses relative URLs for
its start URL, scope, shortcuts, and handlers. It intentionally omits `id` so
identity defaults to the resolved start URL: an explicit relative `id` would
resolve against the origin and collide across project sites. This keeps the
existing root-hosted identity while giving each project path its own identity.
Service-worker notification URLs
resolve against its registration scope, not the origin root.

Do not move the app to another base/domain after users install it without a
migration plan: manifest identity and service-worker scope depend on that URL.
Notes are origin-local, so moving domains requires export/import. Other apps
on the same Pages origin share origin-level storage and permissions; a dedicated
custom domain gives Nimbus its own origin.

No deployment workflow or Pages settings are changed here, and the PWABuilder
homepage demo-URL replacement still waits for the final public URL.

## License

MIT - see the repository root. Third-party icons retain their upstream license.
