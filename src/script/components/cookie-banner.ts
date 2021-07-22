import { LitElement, css, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';

import { smallBreakPoint } from '../utils/css/breakpoints';

@customElement('cookie-banner')
export class CookieBanner extends LitElement {
  @state() show = false;

  static get styles() {
    return css`
      #cookie-banner {
        background: rgb(243, 243, 243);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        font-weight: 700;
        font-size: var(--small-font-size);
      }

      #cookie-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #cookie-banner #close-button {
        border-radius: var(--button-radius);
        border: none;
        background: white;
        padding: 8px;
        font-weight: bold;
        padding-left: 10px;
        padding-right: 10px;
        margin-left: 10px;
        width: 6em;
      }

      ${smallBreakPoint(css`
        #cookie-banner {
          align-items: center;
          display: flex;
          flex-direction: column;
          text-align: center;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    const savedValue = localStorage.getItem('PWABuilderGDPR');

    if (JSON.parse(savedValue as string) !== true) {
      this.show = true;
      localStorage.setItem('PWABuilderGDPR', JSON.stringify(true));
    }
  }

  close() {
    this.show = false;
    localStorage.setItem('PWABuilderGDPR', JSON.stringify(true));
  }

  render() {
    return html`
      ${this.show
        ? html`<div id="cookie-banner">
            <p>
              This site uses cookies for analytics and personalized content. By
              continuing to browse this site, you agree to this use.
            </p>

            <div id="cookie-info">
              <a
                href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule"
                >Learn More</a
              >

              <button
                id="close-button"
                aria-label="Close Button"
                @click="${() => this.close()}"
              >
                Close
              </button>
            </div>
          </div>`
        : null}
    `;
  }
}
