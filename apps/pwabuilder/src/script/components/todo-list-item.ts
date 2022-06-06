import { LitElement, css, html } from 'lit';
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
  @property({ type: String }) level: string = "";
  @property({ type: String }) content: string = "";

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
      #item-wrapper sl-icon {
        color: red;
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

  render() {
    return html`
      <div id="item-wrapper">
        <sl-icon name="exclamation-circle-fill"></sl-icon>
        ${this.content}
      </div>
    `;
  }
}