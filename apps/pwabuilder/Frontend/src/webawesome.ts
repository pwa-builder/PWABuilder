// WebAwesome setup (migrated from Shoelace).
//
// - Loads the WebAwesome base styles plus the Shoelace-compatible theme so the
//   migrated <wa-*> components keep the look they had under Shoelace.
// - Each <wa-*> element is registered via an explicit import in the file that
//   uses it (co-located imports), rather than a central list here. The official
//   autoloader is designed for CDN usage and does not work under a bundler like
//   Vite, so components are imported where used — this is tree-shakeable and keeps
//   each component's dependency local to its consumer.
// - Points <wa-icon>'s default library at Bootstrap Icons (Shoelace's former
//   default icon library) so every existing name="..." resolves identically.
import '@awesome.me/webawesome/dist/styles/webawesome.css';
import '@awesome.me/webawesome/dist/styles/themes/shoelace.css';

import { registerIconLibrary } from '@awesome.me/webawesome/dist/webawesome.js';

// Bootstrap Icons are copied into /assets/bootstrap-icons by the copy-icons npm
// script (see package.json) so the SVGs are served as static assets.
registerIconLibrary('default', {
  resolver: (name: string) => `/assets/bootstrap-icons/${name}.svg`,
});
