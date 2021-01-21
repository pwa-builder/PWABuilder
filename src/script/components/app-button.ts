import { LitElement, css, html, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';


@customElement('app-button')
export class AppButton extends LitElement {
  @property({ type: String }) type: string = "";
  @property({ type: String }) colorMode = "primary";
  @property({ type: String }) appearance = "neutral";

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

      fast-button.link {
        width: auto;

        border-radius: unset;
        box-shadow: none;
      }

      fast-button.link::part(control) {
        width: auto;
        padding: 0;

      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <fast-button part="underlying-button" class="${this.classMap()}" .appearance="${this.appearance}" .type="${this.type}" .color="${this.colorMode}">
        <slot></slot>
      </fast-button>
    `;
  }

  classMap() {
    return classMap({
      link: this.appearance === 'lightweight'
    })
  }
}
