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
import { manifest_fields } from '../utils/manifest-info';

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
        border-radius: 10px;
        padding: .5em;
        margin-bottom: 10px;
        border: 1px solid transparent;
      }

      .iwrapper.clickable:hover {
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

      .iwrapper p {
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

  decideClickable(field: string){
    let decision;
    if(manifest_fields[field] || this.status === "retest"){
      decision = true;
    } // else if(sw_fields[field]){}
    else {
      decision = false;
    }
    return {iwrapper: true, clickable: decision}
  }

  render() {
    return html`
      <div class=${classMap(this.decideClickable(this.field))} @click=${() => this.bubbleEvent()} >
        <div class="left">
          ${this.status === "red" ? html`<img src=${stop_src} alt="yield result icon"/>` : this.status === "retest" ? html`<img src=${retest_src} style="color: black" alt="retest site icon"/>` : html`<img src=${yield_src} alt="yield result icon"/>`}

          <p>${this.fix.split("~").length > 1 ? 
              this.fix.split("~").join(" "+ this.field + " ") :
              this.fix
              } 
          </p>
        </div>
        ${manifest_fields[this.field] ? html`<div class="right"><img src="assets/tooltip.svg" alt="info symbol, additional information available on click" /></div>` : html``}
      </div>
    `;
  }
}

const yield_src = "/assets/new/yield.svg";
const stop_src = "/assets/new/stop.svg";
const retest_src = "/assets/new/retest-black.svg";