import { LitElement, css, html, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

@customElement('todo-item')
export class SuccessCard extends LitElement {
  @property({ type: String }) field: string = "";
  @property({ type: String }) card: string = "";
  @property({ type: String }) fix: string = "";
  @property({ type: String }) status: string = "";
  @property({ type: String }) displayString: string = "";

  static get styles() {
    return [
      css`
      #item-wrapper {
        display: flex;
        column-gap: .5em;
        align-items: center;
        font-size: 16px;
        background-color: #F1F2FA;
        border-radius: 10px;
        padding: .5em;
        margin-bottom: 10px;
      }

      #item-wrapper:hover {
        cursor: pointer;
      }

      #item-wrapper img {
        height: 17px;
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

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    let splitString = this.fix.split("~");
    
    if(splitString.length > 1){
      this.fix = splitString.join(" "+ this.field + " ");
    } else {
      this.fix = splitString.join(" ");
    }
  }

  bubbleEvent(){
    let event = new CustomEvent('todo-clicked', {
      detail: {
          field: this.field,
          card: this.card,
          fix: this.fix,
          displayString: this.displayString
      }
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div id="item-wrapper" @click=${() => this.bubbleEvent()}>
        ${this.status === "red" ? html`<img src=${stop_src} alt="yield result icon"/>` : this.status === "retest" ? html`<img src=${retest_src} style="color: black" alt="retest site icon"/>` : html`<img src=${yield_src} alt="yield result icon"/>`}
        
        ${this.fix}
      </div>
    `;
  }
}

const yield_src = "/assets/new/yield.svg";
const stop_src = "/assets/new/stop.svg";
const retest_src = "/assets/new/retest-black.svg";