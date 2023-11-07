import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { service_worker_fields } from '@pwabuilder/manifest-information';
import {
  smallBreakPoint,
} from '../utils/css/breakpoints';
import { SlDropdown } from '@shoelace-style/shoelace';

@customElement('sw-info-card')
export class ServiceWorkerInfoCard extends LitElement {
  @property({ type: String }) field: string = "";
  @property({ type: String }) placement:  "" |"top" | "top-start" | "top-end" | "right" | "right-start" | "right-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" = "";
  @state() currentlyHovering: boolean = false;
  @state() hoverTimer: any;

  static get styles() {
    return [
    css`

      .mic-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .info-box {
        background-color: var(--font-color);
        width: 340px;
        color: #ffffff;
        padding: 10px;
        border-radius: var(--card-border-radius);
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
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

      .learn-more {
        line-height: 17px;
        display: block;
        width: 100%;
      }

      .learn-more:visited, .learn-more:active, .learn-more:link {
        color: #ffffff;
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

  trackLearnMoreAnalytics(){
    // general counter
    recordPWABuilderProcessStep(`service_worker.learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);

    //specific field counter
    recordPWABuilderProcessStep(`service_worker.${this.field}_learn_more_clicked`, AnalyticsBehavior.ProcessCheckpoint);
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
          class="tooltip"
          placement=${this.placement}
          @sl-hide=${() => this.handleHover(false)}
        >
          <slot name="trigger" slot="trigger"></slot>
          <div class="info-box">
            ${service_worker_fields[this.field].description.map((line: String) => html`<p class="info-blurb">${line}</p>`)}
          </div>
          <sl-menu>
            <sl-menu-item @click=${() => this.handleClickingLink(this.field)}><a class="learn-more" data-tag=${this.field} href="${service_worker_fields[this.field].docs_link ?? "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer">Learn More</a></sl-menu-item>
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
            ${service_worker_fields[this.field].description.map((line: String) => html`<p class="info-blurb">${line}</p>`)}
          </div>
          <sl-menu>
            <sl-menu-item @click=${() => this.handleClickingLink(this.field)}><a class="learn-more" data-tag=${this.field} href="${service_worker_fields[this.field].docs_link ?? "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer">Learn More</a></sl-menu-item>
          </sl-menu>
        </sl-dropdown>
        `
      }

    </div>
    `;
  }
}
