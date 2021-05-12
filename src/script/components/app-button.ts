import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { smallBreakPoint } from '../utils/css/breakpoints';
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

          --font-size: var(--desktop-button-font-size);
          --button-square: var(--button-height);
          --button-width: 120px;
          --button-font-color: var(--secondary-color);
          --pading-vertical: 0;
          --padding-horizontal: 34px;
        }
      `,
      // fast css
      fastButtonCss,
      css`
        fast-button {
          color: var(--button-font-color);
          width: var(--button-width);

          border-radius: var(--button-radius);
          box-shadow: var(--button-shadow);
        }

        fast-button:disabled::part(control) {
          cursor: not-allowed;
        }

        fast-button::part(control) {
          font-size: var(--font-size);
          font-weight: var(--font-bold);
          padding: var(--padding-vertical) var(--padding-horizontal);
        }

        fast-button.secondary {
          color: var(--font-color);
          border-color: transparent;
        }

        fast-button.link {
          --accent-foreground-active: var(--font-color);
          --accent-foreground-hover: var(--font-color);

          width: auto;

          border-radius: unset;
          box-shadow: none;
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
      `,
      smallBreakPoint(css`
        fast-button {
          --font-size: var(--mobile-button-fontsize);
        }
      `),
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

  classMap() {
    const className = this.className || '';

    return classMap({
      [className]: className,
      link: this.appearance === 'lightweight',
      secondary: this.appearance === 'outline',
    });
  }
}
