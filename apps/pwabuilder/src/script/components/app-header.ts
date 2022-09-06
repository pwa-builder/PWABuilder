import { Router } from '@vaadin/router';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  AnalyticsBehavior,
  recordPWABuilderProcessStep,
} from '../utils/analytics';
import { signInUser, signOutUser } from '../services/sign-in';

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

      .nav_link span {
        display: inline-block;
        height: 18px;
        border-bottom: 1px solid transparent;
      }

      .nav_link:hover span {
        border-color: var(--font-color);
      }

      nav ion-icon {
        font-size: 2em;
      }

      #desktop-nav {
        display: flex;
      }

      @media (prefers-color-scheme: light) {
        header {
          color: black;
        }
      }

      ${smallBreakPoint(css``)}

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
    this.shadowRoot
      ?.querySelector('#header-icon')
      ?.addEventListener('keydown', event => {
        // casting here because of type problem described above
        if ((event as KeyboardEvent).key === 'Enter') {
          Router.go('/');
        }
      });

    this.shadowRoot
      ?.querySelector('#signin')
      ?.addEventListener('signin-completed', async ev => {
        signInUser();
      });

      this.shadowRoot
      ?.querySelector('#signin')
      ?.addEventListener('signout-completed', async ev => {
        signOutUser();
      });
  }

  recordGoingHome() {
    recordPWABuilderProcessStep(
      `.header.logo_clicked`,
      AnalyticsBehavior.ProcessCheckpoint
    );
  }

  goToDashboard() {
    Router.go('/userDashboard');
  }

  render() {
    return html`
      <header part="header">
        <a href="/" @click=${() => this.recordGoingHome()}>
          <img
            tabindex="0"
            id="header-icon"
            src="/assets/images/header_logo.svg"
            alt="PWABuilder logo"
          />
        </a>

        <pwa-auth
          id="signin"
          microsoftkey="32b653f7-a63a-4ad0-bf58-9e15f5914a34"
          credentialmode="silent"
        >
        </pwa-auth>
        <button
          id="dashboard"
          @click=${() => {
            this.goToDashboard();
          }}
        >
          User dashboard
        </button>
        <nav id="desktop-nav">
          <fast-anchor
            class="nav_link"
            appearance="hypertext"
            href="https://docs.pwabuilder.com"
            target="__blank"
            aria-label="PWABuilder Docs, will open in separate tab"
            rel="noopener"
            @click=${() =>
              recordPWABuilderProcessStep(
                `.header.docs_clicked`,
                AnalyticsBehavior.ProcessCheckpoint
              )}
            ><span>Docs</span></fast-anchor
          >

          <fast-anchor
            class="nav_link"
            appearance="hypertext"
            href="https://blog.pwabuilder.com"
            target="__blank"
            aria-label="PWABuilder Blog, will open in separate tab"
            rel="noopener"
            @click=${() =>
              recordPWABuilderProcessStep(
                `.header.blog_clicked`,
                AnalyticsBehavior.ProcessCheckpoint
              )}
            ><span>Blog</span></fast-anchor
          >

          <fast-anchor
            appearance="hypertext"
            href="https://github.com/pwa-builder/PWABuilder"
            target="__blank"
            aria-label="Github repo, will open in separate tab"
            rel="noopener"
            @click=${() =>
              recordPWABuilderProcessStep(
                `.header.github_clicked`,
                AnalyticsBehavior.ProcessCheckpoint
              )}
          >
            <ion-icon
              role="presentation"
              aria-hidden="true"
              tab-index="-1"
              name="logo-github"
              title="View source on GitHub"
            ></ion-icon>
          </fast-anchor>
        </nav>
      </header>
    `;
  }
