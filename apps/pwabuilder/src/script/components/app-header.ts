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
        font-size: var(--subheader-font-size);
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

      .link {
        text-decoration: none;
      }

      .link:visited, .link:active, .link:link {
        color: #777777;
      }

      sl-menu {
        display: flex;
        flex-direction: column;
        background-color: white;
        gap: 5px;
        color: #777777;
        font-size: 16px;
        padding: 15px;
        border-radius: 5px;
      }

      sl-menu-item::part(checked-icon), sl-menu-item::part(submenu-icon) {
        display: none;
      }

      sl-menu-item::part(base){
        color: var(--font-color);
        text-decoration: none;
        border-bottom: none;
        font-size: 16px;
        margin: 0;
        padding: 5px;
      }

      sl-menu-item::part(base):hover + sl-menu-item::part(label) {
        background-color: unset;
        color: var(--primary-color);
      }

      sl-dropdown {
        position: relative;
        
      }
      sl-dropdown::part(base){
        box-shadow: 0px 16px 24px 0px #00000026;
      }

      .col-header {
        text-decoration: none;
        margin: 0;
        white-space: nowrap;
        font-weight: bold;
        color: #777777;
        padding: 0 5px;
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
    window.location.href = "/";
    recordPWABuilderProcessStep(`header.logo_clicked`, AnalyticsBehavior.ProcessCheckpoint);
  }

  showMenu(){
    let menu = this.shadowRoot!.querySelector("sl-dropdown");
    if(menu!.open){
      recordPWABuilderProcessStep(`header.community_dropdown_closed`, AnalyticsBehavior.ProcessCheckpoint)
      menu!.hide()
    } else {
      recordPWABuilderProcessStep(`header.community_dropdown_expanded`, AnalyticsBehavior.ProcessCheckpoint)
      menu!.show();

    }
  }

  render() {
    return html`
      <header part="header">
       
          <img id="header-icon" tabindex="0" src="/assets/logos/header_logo.png" 
          alt="PWABuilder logo" @click=${() => this.recordGoingHome()}/>
       

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
          <sl-dropdown distance="5">
            <button slot="trigger" type="button" @mouseover=${() => this.showMenu()} class="nav_link nav_button"><span>Community</span></button>
            
            
            <sl-menu>
                <p class="col-header">Check out our Blogs</p>
                <sl-menu-item><a 
                class="link"
                href="https://blog.pwabuilder.com"
                target="__blank"
                aria-label="PWABuilder Blog, will open in separate tab"
                rel="noopener"
                @click=${() => recordPWABuilderProcessStep(`header.blog_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
                >PWABuilder Blogs</a></sl-menu-item>
                <p class="col-header">Follow us on</p>
                <sl-menu-item><a 
                  class="link" 
                  href="https://github.com/pwa-builder/PWABuilder"
                  target="__blank"
                  aria-label="PWABuilder Github repo, will open in separate tab"
                  rel="noopener"
                  @click=${() => recordPWABuilderProcessStep(`header.github_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
                  >
                  Github
                </a></sl-menu-item>
                <sl-menu-item><a 
                  class="link" 
                  href="https://twitter.com/pwabuilder"
                  target="__blank"
                  aria-label="PWABuilder Twitter, will open in separate tab"
                  rel="noopener"
                  @click=${() => recordPWABuilderProcessStep(`header.twitter_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
                  >
                  Twitter
                </a></sl-menu-item>
                <sl-menu-item><a 
                  class="link" 
                  href="https://aka.ms/pwabuilderdiscord"
                  target="__blank"
                  aria-label="Invitation link to PWABuilder Discord server, will open in separate tab"
                  rel="noopener"
                  @click=${() => recordPWABuilderProcessStep(`header.discord_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
                  >
                  Discord
                </a></sl-menu-item>
            </sl-menu>
          </sl-dropdown>
        </nav>
      </header>
    `;
  }
}
