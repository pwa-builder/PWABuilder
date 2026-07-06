// WebAwesome setup (migrated from Shoelace).
//
// - Loads the WebAwesome base styles plus the Shoelace-compatible theme so the
//   migrated <wa-*> components keep the look they had under Shoelace.
// - Each <wa-*> element is registered via an explicit import in the file that
//   uses it (co-located imports), rather than a central list here. The official
//   autoloader is designed for CDN usage and does not work under a bundler like
//   Vite, so components are imported where used — this is tree-shakeable and keeps
//   each component's dependency local to its consumer.
// - Repoints <wa-icon>'s default library at our self-hosted SVGs in
//   /public/assets/icons so every existing name="..." resolves identically to
//   how it did under Shoelace (whose default library was Bootstrap Icons).
import '@awesome.me/webawesome/dist/styles/webawesome.css';
import '@awesome.me/webawesome/dist/styles/themes/shoelace.css';

import { registerIconLibrary } from '@awesome.me/webawesome/dist/webawesome.js';

// Customizing the default library is the officially supported way to change
// where <wa-icon> resolves names. Our icons live in /public/assets/icons and
// already use fill="currentColor", so no mutator is needed for them to inherit
// the surrounding text color.
// See https://webawesome.com/docs/components/icon/#customizing-the-default-library
registerIconLibrary('default', {
  resolver: (name: string) => `/assets/icons/${name}.svg`,
});
