import { LitElement, css, html, customElement, property } from 'lit-element';

import {
  xxLargeBreakPoint,
  xLargeBreakPoint,
  largeBreakPoint,
  mediumBreakPoint,
  smallBreakPoint,
} from '../utils/breakpoints';

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'PWABuilder';

  static get styles() {
    return css`
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 16px;
        padding-right: 16px;
        background: transparent;
        color: white;
        height: 71px;
      }

      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 20px;
        font-weight: bold;
      }

      nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 8em;
      }

      nav fast-anchor::part(control) {
        color: var(--font-color);
        text-decoration: none;
        border-bottom: none;
        font-weight: var(--font-bold);
      }

      nav ion-icon {
        font-size: 2em;
      }

      #desktop-nav {
        display: flex;
      }

      #mobile-nav {
        display: none;
        width: initial;
      }

      #mobile-nav fast-button::part(control) {
        color: black;
      }

      @media(prefers-color-scheme: light) {
        header {
          color: black;
        }
      }

      ${
        smallBreakPoint(css`
          header nav {
            display: none;
          }

          #desktop-nav {
            display: none;
          }

          #mobile-nav {
            display: flex;
          }
        `)
      }

      ${
        mediumBreakPoint(css`
          header nav {
            display: initial;
          }

          #desktop-nav {
            display: flex;
          }

          #mobile-nav {
            display: none;
          }
        `)
      }

      ${largeBreakPoint(css`
        #desktop-nav {
          display: flex;
        }

        #mobile-nav {
          display: none;
        }
      `)}

      ${
        xLargeBreakPoint(css`
          header {
            padding-left: 1em;
            padding-right: 1em;
          }
        `)
      }

      ${
        xxLargeBreakPoint(css`
          header {
            padding-left: 3em;
            padding-right: 3em;
          }
        `)
      }

    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <header>
        <img id="header-icon" src="/assets/images/header_logo.png" alt="header logo">

        <nav id="desktop-nav">
          <fast-anchor appearance="hypertext" href="./about">Resources</fast-anchor>

          <fast-anchor appearance="hypertext" href="https://github.com/pwa-builder/PWABuilder">
            <ion-icon name="logo-github"></ion-icon>
          </fast-anchor>
        </nav>

        <nav id="mobile-nav">
          <fast-button appearance="lightweight">
            <ion-icon name="menu-outline"></ion-icon>
          </fast-button>
        </nav>
      </header>
    `;
  }
}
