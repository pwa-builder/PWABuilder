import { LitElement, css, html, customElement, property } from 'lit-element';

@customElement('app-button')
export class AppButton extends LitElement {
  @property({ type: String }) type: string = "";
  @property({ type: String }) colorMode = "primary";

  static get styles() {
    return css`
      :host {
        border-radius: var(--button-radius);
        display: block;
      }

      fast-button {
        color: white;
        width: 100%;

        border-radius: var(--button-radius);
        box-shadow: var(--button-shadow);
      }

      fast-button::part(control) {
        font-size: var(--desktop-button-font-size);
        font-weight: var(--font-bold);
        padding-left: 34px;
        padding-right: 34px;
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <fast-button part="underlying-button" .type="${this.type}" .color="${this.colorMode}">
        <slot></slot>
      </fast-button>
    `;
  }
}
