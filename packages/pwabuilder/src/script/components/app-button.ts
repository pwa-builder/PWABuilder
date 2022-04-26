import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { mediumBreakPoint } from '../utils/css/breakpoints';
import { fastButtonCss } from '../utils/css/fast-elements';
import { FastButtonAppearance } from '../utils/fast-element';
import { AppButtonElement } from '../utils/interfaces.components';

@customElement('app-button')
export class AppButton extends LitElement implements AppButtonElement {
  @property({ type: String }) type = '';
  @property({ type: String }) colorMode = 'primary';
  @property({ type: String }) appearance: FastButtonAppearance = 'neutral';
  @property({ type: Boolean }) disabled = false;

  static get styles() {
    return [
      css`
        :host {
          border-radius: var(--button-radius);
          display: block;
          outline: none;
          --font-size: var(--desktop-button-font-size);
          --button-height: 44px;
          --button-height: var(--desktop-button-height);
          --button-square: var(--button-height);
          --button-width: 127px;
          --button-width: var(--button-width);
          --button-font-color: var(--secondary-color);
          --pading-vertical: 0;
          --padding-horizontal: 34px;
        }
      `,
      // fast css
      fastButtonCss,
      css`
        [appearance='lightweight'] {
          box-shadow: none;
        }
        fast-button.link {
          --accent-foreground-active: var(--font-color);
          --accent-foreground-hover: var(--font-color);
          width: auto;
          border-radius: unset;
          box-shadow: none;
          background-color: transparent;
        }
        fast-button.link::part(control) {
          --padding-horizontal: 0;
          width: auto;
        }
        fast-button.round,
        fast-button.square {
          height: var(--button-square);
          width: var(--button-square);
        }
        fast-button.round::part(control),
        fast-button.square::part(control) {
          /* assumption is that the button is 14x21 */
          --padding-horizontal: 15px;
          align-items: center;
          line-height: 0;
        }
        fast-button:focus {
          outline: solid;
          outline-width: 2px;
        }
      `,
      mediumBreakPoint(
        css`
          fast-button.navigation {
            --button-width: 100px;
            --button-height: 40px;
            line-height: 28px;
            font-size: 16px;
          }
        `
      ),
    ];
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <fast-button
        part="underlying-button"
        class="${classMap({
          [this.className]: this.className,
          link: this.appearance === 'lightweight',
          secondary: this.appearance === 'outline',
        })}"
        .appearance="${this.appearance}"
        .type="${this.type}"
        .color="${this.colorMode}"
        ?disabled=${this.disabled}
      >
        <slot></slot>
      </fast-button>
    `;
  }
}