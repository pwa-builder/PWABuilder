import { LitElement, css, html } from 'lit';

import { customElement, state } from 'lit/decorators.js';

import { smallBreakPoint } from '../utils/css/breakpoints';

@customElement('survey-banner')
export class SurveyBanner extends LitElement {
  @state() show = true;

  static get styles() {
    return css`
      #survey-banner {
        background: rgb(243, 243, 243);
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        background-color: #342A6A;
        color: white;
      }

      #banner-content {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #desk_box {
        height: 29px;
        width: 29px;
        margin-right: 10px;
      }

      #survey-banner #take-survey-button {
        border-radius: var(--button-radius);
        border: none;
        background: white;
        padding: 10px 20px;
        margin-left: 10px;
        font-weight: 700;
        width: fit-content;
      }

      #take-survey-button:hover {
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

      #desk_close {
        height: 12px;
        width: 12px;
        margin-top: 5px;
        margin-right: 5px;
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
          width: 120px;
          margin: 0 10px;
          max-height: 45px;
        }

        #spacer {
          display: none;
        }

        #mobile_box {
          display: block;
        }

        #mobile_close {
          display: block;
          margin-top: 5px;
          margin-right: 5px;
        }

        #desk_box {
          display: none;
        }

        #desk_close {
          display: none;
        }

        #survey-banner #take-survey-button {
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
            <img id="desk_box" src="assets/images/wrapped-gift 1_Desktop.png" alt="gift box image"/>
            <img id="mobile_box" src="assets/images/wrapped-gift 1_Mobile.png" alt="gift box image"/>
            <p>
              Complete the survey for a chance to win a $25 Amazon gift card. 
            </p>

            <a href="https://forms.office.com/r/LHq6gqJ9Lf" target="_blank" rel="noopener"><button
              id="take-survey-button"
              aria-label="Take Survey Button"
              @click="${() => console.log("open suvery")}"
            >
            Take Survey
            </button></a>
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
