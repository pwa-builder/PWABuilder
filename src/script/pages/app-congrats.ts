import {
  LitElement,
  css,
  html,
  customElement,
  internalProperty,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import {
  BreakpointValues,
  xxxLargeBreakPoint,
  largeBreakPoint,
} from '../utils/css/breakpoints';

// @ts-ignore
import style from '../../../styles/layout-defaults.css';

import '../components/app-header';
import '../components/app-sidebar';
import '../components/content-header';
import { getPlatformsGenerated } from '../services/congrats';

@customElement('app-congrats')
export class AppCongrats extends LitElement {
  @internalProperty() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @internalProperty() isDeskTopView = this.mql.matches;

  @internalProperty() generatedPlatforms = undefined;

  @internalProperty() generating = false;

  static get styles() {
    return [
      style,
      css`
        content-header::part(header) {
          display: none;
        }

        #summary-block {
          padding: 16px;
          border-bottom: var(--list-border);

          margin-right: 2em;
        }

        p {
          font-size: var(--font-size);
        }

        h2 {
          font-size: var(--xlarge-font-size);
          line-height: 46px;
          max-width: 526px;
        }

        h3 {
          font-size: var(--medium-font-size);
          margin-bottom: 8px;
        }

        #hero-p {
          font-size: var(--font-size);
          line-height: 24px;
          max-width: 406px;
        }

        ul {
          list-style: none;
          margin: 0;
          padding: 0;

          width: 100%;
        }

        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 35px;
          padding-bottom: 35px;
          border-bottom: var(--list-border);
        }

        li h4 {
          font-size: var(--small-medium-font-size);
        }

        ${xxxLargeBreakPoint(
          css`
            app-sidebar {
              display: block;
            }

            #tablet-sidebar {
              display: none;
            }

            #desktop-sidebar {
              display: block;
            }
          `
        )}

        ${largeBreakPoint(
          css`
            #tablet-sidebar {
              display: block;
            }

            #desktop-sidebar {
              display: none;
            }
          `
        )}
      `,
    ];
  }

  constructor() {
    super();
  }

  firstUpdated() {
    this.generatedPlatforms = getPlatformsGenerated();
    console.log(this.generatedPlatforms);
  }

  showWindowsOptionsModal() {}

  generatePackage(platform: string) {}

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
              <h2 slot="hero-container">Congrats! Your PWA has...</h2>
              <p id="hero-p" slot="hero-container">
                Description about what is going to take place below and how they
                are on their way to build their PWA. Mention nav bar for help.
              </p>

              <img
                slot="picture-container"
                src="/assets/images/reportcard-header.svg"
                alt="congrats header image"
              />
            </content-header>

            <app-sidebar id="tablet-sidebar"></app-sidebar>

            <section id="summary-block">
              <h3>Nice</h3>

              <p>
                REcap and intoduction to the other assets we have that can
                further their PWAs. Nemo enim ipsam voluptatem quia voluptas sit
                aspernatur aut odit aut fugit, sed quia consequuntur magni
                dolores eos qui ratione voluptatem sequi nesciunt. ven further!
              </p>
            </section>

            <section id="other-stores">
              <h3>Publish your PWA to other stores?</h3>

              <ul>
                ${this.generatedPlatforms &&
                this.generatedPlatforms.windows === false
                  ? html`
                      <li>
                        <div id="title-block">
                          <h4>Windows</h4>
                          <p>
                            Some text about how awesome PWAs are on Windows and
                            how you should publish to the Microsoft Store
                          </p>
                        </div>

                        <div id="platform-actions-block">
                          <app-button
                            @click="${() => this.showWindowsOptionsModal()}"
                            >Publish</app-button
                          >

                          <loading-button
                            ?loading=${this.generating}
                            id="test-package-button"
                            @click="${() => this.generatePackage('windows')}"
                            >Test Package</loading-button
                          >
                        </div>
                      </li>
                    `
                  : null}
              </ul>

              ${this.generatedPlatforms &&
              this.generatedPlatforms.android === false
                ? html``
                : null}
            </section>
          </div>
        </div>
      </div>
    `;
  }
}
