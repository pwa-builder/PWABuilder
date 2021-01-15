import { LitElement, css, html, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { completeCards, landingCards } from './resource-hub-cards';
import {
  largeBreakPoint,
  mediumBreakPoint,
  smallBreakPoint,
  BreakpointValues,
} from '../utils/breakpoints';

import '../components/app-button';

type ResourceHubPages = 'home' | 'complete';

@customElement('resource-hub')
export class ResourceHub extends LitElement {
  @property({ attribute: 'all', type: Boolean }) showViewAllButton = false;
  @property({ attribute: 'page', type: String }) pageName: ResourceHubPages =
    'home';

  static get styles() {
    return css`
      :host {
        background: var(--primary-color);
        display: flex;
        color: white;
        justify-content: center;
      }

      ::slotted([slot='header']) {
        margin: 0;
        font-weight: var(--font-bold);
        text-align: center;

        font-size: 36px;
        line-height: 39px;
        letter-spacing: -0.015em;
        margin-top: 0;
      }

      ::slotted([slot='description']) {
        font-weight: var(--font-bold);
        text-align: center;
      }

      #resource-header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-top: 80px;
        padding-left: 4em;
        padding-right: 4em;
      }

      #cards {
        display: flex;
        justify-content: center;
        padding-left: 4em;
        padding-right: 4em;
        margin-top: 1em;
        padding: 0 16px;
      }

      #cards fast-card {
        max-width: 280px;
        padding-bottom: 16px;
        margin-right: 12px;
        margin-left: 12px;

        color: var(--font-color);
        background: white;
      }

      fast-card img {
        width: 100%;
        object-fit: none;
        height: 188px;
      }

      fast-card h3 {
        font-size: 24px;
        line-height: 24px;
        font-weight: var(--font-bold);
        margin: 16px 16px 0 16px;
      }

      fast-card p {
        color: var(--secondary-font-color);
        margin: 8px 16px 0 16px;

        font-size: 14px;
        line-height: 20px;
      }

      .card-actions {
        margin-top: 8px;
      }

      .card-actions fast-button::part(control) {
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;
        color: var(--link-color);
        padding: 0 16px;
      }

      #resource-hub-actions {
        display: flex;
        align-items: center;
        justify-content: center;

        margin-top: 32px;
        margin-bottom: 74px;
      }

      #resource-hub-actions app-button::part(underlying-button) {
        background: white;
        color: var(--font-color);
      }

      #resource-hub-actions fast-button::part(control) {
        font-size: 16px;
        font-weight: var(--font-bold);
      }

      ${smallBreakPoint(
        css`
          :host {
            background-color: #ededed;
          }

          ::slotted([slot='header']) {
            color: var(--font-color);
          }

          ::slotted([slot='description']) {
            color: var(--font-color);
            font-weight: var(--font-medium);
          }

          /* TODO make this gated to only a gallery variant */
          #cards.horizontal {
            overflow-y: scroll;
            overflow-x: none;
            white-space: nowrap;

            flex-direction: row;
            align-items: center;
          }

          #card.horizontal fast-card {
            display: inline-block;
            min-width: calc(100% - 32px);
          }

          .card-actions fast-button::part(control) {
            color: var(--mobile-link-color);
          }
        `
      )}

      ${smallBreakPoint(
        css`
          section {
            width: 100%;
          }

          #cards.horizontal {
            display: flex;
            justify-content: normal;
            flex-wrap: nowrap;
            overflow: auto;
          }

          #cards.horizontal fast-card {
            flex: 0 0 auto;
          }

          #cards.horizontal fast-card p,
          #cards.horizontal fast-card h3 {
            white-space: normal;
          }
        `
      )}

      ${mediumBreakPoint(
        css`
          #cards {
            flex-direction: column;
            align-items: center;
          }

          #cards fast-card {
            margin-bottom: 16px;
          }
        `,
        'no-lower'
      )}

      ${mediumBreakPoint(
        css`
          #cards {
            padding: 0 32px;
          }
        `
      )}

      ${largeBreakPoint(
        css`
          #cards fast-card {
            max-width: 350px;
          }
        `,
        'no-lower'
      )}

      ${largeBreakPoint(
        css`
          #cards {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            padding: 0;
          }

          #cards fast-card {
            margin-bottom: 16px;
          }
        `
      )}
    `;
  }

  constructor() {
    super();

    window.addEventListener('resize', () => {
      this.requestUpdate();
    });
  }

  render() {
    return html`
      <section>
        <div id="resource-header">
          <slot name="header"></slot>
          <slot name="description"></slot>
        </div>

        <div id="cards" class=${classMap(this.cardsClasses())}>
          ${this.renderCards()}
        </div>

        ${this.renderViewAllButton()}
      </section>
    `;
  }

  renderCards() {
    if (this.pageName === 'home') {
      return landingCards();
    }

    if (this.pageName === 'complete') {
      return completeCards();
    }

    return undefined;
  }

  renderViewAllButton() {
    if (this.showViewAllButton) {
      return html`
        <div id="resource-hub-actions">
          <app-button>View all resources</app-button>
        </div>
      `;
    }

    return undefined;
  }

  cardsClasses() {
    return {
      horizontal:
        this.pageName === 'complete' &&
        window.innerWidth <= BreakpointValues.smallUpper,
    };
  }
}
