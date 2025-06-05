import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { manifest_fields } from '@pwabuilder/manifest-information';
import {
  smallBreakPoint,
} from '../utils/css/breakpoints';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';

@customElement('manifest-info-card')
export class ManifestInfoCard extends LitElement {
  @property({ type: String }) field: string = "";
  @property({ type: String }) placement:  "" |"top" | "top-start" | "top-end" | "right" | "right-start" | "right-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" = "";
  @state() currentlyHovering: boolean = false;
  @state() currentlyOpen: boolean = false;
  @state() hoverTimer: any;

  static get styles() {
    return [
    css`
    
      .mic-wrapper {
        display: flex;
        flex-direction: column;
      }

      .info-box {
        background-color: var(--font-color);
        width: 340px;
        color: #ffffff;
        padding: 10px;
        border-radius: 0;
        border-top-left-radius: var(--card-border-radius);
        border-top-right-radius: var(--card-border-radius);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .info-box p {
        margin: 0;
        font-size: 16px;
        font-family: var(--font-family);
      }

      .right {
        background-color: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .right:hover {
        cursor: pointer;
      }

      .image-section {
        background: linear-gradient(93.16deg, #EAECF4 16%, #CED0EC 87.75%);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .image-section img {
        padding: 10px 20px;
        width: 300px;
        height: auto;
      }

      .mic-actions {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        margin: 5px 0;
      }

      .learn-more {
        line-height: 17px;
        display: block;
        width: 100%;
      }

      .learn-more:visited, .learn-more:active, .learn-more:link {
        color: #ffffff;
      }

      .eim {
        background-color: transparent;
        border: none;
        color: #ffffff;
        padding: 0;
        text-decoration: underline;
        height: 25px;
        display: flex;
        align-items: center;
        font-weight: 700;
        font-size: 14px;
        font-family: var(--font-family);
      }

      .eim:hover {
        cursor: pointer;
      }

      sl-menu {
        background-color: var(--font-color);
        border: none;
        padding: 10px;
        padding-top: 0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        gap: 15px;
        margin: 0;
        border-radius: 0;
        border-bottom-left-radius: var(--card-border-radius);
        border-bottom-right-radius: var(--card-border-radius);
      }

      sl-menu-item {
        border: 1px solid transparent;
      }

      sl-menu-item::part(checked-icon), sl-menu-item::part(submenu-icon) {
        display: none;
      }

      sl-menu-item::part(base){
        color: #ffffff;
        font-size: var(--card-body-font-size);
        font-weight: bold;
        font-family: var(--font-family);
        padding: 0;
        text-decoration: underline;
      }

      sl-menu-item:hover, sl-menu-item::part(base) {
        background-color: unset;
      }

      sl-menu-item:focus {
        border: 1px solid #ffffff;
      }

      /* < 480px */
      ${smallBreakPoint(css`
        .info-box{
          width: 240px;
        }

        .image-section img {
          width: 200px;
        }
      `)}

    `
    ];
  }

  constructor() {
    super();
  }

  firstUpdated(){

  }

  openME(){
    // general counter
    recordPWABuilderProcessStep(`manifest_tooltip.open_editor_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    // specific counter
    recordPWABuilderProcessStep(`manifest_tooltip.${this.field}_open_editor_clicked`, AnalyticsBehavior.ProcessCheckpoint);

    (this.shadowRoot!.querySelector(".tooltip") as unknown as SlDropdown).hide()
    let tab: string = manifest_fields[this.field].location!;
    let event: CustomEvent = new CustomEvent('open-manifest-editor', {
      detail: {
          field: this.field,
          tab: tab
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  trackLearnMoreAnalytics(){
    // general counter
    recordPWABuilderProcessStep(`manifest_tooltip.learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);
    //specific field counter
    recordPWABuilderProcessStep(`manifest_tooltip.${this.field}_learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);
  }


  // opens tooltip
  handleHover(entering: boolean){
    this.currentlyHovering = entering;
    let tooltip = (this.shadowRoot!.querySelector("sl-dropdown") as unknown as SlDropdown)
    let myEvent = new CustomEvent('trigger-hover',
      {
        detail: {
          tooltip: tooltip,
          entering: entering
        },
        bubbles: true,
        composed: true
      });
    if(!entering){
      setTimeout(() => { this.closeTooltip(myEvent) }, 250)
    } else {
      this.hoverTimer = setTimeout(() => { this.dispatchEvent(myEvent) }, 750)
    }
  }

  handleClick(){
    let tooltip = (this.shadowRoot!.querySelector("sl-dropdown") as unknown as SlDropdown);
    if(!tooltip.open){
      tooltip.show();
    }
    this.currentlyOpen = tooltip.open;
  }

  closeTooltip(e: CustomEvent){
    if(!this.currentlyHovering){
      clearTimeout(this.hoverTimer);
      this.dispatchEvent(e);
    }
  }

  // hacky work around for clicking links with keyboard that are nested in menu items
  // in the future, shoelace may make <sl-menu-item href> a thing but for now this works.
  handleClickingLink(linkTag: string){
    const anchor: HTMLAnchorElement = this.shadowRoot!.querySelector('a[data-tag="' + linkTag + '"]')!;
    anchor.click();
    this.trackLearnMoreAnalytics();
  }

  render() {
    return html`
    <div class="mic-wrapper" @mouseenter=${() => this.handleHover(true)} @mouseleave=${() => this.handleHover(false)}>
      ${this.placement !== "" ?
        html`
          <sl-dropdown
            distance="10"
            placement="${this.placement}"
            class="tooltip"
            @sl-hide=${() => this.handleHover(false)}
          >
          <slot name="trigger" slot="trigger"></slot>
          <div class="info-box">
            ${manifest_fields[this.field].description.map((line: String) => html`<p class="info-blurb">${line}</p>`)}
            ${manifest_fields[this.field].image ?

              html`
                <div class="image-section">
                  <img src="${manifest_fields[this.field].image!}" alt=${`example of ${this.field} in use.`} />
                </div>
              ` :
              null

            }
            
          </div>
          <sl-menu>
            <sl-menu-item  @click=${() => this.handleClickingLink(this.field)}><a class="learn-more" data-tag=${this.field} href="${manifest_fields[this.field].docs_link ?? "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer">Learn More</a></sl-menu-item>
            ${manifest_fields[this.field].location ? html`<sl-menu-item @click=${() => this.openME()}>Edit in Manifest</sl-menu-item>` : null}
          </sl-menu>
        </sl-dropdown>
        ` :
        html`
          <sl-dropdown
            distance="10"
            class="tooltip"
            @sl-hide=${() => this.handleHover(false)}
          >
          <slot name="trigger" slot="trigger"></slot>
          <div class="info-box">
            ${manifest_fields[this.field].description.map((line: String) => html`<p class="info-blurb">${line}</p>`)}
            ${manifest_fields[this.field].image ?

              html`
                <div class="image-section">
                  <img src="${manifest_fields[this.field].image!}" alt=${`example of ${this.field} in use.`} />
                </div>
              ` :
              null

            }
            >
            <sl-menu>
            <sl-menu-item  @click=${() => this.handleClickingLink(this.field)}><a class="learn-more" data-tag=${this.field} href="${manifest_fields[this.field].docs_link ?? "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer">Learn More</a></sl-menu-item>
              ${manifest_fields[this.field].location ? html`<sl-menu-item @click=${() => this.openME()}>Edit in Manifest</sl-menu-item>` : null}
          </sl-menu>
          </div>
        </sl-dropdown>
        `}


    </div>
    `;
  }
}
