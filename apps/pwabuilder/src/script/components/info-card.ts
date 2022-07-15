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

@customElement('info-card')
export class Infocard extends LitElement {
  @property({ type: String }) imageUrl: string = "";
  @property({ type: String }) cardTitle: string = "";
  @property({ type: String }) description: string = "";
  @property({ type: String }) linkRoute: string = "";

  static get styles() {
    return [
    css`
      .card {
        min-width: 140px;
        max-width: 220px;
        height: 12em;
        padding: .5em 1.25em;
        padding-bottom: 35px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        background: white;
        border-radius: 4px;
        box-shadow: 0px 16px 24px 0px #00000026;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .card-content img {
        width: 4em;
        height: auto;
      }

      .card-content h3 {
        font-size: 1em;
        line-height: 24px;
        font-weight: var(--font-bold);
        margin: 0;
        margin-bottom: .5em;
        text-align: center;
        white-space: nowrap;
      }

      .card-content p {
        color: var(--secondary-font-color);
        font-size: .65em;
        line-height: 18px;
        text-align: center;
        margin: 0;
      }

      .card-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%
      }

      .card-actions a {
        color: #4F3FB6;
        font-weight: bold;
        border-bottom: 1px solid rgb(79, 63, 182);
        text-decoration: none;
        line-height: 14px;
        font-size: 14px;
        margin: 0;
      }

      .card-actions a:hover {
        cursor: pointer;
      }

      /* < 480px */
      ${smallBreakPoint(css`
          .card {
            min-width: 140px;
            max-width: 300px;
            height: 15em;
          }
          .card-content p {
            font-size: .825em;
          }
          .card-content h3 {
            font-size: 20px;
          }
      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
        .card {
            min-width: 140px;
            max-width: 300px;
            height: 12em;
          }
          .card-content p {
            font-size: .825em;
          }
          .card-content h3 {
            font-size: 20px;
          }
      `)}

      /* 640px - 1023px */
      ${largeBreakPoint(css`
        .card {
          min-width: 140px;
          max-width: 200px;
          height: 12em;
          padding: .75em;
          padding-bottom: 1.25em;
        }
      `)}

      /*1024px - 1365px*/
      ${xLargeBreakPoint(css`
      `)}

      /* > 1920 */
      ${xxxLargeBreakPoint(css`
          
      `)}

    `
    ];
  }

  constructor() {
    super();
  }

  firstUpdated(){
   
  }

  render() {
    return html`
      <div class="card">
        <div class="card-content">
          <img src=${this.imageUrl} alt="${this.cardTitle} icon" role="presentation"/>
          <h3>${this.cardTitle}</h3>
          <p>${this.description}</p>
        </div>
        <div class="card-actions" @click=${() => recordPWABuilderProcessStep("home.middle." + this.cardTitle + "_learn_more_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
          <a href=${this.linkRoute} target="_blank" rel="noopener" aria-label="Learn more about ${this.cardTitle}">Learn More</a>
        </div>
      </div>
    `;
  }
}