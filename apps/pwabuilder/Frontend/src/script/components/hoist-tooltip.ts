import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { hoistTooltipStyles } from "./hoist-tooltip.styles";
import '@awesome.me/webawesome/dist/components/tooltip/tooltip.js';

/**
 * A tooltip that can receive focus or contain clickable elements.
 * Usage:
 *  <hoist-tooltip text="hello, world" link="https://test.com"></hoist-tooltip>
 */
@customElement("hoist-tooltip")
export class HoistTooltip extends LitElement {
  @property({ type: String }) text = "";
  @property({ type: String }) link = "";
  @property({ type: Boolean }) disabled = false;
  static styles = [hoistTooltipStyles];

  constructor() {
    super();
  }

  render(): TemplateResult {
    return html`
      <span class="tooltip-anchor" id="tooltip-anchor">
        <slot></slot>
      </span>
      <wa-tooltip
        for="tooltip-anchor"
        trigger="hover focus"
        placement="right-start"
        without-arrow
        ?disabled=${this.disabled}
      >
        <div class="tooltip-content">
          <p>${this.text}</p>
          ${this.renderLink()}
        </div>
      </wa-tooltip>
    `;
  }

  renderLink(): TemplateResult {
    if (!this.link) {
      return html``;
    }

    return html` <a target="_blank" href="${this.link}"> Read more... </a> `;
  }
}
