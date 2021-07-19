import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * Used when a platform doesn't support a certain feature.
 */
@customElement('disclaimer-message')
export class DisclaimerMessage extends LitElement {
  static styles = css`
    .message {
      font-style: italic;
      font-size: 14px;
      opacity: 0.8;
      color: var(--secondary-font-color);
      font-weight: 600;
      margin: 0;
      text-align: center;
    }
  `;

  render() {
    return html`<p class="message"><slot></slot></p>`;
  }
}