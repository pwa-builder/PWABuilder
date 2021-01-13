import { LitElement, css, html, customElement, property } from 'lit-element';
import { smallBreakPoint, mediumBreakPoint } from '../utils/breakpoints';

@customElement('loading-button')
export class LoadingButton extends LitElement {
  @property({ type: Boolean }) loading: boolean = false;

  static get styles() {
    return css`
      fast-progress-ring {
        height: 1.8em;
        width: 1.8em;
      }

      fast-button::part(control) {
        font-size: var(--font-size);
        font-weight: var(--font-bold);
      }

      ${smallBreakPoint(css`
        fast-button {
          width: 176px;
          height: var(--mobile-button-height);
        }

        fast-button::part(control) {
          font-size: var(--mobile-button-fontsize);
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
      `)}
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <fast-button part="underlying-button" type="submit" color="primary">
        ${this.loading
          ? html`<fast-progress-ring></fast-progress-ring>`
          : html`<slot></slot>`}
      </fast-button>
    `;
  }
}
