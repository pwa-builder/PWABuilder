import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * A tooltip that can receive focus or contain clickable elements.
 * Usage:
 *  <hoist-tooltip text="hello, world" link="https://test.com"></hoist-tooltip>
 */
@customElement("hoist-tooltip")
export class InfoCircleTooltip extends LitElement {
  @property({ type: String }) text = "";
  @property({ type: String }) link = "";
  readonly circleId = Math.random().toString(36).replace("0.", "info-circle-");

  static get styles() {
    return css`
      sl-tooltip {
        --max-width: 250px;
        --hide-delay: 250;
        --sl-tooltip-arrow-size: 0;
      }

      sl-tooltip::part(body) {
        box-shadow: 0 0 5px gray;
        background-color: #000;
        border-radius: 0.25rem;
        width: max-content;
      }

      sl-tooltip::part(base) {
        padding: 0px 15px 0px 15px;
      }

      .tooltip-content {
        color: #fff;
        font-family: var(--font-family);
        font-size: 14px;
        font-weight: normal;
        line-height: 21px;
        pointer-events: auto;
      }

      a,
      a:hover,
      a:active {
        color: white;
        display: block;
        margin-bottom: 15px;
      }
    `;
  }

  constructor() {
    super();
  }

  render(): TemplateResult {
    return html`
      <sl-tooltip trigger="hover focus" placement="right-start" hoist>
        <div class="tooltip-content" slot="content">
          <p>${this.text}</p>
          ${this.renderLink()}
        </div>
        <slot></slot>
      </sl-tooltip>
    `;
  }

  renderLink(): TemplateResult {
    if (!this.link) {
      return html``;
    }

    return html` <a target="_blank" href="${this.link}"> Read more... </a> `;
  }
}
