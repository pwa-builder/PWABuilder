import { LitElement, css, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { onInstallStateChange, promptInstall } from '../utils/pwa';

import '@awesome.me/webawesome/dist/components/button/button.js';

// A dismissible banner that surfaces the native install prompt when the
// browser makes one available.
@customElement('install-banner')
export class InstallBanner extends LitElement {
  @state() private canInstall = false;
  @state() private dismissed = sessionStorage.getItem('nimbus-install-dismissed') === '1';
  private unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.unsub = onInstallStateChange((state) => {
      this.canInstall = state.canInstall && !state.installed;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsub?.();
  }

  private async install() {
    await promptInstall();
  }

  private dismiss() {
    this.dismissed = true;
    sessionStorage.setItem('nimbus-install-dismissed', '1');
  }

  static styles = css`
    .banner {
      position: fixed;
      left: 16px;
      right: 16px;
      bottom: 16px;
      margin: 0 auto;
      max-width: 520px;
      z-index: 25;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      border-radius: 16px;
      color: #fff;
      background: var(--nimbus-gradient);
      box-shadow: 0 12px 34px rgba(2, 32, 71, 0.4);
      animation: rise 0.25s ease;
    }

    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
    }

    img {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      flex: none;
    }

    .text {
      flex: 1;
      min-width: 0;
    }

    .text strong {
      display: block;
      font-size: 0.95rem;
    }

    .text span {
      font-size: 0.8rem;
      opacity: 0.9;
    }

    .close {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 1.1rem;
      opacity: 0.85;
      padding: 4px;
    }

    .close:hover {
      opacity: 1;
    }
  `;

  render() {
    if (!this.canInstall || this.dismissed) {
      return nothing;
    }
    return html`
      <div class="banner" role="dialog" aria-label="Install Nimbus">
        <img src="${import.meta.env.BASE_URL}assets/icons/icon_192.png" alt="" />
        <div class="text">
          <strong>Install Nimbus</strong>
          <span>Add it to your device for a full-screen, offline experience.</span>
        </div>
        <wa-button size="s" variant="neutral" @click="${this.install}">
          Install
        </wa-button>
        <button class="close" aria-label="Dismiss" @click="${this.dismiss}">
          &times;
        </button>
      </div>
    `;
  }
}
