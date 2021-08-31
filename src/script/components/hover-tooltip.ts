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
        z-index: 1;

        white-space: break-spaces;
        width: 14em;

        background: var(--font-color);
        left: 0em;

        color: #fff;
        text-decoration: none;
        font-weight: initial;
      }

      #tooltip-block {
        position: relative;
        cursor: pointer;
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
        <img
          part="tooltip-image"
          src="assets/images/help-outline.svg"
          alt="help outline"
          aria-hidden="true"
          id="tooltip-image"
        />

        <a id="hover-tooltip" target="_blank" href="${this.link}"
          >${this.text}</a
        >
      </div>
    `;
  }
}
