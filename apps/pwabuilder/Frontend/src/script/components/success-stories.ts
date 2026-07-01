import { LitElement, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { getCards } from './success-stories-cards';
import '../components/success-card'


import { successStoriesStyles } from "./success-stories.styles";
@customElement('success-stories')
export class SuccessStories extends LitElement {
  @state() cards: any = [];

  static styles = [successStoriesStyles];

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();
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