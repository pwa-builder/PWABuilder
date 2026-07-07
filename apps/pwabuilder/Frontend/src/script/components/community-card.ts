import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { communityCardStyles } from './community-card.styles';
import { link } from './community-hub-cards';

import {AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

@customElement('community-card')
export class CommunityCard extends LitElement {
  @property({ type: String }) imageUrl: string = "";
  @property({ type: String }) cardTitle: string = "";
  @property({ type: String }) description: string = "";
  @property({ type: String }) company: string = "";
  @property({type: Array}) links: link[] = [];

  static styles = [communityCardStyles];

  constructor() {
    super();
  }

  firstUpdated(){
  }

  render() {
    return html`
      <div class="community-card">
        <div class="community-card-image">
          <img src=${this.imageUrl} alt ="${this.company} logo" />
        </div>
        <div class="community-card-content">
          <h3>${this.cardTitle}</h3>
          <p>${this.description}</p>
          <div class="community-card-actions">
            ${this.links && this.links.map((link: any) =>
              html`
              <div class="card-link-box">
                <a @click=${() => recordPWABuilderProcessStep("bottom." + link.text + "_clicked", AnalyticsBehavior.ProcessCheckpoint)} href=${link.link} target="_blank" rel="noopener" aria-label="${link.text}, will open in separate tab">${link.text}</a>
                <img src="/assets/new/arrow.svg" alt="Click here to ${link.text}, will open separate tab" role="button"/>
              </div>
              `
            )}
          </div>
        </div>
      </div>
    `;
  }
}