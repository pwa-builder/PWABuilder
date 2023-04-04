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
        background: #ffffff;
        border-radius: var(--card-border-radius);
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
        font-size: var(--subheader-font-size);
        line-height: 24px;
        color: var(--font-color);
        font-weight: var(--font-bold);
        margin: 0;
        margin-bottom: .5em;
        text-align: center;
        white-space: nowrap;
      }

      .card-content p {
        color: var(--secondary-font-color);
        font-size: var(--card-body-font-size);
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
        color: var(--primary-color);
        font-weight: bold;
        text-decoration: none;
        font-size: var(--card-body-font-size);
        margin: 0;
      }

      .card-actions a:hover {
        cursor: pointer;
      }

      .arrow_link {
        margin: 0;
        border-bottom: 1px solid var(--primary-color);
        white-space: nowrap;
      }

      .arrow_anchor {
        text-decoration: none;
        font-size: var(--arrow-link-font-size);
        font-weight: bold;
        margin: 0px 0.5em 0px 0px;
        line-height: 1em;
        color: rgb(79, 63, 182);
        display: flex;
        column-gap: 10px;
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

      /* < 480px */
      ${smallBreakPoint(css`
          .card {
            min-width: 140px;
            max-width: 300px;
            height: 15em;
          }
          .card-content img {
            width: 6em;
          }
          .card-content p {
            font-size: 14px;
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
          <img src=${this.imageUrl} alt="${this.cardTitle} icon" role="img"/>
          <h3>${this.cardTitle}</h3>
          <p>${this.description}</p>
        </div>
        <div class="card-actions" @click=${() => recordPWABuilderProcessStep("middle." + this.cardTitle + "_learn_more_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
          <a
            class="arrow_anchor"
            href=${this.linkRoute}
            rel="noopener"
            target="_blank"
            aria-label="Learn more about ${this.cardTitle}, will open separate tab"
          >
            <p class="arrow_link">Learn More</p>
            <img
              src="/assets/new/arrow.svg"
              alt="Click here to learn more about ${this.cardTitle}, will open separate tab"
              role="button"
            />
          </a>
        </div>
      </div>
    `;
  }
}