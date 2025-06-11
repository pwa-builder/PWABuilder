import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

@customElement('success-card')
export class SuccessCard extends LitElement {
  @property({ type: String }) imageUrl: string = "";
  @property({ type: String }) cardStat: string = "";
  @property({ type: String }) description: string = "";
  @property({ type: String }) cardValue: string = "";
  @property({ type: String }) company: string = "";
  @property({ type: String }) source: string = "";

  static get styles() {
    return [
      css`
      .success-card {
        width: 350px;
        height: max-content;
        padding: 1em;
        display: inline-flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        background: #ffffff;
        border-radius: var(--card-border-radius);
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        text-decoration: none;
        color: black;
      }

      .success-line-one {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        width: 100%;
        /* for screen reader scan */
        flex-direction: row-reverse;
        color: var(--font-color);
      }

      .success-stat {
        margin: 0;
        font-size: var(--subheader-font-size);
        line-height: 28px;
        font-weight: var(--font-bold);
        margin-bottom: .75em;
        color: var(--font-color);
      }

      .success-stat span {
        margin-right: 50%;
        font-size: 36px;
        line-height: 36px;
        font-weight: bold;
      }

      .success-desc {
        margin: 0;
        font-size:  var(--card-body-font-size);
        line-height: 18px;
        color: var(--secondary-font-color);
      }

      @media screen and (-ms-high-contrast: white-on-black) {
        .success-card:focus{
          border: 4px solid #ffffff;
          border-radius: 5px;
        }
      }

      @media(max-width: 800px){
        .success-card img {
          margin-bottom: 10px;
        }
        .success-line-one {
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .success-stat span {
          margin-right: 0;
        }
        .success-line-one h3 {
          font-size: 20px;
          text-align: center;
        }
      }

      /* < 480px */
      ${smallBreakPoint(css`
        .success-card {
          width: 280px;
          box-sizing: border-box;
        }
        
      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
        .success-card {
          width: 400px;
        }
        .success-line-one h3 {
          font-size: 28px;
        }
      `)}

      /* 640px - 1023px */
      ${largeBreakPoint(css`
          .success-card {
            width: 305px;
          }
      `)}

      /*1024px - 1365px*/
      ${xLargeBreakPoint(css`

      `)}

      /* > 1920px */
      ${xxxLargeBreakPoint(css`
        .success-card {
          width: 525px;
        }
      `)}
    `
    ];
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <a @click=${() => recordPWABuilderProcessStep("middle." + this.company + "_clicked", AnalyticsBehavior.ProcessCheckpoint)} class="success-card" href="${this.source}" rel="noopener" target="_blank" aria-label=${"Success story of " + this.company + " link, click for more details on separate tab"}>
        <div class="success-line-one">
           <img src=${this.imageUrl} alt="${this.company} logo"/>
           <h3 class="success-stat">
             <span>${this.cardValue}</span> ${this.cardStat}
           </h3>    
        </div>
        <p class="success-desc">${this.description}</p>
  </a>
    `;
  }
}