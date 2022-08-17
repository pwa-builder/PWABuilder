import { LitElement, css, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';

import { smallBreakPoint } from '../utils/css/breakpoints';

@customElement('summit-banner')
export class SummitBanner extends LitElement {
  @state() show = true;

  static get styles() {
    return css`
      #summit-banner {
        background: rgb(243, 243, 243);
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: fit-content;
        background-color: #342A6A;
        color: white;
        padding: .75em;
      }

      #banner-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1em;
      }

      #banner-text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: .25em;
      }

      #banner-text a {
        color: white;
      }

      #bold-text {
        font-weight: bold;
      }

      #summit-banner p{
        font-size: 14px;
        line-height: 16px;
        margin: 0;
      }

      #spacer {
        width: 12px;
      }

      #closer {
        height: 100%;
        display: flex;
        align-self: flex-start;
      }

      #desk_close {
        height: 12px;
        width: 12px;
      }

      #desk_close:hover {
        cursor: pointer;
      }

      #mobile_box {
        height: 35px;
        width: 35px;
        display: none;
      }

      #mobile_close {
        height: 12px;
        width: 12px;
        display: none;
      }

      #mobile_close:hover {
        cursor: pointer;
      }

      ${smallBreakPoint(css`
        #summit-banner {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }

        #banner-content {
          width: 100%;
        }

        #survey-banner p{
          font-size: 12px;
          line-height: 15px;
          margin: 0 10px;
        }

        #spacer {
          display: none;
        }

        #mobile_box {
          display: block;
        }

        #mobile_close {
          display: block;
        }

        #desk_box {
          display: none;
        }

        #desk_close {
          display: none;
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
        <div id="summit-banner">
          <div id="spacer"></div>
          <div id="banner-content">

            <div id="banner-text">
              <p id="bold-text">Upcoming: PWA Summit on October 5th! 😄</p>
              <p>
                <a href="https://pwasummit.org/" target="_blank" rel="noopener">PWA Summit</a> is an online conference dedicated entirely to helping developers succeed with Progressive Web Apps. 
                Sign ups for speakers are now closed, but you can still register to attend <a href="https://pwasummit.org/register/" target="_blank" rel="noopener">here.</a>
              </p>
            </div>

          </div>
          <div id="closer" @click="${() => this.close()}">
            <img id="desk_close" src="assets/images/Close_desk.png" alt="gift box image"/>
            <img id="mobile_close" src="assets/images/Close_mobile.png" alt="gift box image"/>
          </div>
        </div>`
        : null}
    `;
  }
}
