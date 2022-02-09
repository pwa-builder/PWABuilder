import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { link } from './community-hub-cards';

@customElement('community-card')
export class CommunityCard extends LitElement {
  @property({ type: String }) imageUrl: string = "";
  @property({ type: String }) cardTitle: string = "";
  @property({ type: String }) description: string = "";
  @property({type: Array}) links: link[] = [];

  static get styles() {
    return css`
      .community-card {
        width: max-content;
        max-width: 480px;
        height: max-content;
        color: #292C3A;
        display: flex;
        align-items: flex-start;
        column-gap: 1.5em;
        padding: .5em;
      }

      .community-card-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
      }

      .community-card img {
        width: 3em;
        height: auto;
      }

      .community-card-content h3 {
        margin: 0;
        font-size: 1em;
      }

      .community-card-content p {
        font-size: .75em;
        margin-top: 0;
        margin-bottom: .25em;
      }

      .community-card-actions {
        color:  #4F3FB6;
        fill: #4F3FB6;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        column-gap: .5em;
      }

      .community-card-actions a {
        font-size: .5em;
        font-weight: bold;
        margin-right: .75em;
        width: 100%;
      }

      .card-link-box {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: max-content;
      }

      .community-card-image {
        width: 3em:
        height: auto;
      }

      .community-card-image img {
        object-fit: contain;
      }

      .community-card-image img {
        object-fit: contain;
      }

      .community-card-actions a:hover {
        cursor: pointer;
      }

      .community-card-actions a:visited {
        color:  #4F3FB6;
      }
      .card-link-box img {
        width: .5em;
        height: auto;
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated(){
    
  }

  render() {
    return html`
      <div class="community-card">
        <div class="community-card-image">
          <img src=${this.imageUrl} />
        </div>
        <div class="community-card-content">
          <h3>${this.cardTitle}</h3>
          <p>${this.description}</p>
          <div class="community-card-actions">
            ${this.links && this.links.map((link: any) =>
              html`
              <div class="card-link-box">
                <a href=${link.route} target="_blank" rel="noopener">${link.text}</a>
                <img src="/assets/arrow.svg" alt="arrow" />
              </div>
              `
            )}
          </div>
        </div>
      </div>
    `;
  }
}