import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { communityHubStyles } from './community-hub.styles';
import { getCards } from './community-hub-cards';
import '../components/community-card';


@customElement('community-hub')
export class CommunityHub extends LitElement {
  @state() cards: any = [];

  static styles = [communityHubStyles];

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.cards = getCards();
  }

  render() {
    return html`
      <div id="community-panel">
        <div id="community-photo">
          <img src="/assets/new/community-image.webp" alt="social hub image" role="img"/>
        </div>
        <div id="community-content">
          <h2>Join our community</h2>
          <div id="community-cards">
            ${this.cards.map((card: any) => html`
              <community-card
              cardTitle=${card.title}
              description=${card.description}
              imageUrl=${card.imageUrl}
              company=${card.company}
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