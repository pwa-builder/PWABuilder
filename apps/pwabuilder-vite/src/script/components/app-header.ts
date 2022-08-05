import { Router } from '@vaadin/router';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

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
        --header-background: white;
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

      .nav_link {
        color: var(--font-color);
        text-decoration: none;
        border-bottom: none;
        font-weight: var(--font-bold);
      }

      .nav_link:focus {
        outline: solid;
        outline-width: 2px;
      }

      .nav_link span {
        display: inline-block;
        height: 18px;
        font-size: 20px;
        border-bottom: 1px solid transparent;
      }

      .nav_link:hover span{
        border-color: var(--font-color);
        padding-bottom: 4px;
      }

      nav ion-icon {
        font-size: 2em;
      }

      #desktop-nav {
        display: flex;
      }



      a:visited {
        color: black;
      }

      @media (prefers-color-scheme: light) {
        header {
          color: black;
        }
      }

      ${smallBreakPoint(css`

      `)}

      ${mediumBreakPoint(css`
        header nav {
          display: initial;
        }

        #desktop-nav {
          display: flex;
        }

      `)}


      ${largeBreakPoint(css`
        #desktop-nav {
          display: flex;
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
        Router.go("/");
      }
    })
  }

  recordGoingHome() {
    recordPWABuilderProcessStep(`.header.logo_clicked`, AnalyticsBehavior.ProcessCheckpoint);
  }

  render() {
    return html`
      <header part="header">
        <a href="/" @click=${() => this.recordGoingHome()}>
          <img tabindex="0" id="header-icon" src="/assets/images/header_logo.svg"
          alt="PWABuilder logo" />
        </a>

        <nav id="desktop-nav">
          <a
            class="nav_link"
            appearance="hypertext"
            href="https://docs.pwabuilder.com"
            target="__blank"
            aria-label="PWABuilder Docs, will open in separate tab"
            rel="noopener"
            @click=${() => recordPWABuilderProcessStep(`.header.docs_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
          >
            <span>Docs</span>
          </a>

          <a
            class="nav_link"
            href="https://blog.pwabuilder.com"
            target="__blank"
            aria-label="PWABuilder Blog, will open in separate tab"
            rel="noopener"
            @click=${() => recordPWABuilderProcessStep(`.header.blog_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
          >
            <span>Blog</span>
          </a>

          <a
            href="https://github.com/pwa-builder/PWABuilder"
            target="__blank"
            aria-label="Github repo, will open in separate tab"
            rel="noopener"
            @click=${() => recordPWABuilderProcessStep(`.header.github_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
          >
            <ion-icon role="presentation" aria-hidden="true" tab-index="-1" name="logo-github" title="View source on GitHub"></ion-icon>
          </a>
        </nav>
      </header>
    `;
  }
}
