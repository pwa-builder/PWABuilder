import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../components/hover-tooltip';

/**
 * A component that renders a round circle with a question mark in it.
 * When hovered or focused, a <hover-tooltip> will be shown.
 */
 @customElement('info-circle-tooltip')
 export class InfoCircleTooltip extends LitElement {
  @property({ type: String }) text = '';
  @property({ type: String }) link = '';
  readonly circleId = Math.random().toString(36).replace('0.', 'info-circle-');

  static get styles() {
    return css`
      .info-circle-img {
        height: 12px;
        width: 12px;
        border-radius: 50%;
        background: #e5e5e5;
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
      <img id="${this.circleId}" class="info-circle-img" src="assets/images/help-outline.svg" alt="help outline"
        aria-hidden="true" />

      <hover-tooltip anchor="${this.circleId}" text="${this.text}" link="${ifDefined(this.link)}">
      </hover-tooltip>
    `;
  }
 }