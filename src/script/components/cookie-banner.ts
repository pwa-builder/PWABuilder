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
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
      }

      #cookie-info p {
        margin: 0;
      }

      #cookie-actions {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
      }

      #cookie-actions button {
        border-radius: var(--button-radius);
        border: none;
        padding: 8px;
        font-weight: bold;
        padding-left: 10px;
        padding-right: 10px;
        margin-left: 10px;
        width: 6em;
      }

      #cookie-actions button:hover {
        cursor: pointer;
      }

      #cookie-actions #reject-button {
        background: black;
        color: white;
      }

      #cookie-actions #accept-button {
        background: white;
      }



      ${smallBreakPoint(css`
        #cookie-banner {
          flex-direction: column;
          text-align: center;
        }

        #cookie-info{
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-bottom: 10px;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    // by default, non essential cookies are denied.
    const savedValue = localStorage.getItem('PWABuilderGDPR');

    if (JSON.parse(savedValue as string) !== true) {
      this.show = true;
      localStorage.setItem('PWABuilderGDPR', JSON.stringify(false));
    }
  }

  close(accepted: boolean) {
    this.show = false;

    // setting the PWABuilderGDPR var to what the user chose.
    localStorage.setItem('PWABuilderGDPR', JSON.stringify(accepted));
  }

  render() {
    return html`
      ${this.show
        ? html`<div id="cookie-banner">
            

            <div id="cookie-info">
              <p>
              This site uses cookies for analytics and personalized content. By
              continuing to browse this site, you agree to this use.
              </p>
              <a
                href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule"
                >Learn More
              </a>
            </div>

            <div id="cookie-actions">
              <button
                id="reject-button"
                aria-label="Reject Button"
                @click="${() => this.close(false)}"
              > 
                Reject
              </button>

              <button
                id="accept-button"
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
