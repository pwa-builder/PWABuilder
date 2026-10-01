import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

import { aboutStyles } from './app-about.styles';
import { styles as sharedStyles } from '../../shared.styles';

interface Capability {
  icon: string;
  title: string;
  detail: string;
}

// Grouped list of the platform features Nimbus exercises, surfaced so visitors
// (and the PWABuilder demo) can see exactly what the web can do today.
const capabilities: Capability[] = [
  {
    icon: 'bolt',
    title: 'Installable & offline',
    detail: 'Web App Manifest + a Workbox service worker precache the app shell so it launches offline.',
  },
  {
    icon: 'database',
    title: 'Local persistence',
    detail: 'Notes, sketches, and photos live together in IndexedDB. Protect local notes requests persistent storage; Export creates a portable backup.',
  },
  {
    icon: 'microchip',
    title: 'Web Workers',
    detail: 'Note analytics and camera image filters run off the main thread on OffscreenCanvas.',
  },
  {
    icon: 'camera',
    title: 'Media capture',
    detail: 'Capture a photo or choose an image, apply worker-powered filters, and attach it to a note.',
  },
  {
    icon: 'pen-nib',
    title: 'Rich input',
    detail: 'Pointer Events with pressure and coalesced samples power the pressure-sensitive sketch pad.',
  },
  {
    icon: 'share-nodes',
    title: 'System integration',
    detail: 'Web Share, Share Target, File Handling, protocol handlers, shortcuts, and app badging.',
  },
  {
    icon: 'microphone',
    title: 'Write and listen',
    detail: 'Dictate into a note, listen with read-aloud, insert a contact, or copy your text to the clipboard.',
  },
  {
    icon: 'compass',
    title: 'Tools with a purpose',
    detail: 'Add a location to a note, keep the screen awake while reading, or send yourself a notification that opens the note.',
  },
];

@customElement('app-about')
export class AppAbout extends LitElement {
  static styles = [sharedStyles, aboutStyles];

  render() {
    return html`
      <div class="page-head">
        <h1>About Nimbus</h1>
        <p>
          Nimbus is your offline-first notebook. Keep thoughts, sketches, and
          photos together, then use tools like dictation and read-aloud to work
          your way. It is also PWABuilder’s demo of what a useful, installable
          web app can do.
        </p>
      </div>

      <wa-card>
        <h2 style="margin-top:0">What it demonstrates</h2>
        <div class="feature-list">
          ${capabilities.map(
            (c) => html`
              <div class="item">
                <wa-icon name="${c.icon}"></wa-icon>
                <div>
                  <strong>${c.title}</strong>
                  <span>${c.detail}</span>
                </div>
              </div>
            `
          )}
        </div>
      </wa-card>

      <h2>Built with PWABuilder</h2>
      <wa-card>
        <p class="muted" style="margin-top:0">
          This app was scaffolded from the
          <strong>pwa-starter</strong> template — Lit, WebAwesome, Vite, and
          Workbox — and can be packaged for the app stores with PWABuilder. Point
          PWABuilder at any URL to score its PWA-readiness and generate native
          packages for the Microsoft Store, Google Play, and iOS.
        </p>
        <div class="links">
          <wa-button variant="brand" href="https://www.pwabuilder.com" target="_blank" rel="noopener">
            <wa-icon slot="prefix" name="rocket"></wa-icon>
            PWABuilder.com
          </wa-button>
          <wa-button appearance="outlined" href="https://github.com/pwa-builder/pwa-starter" target="_blank" rel="noopener">
            <wa-icon slot="prefix" name="github" family="brands"></wa-icon>
            pwa-starter
          </wa-button>
          <wa-button appearance="outlined" href="https://whatpwacando.today" target="_blank" rel="noopener">
            <wa-icon slot="prefix" name="list-check"></wa-icon>
            whatpwacando.today
          </wa-button>
        </div>
      </wa-card>

      <p class="colophon">
        Nimbus is open source and part of the PWABuilder project. Notes and
        attachments are stored on this device, not synced to a server. Export
        important notes as backups. Sharing sends the content you choose, and
        dictation may use your browser’s online speech service.
      </p>
    `;
  }
}
