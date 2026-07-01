import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { landingCards } from './resource-hub-cards';
import './info-card'


import { resourceHubStyles } from "./resource-hub.styles";
@customElement('resource-hub')
export class ResourceHubNew extends LitElement {
  @state() cards: any = [];

  static styles = [resourceHubStyles];

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();
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