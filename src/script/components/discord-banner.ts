import { LitElement, css, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';

import { smallBreakPoint } from '../utils/css/breakpoints';

@customElement('discord-banner')
export class DiscordBanner extends LitElement {
  @state() show = true;

  static get styles() {
    return css`
      #survey-banner {
        background: #f1f1f1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        color: #black;
        border-bottom: var(--header-border);
      }

      #banner-content {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #logo {
        height: 29px;
        width: 29px;
        margin-right: 10px;
      }

      #survey-banner #discord-button {
        border-radius: var(--button-radius);
        border: none;
        background: black;
        color: white;
        padding: 10px 20px;
        margin-left: 10px;
        font-weight: 700;
        width: fit-content;
      }

      #discord-button:hover {
        cursor: pointer;
      }

      #survey-banner p{
        font-size: 14px;
        line-height: 24px;
        font-weight: 700;
      }

      #spacer {
        width: 12px;
      }

      #closer {
        height: 100%;
        display: flex;
        align-items: baseline;
      }

      #close {
        height: 12px;
        width: 12px;
        margin-top: 5px;
        margin-right: 5px;
      }

      #close:hover {
        cursor: pointer;
      }

      ${smallBreakPoint(css`
        #survey-banner {
          align-items: center;
          display: flex;
          justify-content: space-between;
          height: 60px;
        }

        #banner-content {
          width: 100%;
        }

        #survey-banner p{
          font-size: 12px;
          line-height: 15px;
          font-weight: 700;
          width: 100%;
          margin: 0 10px;
          max-height: 45px;
        }

        #spacer {
          height: 12px;
          width: 12px;
        }

        #close {
          height: 12px;
          width: 12px;
          margin-top: 5px;
          margin-right: 5px;
        }

        #survey-banner #discord-button {
          margin: 0;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
  }

  close() {
    this.show = false;
  }

  render() {
    return html`
      ${this.show
        ? html`
        <div id="survey-banner">
          <div id="spacer"></div>
          <div id="banner-content">
            <img id="logo" src="/assets/images/discord_logo.svg" alt="discord logo"/>
            <p>
              Join the PWABuilder Discord community to connect with the people and resources you need.
            </p>

            <a href="https://aka.ms/pwabuilderdiscord" target="_blank" rel="noopener"><button
              id="discord-button"
              aria-label="Discord Button"
            >
            Join
            </button></a>
          </div>
          <div id="closer" @click="${() => this.close()}">
            <img id="close" src="assets/images/Close_desk.png" alt="close icon"/>
          </div>
        </div>`
        : null}
    `;
  }
}
