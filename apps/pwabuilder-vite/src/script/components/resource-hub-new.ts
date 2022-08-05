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
        background-image: url(/assets/new/OtterBackgroundPWA1920.jpg);
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
        text-align: center;
      }

      #cards {
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        column-gap: 1em;
      }

      /* < 480px */
      ${smallBreakPoint(css`
          #hub-panel{
            background-image: url(/assets/new/BackgroundPWA320.png);
            padding: 2em 1em;
          }
          #cards {
            flex-direction: column;
            row-gap: 1em;
            align-items: center;
            justify-content: center;
          }
      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
          #hub-panel{
            background-image: url(/assets/new/BackgroundPWA480.png);
            padding: 2em 4em;
          }
          #cards {
            flex-direction: column;
            row-gap: 1em;
            align-items: center;
            justify-content: center;
          }
      `)}

      /* 640px - 1023px */
      ${largeBreakPoint(css`
          #hub-panel{
            background-image: url(/assets/new/OtterBackgroundPWA1024.jpg);
            background-position: center center;
            padding: 3.25em;
          }
      `)}

      /*1024px - 1365px*/
      ${xLargeBreakPoint(css`
          #hub-panel {
            background: url(/assets/new/OtterBackgroundPWA1366.jpg);
            background-position: center center;
            background-size: cover;
            background-repeat: no-repeat;
          }
      `)}

      /* > 1920 */
      ${xxxLargeBreakPoint(css`
            #hub-panel{
            background-image: url(/assets/new/OtterBackgroundPWA1920.jpg);
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
        <h2>What makes a PWA?</h2>
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