import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { infoCardStyles } from "./info-card.styles";
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';


@customElement('info-card')
export class Infocard extends LitElement {
  @property({ type: String }) imageUrl: string = "";
  @property({ type: String }) cardTitle: string = "";
  @property({ type: String }) description: string = "";
  @property({ type: String }) linkRoute: string = "";
  static styles = [infoCardStyles];

  constructor() {
    super();
  }

  firstUpdated(){
   
  }

  render() {
    return html`
      <div class="card">
        <div class="card-content">
          <img src=${this.imageUrl} alt="${this.cardTitle} icon" role="img"/>
          <h3>${this.cardTitle}</h3>
          <p>${this.description}</p>
        </div>
        <div class="card-actions" @click=${() => recordPWABuilderProcessStep("middle." + this.cardTitle + "_learn_more_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
          <a
            class="arrow_anchor"
            href=${this.linkRoute}
            rel="noopener"
            target="_blank"
            aria-label="Learn more about ${this.cardTitle}, will open separate tab"
          >
            <p class="arrow_link">Learn More</p>
            <img
              src="/assets/new/arrow.svg"
              alt="Click here to learn more about ${this.cardTitle}, will open separate tab"
              role="button"
            />
          </a>
        </div>
      </div>
    `;
  }
}