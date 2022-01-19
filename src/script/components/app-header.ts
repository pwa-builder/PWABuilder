import { Router } from '@vaadin/router';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import {
  xxxLargeBreakPoint,
  xxLargeBreakPoint,
  xLargeBreakPoint,
  largeBreakPoint,
  mediumBreakPoint,
  smallBreakPoint,
} from '../utils/css/breakpoints';

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) heading = 'PWABuilder';

  static get styles() {
    return css`
      :host {
        --header-background: transparent;
        --header-border: rgba(0, 0, 0, 0.25) solid 1px;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 16px;
        padding-right: 16px;
        background: var(--header-background);
        color: white;
        height: 71px;

        border-bottom: var(--header-border);
      }

      header img {
        cursor: pointer;
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

        font-size: 18px;
      }

      fast-anchor:focus {
        outline: solid;
        outline-width: 2px;
      }

      nav fast-anchor::part(control) {
        color: var(--font-color);
        text-decoration: none;
        border-bottom: none;
        font-weight: var(--font-bold);
      }

      #resources span {
        display: inline-block;
        height: 18px;
        border-bottom: 1px solid transparent;
      }
    
      #resources:hover span{
        border-color: var(--font-color);
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

      @media (prefers-color-scheme: light) {
        header {
          color: black;
        }
      }

      ${smallBreakPoint(css`
        header nav {
          display: none;
        }

        #desktop-nav {
          display: none;
        }

        #mobile-nav {
          display: flex;
        }

        nav fast-anchor::part(control) {
          color: white;
        }
      `)}

      ${mediumBreakPoint(css`
        header nav {
          display: initial;
        }

        #desktop-nav {
          display: flex;
        }

        #mobile-nav {
          display: none;
        }

        nav fast-anchor::part(control) {
          color: white;
        }
      `)}
      

      ${largeBreakPoint(css`
        #desktop-nav {
          display: flex;
        }

        #mobile-nav {
          display: none;
        }

        nav fast-anchor::part(control) {
          color: white;
        }
      `)}

      ${xLargeBreakPoint(css`
        header {
          padding-left: 1em;
          padding-right: 1em;
        }
      `)}

      ${xxLargeBreakPoint(css`
        header {
          padding-left: 3em;
          padding-right: 3em;
        }
      `)}

      ${xxxLargeBreakPoint(css`
        header {
          background-color: white;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    // Cant seem to type `event` as a KeyboardEvent without TypeScript complaining
    // with an error I dont fully understand.
    // revisit: Justin
    this.shadowRoot?.querySelector('#header-icon')?.addEventListener("keydown", (event) => {
      // casting here because of type problem described above
      if ((event as KeyboardEvent).key === "Enter") {
        this.goBack();
      }
    })
  }

  goBack() {
    const pathName = location.pathname;

    if (pathName === '/' || pathName === '/reportcard') {
      Router.go('/');
    } else {
      window.history.back();
    }
  }

  render() {
    return html`
      <header part="header">
        <img @click="${this.goBack}" tabindex="0" id="header-icon" src="/assets/images/header_logo.svg"
          alt="PWA Builder logo" />
      
        <nav id="desktop-nav">
          <fast-anchor
            id="resources"
            appearance="hypertext"
            href="https://blog.pwabuilder.com"
            target="__blank"
            aria-label="Resources, will open in separate tab"
            rel="noopener"
            ><span>Resources</span></fast-anchor
          >

          <fast-anchor
            appearance="hypertext"
            href="https://github.com/pwa-builder/PWABuilder"
            target="__blank"
            aria-label="Github repo, will open in separate tab"
            rel="noopener"
          >
            <ion-icon role="presentation" aria-hidden="true" tab-index="-1" name="logo-github"></ion-icon>
          </fast-anchor>
        </nav>
      </header>
    `;
  }
}
