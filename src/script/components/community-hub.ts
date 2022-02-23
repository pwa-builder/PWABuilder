import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getCards } from './community-hub-cards';
import '../components/community-card';

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

@customElement('community-hub')
export class CommunityHub extends LitElement {
  @state() cards: any = [];

  static get styles() {
    return [
    css`
      #community-panel {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        background: white;
        padding: 2em;
        column-gap: 1em;
      }

      #community-photo {
        display: flex;
        height: 100%;
        align-items: center;
        justify-content: center;
      }

      #community-photo img { 
        width: 500px;
        height: auto;
      }

      #community-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
      }

      #community-content h2 {
        color: black;
        margin: 0;
        margin-bottom: 1em;
        font-weight: bold;
        font-size: 1.55em;
      }

      #community-cards {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        row-gap: 30px;
      }

       /* < 480px */
       ${smallBreakPoint(css`
          #community-photo img { 
            display: none;
          }
          #community-panel {
            column-gap: 0;
          }
          #community-content h2 {
            width: 100%;
            margin-bottom: .5em;
          }
          #community-content{
            width: 280px;
          }
      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
          #community-photo img { 
            display: none;
          }
          #success-panel {
            align-items: center;
            justify-content: center;
          }
          #community-panel {
            align-items: center;
            column-gap: 0;
          }
          #community-content {
            align-items: center;
            justify-content: center;
            width: 100%;
          }
          #community-content h2 {
            width: 100%;
            margin-bottom: .5em;
          }
      `)}

      /* 640px - 1023px */
      ${largeBreakPoint(css`
          #community-panel {
            padding-left: 35px;
            justify-content: space-between;
          }
          #community-photo img { 
            max-width: 19em;
            height: auto;
          }
          #community-panel h2 {
            margin-bottom: .5em;
          }
          #community-cards {
            row-gap: 15px;
          }
      `)}

      @media (min-width: 640px) and (max-width: 850px) {
        #community-photo img { 
          display: none;
        }
        #success-panel {
          align-items: center;
          justify-content: center;
        }
      }
      

      /*1024px - 1365px*/
      ${xLargeBreakPoint(css`

      `)}

      /* > 1920px */
      ${xxxLargeBreakPoint(css`
          #community-panel {
            justify-content: unset;
            padding-left: 17em;
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
      <div id="community-panel">
        <div id="community-photo">
          <img src="/assets/new/community-image.png" />
        </div>
        <div id="community-content">
          <h2>Join our Community</h2>
          <div id="community-cards">
            ${this.cards.map((card: any) => html`
              <community-card
              cardTitle=${card.title}
              description=${card.description}
              imageUrl=${card.imageUrl}
              .links=${card.links}
            >
            </community-card>
            `)}
          </div>
        </div>
      </div>
    `;
  }
}