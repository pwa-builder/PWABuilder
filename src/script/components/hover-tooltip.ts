import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hover-tooltip')
export class HoverTooltip extends LitElement {
  @property({ type: String }) text: string = '';
  @property({ type: String }) link: string = '';

  static get styles() {
    return css`
      #hover-tooltip {
        display: none;

        position: relative;

        flex-direction: column;
        justify-content: space-around;

        padding: 8px;
        border-radius: 6px;
        position: absolute;
        z-index: 1000;

        white-space: break-spaces;
        width: 14em;

        background: var(--font-color);
        left: 0em;
        top: 0em;

        color: #fff;
        font-weight: initial;

        line-height: initial;
        font-size: 14px;
      }

      #hover-tooltip a {
        color: #fff;
        text-decoration: underline;
      }

      #tooltip-block {
        position: relative;
        cursor: pointer;

        display: flex;
      }

      #tooltip-block img {
        height: 12px;
        width: 12px;
        border-radius: 50%;
        background: var(--neutral-fill-stealth-rest);
        padding: 4px;
        margin-left: 6px;
      }

      #tooltip-block:hover #hover-tooltip {
        display: flex;
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div id="tooltip-block">
        <img part="tooltip-image" src="assets/images/help-outline.svg" alt="help outline" aria-hidden="true"
          id="tooltip-image" />
      
        ${this.renderLinkOrSpan()}
      </div>
    `;
  }

  renderLinkOrSpan() {
    if (this.link) {
      return html`
        <p id="hover-tooltip">
          ${this.text}
          <a target="_blank" href="${this.link}"><i class="fas fa-external-link-square-alt"></i>Read more...</a>
        </p>
      `;
    }

    return html`<span id="hover-tooltip">${this.text}</span>`;
  }
}
