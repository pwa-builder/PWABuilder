import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { FastButtonAppearance } from '../utils/fast-element';
import { AppButtonElement } from '../utils/interfaces.components';

@customElement('flipper-button')
export class FlipperButton extends LitElement implements AppButtonElement {
  @property({ type: String }) type = '';
  @property({ type: String }) colorMode = 'primary';
  @property({ type: String }) appearance: FastButtonAppearance = 'neutral';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) opened = false;

  static get styles() {
    return [
      css`
        .flipper-button {
          animation-name: close;
          animation-duration: 0.1s;
          animation-iteration-count: 1;

          background: white;
          box-shadow: 0 1px 4px 0px rgb(0 0 0 / 25%);
          border-radius: 50%;
          color: #5231a7;

          height: 16px;
          min-width: 16px;

          margin-left: 5px;
        }

        .flipper-button.opened {
          animation-name: open;
        }

        .flipper-button ion-icon {
          pointer-events: none;

          height: 10px;
          width: 10px;
        }

        .flipper-button::part(control) {
          font-size: 18px;
          padding: 0;
        }

        .flipper-button::part(content) {
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes open {
          from {
            transform: rotate(0);
          }

          to {
            transform: rotate(90deg);
          }
        }

        @keyframes close {
          from {
            transform: rotate(90deg);
          }

          to {
            transform: rotate(0);
          }
        }
      `,
    ];
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <fast-button
        class="${classMap({
          [this.className]: this.className,
          'flipper-button': true,
          'opened': this.opened,
        })}"
        mode="stealth"
      >
        <ion-icon name="caret-forward-outline"></ion-icon>
      </fast-button>
    `;
  }
}
