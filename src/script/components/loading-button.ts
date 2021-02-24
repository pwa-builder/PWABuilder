import { LitElement, css, html, customElement, property } from 'lit-element';
import { smallBreakPoint, mediumBreakPoint } from '../utils/css/breakpoints';

import '../components/app-button';

@customElement('loading-button')
export class LoadingButton extends LitElement {
  @property({ type: Boolean }) loading = false;

  static get styles() {
    return css`
      fast-progress-ring {
        height: 1.8em;
        width: 1.8em;

        --accent-foreground-rest: var(--primary-purple);
      }

      ${smallBreakPoint(css`
        fast-button {
          width: 176px;
          height: var(--mobile-button-height);
        }

        fast-button::part(control) {
          font-size: var(--mobile-button-fontsize);
        }

        app-button::part(underlying-button) {
          width: 176px;
          font-size: 22px;
          height: 64px;
        }
      `)}

      ${mediumBreakPoint(css`
        fast-button {
          width: 176px;
          height: var(--mobile-button-height);
        }

        fast-button::part(control) {
          font-size: var(--mobile-button-fontsize);
        }

        app-button::part(underlying-button) {
          width: 176px;
          font-size: 22px;
          height: 64px;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <app-button part="underlying-button" type="submit" color="primary">
        ${this.loading
          ? html`<fast-progress-ring></fast-progress-ring>`
          : html`<slot></slot>`}
      </app-button>
    `;
  }
}
