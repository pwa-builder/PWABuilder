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
        background: url(/assets/images/glass.jpg);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: right;
      }

      #main-container {
        display: flex;
        align-items: center;
        padding-bottom: 91px;
        padding-left: 2em;
      }

      #circles-box {
        --colors: #888094, #5a5ab7, #d9a0f7, #5d2863, #5b5bb9;
        --min-radius: 30;
        --max-radius: 100;
        --num-circles: 15;
        --min-opacity: 10;
        --max-opacity: 50;
        background-image: paint(circles);
      }

      #background-filter-box {
        background: linear-gradient(
          106.57deg,
          rgba(255, 255, 255, 0.616) 0%,
          rgba(255, 255, 255, 0.098) 100%
        );
        backdrop-filter: blur(40px);
      }

      img {
        margin-left: 30px;
        height: 389px;
        width: 369px;

        animation: float 3s ease-in-out infinite;
      }

      /*
        keeping this here as its only used in this component
      */
      @keyframes float {
        0% {
          transform: translateY(0px);
        }
        25% {
          transform: translateY(-10px);
        }
        75% {
          transform: translateY(10px);
        }
        100% {
          transform: translateY(0px);
        }
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

  async firstUpdated() {
    await loadPaintPolyfillIfNeeded();
    (CSS as any).paintWorklet.addModule('/workers/header-paint.js');
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
              <slot name="picture-container">
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
              </slot>
            </section>
          </div>
        </div>
      </div>
    `;
  }
}
