import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { landingCards } from './resource-hub-cards-new';
import '../components/info-card'

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

@customElement('resource-hub-new')
export class ResourceHubNew extends LitElement {
  @state() cards: any = [];

  static get styles() {
    return [
    css`
      #hub-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-image: url(/assets/new/BackgroundPWA1366.png);
        background-repeat: no-repeat;
        background-size: cover;
        padding: 2em;
      }

      #hub-panel h2 {
        color: white;
        margin: 0;
        margin-bottom: 1em;
        font-weight: bold;
        font-size: 1.55em;
      }

      #cards {
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        column-gap: 1em;
      }

      /* 480px - 639px */
      ${mediumBreakPoint(css`
          
      `)}

      /* 640px - 1023px */
      ${largeBreakPoint(css`
        #wrapper{
          background-image: url(/assets/new/BackgroundPWA1024.png);
          background-position: center center;
          background-repeat: no-repeat;
          background-size: cover;
        }
    `)}

    /*1024px - 1365px*/
    ${xLargeBreakPoint(css`
        #wrapper {
          background: url(/assets/new/BackgroundPWA1366.png);
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
        }
    `)}

    /* > 1920 */
    ${xxxLargeBreakPoint(css`
          #wrapper{
          background-image: url(/assets/new/BackgroundPWA1920.png);
          background-repeat: no-repeat;
          background-size: cover;
          padding: 3em;
        }
      `)}

      
    `,
  ];
  }

  constructor() {
    super();
  }

  firstUpdated(){
    this.cards = landingCards();
  }

  render() {
    return html`
      <div id="hub-panel">
        <h2>What Makes a PWA?</h2>
        <div id="cards">
          ${this.cards.map((card: any) => html`
            <info-card
            cardTitle=${card.title}
            description=${card.description}
            imageUrl=${card.imageUrl}
            linkRoute=${card.linkUrl}
          >
          </info-card>
          `)}
        </div>
      </div>
    `;
  }
}