import { LitElement, css, html, customElement } from 'lit-element';

import { smallBreakPoint, mediumBreakPoint, largeBreakPoint, xLargeBreakPoint, xxLargeBreakPoint } from '../utils/breakpoints';

import './app-header';

@customElement('content-header')
export class ContentHeader extends LitElement {

  static get styles() {
    return css`
      :host {
        display: block;
        background: url(/assets/images/background-copy.webp);
      }

      #main-container {
        display: flex;
        align-items: center;

        padding-bottom: 91px;
      }

      img {
        margin-left: 30px;
        height: 389px;
        width: 369px;
      }

      ${smallBreakPoint(css`
        #main-container {
          flex-direction: column-reverse;
        }

        img {
          margin-left: 0;
          width: 294px;
          height: 294px;
          margin-top: 16px;
        }

        #content-side {
          padding: 1em;
        }

        #main-container {
          padding-top: initial;
          padding-bottom: 51px;
        }

        #hero-container {
          text-align: center;
        }

        ::slotted(ul) {
          grid-gap: 10px;
        }
      `)}

      ${mediumBreakPoint(css`
        #main-container {
          flex-direction: column-reverse;
        }

        img {
          margin-left: 0;
          width: 294px;
          height: 294px;
          margin-top: 16px;
        }

        #content-side {
          padding: 1em;
        }

        #main-container {
          padding-top: initial;
        }
      `)}

      ${largeBreakPoint(css`
        ::slotted(ul) {
          grid-gap: 10px;
        }

        img {
          height: 282px;
          width: 268px;
        }
      `)}

      ${xLargeBreakPoint(css`
        img {
          height: 18em;
          width: initial;
        }
      `)}

      ${xxLargeBreakPoint(css`
        #content-side {
          width: 44em;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <app-header></app-header>

      <div part="main-container" id="main-container">
        <section id="content-side">
          <div id="hero-container">
            <slot name="hero-container"></slot>
          </div>

          <slot part="grid-container" name="grid-container"></slot>

          <slot name="input-container"></slot>
        </section>

        <section>
          <img src="/assets/images/pwab3d.png" alt="3d version of the PWABuilder logo">
        </section>
      </div>
    `;
  }
}
