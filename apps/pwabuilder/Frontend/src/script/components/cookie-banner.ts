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
        font-size: var(--footer-font-size);
        position: fixed;
        bottom: 0;
        z-index: 2;
        width: 100%;
        box-sizing: border-box;
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
        border-radius: var(--button-border-radius);
        border: none;
        padding: 8px;
        font-weight: bold;
        padding-left: 10px;
        padding-right: 10px;
        margin-left: 10px;
        width: fit-content;
      }

      #cookie-actions button:hover {
        cursor: pointer;
      }

      #cookie-actions #reject-button {
        background: #ffffff;
        color: var(--font-color);
      }

      #cookie-actions #accept-button {
        background: var(--font-color);
        color: white;
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

        #cookie-actions {
          flex-direction: column;
          align-items: center;
          justify-content: center;
          row-gap: 5px;
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
    
    if (!savedValue) {
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
              This site uses cookies to offer you a better browsing experience. Click below to learn more.
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
                Reject all non-essential cookies
              </button>

              <button
                id="accept-button"
                aria-label="Accept Button"
                @click="${() => this.close(true)}"
              >
                Accept all cookies
              </button>
            </div>
          </div>`
        : null}
    `;
  }
}
