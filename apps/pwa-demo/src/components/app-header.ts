import { LitElement, css, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';

import '@awesome.me/webawesome/dist/components/icon/icon.js';

const links: Array<{ label: string; path: string; icon: string }> = [
  { label: 'Home', path: resolveRouterPath(), icon: 'house' },
  { label: 'Notes', path: resolveRouterPath('notes'), icon: 'note-sticky' },
  { label: 'Sketch', path: resolveRouterPath('sketch'), icon: 'pen-nib' },
  { label: 'Capture', path: resolveRouterPath('capture'), icon: 'camera' },
  { label: 'Superpowers', path: resolveRouterPath('powers'), icon: 'bolt' },
  { label: 'About', path: resolveRouterPath('about'), icon: 'circle-info' },
];

@customElement('app-header')
export class AppHeader extends LitElement {
  // Re-render on navigation so the active link highlight stays in sync.
  @state() private current = window.location.pathname;

  connectedCallback(): void {
    super.connectedCallback();
    const nav = (window as any).navigation;
    if (nav) {
      nav.addEventListener('navigatesuccess', this.syncCurrent);
    } else {
      window.addEventListener('popstate', this.syncCurrent);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    const nav = (window as any).navigation;
    if (nav) {
      nav.removeEventListener('navigatesuccess', this.syncCurrent);
    } else {
      window.removeEventListener('popstate', this.syncCurrent);
    }
  }

  private syncCurrent = () => {
    this.current = window.location.pathname;
  };

  static styles = css`
    header {
      display: flex;
      align-items: center;
      gap: 12px;
      box-sizing: border-box;
      background: var(--nimbus-gradient);
      color: #fff;
      padding: 0 14px;
      position: fixed;
      left: env(titlebar-area-x, 0);
      top: env(titlebar-area-y, 0);
      height: env(titlebar-area-height, var(--nimbus-header-height));
      width: env(titlebar-area-width, 100%);
      z-index: 20;
      box-shadow: 0 2px 18px rgba(2, 32, 71, 0.28);
      -webkit-app-region: drag;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 9px;
      font-weight: 700;
      font-size: 1.05rem;
      letter-spacing: -0.01em;
      text-decoration: none;
      color: #fff;
      -webkit-app-region: no-drag;
      flex: none;
    }

    .brand img {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }

    nav {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-left: auto;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-app-region: no-drag;
    }

    nav::-webkit-scrollbar {
      display: none;
    }

    a.link {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: #eaf4ff;
      text-decoration: none;
      font-size: 0.9rem;
      padding: 8px 12px;
      border-radius: 999px;
      white-space: nowrap;
      transition: background 0.15s ease, color 0.15s ease;
    }

    a.link:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
    }

    a.link[aria-current='page'] {
      background: rgba(255, 255, 255, 0.24);
      color: #fff;
      font-weight: 600;
    }

    a.link .label {
      display: none;
    }

    @media (min-width: 720px) {
      a.link .label {
        display: inline;
      }
    }
  `;

  render() {
    return html`
      <header>
        <a class="brand" href="${resolveRouterPath()}">
          <img src="/assets/icons/icon_192.png" alt="" />
          <span>Nimbus</span>
        </a>
        <nav aria-label="Primary">
          ${links.map(
            (l) => html`
              <a
                class="link"
                href="${l.path}"
                aria-current="${this.current === l.path ? 'page' : nothing}"
              >
                <wa-icon name="${l.icon}"></wa-icon>
                <span class="label">${l.label}</span>
              </a>
            `
          )}
        </nav>
      </header>
    `;
  }
}
