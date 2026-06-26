import { Router } from '@vaadin/router';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { appHeaderStyles } from './app-header.styles';
import '@awesome.me/webawesome/dist/components/dropdown/dropdown.js';
import '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js';

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) page = 'home';

  static styles = [appHeaderStyles];

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
    let menu = this.shadowRoot!.querySelector("wa-dropdown");
    if(menu!.open){
      recordPWABuilderProcessStep(`header.community_dropdown_closed`, AnalyticsBehavior.ProcessCheckpoint)
      menu!.open = false;
    } else {
      recordPWABuilderProcessStep(`header.community_dropdown_expanded`, AnalyticsBehavior.ProcessCheckpoint)
      menu!.open = true;
    }
  }

  // hacky work around for clicking links with keyboard that are nested in menu items
  // in the future, Web Awesome may make <wa-dropdown-item href> a thing but for now this works.
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
          
            <wa-dropdown distance="5">
            <button slot="trigger" type="button" @mouseover=${() => this.showMenu()} class="nav_link nav_button"><span class="hover-color">Community</span></button>

                <p class="col-header">Follow us on</p>
                <wa-dropdown-item @click=${() => this.handleClickingLink("github_link", "header.github_clicked")}>
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
                </wa-dropdown-item>
                <wa-dropdown-item @click=${() => this.handleClickingLink("twitter_link", "header.twitter_clicked")}>
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
                </wa-dropdown-item>
                <wa-dropdown-item @click=${() => this.handleClickingLink("discord_link", "header.discord_clicked")}>
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
                </wa-dropdown-item>
          </wa-dropdown>
        </nav>
      </header>
    `;
  }
}
