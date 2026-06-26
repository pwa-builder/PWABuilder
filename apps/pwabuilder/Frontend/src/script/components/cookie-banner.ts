import { LitElement, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { cookieBannerStyles } from './cookie-banner.styles';

@customElement('cookie-banner')
export class CookieBanner extends LitElement {
  @state() show = false;

  static styles = [cookieBannerStyles];

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
