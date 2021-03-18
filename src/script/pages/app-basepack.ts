import { LitElement, css, html, customElement, internalProperty } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import '../components/app-header';
import '../components/app-sidebar';
import '../components/content-header';
import { BreakpointValues } from '../utils/css/breakpoints';

@customElement('app-basepack')
export class AppBasePack extends LitElement {
  @internalProperty() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @internalProperty() isDeskTopView = this.mql.matches;

  static get styles() {
    return css``;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
 
  }

  render() {
    return html`
      <div>
        <app-header></app-header>

        <div
          id="grid"
          class=${classMap({
            'grid-mobile': this.isDeskTopView == false,
          })}
        >
          <app-sidebar id="desktop-sidebar"></app-sidebar>

          <div>
            <content-header>
              <h2 slot="hero-container">Getting down to business.</h2>
              <p id="hero-p" slot="hero-container">
                Description about what is going to take place below and how they
                are on their way to build their PWA. Mention nav bar for help.
              </p>

              <img
                slot="picture-container"
                src="/assets/images/reportcard-header.svg"
                alt="report card header image"
              />
            </content-header>

            <app-sidebar id="tablet-sidebar"></app-sidebar>

            <section id="summary-block">
              <h3>Download your PWA base files</h3>

              <p>
                Grab everything you need to make your app a PWA and get ready for publishing to the app stores! 
              </p>
            </section>

            <section class="container">
              <h3>Body</h3>
            </section>
          </div>
        </div>
      </div>
    `;
  }
}
