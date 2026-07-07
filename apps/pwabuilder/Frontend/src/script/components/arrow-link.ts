import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { arrowLinkStyles } from './arrow-link.styles';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

@customElement('arrow-link')
export class ArrowLink extends LitElement {
  @property({ type: String }) link = '';
  @property({ type: String }) text = '';

  static styles = [arrowLinkStyles];

  constructor() {
    super();
  }

  trackLinkClick(linkDescription: string){
    recordPWABuilderProcessStep(`${linkDescription}_link_clicked`, AnalyticsBehavior.ProcessCheckpoint);
  }

  render() {
    return html`
      <a
        class="arrow_anchor"
        href=${this.link}
        target="_blank" 
        rel="noopener" 
        aria-label="${this.text}, will open in separate tab"
        @click=${() => this.trackLinkClick(this.text.toLowerCase().split("").join("_"))}
      >
        <p class="arrow_link">${this.text}</p>
        <img
          class="arrow"
          src="/assets/new/arrow.svg"
          alt="arrow"
        />
    </a>
    `;
  }
}