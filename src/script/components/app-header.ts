import { LitElement, css, html, customElement, property } from 'lit-element';

import {
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
        padding-left: 41px;
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
      }

      nav fast-anchor::part(control) {
        color: var(--font-color);
        text-decoration: none;
        border-bottom: none;
        font-weight: var(--font-bold);
      }

      @media(prefers-color-scheme: light) {
        header {
          color: black;
        }
      }

      ${
        smallBreakPoint(css`
          header {
            padding-left: 16px;
          }
        `)
      }

      ${
        mediumBreakPoint(css`
          header {
            padding-left: 16px;
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

        <nav>
          <fast-anchor appearance="hypertext" href="./about">Resources</fast-anchor>
        </nav>
      </header>
    `;
  }
}
