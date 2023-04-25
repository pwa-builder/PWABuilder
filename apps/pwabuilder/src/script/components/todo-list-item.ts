import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';
import { manifest_fields } from '@pwabuilder/manifest-information';
//import { recordPWABuilderProcessStep } from '../utils/analytics';
import './manifest-info-card'

@customElement('todo-item')
export class TodoItem extends LitElement {
  @property({ type: String }) field: string = "";
  @property({ type: String }) card: string = "";
  @property({ type: String }) fix: string = "";
  @property({ type: String }) status: string = "";
  @property({ type: String }) displayString: string = "";

  static get styles() {
    return [
      css`
      .iwrapper {
        display: flex;
        column-gap: .5em;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        background-color: #F1F2FA;
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

  bubbleEvent(){
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

  // allows for the retest items to be clicked
  decideClickable(){
    let decision;
    if(this.status === "retest" || this.field.startsWith("Open")){
      decision = true;
    } // else if(sw_fields[field]){}
    else {
      decision = false;
    }
    return {iwrapper: true, clickable: decision}
  }

  triggerHoverState(e: CustomEvent){
    let element = this.shadowRoot!.querySelector(".iwrapper");
    if(e.detail.entering){
      element?.classList.add("active");
    } else {
      element?.classList.remove("active");
    }
  }

  formatFix(fix: string){
    if(fix.split("~").length > 1){
      return fix.split("~").join(" "+ this.field + " ");
    }
    return fix;
  }

  render() {
    return html`
      <div class="${classMap(this.decideClickable())}" @click=${() => this.bubbleEvent()}>
        <div class="left">
          ${this.status === "required" ? html`<img src=${stop_src} alt="yield result icon"/>` : this.status === "retest" ? html`<img src=${retest_src} style="color: black" alt="retest site icon"/>` : html`<img src=${yield_src} alt="yield result icon"/>`}
          <p>${this.formatFix(this.fix)}</p>
        </div>
        ${manifest_fields[this.field] ? 
          html`
            <manifest-info-card .field=${this.field} @trigger-hover=${(e: CustomEvent) => this.triggerHoverState(e)}></manifest-info-card>
          ` 
          : html``}
      </div>
    `;
  }
}

const yield_src = "/assets/new/yield.svg";
const stop_src = "/assets/new/stop.svg";
const retest_src = "/assets/new/retest-black.svg";