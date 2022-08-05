import { LitElement, css, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { getCards } from './success-stories-cards';
import '../components/success-card'

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

@customElement('success-stories')
export class SuccessStories extends LitElement {
  @state() cards: any = [];

  static get styles() {
    return [
    css`
      #success-panel::before {
        content: "";
      }
      #success-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-image: url(/assets/new/successBG_1920.png);
        background-repeat: no-repeat;
        background-size: cover;
        background-position: right;
        padding: 2em;
        /* padding-left: 20%; */
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
      }

      /* < 480px */
      ${smallBreakPoint(css`
          #success-panel {
            background-image: url(/assets/new/successBG_320.png);
            padding: 2em 1em;
          }
          #success-panel h2 {
            text-align: left;
            width: 100%;
            padding-left: 5px;
            font-size: 1.75em;
            margin-bottom: .5em;
          }
          
          #success-cards {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            align-self: center;
          }
      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
        #success-panel {
          background-image: url(/assets/new/successBG_480.png);
          padding: 1em;
          padding-bottom: 2em;
        }

        #success-panel h2 {
          text-align: left;
          width: 100%;
          padding-left: 5px;
          margin-bottom: .5em;
        }
        
        #success-cards {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          align-self: center;
        }
      `)}

      /* 640px - 1023px */
      ${largeBreakPoint(css`
          #success-panel {
            background-image: url(/assets/new/successBG_1024.png);
            padding-left: 2em;
          }
          #success-panel h2 {
            margin-bottom: .5em;
          }
      `)}

      @media (min-width: 640px) and (max-width: 850px) {
        #success-panel {
          background-image: url(/assets/new/successBG_480.png);
          padding: 1em;
          padding-bottom: 2em;
        }

        #success-panel h2 {
          text-align: center;
          width: 100%;
        }
        
        #success-cards {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: fit-content;
          align-self: center;
        }
      }
      

      /*1024px - 1365px*/
      ${xLargeBreakPoint(css`
          #success-panel {
            /* padding-left: 15%; */
            padding-bottom: 2.5em;
          }
      `)}

      /* > 1920px */
      ${xxxLargeBreakPoint(css`
          #success-panel {
            /* padding-left: 30%; */
            padding-bottom: 2.5em;
          }
          #success-panel h2 {
            margin-bottom: .5em;
          }
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
        <div id="success-panel-wrapper">
          <h2>PWA success stories</h2>
          <div id="success-cards">
            ${this.cards.map((card: any) => html`
            <success-card
            cardStat=${card.stat}
            description=${card.description}
            imageUrl=${card.imageUrl}
            cardValue=${card.value}
            company=${card.company}
            source=${card.source}
            >
            </success-card>
            `)}
          </div>
        </div>
      </div>
    `;
  }
}