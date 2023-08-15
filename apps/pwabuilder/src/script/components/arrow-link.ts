import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

@customElement('arrow-link')
export class ArrowLink extends LitElement {
  @property({ type: String }) link = '';
  @property({ type: String }) text = '';

  static get styles() {
    return [
      css`
      .arrow_anchor {
        font-size: var(--arrow-link-font-size);
        font-weight: bold;
        margin: 0px 0.5em 0px 0px;
        line-height: 1em;
        color: var(--primary-color);
        display: flex;
        column-gap: 10px;
        width: fit-content;
        text-decoration: none;
      }

      .arrow_anchor p {
        border-bottom: 1px solid #4f3fb6;
      }

      .arrow_anchor:visited {
        color: var(--primary-color);
      }

      .arrow_anchor:hover {
        cursor: pointer;
      }

      .arrow_anchor:hover img {
        animation: bounce 1s;
      }

      @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateX(-5px);
          }
          60% {
            transform: translateX(5px);
          }
      }
        `
    ];
  }

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