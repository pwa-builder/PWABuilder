import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
// import { loadPaintPolyfillIfNeeded } from '../polyfills/css-paint';
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
        background: url(/assets/new/HeroBackground1920.jpg);
        background-position: top right;
        background-size: cover;
        background-repeat: no-repeat;

        height: 16em;
        display: flex;
        align-items: center;
      }

      :host(.reportCard) {
        background: url(/assets/images/report_card.webp) top right / cover
          no-repeat;
      }

      :host(.reportCard.mani) {
        background: url(/assets/images/report_card_manifest.webp) top right /
          cover no-repeat;
      }

      :host(.reportCard.sw) {
        background: url(/assets/images/report_card_sw.webp) top right / cover
          no-repeat;
      }

      :host(.basePackage) {
        background: url(/assets/images/base_package.webp) top right / cover
          no-repeat;
      }

      :host(.publish) {
        background: url(/assets/images/Publish_back1920.jpg) top right / cover no-repeat;
      }

      :host(.congrats) {
        background: url(/assets/images/congrats.webp) top right / cover
          no-repeat;
      }

      :host(.home) {
        height: initial;
        background-color: white;
      }

      :host(.home) #circles-box {
        width: 100%;
      }

      #content-side {
        max-width: 30em;
      }

      #main-container {
        display: flex;
        align-items: center;
        padding-bottom: 91px;
        padding-left: 2em;
      }

      :host ::slotted(h1) {
        margin-bottom: 0;
        line-height: 40px;

        max-width: 474px;
      }

      ${smallBreakPoint(css`
        :host(.home) {
          background-position: top center;
          background-repeat: no-repeat;
          background-image: url(/assets/images/home_mobile.webp);
          background-size: cover;

          height: 43em;
        }

        :host(.home) #circles-box {
          height: 44em;
        }

        :host(.home) #main-container {
          height: 51em;
          display: flex;
          justify-content: center;
          align-items: center;
          max-width: initial;
        }

        :host(.reportCard) {
          background-repeat: no-repeat;
          background-image: url(/assets/images/report_card_mobile.webp);
          background-size: cover;

          background-position: 0em -2.5em;
          height: 10em;
        }

        :host(.congrats) {
          background-repeat: no-repeat;
          background-image: url(/assets/images/congrats_mobile.webp);
          background-size: cover;

          background-position: 0em -2.5em;
          height: 10em;
        }

        :host(.basePackage) {
          background-repeat: no-repeat;
          background-image: url(/assets/images/base_package_mobile.webp);
          background-size: cover;

          background-position: 0em -2.5em;
          height: 10em;
        }

        :host(.publish) {
          background-repeat: no-repeat;
          background-image: url(/assets/images/publish_mobile.webp);
          background-size: cover;

          background-position: 0em -2.5em;
          height: 10em;
        }

        :host(.reportCard) #circles-box,
        :host(.publish) #circles-box,
        :host(.congrats) #circles-box,
        :host(.basePackage) #circles-box {
          height: 34em;
        }

        :host(.reportCard) #hero-container,
        :host(.publish) #hero-container,
        :host(.congrats) #hero-container,
        :host(.basePackage) #hero-container {
          text-align: initial;
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
          flex-direction: column-reverse;
          padding-left: 0;

          height: 23em;
          max-width: 16em;
        }

        #circles-box {
          height: 46em;
        }

        #hero-container {
          text-align: center;
        }

        ::slotted(ul) {
          grid-gap: 10px;
        }

        :host(.publish) {
          background-repeat: no-repeat;
          background-image: url(/assets/images/publish_mobile.webp);
          background-size: cover;

          background-position: 0em -2.5em;
          height: 10em;
        }

        :host(.publish) #circles-box {
          height: fit-content;
        }

        :host(.publish) #main-container {
          margin: 0;
          padding: 0;
          height: fit-content;
        }
        #content-side {
          width: 10em;
        }
      `)}

      ${mediumBreakPoint(css`
        :host(.home) {
          background-position: top center;
          background-repeat: no-repeat;
          background-image: url(/assets/images/home_mobile.webp);
          background-size: cover;

          height: 40em;
        }

        :host(.home) #circles-box {
          height: 40em;
        }

        :host(.reportCard) {
          background-repeat: no-repeat;
          background-image: url(/assets/images/report_card_mobile.webp);
          background-size: cover;

          background-position: 0em -2.5em;
          height: 10em;
        }

        :host(.reportCard) #circles-box,
        :host(.congrats) #circles-box,
        :host(.basePackage) #circles-box {
          height: 34em;
        }

        :host(.publish) {
          background-repeat: no-repeat;
          background-image: url(/assets/images/publish_mobile.webp);
          background-size: cover;

          background-position: 0em -2.5em;
          height: 10em;
        }

        :host(.publish) #circles-box {
          height: fit-content;
        }

        :host(.publish) #main-container {
          margin: 0;
          padding: 0;
        }


        :host(.congrats) {
          background-repeat: no-repeat;
          background-image: url(/assets/images/congrats_mobile.webp);
          background-size: cover;

          background-position: 0em -2.5em;
          height: 10em;
        }

        :host(.basePackage) {
          background-repeat: no-repeat;
          background-image: url(/assets/images/base_package_mobile.webp);
          background-size: cover;

          background-position: 0em -2.5em;
          height: 10em;
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

        :host(.reportCard) #hero-container,
        :host(.publish) #hero-container,
        :host(.congrats) #hero-container,
        :host(.basePackage) #hero-container {
          text-align: initial;
        }

        #hero-container {
          text-align: center;
        }

        #main-container {
          padding-top: initial;
          margin-top: 14em;

          flex-direction: column-reverse;
          padding-left: 0;
        }

        #circles-box {
          height: 30em;
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

        :host(.home) {
          background-repeat: no-repeat;
          background-image: url(/assets/new/HeroBackground1024.jpg);
          background-size: cover;
        }

        :host(.reportCard) {
          background: url(/assets/images/report_card.webp) top right / cover
            no-repeat;

          background-position: -1em;
        }

        :host(.reportCard.mani) {
          background-position: -1em;
        }

        :host(.reportCard.sw) {
          background-position: -1em;
        }

        :host(.basePackage) {
          background-position: -1em;
        }

        :host(.publish) {
          background-image: url(/assets/images/Publish_back1024.jpg);
          background-position: 0em;
        }

        :host(.congrats) {
          background-position: 0em;
        }
      `)}

      ${xLargeBreakPoint(css`
        img {
          height: 100%;
          width: initial;
        }

        :host(.home) {
          background-position: -21em center;
          background-repeat: no-repeat;
          background-image: url(/assets/new/HeroBackground1920.jpg);
          background-size: cover;
        }

        :host(.home) #content-side {
          max-width: 21em;
        }

        :host(.reportCard) {
          background: url(/assets/images/report_card.webp) top right / cover
            no-repeat;

          background-position: -1em;
        }

        :host(.reportCard.mani) {
          background-position: -1em;
        }

        :host(.reportCard.sw) {
          background-position: -1em;
        }

        :host(.basePackage) {
          background-position: -1em;
        }

        :host(.publish) {
          background-image: url(/assets/images/Publish_back1366.jpg);
          background-position: 0em;
        }

        :host(.congrats) {
          background-position: 0em;
        }
      `)}

      ${xxLargeBreakPoint(css`
        #content-side {
          max-width: 23em;
        }

        :host {
          background-position: -8em center;
          background-repeat: no-repeat;
          background-size: cover;
        }

        :host(.reportCard) {
          background: url(/assets/images/report_card.webp) top right / cover
            no-repeat;
        }

        :host(.basePackage) {
          background-position: 0em;
        }

        :host(.publish) {
          background-position: 2em;
        }

        :host(.congrats) {
          background-position: 0em;
        }
      `)}
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div id="circles-box">
        <div id="background-filter-box">

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
