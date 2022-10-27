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
        z-index: 1;
      }

      header img {
        cursor: pointer;
        width: 100px;
        height: auto;
      }

      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 20px;
        font-weight: bold;
      }

      nav {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 8em;
        gap: .75em;
      }

      .nav_button {
        all: unset;
      }

      .nav_link {
        color: var(--font-color);
        text-decoration: none;
        border-bottom: none;
        font-weight: var(--font-bold);
        font-size: 20px;
        margin: 0;
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
        cursor: pointer;
        border-color: var(--font-color);
        padding-bottom: 4px;
      }

      nav sl-icon {
        font-size: 2em;
      }

      .nav_link:visited {
        color: black;
      }

      .social-box {
        display: flex;
        background-color: white;
        gap: 2em;
        color: #777777;
        font-size: 16px;
        padding: 1em;
        position: relative;
        border-radius: 5px;
      }

      .arrow {
        height: 15px;
        width: 15px;
        transform: rotate(45deg);
        background-color: white;
        position: absolute;
        top: -5px;
        right: 45px;
      }

      .col {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .col-header {
        text-decoration: none;
        margin: 0;
        white-space: nowrap;
        font-weight: bold;
        color: #777777;
      }

      .link {
        text-decoration: none;
      }

      .link:visited, .link:active, .link:link {
        color: #777777;
      }

      .link:hover {
        cursor: pointer;
        text-decoration: underline;
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
    recordPWABuilderProcessStep(`header.logo_clicked`, AnalyticsBehavior.ProcessCheckpoint);
  }

  showMenu(){
    recordPWABuilderProcessStep(`header.community_dropdown_expanded`, AnalyticsBehavior.ProcessCheckpoint)
    let menu = this.shadowRoot!.querySelector("sl-dropdown");
    menu!.show();
  }

  render() {
    return html`
      <header part="header">
        <a href="/" @click=${() => this.recordGoingHome()}>
          <img tabindex="0" id="header-icon" src="/assets/logos/header_logo.png"
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
            @click=${() => recordPWABuilderProcessStep(`header.docs_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
          >
            <span>Docs</span>
          </a>
          <sl-dropdown distance="10">
            <button slot="trigger" type="button" @mouseover=${() => this.showMenu()} class="nav_link nav_button"><span>Community</span></button>
            <div class="social-box">
              <div class="arrow" role="presentation"></div>
              <div class="col">
                <a 
                class="col-header"
                href="https://blog.pwabuilder.com"
                target="__blank"
                aria-label="PWABuilder Blog, will open in separate tab"
                rel="noopener"
                @click=${() => recordPWABuilderProcessStep(`header.blog_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
                >Blogs</a>
              </div>
              <div class="col">
                <p class="col-header">Follow us on</p>
                <a 
                  class="link" 
                  href="https://github.com/pwa-builder/PWABuilder"
                  target="__blank"
                  aria-label="PWABuilder Github repo, will open in separate tab"
                  rel="noopener"
                  @click=${() => recordPWABuilderProcessStep(`header.github_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
                  >
                  Github
                </a>
                <a 
                  class="link" 
                  href="https://twitter.com/pwabuilder"
                  target="__blank"
                  aria-label="PWABuilder Twitter, will open in separate tab"
                  rel="noopener"
                  @click=${() => recordPWABuilderProcessStep(`header.twitter_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
                  >
                  Twitter
                </a>
                <a 
                  class="link" 
                  href="https://aka.ms/pwabuilderdiscord"
                  target="__blank"
                  aria-label="Invitation link to PWABuilder Discord server, will open in separate tab"
                  rel="noopener"
                  @click=${() => recordPWABuilderProcessStep(`header.discord_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
                  >
                  Discord
                </a>
              </div>
            </div>
          </sl-dropdown>
        </nav>
      </header>
    `;
  }
}
