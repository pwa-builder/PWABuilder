import { LitElement, css, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { getCards } from './success-stories-cards';
import '../components/success-card'

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xxLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

@customElement('success-stories')
export class SuccessStories extends LitElement {
  @state() cards: any = [];

  static get styles() {
    return [
    css`
      #success-panel {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        background-image: url(/assets/new/successBG_1366.png);
        background-repeat: no-repeat;
        padding: 2em;
        padding-left: 7em;
      }

      #success-panel h2 {
        margin: 0;
        margin-bottom: 1em;
        font-weight: bold;
        font-size: 1.55em;
        text-align: left;
      }

      #success-cards {
        width: 100%;
        display: grid;
        grid-template-columns: min-content min-content;
        grid-template-rows: auto auto;
        row-gap: .8em;
        column-gap: 1em;
      },
      /* 850px, hide background */

      /* 640px - 1023px */
      ${largeBreakPoint(css`
        #success-panel {
          background-image: url(/assets/new/successBG_1024.png);
        }
      `)}

      /*1024px - 1365px*/
      ${xxLargeBreakPoint(css`
          
      `)}

      /* > 1920px */
      ${xxxLargeBreakPoint(css`
          
      `)}
    `,
    ];
  }

  constructor() {
    super();
  }

  firstUpdated(){
    this.cards = getCards();
  }

  render() {
    return html`
      <div id="success-panel">
        <h2>PWA success stories</h2>
        <div id="success-cards">
          ${this.cards.map((card: any) => html`
            <success-card
            cardStat=${card.stat}
            description=${card.description}
            imageUrl=${card.imageUrl}
            cardValue=${card.value}
          >
          </success-card>
          `)}
        </div>
      </div>
    `;
  }
}