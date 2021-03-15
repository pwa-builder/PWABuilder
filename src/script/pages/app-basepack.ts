import { LitElement, css, html, customElement, internalProperty } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import '../components/app-header';
import '../components/app-sidebar';
import '../components/content-header';
import '../components/app-button';
import { BreakpointValues, largeBreakPoint,
  xxxLargeBreakPoint, } from '../utils/css/breakpoints';

// @ts-ignore
import style from '../../../styles/layout-defaults.css';

@customElement('app-basepack')
export class AppBasePack extends LitElement {
  @internalProperty() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @internalProperty() isDeskTopView = this.mql.matches;

  static get styles() {
    return [style, css`
        #tablet-sidebar {
          display: none;
        }

        #desktop-sidebar {
          display: block;
        }

        content-header::part(header) {
          display: none;
        }

        .container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-items: center;

          padding-right: 2em;
        }

        .container .action-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .container .action-buttons > app-button {
          margin: 1rem;
        }

        #summary-block {
          padding: 16px;
          border-bottom: var(--list-border);

          margin-right: 2em;
        }

        p {
          font-size: var(--font-size)
        }

        h2 {
          font-size: var(--xlarge-font-size);
          line-height: 46px;
          max-width: 526px;
        }

        #hero-p {
          font-size: var(--font-size);
          line-height: 24px;
          max-width: 406px;
        }

        h3,
        h5 {
          font-size: var(--medium-font-size);
          margin-bottom: 8px;
        }

        h4 {
          margin-bottom: 8px;
          margin-top: 0;
        }

        #top-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #up-next {
          border-top: var(--list-border);
        }

        #download-summary p {
          max-width: 20em;
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

    `];
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
              <div id="top-container">
                <div id="download-summary">
                  <h3>Download Summary</h3>

                  <p>
                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.
                  </p>
                </div>

                <div id="download-actions">
                  <app-button>Download</app-button>
                </div>
              </div>

              <div id="up-next">
                <h5>Up next</h5>

                <p>
                  Ready to build your PWA? Tap "Build My PWA" to package your
                  PWA for the app stores or tap "Feature Store" to check out the
                  latest web components from the PWABuilder team to improve your
                  PWA even further!
                </p>
              </div>

              <div class="action-buttons">
                <app-button>Back</app-button>
                <app-button>Next</app-button>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  }
}
