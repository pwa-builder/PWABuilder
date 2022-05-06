import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
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
          --loader-size: 1.8em;
        }
        fast-progress-ring {
          height: var(--loader-size);
          width: var(--loader-size);
          --accent-foreground-rest: var(--secondary-color);
        }
        app-button.secondary fast-progress-ring {
          --accent-foreground-rest: var(--primary-color);
          --neutral-fill-rest: white;
          --neutral-fill-active: white;
          --neutral-fill-hover: white;
        }
      `,
    ];
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <app-button
        class=${this.className}
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