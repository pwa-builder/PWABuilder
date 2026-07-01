import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';


import { successCardStyles } from "./success-card.styles";
@customElement('success-card')
export class SuccessCard extends LitElement {
  @property({ type: String }) imageUrl: string = "";
  @property({ type: String }) cardStat: string = "";
  @property({ type: String }) description: string = "";
  @property({ type: String }) cardValue: string = "";
  @property({ type: String }) company: string = "";
  @property({ type: String }) source: string = "";

  static styles = [successCardStyles];

  constructor() {
    super();
  }

  render() {
    return html`
      <a @click=${() => recordPWABuilderProcessStep("middle." + this.company + "_clicked", AnalyticsBehavior.ProcessCheckpoint)} class="success-card" href="${this.source}" rel="noopener" target="_blank" aria-label=${"Success story of " + this.company + " link, click for more details on separate tab"}>
        <div class="success-line-one">
           <img src=${this.imageUrl} alt="${this.company} logo"/>
           <h3 class="success-stat">
             <span>${this.cardValue}</span> ${this.cardStat}
           </h3>    
        </div>
        <p class="success-desc">${this.description}</p>
  </a>
    `;
  }
}