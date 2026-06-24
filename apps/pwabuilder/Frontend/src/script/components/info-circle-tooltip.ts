import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import "../components/hoist-tooltip";

/**
 * A component that renders a round circle with a question mark in it.
 * When hovered or focused, a <hoist-tooltip> will be shown.
 */
@customElement("info-circle-tooltip")
export class InfoCircleTooltip extends LitElement {
  @property({ type: String }) text = "";
  @property({ type: String }) link = "";
  readonly circleId = Math.random().toString(36).replace("0.", "info-circle-");

  static get styles() {
    return css`
      .holder {
        display: flex;
        height: fit-content;
      }
      .info-circle-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
      }
      .info-circle-btn:focus-visible {
        outline: 2px solid var(--primary-color, #4f3fb6);
        outline-offset: 2px;
        border-radius: 50%;
      }
      .info-circle-img {
        height: 16px;
        width: 16px;
        border-radius: 50%;
        padding: 4px;
        margin-left: 6px;
      }
    `;
  }

  constructor() {
    super();
  }

  render(): TemplateResult {
    return html`
      <hoist-tooltip
        class="holder"
        text=${this.text}
        link="${ifDefined(this.link)}"
      >
        <button
          id="${this.circleId}"
          class="info-circle-btn"
          type="button"
          aria-label="More information: ${this.text}"
        >
          <img
            class="info-circle-img"
            src="assets/tooltip.svg"
            alt=""
            aria-hidden="true"
          />
        </button>
      </hoist-tooltip>
    `;
  }
}
