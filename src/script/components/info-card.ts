import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('info-card')
export class Infocard extends LitElement {
  @property({ type: String }) imageUrl: string = "";
  @property({ type: String }) cardTitle: string = "";
  @property({ type: String }) description: string = "";
  @property({ type: String }) linkRoute: string = "";

  static get styles() {
    return css`
      .card {
        min-width: 140px;
        max-width: 220px;
        height: 12em;
        padding: .5em 1.25em;
        padding-bottom: 35px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        background: white;
        border-radius: 4px;
        box-shadow: 0px 16px 24px 0px #00000026;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .card-content img {
        width: 4em;
        height: auto;
      }

      .card-content h3 {
        font-size: 1em;
        line-height: 24px;
        font-weight: var(--font-bold);
        margin: 0;
        margin-bottom: .5em;
      }

      .card-content p {
        color: #808080;
        font-size: .65em;
        line-height: 18px;
        text-align: center;
        margin: 0;
      }

      .card-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%
      }

      .card-actions a {
        color: #4F3FB6;
        font-weight: bold;
        border-bottom: 1px solid rgb(79, 63, 182);
        text-decoration: none;
        line-height: 14px;
        font-size: 14px;
        margin: 0;
      }

      .card-actions a:hover {
        cursor: pointer;
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
      <div class="card">
        <div class="card-content">
          <img src=${this.imageUrl} />
          <h3>${this.cardTitle}</h3>
          <p>${this.description}</p>
        </div>
        <div class="card-actions">
          <a href=${this.linkRoute} target="_blank" rel="noopener">Learn More</a>
        </div>
      </div>
    `;
  }
}