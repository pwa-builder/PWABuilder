import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../components/app-button';
import { classMap } from 'lit/directives/class-map.js';


@customElement('loading-button')
export class LoadingButton extends LitElement {
  @property({ type: String }) type = 'submit';
  @property({ type: Boolean }) loading = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) secondary = false;
  @property({ type: Boolean }) primary = false;

  static get styles() {
    return [
      css`
        :host {
          --loader-size: 1.8em;
        }

        fast-progress-ring {
          height: var(--loader-size);
          width: var(--loader-size);
          margin: 0;

          --accent-foreground-rest: var(--secondary-color);
        }

        #loading-options.secondary fast-progress-ring {
          --accent-foreground-rest: var(--primary-color);
          --neutral-fill-rest: white;
          --neutral-fill-active: white;
          --neutral-fill-hover: white;  
        }

        #loading-options.primary {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 35px;
          font-size: 14px;
          font-family: inherit;
          font-weight: 700;
          color: white;
          background-color: #292c3a;
          box-shadow: rgb(0 0 0 / 25%) 0px 1px 4px;
          border-radius: 20px;
        }

        #loading-options.primary:hover {
          background-color: #545454;
        }

        #loading-options.secondary {
          display: flex;
          justify-content: center;
          padding: 10px 4px 8px 4px;
          font-size: 14px;
          font-family: inherit;
          font-weight: 700;
          color: #292c3a;
          margin-top: 3px;
          background-color: white;
          box-shadow: rgb(0 0 0 / 25%) 0px 1px 4px;
          border-radius: 20px;
        }

        #loading-options.secondary.disabled {
          opacity: 0.8;
          color: #747578;
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
        role="button"
        aria-label="loading button"
        id="loading-options"
        class=${classMap({
          secondary: this.secondary,
          primary: this.primary,
          disabled: this.disabled
        })}
      >
        ${this.loading
          ? html`<fast-progress-ring></fast-progress-ring>`
          : html`<slot></slot>`}
      </div>
    `;
  }
}
