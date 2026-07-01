import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { infoCircleTooltipStyles } from "./info-circle-tooltip.styles";
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
  @property({ type: Boolean }) disabled = false;
  readonly circleId = Math.random().toString(36).replace("0.", "info-circle-");
  static styles = [infoCircleTooltipStyles];

  constructor() {
    super();
  }

  render(): TemplateResult {
    return html`
      <hoist-tooltip
        class="holder"
        text=${this.text}
        link="${ifDefined(this.link)}"
        ?disabled=${this.disabled}
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
