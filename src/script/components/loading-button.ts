import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { smallBreakPoint, mediumBreakPoint } from '../utils/css/breakpoints';
import { AppButtonElement } from '../utils/interfaces.components';

import '../components/app-button';
import { FastButtonAppearance } from '../utils/fast-element';

@customElement('loading-button')
export class LoadingButton extends LitElement implements AppButtonElement {
  @property({ type: String }) type = 'submit';
  @property({ type: String }) colorMode = 'primary';
  @property({ type: String }) appearance: FastButtonAppearance = 'neutral';
  @property({ type: Boolean }) loading = false;
  @property({ type: Boolean }) disabled = false;

  static get styles() {
    return [
      css`
        :host {
          --loading-button-height: var(--button-height);
          --loading-button-width: 176px;
          --loader-size: 1.8em;
        }

        fast-progress-ring {
          height: var(--loader-size);
          width: var(--loader-size);

          --accent-foreground-rest: white;
        }

        app-button {
          height: var(--loading-button-height);
        }

        app-button::part(underlying-button) {
          height: 100%;
          font-size: inherit;
        }
      `,
      smallBreakPoint(css`
        fast-button::part(control) {
          font-size: var(--mobile-button-fontsize);
        }
      `),
      mediumBreakPoint(
        css`
          app-button {
            width: var(--loading-button-width);
            height: var(--mobile-button-height);
          }
        `,
        'no-lower'
      ),
    ];
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <app-button
        part="underlying-button"
        .appearance=${this.appearance}
        .type=${this.type}
        .colorMode=${this.colorMode}
        ?disabled=${this.disabled || this.loading}
      >
        ${this.loading
          ? html`<fast-progress-ring></fast-progress-ring>`
          : html`<slot></slot>`}
      </app-button>
    `;
  }
}
