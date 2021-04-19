import { css, customElement, html, LitElement } from 'lit-element';
import { loadPaintPolyfillIfNeeded } from '../polyfills/css-paint';
import {
  BreakpointValues,
  largeBreakPoint,
  mediumBreakPoint,
  smallBreakPoint,
  xLargeBreakPoint,
  xxLargeBreakPoint,
} from '../utils/css/breakpoints';
import './app-header';

@customElement('content-header')
export class ContentHeader extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        background: url(/assets/images/home_1920.jpg) right / cover no-repeat;
        background-position: top right;
        background-size: cover;
        background-repeat: no-repeat;
      }

      #main-container {
        display: flex;
        align-items: center;
        padding-bottom: 91px;
        padding-left: 2em;
      }

      ${smallBreakPoint(css`
        #main-container {
          flex-direction: column-reverse;
        }

        img {
          margin-left: 0;
          width: 226px;
          height: 226px;
          margin-top: 16px;
        }

        #content-side {
          padding: 1em;
        }

        #main-container {
          padding-top: initial;
          padding-bottom: 51px;
          padding-left: 0;
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
          width: 100%;
          height: 226px;
          margin-top: 16px;
        }

        #content-side {
          padding: 1em;
        }

        #hero-container {
          text-align: center;
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
          height: 100%;
          width: initial;
        }

        :host {
          background-position: -16em center;
          background-repeat: no-repeat;
          background-image: url(/assets/images/home_1920.jpg);
          background-size: cover;
        }
      `)}

      ${xxLargeBreakPoint(css`
        #content-side {
          width: 28em;
        }

        :host {
          background-position: -8em center;
          background-repeat: no-repeat;
          background-image: url(/assets/images/home_1920.jpg);
          background-size: cover;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // await loadPaintPolyfillIfNeeded();
    // (CSS as any).paintWorklet.addModule('/workers/header-paint.js');
  }

  render() {
    return html`
      <div id="circles-box">
        <div id="background-filter-box">
          <app-header part="header"></app-header>

          <div part="main-container" id="main-container">
            <section id="content-side">
              <div id="hero-container">
                <slot name="hero-container"></slot>
              </div>

              <slot part="grid-container" name="grid-container"></slot>

              <slot name="input-container"></slot>
            </section>

            <section>
              <!--<slot name="picture-container">
                <picture>
                  <source
                    srcset="/assets/images/pwab3d.png"
                    media="(max-width: ${BreakpointValues.mediumLower}px)"
                  />
                  <source
                    srcset="/assets/images/full_header_logo.png"
                    media="(max-width: ${BreakpointValues.mediumUpper}px)"
                  />
                  <img
                    src="/assets/images/pwab3d.png"
                    alt="3d version of the PWABuilder logo"
                  />
                </picture>
              </slot>-->
            </section>
          </div>
        </div>
      </div>
    `;
  }
}
