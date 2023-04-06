import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { manifest_fields } from '../utils/manifest-info';

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

@customElement('manifest-info-card')
export class ManifestInfoCard extends LitElement {
  @property({ type: String }) field: string = "";

  static get styles() {
    return [
    css`

      .mic-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .info-box {
        background-color: var(--font-color);
        max-width: 220px;
        color: #ffffff;
        padding: 10px;
        border-radius: var(--card-border-radius);
        position: relative;
      }

      .info-box p {
        margin: 0;
        font-size: 16px;
      }

      .info-box a {
        color: #ffffff;
        font-size: 16px;
      }

      .info-box a:visited, .info-box a:active, .info-box a:link {
        color: #ffffff;
      }

      .right {
        background-color: none;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .right:hover {
        cursor: pointer;      
      }

      /* < 480px */
      ${smallBreakPoint(css`
      `)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
      `)}

      /* 640px - 1023px */
      ${largeBreakPoint(css`
      `)}

      /*1024px - 1365px*/
      ${xLargeBreakPoint(css`
      `)}

      /* > 1920 */
      ${xxxLargeBreakPoint(css`
          
      `)}

    `
    ];
  }

  constructor() {
    super();
  }

  firstUpdated(){
   
  }

  render() {
    return html`
    <div class="mic-wrapper">
      <sl-dropdown distance="10" placement="left" >
        <button slot="trigger" type="button" class="right" class="nav_link nav_button">
          <img src="assets/tooltip.svg" alt="info symbol, additional information available on hover" />
        </button>
        <div class="info-box">
          ${manifest_fields[this.field].description.map((line: String) => html`<p class="info-blurb">${line}</p>`)}
          <a class="learn-more" href="${manifest_fields[this.field].docs_link ?? "https://docs.pwabuilder.com"}" target="blank" rel="noopener noreferrer">Learn More</a>
        </div>
      </sl-dropdown>
    </div>
    `;
  }
}