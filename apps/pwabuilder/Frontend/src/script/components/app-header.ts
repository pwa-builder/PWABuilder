import { Router } from '@vaadin/router';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import {
  xxxLargeBreakPoint,
  xxLargeBreakPoint,
  xLargeBreakPoint,
  largeBreakPoint,
  mediumBreakPoint,
  smallBreakPoint,
  xSmallBreakPoint,
} from '../utils/css/breakpoints';

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) page = 'home';

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
      }

      .nav_link:hover span{
        cursor: pointer;
      }

      nav sl-icon {
        font-size: 2em;
      }

      .nav_link:visited {
        color: black;
      }

      .link {
        display: block;
        width: 100%;
        text-decoration: none;
      }

      .link:visited, .link:active, .link:link {
        color: #777777;
      }

      .hover-color:hover {
        color: var(--primary-color);
      }

      sl-menu {
        display: flex;
        flex-direction: column;
        background-color: white;
        gap: 5px;
        color: #777777;
        font-size: 16px;
        border-radius: 5px;
        height: fit-content;
        width: 136px;
        padding: 16px 22px;
      }

      sl-menu-item::part(checked-icon), sl-menu-item::part(submenu-icon) {
        display: none;
      }

      sl-menu-item::part(base){
        color: #777777;
        text-decoration: none;
        border-bottom: none;
        font-size: 14px;
        margin: 0;
        padding: 0;
      }

      sl-menu-item::part(base):hover sl-menu-item::part(label) {
        background-color: unset;
        color: var(--primary-color);
      }

      sl-menu-item:focus-visible::part(base) {
        color: var(--primary-color);
        background-color: transparent;
        
      }

      sl-menu-item:hover::part(base) {
        color: var(--primary-color);
        background-color: transparent;
        font-weight: 700;
      }

      sl-menu-item:focus-visible .link, sl-menu-item:hover .link {
        color: var(--primary-color);
        background-color: transparent;
        font-weight: 700;
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
        padding: 0;
        font-size: 14px;
      }

      @media (prefers-color-scheme: light) {
        header {
          color: black;
        }
      }

      ${xSmallBreakPoint(css`
        header {
          padding-left: 8px;
          padding-right: 8px;
        }

        header img {
          width: 60px;
        }

        nav {
          width: auto;
          gap: 0.5em;
        }

        .nav_link span {
          font-size: 16px;
        }
      `)}

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

  // hacky work around for clicking links with keyboard that are nested in menu items
  // in the future, shoelace may make <sl-menu-item href> a thing but for now this works.
  handleClickingLink(linkTag: string, analyticsString: string){
    const anchor: HTMLAnchorElement = this.shadowRoot!.querySelector('[data-tag="' + linkTag + '"]')!;
    anchor.click();
    recordPWABuilderProcessStep(analyticsString, AnalyticsBehavior.ProcessCheckpoint)
  }

  render() {
    return html`
      <header part="header">
       
          <img id="header-icon" tabindex="0" src="/assets/logos/header_logo.png" 
          alt="PWABuilder logo" @click=${() => this.recordGoingHome()}/>
       

        <nav id="desktop-nav">
        ${this.page === "home" ? 
          html`
            <a
              class="nav_link"
              appearance="hypertext"
              href="https://blog.pwabuilder.com"
              aria-label="PWABuilder Blog, will open in separate tab"
              rel="noopener"
              @click=${() => recordPWABuilderProcessStep(`header.blog_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
            >
              <span class="hover-color">Blog</span>
            </a>
            <a
              class="nav_link"
              appearance="hypertext"
              href="https://docs.pwabuilder.com"
              target="_blank"
              aria-label="PWABuilder Docs, will open in separate tab"
              rel="noopener"
              @click=${() => recordPWABuilderProcessStep(`header.docs_clicked`, AnalyticsBehavior.ProcessCheckpoint)}
            >
              <span class="hover-color">Docs</span>
            </a>
          ` : null
        }
          
          <sl-dropdown distance="5">
            <button slot="trigger" type="button" @mouseover=${() => this.showMenu()} class="nav_link nav_button"><span class="hover-color">Community</span></button>
            
            <sl-menu>
                <p class="col-header">Follow us on</p>
                <sl-menu-item @click=${() => this.handleClickingLink("github_link", "header.github_clicked")}>
                  <a 
                    class="link" 
                    href="https://github.com/pwa-builder/PWABuilder"
                    target="_blank"
                    aria-label="PWABuilder Github repo, will open in separate tab"
                    rel="noopener"
                    data-tag="github_link"
                  >
                    Github
                  </a>
                </sl-menu-item>
                <sl-menu-item @click=${() => this.handleClickingLink("twitter_link", "header.twitter_clicked")}>
                  <a 
                    class="link" 
                    href="https://x.com/pwabuilder"
                    target="_blank"
                    aria-label="PWABuilder on X, will open in separate tab"
                    rel="noopener"
                    data-tag="twitter_link"
                  >
                    X
                  </a>
                </sl-menu-item>
                <sl-menu-item @click=${() => this.handleClickingLink("discord_link", "header.discord_clicked")}>
                  <a 
                    class="link" 
                    href="https://aka.ms/pwabuilderdiscord"
                    target="_blank"
                    aria-label="Invitation link to PWABuilder Discord server, will open in separate tab"
                    rel="noopener"
                    data-tag="discord_link"
                  >
                    Discord
                  </a>
                </sl-menu-item>
            </sl-menu>
          </sl-dropdown>
        </nav>
      </header>
    `;
  }
}
