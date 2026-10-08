import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

// Web Awesome global styles + theme.
import '@awesome.me/webawesome/dist/styles/webawesome.css';
// Point Web Awesome at a hosted copy of its (non-icon) assets.
import { setBasePath, registerIconLibrary } from '@awesome.me/webawesome/dist/webawesome.js';
setBasePath('https://cdn.jsdelivr.net/npm/@awesome.me/webawesome@3.10.0/dist');

// Serve icons from a self-hosted Font Awesome Free set so they load offline and
// never hit the Font Awesome Kit CDN (which 403s on Pro-only weights). We only
// self-host the `solid` and `brands` folders (see scripts/copy-icons.mjs), so
// override the default icon library with a resolver that maps every classic
// icon to `solid` regardless of the requested variant. This avoids Web
// Awesome's default resolving some icons to a `regular` folder we don't ship.
registerIconLibrary('default', {
  resolver: (name: string, family?: string) => {
    const folder = family === 'brands' ? 'brands' : 'solid';
    return `${import.meta.env.BASE_URL}assets/fa/${folder}/${name}.svg`;
  },
  // Match the built-in library so icons inherit the current text color.
  mutator: (svg: SVGElement) => {
    if (!svg.hasAttribute('fill')) {
      svg.setAttribute('fill', 'currentColor');
    }
  },
});

import './pages/app-notes/app-notes';
import './components/app-header';
import './components/offline-indicator';
import './components/install-banner';
import { router } from './router';

import { appIndexStyles } from './app-index.styles';

@customElement('app-index')
export class AppIndex extends LitElement {
  static styles = [appIndexStyles];

  firstUpdated() {
    router.addEventListener('route-changed', () => {
      if ('startViewTransition' in document) {
        (document as any).startViewTransition(() => this.requestUpdate());
      } else {
        this.requestUpdate();
      }
    });
  }

  render() {
    return html`
      <app-header></app-header>
      <offline-indicator></offline-indicator>
      <main>${router.render()}</main>
      <install-banner></install-banner>
    `;
  }
}
