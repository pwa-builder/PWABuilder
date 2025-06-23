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
        <img
          id="${this.circleId}"
          class="info-circle-img"
          src="assets/tooltip.svg"
          alt="help outline"
          aria-hidden="true"
        />
      </hoist-tooltip>
    `;
  }
}
