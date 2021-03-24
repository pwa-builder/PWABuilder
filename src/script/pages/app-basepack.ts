import { LitElement, css, html, customElement, internalProperty } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import '../components/app-header';
import '../components/app-sidebar';
import '../components/content-header';
import '../components/loading-button';
import '../components/app-modal';
import { BreakpointValues, largeBreakPoint,
  xxxLargeBreakPoint, smallBreakPoint } from '../utils/css/breakpoints';

// @ts-ignore
import style from '../../../styles/layout-defaults.css';

import { generateWebPackage } from '../services/publish/web-publish';
import { fileSave } from 'browser-fs-access';
import { Router } from '@vaadin/router';
import { getURL } from '../services/app-info';

@customElement('app-basepack')
export class AppBasePack extends LitElement {
  @internalProperty() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @internalProperty() isDeskTopView = this.mql.matches;
  
  @internalProperty() loading: boolean = false;
  @internalProperty() blob: Blob | File | undefined;

  @internalProperty() errored = false;
  @internalProperty() errorMessage: string | undefined;

  static get styles() {
    return [style, css`
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

        .container .action-buttons fast-anchor {
          /** 
             Seems like a magic value but really
             this is just to match the back button next to it
           */
          width: 100px;

          color: white;
          box-shadow: var(--button-shadow);
          border-radius: var(--button-radius);
          font-weight: bold;
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

        #report-link {
          color: white;
          border-radius: var(--button-radius);
          box-shadow: var(--button-shadow);
          width: 10em;
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

        ${smallBreakPoint(
          css`
           #top-container {
            flex-direction: column;
            align-items: flex-start;
           }

           #download-actions {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2em;
            margin-top: 2em;
           }
          `
        )}

    `];
  }

  constructor() {
    super();
  }

  async doWebGenerate() {
    this.loading = true;

    try {
      const generatedPackage = await generateWebPackage();

      if (generatedPackage) {
        this.blob = generatedPackage;
      }
    }
    catch (err) {
      this.errorMessage = err;
      this.errored = true;
    }

    this.loading = false;
  }

  async download() {
    if (this.blob) {
      await fileSave(this.blob, {
        fileName: 'your_pwa.zip',
        extensions: ['.zip'],
      });

      this.blob = undefined;
    }
  }

  showAlertModal(errorMessage: string) {
    this.errored = true;

    this.errorMessage = errorMessage;
  }

  reTest() {
    const site = getURL();
    
    if (site) {
      Router.go(`/testing?site=${site}`);
    }
  }

  render() {
    return html`
      <app-modal
        ?open="${this.blob ? true : false}"
        title="Test Package Download"
        body="Want to test your files first before publishing? No problem! Description here about how this isn’t store ready and how they can come back and publish their PWA after doing whatever they need to do with their testing etc etc tc etc."
        id="test-download-modal"
      >
        <img
          class="modal-image"
          slot="modal-image"
          src="/assets/images/warning.svg"
          alt="warning icon"
        />

        <div slot="modal-actions">
          <app-button @click="${() => this.download()}">Download</app-button>
        </div>
      </app-modal>

      <app-modal
        title="Wait a minute!"
        .body="${this.errorMessage || ''}"
        ?open="${this.errored}"
        id="error-modal"
      >
        <img
          class="modal-image"
          slot="modal-image"
          src="/assets/warning.svg"
          alt="warning icon"
        />

        <div slot="modal-actions">
          <fast-anchor target="_blank" rel="noopener" href="https://github.com/pwa-builder/PWABuilder/issues/new/choose" id="report-link" appearance="button">Report an Issue</fast-anchor>
        </div>
      </app-modal>
      
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
                  <loading-button ?loading="${this.loading}" @click="${() => this.doWebGenerate()}">Generate</loading-button>
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
                <app-button @click="${() => this.reTest()}">Run New Test</app-button>
                <fast-anchor href="/congrats">Next</fast-anchor>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  }
}
