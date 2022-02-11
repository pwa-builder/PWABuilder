import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('success-card')
export class SuccessCard extends LitElement {
  @property({ type: String }) imageUrl: string = "";
  @property({ type: String }) cardStat: string = "";
  @property({ type: String }) description: string = "";
  @property({ type: String }) cardValue: string = "";

  static get styles() {
    return css`
      .success-card {
        width: 350px;
        height: max-content;
        padding: 1em;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        background: white;
        border-radius: 4px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      }

      .success-line-one {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        width: 100%;
      }

      .success-line-one h3 {
        margin: 0;
        font-size: 36px;
        line-height: 36px;
        font-weight: bold;
      }

      .success-stat {
        margin: 0;
        font-size: 20px;
        line-height: 28px;
        font-weight: bold;
        margin-bottom: .75em;
      }

      .success-desc {
        margin: 0;
        font-size: 14px;
        line-height: 18px;
        color: #808080
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
      <div class="success-card">
        <div class="success-line-one">
          <h3>${this.cardValue}</h3>
          <img src=${this.imageUrl} />
        </div>
        <p class="success-stat">${this.cardStat}</p>
        <p class="success-desc">${this.description}</p>
      </div>
    `;
  }
}