import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
// import { AuthModule } from '../services/auth_service';
import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';
import { manifest_fields, service_worker_fields } from '@pwabuilder/manifest-information';
//import { recordPWABuilderProcessStep } from '../utils/analytics';
import './manifest-info-card'
import './sw-info-card'

@customElement('todo-item')
export class TodoItem extends LitElement {
  @property({ type: String }) field: string = "";
  @property({ type: String }) card: string = "";
  @property({ type: String }) fix: string = "";
  @property({ type: String }) status: string = "";
  @property({ type: String }) displayString: string = "";

  @state() clickable: boolean = false;
  @state() isOpen: boolean = false;

  @state() darkMode: boolean = false;

  static get styles() {
    return [
      css`
      .iwrapper {
        display: flex;
        column-gap: .5em;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        background-color: #f1f1f1;
        border-radius: var(--card-border-radius);
        padding: .5em;
        margin-bottom: 10px;
        border: 1px solid transparent;
      }
      .clickable:hover {
        cursor: pointer;
        border: 1px solid #CBCDEB;
      }
      .active:hover {
        cursor: pointer;
        border: 1px solid #CBCDEB;
      }
      .iwrapper img {
        height: 16px;
      }
      .left, .right {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .left {
        gap: .5em;
      }
      .left p {
        margin: 0;
        vertical-align: middle;
        line-height: 16px;
        padding-top: 3px;
      }

      .arrow_link {
        margin: 0;
        border-bottom: 1px solid var(--primary-color);
        white-space: nowrap;
      }

      .arrow_anchor {
        font-size: var(--arrow-link-font-size);
        font-weight: bold;
        margin: 0px 0.5em 0px 0px;
        line-height: 1em;
        color: var(--primary-color);
        display: flex;
        column-gap: 10px;
        width: fit-content;
      }

      .arrow_anchor:visited {
        color: var(--primary-color);
      }

      .arrow_anchor:hover {
        cursor: pointer;
      }

      .arrow_anchor:hover img {
        animation: bounce 1s;
      }

      @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateX(-5px);
          }
          60% {
            transform: translateX(5px);
          }
      }
      .arrow {
        width: 16px;
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

      /* < 480px */
      ${smallBreakPoint(css`
      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
      `)}
      /* 640px - 1023px */
      ${largeBreakPoint(css`
      `)}
      /*1024px - 1365px*/
      ${xLargeBreakPoint(css`
      `)}
      /* > 1920px */
      ${xxxLargeBreakPoint(css`
      `)}
    `
    ];
  }

  constructor() {
    super();
  }

  connectedCallback(){
    super.connectedCallback();

    // understand the users color preference
    const result = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkMode = result.matches; // TRUE if user prefers dark mode
  }

  decideClasses(){

    if(this.status === "retest" || this.field.startsWith("Open") || manifest_fields[this.field] || service_worker_fields[this.field]){
      this.clickable = true;
    } else {
      this.clickable = false;
    }

    return {iwrapper: true, clickable: this.clickable}
  }

  bubbleEvent(){
    if(manifest_fields[this.field]){
      let tooltip = (this.shadowRoot!.querySelector('manifest-info-card') as any);
      tooltip.handleHover(!this.isOpen);
    }

    if(service_worker_fields[this.field]){
      let tooltip = (this.shadowRoot!.querySelector('sw-info-card') as any);
      tooltip.handleHover(!this.isOpen);
    }

    let event = new CustomEvent('todo-clicked', {
      detail: {
          field: this.field,
          card: this.card,
          fix: this.fix,
          displayString: this.displayString,
          errorString: this.fix
      }
    });
    this.dispatchEvent(event);
  }

  triggerHoverState(e: CustomEvent){

    let element = this.shadowRoot!.querySelector(".iwrapper");
    if(e.detail.entering){
      element?.classList.add("active");
      this.isOpen = true;
    } else {
      element?.classList.remove("active");
      this.isOpen = false;
    }
  }


  decideIcon(){
    switch(this.status){
      case "required":
      case "missing":
        return html`<img src=${stop_src} alt="yield result icon"/>`
      case "enhancement":
        return html`<img src=${enhancement_src} alt="app capability result icon"/>`

      case "retest":
        return html`<img src=${this.darkMode ? retest_src_light : retest_src} style="color: black" alt="retest site icon"/>`
    }

    return html`<img src=${yield_src} alt="yield result icon"/>`
  }


  render() {
    return html`
      <div class="${classMap(this.decideClasses())}" @click=${() => this.bubbleEvent()}>
        <div class="left">
          ${this.decideIcon()}
          <p>${this.fix}</p>
        </div>

        ${manifest_fields[this.field] ?
          html`
            <manifest-info-card .field=${this.field} .placement="${"left"}" @trigger-hover=${(e: CustomEvent) => this.triggerHoverState(e)}>
              <button slot="trigger" type="button" class="right">
                <img src="assets/tooltip.svg" alt="info symbol, additional information available on hover" />
              </button>
            </manifest-info-card>
          `
          : null}

        ${service_worker_fields[this.field] ?
          html`
            <sw-info-card .field=${this.field} .placement="${"left"}" @trigger-hover=${(e: CustomEvent) => this.triggerHoverState(e)}>
              <button slot="trigger" type="button" class="right">
                <img src="assets/tooltip.svg" alt="info symbol, additional information available on hover" />
              </button>
            </sw-info-card>
          `
          : null}
      </div>
    `;
  }
}

const yield_src = "/assets/new/yield.svg";
const stop_src = "/assets/new/stop.svg";
const enhancement_src = "/assets/new/enhancement.svg";
const retest_src = "/assets/new/retest-icon.svg";
const retest_src_light = "/assets/new/retest-icon_light.svg";
