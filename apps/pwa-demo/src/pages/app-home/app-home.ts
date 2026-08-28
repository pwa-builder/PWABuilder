import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/progress-bar/progress-bar.js';

import { homeStyles } from './app-home.styles';
import { styles as sharedStyles } from '../../shared.styles';
import { resolveRouterPath } from '../../router';
import {
  onInstallStateChange,
  onConnectivityChange,
  getStorageInfo,
  requestPersistentStorage,
  formatBytes,
  promptInstall,
  type StorageInfo,
} from '../../utils/pwa';

interface Feature {
  title: string;
  desc: string;
  icon: string;
  path: string;
}

const features: Feature[] = [
  {
    title: 'Notes',
    desc: 'Write markdown notes saved to IndexedDB. Live analytics run in a Web Worker. Export to disk with the File System Access API.',
    icon: 'note-sticky',
    path: resolveRouterPath('notes'),
  },
  {
    title: 'Sketch',
    desc: 'A pressure-sensitive drawing canvas using Pointer Events. Save, share, or download your art. Go full-screen while you draw.',
    icon: 'pen-nib',
    path: resolveRouterPath('sketch'),
  },
  {
    title: 'Capture',
    desc: 'Snap photos with your camera, apply real-time filters processed off-thread on an OffscreenCanvas, and geotag them.',
    icon: 'camera',
    path: resolveRouterPath('capture'),
  },
  {
    title: 'Superpowers',
    desc: 'A live playground of ~20 web platform capabilities: share, vibrate, sensors, speech, wake lock, badging and more.',
    icon: 'bolt',
    path: resolveRouterPath('powers'),
  },
];

@customElement('app-home')
export class AppHome extends LitElement {
  @state() private online = navigator.onLine;
  @state() private installed = false;
  @state() private canInstall = false;
  @state() private storage: StorageInfo | null = null;

  private unsubs: Array<() => void> = [];

  static styles = [sharedStyles, homeStyles];

  connectedCallback(): void {
    super.connectedCallback();
    this.unsubs.push(
      onConnectivityChange((online) => (this.online = online)),
      onInstallStateChange((state) => {
        this.installed = state.installed;
        this.canInstall = state.canInstall;
      })
    );
    void this.refreshStorage();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubs.forEach((fn) => fn());
    this.unsubs = [];
  }

  private async refreshStorage() {
    this.storage = await getStorageInfo();
  }

  private async makePersistent() {
    await requestPersistentStorage();
    await this.refreshStorage();
  }

  render() {
    const usedPct =
      this.storage && this.storage.quota
        ? Math.min(100, (this.storage.usage / this.storage.quota) * 100)
        : 0;

    return html`
      <div class="hero">
        <h1>Your offline-first pocket studio.</h1>
        <p>
          Nimbus is a Progressive Web App that shows off what the modern web
          platform can do — installable, works offline, and packed with device
          capabilities. Built with the
          <a href="https://github.com/pwa-builder/pwa-starter" style="color:#fff;text-decoration:underline">PWABuilder pwa-starter</a>.
        </p>

        <div class="cta">
          <wa-button
            variant="neutral"
            size="l"
            @click="${() => promptInstall()}"
            ?disabled="${!this.canInstall}"
          >
            <wa-icon slot="prefix" name="download"></wa-icon>
            ${this.installed
              ? 'Installed'
              : this.canInstall
                ? 'Install Nimbus'
                : 'Install (use browser menu)'}
          </wa-button>
          <wa-button variant="brand" size="l" appearance="outlined" href="${resolveRouterPath('powers')}">
            Explore superpowers
            <wa-icon slot="suffix" name="arrow-right"></wa-icon>
          </wa-button>
        </div>

        <div class="chips">
          <span class="chip ${this.online ? 'ok' : ''}">
            <wa-icon name="${this.online ? 'wifi' : 'link-slash'}"></wa-icon>
            ${this.online ? 'Online' : 'Offline'}
          </span>
          <span class="chip ${this.installed ? 'ok' : ''}">
            <wa-icon name="${this.installed ? 'mobile-screen' : 'globe'}"></wa-icon>
            ${this.installed ? 'Installed app' : 'In browser'}
          </span>
          ${this.storage
            ? html`<span class="chip ${this.storage.persisted ? 'ok' : ''}">
                <wa-icon name="database"></wa-icon>
                ${this.storage.persisted ? 'Persistent storage' : 'Best-effort storage'}
              </span>`
            : nothing}
        </div>
      </div>

      <section class="features">
        <h2>Try a tool</h2>
        <div class="grid">
          ${features.map(
            (f) => html`
              <a class="card-link" href="${f.path}">
                <wa-card>
                  <div class="feature">
                    <div class="ic"><wa-icon name="${f.icon}"></wa-icon></div>
                    <h3>${f.title}</h3>
                    <p>${f.desc}</p>
                    <span class="muted" style="font-size:.85rem">
                      Open ${f.title} →
                    </span>
                  </div>
                </wa-card>
              </a>
            `
          )}
        </div>
      </section>

      <section class="status">
        <h2>Device &amp; storage</h2>
        <wa-card>
          ${this.storage
            ? html`
                <div class="storage-row">
                  <span>On-device storage used</span>
                  <span class="mono">
                    ${formatBytes(this.storage.usage)} /
                    ${formatBytes(this.storage.quota)}
                  </span>
                </div>
                <wa-progress-bar value="${usedPct}"></wa-progress-bar>
                <div class="row" style="margin-top:14px">
                  <wa-button
                    size="s"
                    variant="brand"
                    appearance="outlined"
                    ?disabled="${this.storage.persisted}"
                    @click="${this.makePersistent}"
                  >
                    ${this.storage.persisted
                      ? 'Storage is persistent'
                      : 'Request persistent storage'}
                  </wa-button>
                  <span class="muted" style="font-size:.82rem">
                    Persistent storage protects your notes and photos from being
                    evicted.
                  </span>
                </div>
              `
            : html`<p class="muted">
                The Storage API isn't available in this browser.
              </p>`}
        </wa-card>
      </section>
    `;
  }
}
