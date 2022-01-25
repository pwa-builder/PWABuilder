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

      #cookie-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start
        justify-content: center;
      }

      #cookie-text p {
        margin-bottom: 0;
      }

      .action-button {
        border-radius: var(--button-radius);
        border: none;
        padding: 8px;
        font-weight: bold;
        padding-left: 10px;
        padding-right: 10px;
        margin-left: 10px;
        width: 6em;
      }

      .action-button:hover {
        cursor: pointer;
      }

      #accept-button {
        background-color: black;
        color: white;
      }

      #reject-button {
        background-color: white;
        color: black;
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
      //localStorage.setItem('PWABuilderGDPR', JSON.stringify(true));
    }
  }

  close(response: boolean) {
    this.show = false;
    localStorage.setItem('PWABuilderGDPR', JSON.stringify(response));
  }

  render() {
    return html`
      ${this.show
        ? html`
        <div id="cookie-banner">
          <div id="cookie-text">
            <p>
              This site uses cookies for analytics and personalized content. By
              continuing to browse this site, you agree to this use.
            </p>
            <a
              href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule"
              >Learn More</a
            >
          </div>

          <div id="cookie-buttons">
            <button
              id="reject-button"
              class="action-button"
              aria-label="Reject Button"
              @click="${() => this.close(false)}"
            >
              Reject
            </button>

            <button
              id="accept-button"
              class="action-button"
              aria-label="Accept Button"
              @click="${() => this.close(true)}"
            >
              Accept
            </button>
          </div>
        </div>`
        : null}
    `;
  }
}
