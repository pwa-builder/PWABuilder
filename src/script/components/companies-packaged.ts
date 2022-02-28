import { LitElement, css, html } from 'lit';

import { customElement } from 'lit/decorators.js';

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xxLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

@customElement('companies-packaged')
export class ComapniesPackaged extends LitElement {

  static get styles() {
    return [
    css`
      #success-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 2em 0;
        background-color: white;
      }

      #success-title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #292C3A;
        margin-bottom: 1em;
      }

      #success-title h2 {
        text-align: center;
        font-size: 1.6em;
        margin: 0;
      }

      #success-title p {
        text-align: center;
        margin: 0;
        font-size: .75em;
      }

      #success-wrapper #img-box {
        background-image: url("/assets/new/packaged_1366.svg");
        height: 4em;
        width: 100%;
        background-repeat: no-repeat;
        background-position: center;
      }

      /* < 480px */
      ${smallBreakPoint(css`
          #success-wrapper #img-box {
            background-image: url("/assets/new/packaged_320.png");
            height: 7em;
          }
      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
          #success-wrapper #img-box {
            background-image: url("/assets/new/packaged_480.png");
            height: 7em;
          }
      `)}

      /* 640px - 1023px */
      ${largeBreakPoint(css`
        #success-wrapper #img-box {
          background-size: 85%;
        }
      `)}

      /*1024px - 1365px*/
      ${xxLargeBreakPoint(css`
          
      `)}

      /* > 1920px */
      ${xxxLargeBreakPoint(css`
          #success-wrapper #img-box {
            background-size: 50%;
          }
      `)}
    `
    ];
  }

  constructor() {
    super();
  }

  firstUpdated() {
  }


  render() {
    return html`
    <div id="success-wrapper">
      <div id="success-title">
          <h2>Apps Packaged</h2>
          <p>Companies of all sizes—from startups to Fortune 500s—have used PWABuilder to package their PWAs.</p>
      </div>
      <div id="img-box" alt="logos of companies that use PWA" style="visibility: hidden" ></div>
    </div>
    `;
  }
}
