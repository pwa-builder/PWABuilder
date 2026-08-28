import { LitElement, css, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { onConnectivityChange } from '../utils/pwa';

// A small pill that appears only while offline, so users know the app still
// works without a connection.
@customElement('offline-indicator')
export class OfflineIndicator extends LitElement {
  @state() private online = navigator.onLine;
  private unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.unsub = onConnectivityChange((online) => {
      this.online = online;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsub?.();
  }

  static styles = css`
    .pill {
      position: fixed;
      top: calc(var(--nimbus-header-height) + 8px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 30;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #b45309;
      color: #fff;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.82rem;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
      animation: drop 0.25s ease;
    }

    @keyframes drop {
      from {
        opacity: 0;
        transform: translate(-50%, -6px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
  `;

  render() {
    return this.online
      ? nothing
      : html`<div class="pill" role="status">
          <wa-icon name="link-slash" variant="solid"></wa-icon>
          Offline — Nimbus still works
        </div>`;
  }
}
