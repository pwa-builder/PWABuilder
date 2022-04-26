import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CardData, publishCards, landingCards } from './resource-hub-cards';
import {
  largeBreakPoint,
  mediumBreakPoint,
  smallBreakPoint,
  BreakpointValues,
  customBreakPoint,
} from '../utils/css/breakpoints';

import { AppCardModes } from '../components/app-card';
import '../components/app-button';

type ResourceHubPages = 'home' | 'complete';

@customElement('resource-hub')
export class ResourceHub extends LitElement {
  @property({ attribute: 'all', type: Boolean }) showViewAllButton = false;
  @property({ attribute: 'page', type: String }) pageName: ResourceHubPages =
    'home';

  static get styles() {
    return [
      css`
        :host {
          display: flex;
          justify-content: center;
        }

        ::slotted([slot='title']) {
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
          max-width: 950px;
          text-align: center;
        }

        .home {
          background-repeat: no-repeat;
          background-image: url(/assets/images/blog_fold.webp);
          background-size: cover;
          background-position: left bottom;
          color: var(--secondary-color);
        }

        .complete {
          background-color: var(--primary-background-color);
          color: var(--font-color);
        }

        .resource-hub {
          width: 100%;
        }
      `,
      css`
        .resource-header {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding-top: 80px;
          padding-left: 4em;
          padding-right: 4em;
        }

        .complete .resource-header {
          padding-top: 0;
        }

        .cards {
          display: flex;
          justify-content: center;
          padding-left: 4em;
          padding-right: 4em;
          margin-top: 1em;
          padding: 0 16px;
        }

        .cards app-card {
          margin: 8px;
        }

        .cards app-card::part(card) {
          margin: 0;
        }

        .resource-hub-actions {
          display: flex;
          align-items: center;
          justify-content: center;

          margin-top: 32px;
          margin-bottom: 74px;
        }

        .resource-hub-actions fast-anchor {
          width: 205px;
          background-color: white;
          color: var(--font-color);
          border-radius: var(--button-radius);
        }

        .resource-hub-actions fast-anchor::part(control) {
          font-size: 16px;
          font-weight: var(--font-bold);
        }
      `,
      largeBreakPoint(
        css`
          .cards app-card {
            max-width: 350px;
          }
        `,
        'no-lower'
      ),
      mediumBreakPoint(
        css`
          .cards {
            flex-direction: column;
            align-items: center;
          }

          .resource-header {
            padding-left: 1em;
            padding-right: 1em;
          }

          .cards app-card,
          .cards app-card::part(card) {
            width: 100%;
            max-width: 100%;
          }

          .cards app-card {
            margin-bottom: 16px;
          }
        `,
        'no-lower'
      ),
      mediumBreakPoint(
        css`
          .cards {
            padding: 0 32px;
          }
        `
      ),
      largeBreakPoint(
        css`
          .cards {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            padding: 0;
          }

          .cards app-card {
            margin-bottom: 16px;
          }
        `
      ),

      smallBreakPoint(
        css`
          :host {
            background-color: #ededed;
          }

          .resource-header {
            padding-left: 1em;
            padding-right: 1em;
          }

          .cards app-card,
          .cards app-card::part(card) {
            width: 100%;
            max-width: 100%;
          }

          /* TODO make this gated to only a gallery variant */
          .cards.horizontal {
            overflow-y: scroll;
            overflow-x: none;
            /* white-space: nowrap; */

            flex-direction: row;
            align-items: center;
          }

          .cards.horizontal app-card {
            display: inline-block;
            min-width: calc(100% - 32px);
          }

          section {
            width: 100%;
          }

          .cards.horizontal {
            display: flex;
            flex-direction: column;
            overflow-x: scroll;
            scroll-snap-type: x proximity;
          }

          .cards.horizontal app-card {
            display: inline-block;
            flex: 0 0 auto;
            scroll-snap-align: center;
          }

          .cards.horizontal app-card p,
          .cards.horizontal app-card h3 {
            white-space: normal;
          }
        `
      ),
      mediumBreakPoint(
        css`
          .cards {
            flex-direction: column;
            align-items: center;
          }

          .cards app-card {
            margin-bottom: 16px;
          }
        `,
        'no-lower'
      ),
      mediumBreakPoint(
        css`
          .cards {
            padding: 0 32px;
          }
        `
      ),
      largeBreakPoint(
        css`
          .cards app-card {
            max-width: 350px;
          }
        `,
        'no-lower'
      ),
      largeBreakPoint(
        css`
          .cards {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
          }

          .cards app-card {
            margin-bottom: 16px;
          }
        `
      ),
      customBreakPoint(
        css`
          .resource-hub.complete .cards {
            flex-direction: column;
          }
        `,
        undefined,
        919
      ),
      customBreakPoint(
        css`
          .resource-hub.home .cards {
            display: grid;
            grid-template-columns: auto auto;
          }
        `,
        888,
        1023
      ),
      customBreakPoint(
        css`
          .resource-hub.home .cards {
            display: grid;
            grid-template-columns: auto auto;
          }
        `,
        888,
        1023
      ),
    ];
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <section
        class="${classMap({
          'resource-hub': true,
          'home': this.pageName === 'home',
          'complete': this.pageName === 'complete',
        })}"
      >
        <div class="resource-header">
          <slot name="title"></slot>
          <slot name="description"></slot>
        </div>

        <div
          class="${classMap({
            cards: true,
            horizontal:
              this.pageName === 'complete' &&
              window.innerWidth <= BreakpointValues.smallUpper,
          })}"
        >
          ${this.renderCards()}
        </div>

        ${this.renderViewAllButton()}
      </section>
    `;
  }

  renderCards() {
    const mode = this.determineCardMode();
    let cardList: Array<CardData> = [];
    if (this.pageName === 'home') {
      cardList = landingCards();
    } else if (this.pageName === 'complete') {
      cardList = publishCards();
    }

    return cardList.map(data => {
      return html`
        <app-card
          class=${mode}
          cardTitle=${data.title}
          description=${data.description}
          imageUrl=${data.imageUrl}
          linkRoute=${data.linkUrl}
        >
        </app-card>
      `;
    });
  }

  renderViewAllButton() {
    if (this.showViewAllButton) {
      return html`
        <div class="resource-hub-actions">
          <fast-anchor
            appearance="button"
            href="https://blog.pwabuilder.com"
            target="_blank"
            rel="noopener"
            >View all resources</fast-anchor
          >
        </div>
      `;
    }

    return undefined;
  }

  determineCardMode(): AppCardModes {
    if (
      this.pageName === 'complete' &&
      window.innerWidth <= BreakpointValues.smallUpper
    ) {
      return AppCardModes.micro;
    }

    return AppCardModes.default;
  }
}
