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
        :host {
          --height: 16px;
          --min-width: 16px;
        }

        .flipper-button {
          animation-name: close;
          animation-duration: 0.3s;
          animation-iteration-count: 1;

          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 18px;
          background: white;
          box-shadow: 0 1px 4px 0px rgb(0 0 0 / 25%);
          border-radius: 50%;
          color: #5231a7;

          height: var(--height);
          min-width: var(--min-width);

          margin-left: 5px;
        }

        .flipper-button.opened {
          animation-name: open;
          transform: rotate(90deg);
        }

        .flipper-button.large {
          --height: 32px;
          --min-width: 32px;
        }

        .flipper-button.large ion-icon {
          height: 18px;
          min-width: 18px;
          font-size: 18px;
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
      <div
        class="${classMap({
          [this.className]: this.className,
          'flipper-button': true,
          'opened': this.opened,
        })}"
        mode="stealth"
      >
        <ion-icon name="caret-forward-outline"></ion-icon>
      </div>
    `;
  }
}
