import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { link } from './community-hub-cards';

import {
  smallBreakPoint,
  mediumBreakPoint
} from '../utils/css/breakpoints';
import {AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

@customElement('community-card')
export class CommunityCard extends LitElement {
  @property({ type: String }) imageUrl: string = "";
  @property({ type: String }) cardTitle: string = "";
  @property({ type: String }) description: string = "";
  @property({ type: String }) company: string = "";
  @property({type: Array}) links: link[] = [];

  static get styles() {
    return [
    css`
      .community-card {
        width: max-content;
        max-width: 480px;
        height: max-content;
        color: var(--font-color);
        display: flex;
        align-items: flex-start;
        column-gap: 1.5em;
        padding: .5em;
        padding-left: 0;
      }

      .community-card-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
      }

      .community-card img {
        width: 3em;
        height: auto;
      }

      .community-card-content h3 {
        margin: 0;
        font-size: var(--subheader-font-size);
        font-weight: var(--font-bold);
      }

      .community-card-content p {
        font-size:  var(--body-font-size);
        margin-top: 0;
        margin-bottom: .25em;
      }

      .community-card-actions {
        color: var(--primary-color);
        fill: var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        column-gap: 1.5em;
      }

      .community-card-actions a {
        color: var(--primary-color);;
        font-size: var(--arrow-link-font-size);
        font-weight: bold;
        margin-right: .5em;
        width: 100%;
        border-bottom: 1px solid rgb(79, 63, 182);
        text-decoration: none;
        line-height: 14px;
      }

      .card-link-box {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: max-content;
      }

      .community-card-image img {
        width: 50px;
        height: auto;
      }

      .community-card-actions a:hover {
        cursor: pointer;
      }

      .community-card-actions a:visited {
        color:  var(--primary-color);;
      }
      .card-link-box img {
        width: .5em;
        height: auto;
      }

      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateX(-5px);
        }
        60% {
            transform: translateX(5px);
        }
      }

      .card-link-box:hover img {
        animation: bounce 1s;
      }

      /* < 480px */
      ${smallBreakPoint(css`
          .community-card {
            width: 100%;
          }
          .community-card-actions {
            flex-direction: column;
            align-items: flex-start;
            row-gap: .5em;
          }
          .community-card-image img {
            width: 35px;
            height: auto;
          }
          .community-card-content p {
            font-size: 16px;
          }
      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
          .community-card {
            width: 100%;
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

  render() {
    return html`
      <div class="community-card">
        <div class="community-card-image">
          <img src=${this.imageUrl} alt ="${this.company} logo" />
        </div>
        <div class="community-card-content">
          <h3>${this.cardTitle}</h3>
          <p>${this.description}</p>
          <div class="community-card-actions">
            ${this.links && this.links.map((link: any) =>
              html`
              <div class="card-link-box">
                <a @click=${() => recordPWABuilderProcessStep("bottom." + link.text + "_clicked", AnalyticsBehavior.ProcessCheckpoint)} href=${link.link} target="_blank" rel="noopener" aria-label="${link.text}, will open in separate tab">${link.text}</a>
                <img src="/assets/new/arrow.svg" alt="Click here to ${link.text}, will open separate tab" role="button"/>
              </div>
              `
            )}
          </div>
        </div>
      </div>
    `;
  }
}