import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import '../components/app-header';
import '../components/app-sidebar';
import '../components/content-header';
import '../components/loading-button';
import '../components/app-modal';
import {
  BreakpointValues,
  largeBreakPoint,
  xxxLargeBreakPoint,
  smallBreakPoint,
  mediumBreakPoint,
} from '../utils/css/breakpoints';

// @ts-ignore
import style from '../../../styles/layout-defaults.css';
// @ts-ignore
import listStyle from '../../../styles/list-defaults.css';

import { generateWebPackage } from '../services/publish/web-publish';
import { fileSave } from 'browser-fs-access';
import { Router } from '@vaadin/router';
import { getURL } from '../services/app-info';

import { localeStrings } from '../../locales';

@customElement('app-basepack')
export class AppBasePack extends LitElement {
  @state() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @state() isDeskTopView = this.mql.matches;

  @state() loading: boolean = false;
  @state() blob: Blob | File | undefined;

  @state() errored = false;
  @state() errorMessage: string | undefined;

  static get styles() {
    return [
      style,
      listStyle,
      css`
        content-header::part(header) {
          display: none;
        }

        .container {
          padding: 16px 16px 16px 36px;
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
          width: 11em;

          color: white;
          box-shadow: var(--button-shadow);
          border-radius: var(--button-radius);
          font-weight: bold;
        }

        #summary-block {
          padding: 16px 16px 16px 36px;
          border-bottom: var(--list-border);

          margin-right: 2em;
        }

        p {
          font-size: var(--font-size);
        }

        h2 {
          font-size: var(--xlarge-font-size);
          line-height: 46px;
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

        #up-next ol {
          margin: 0;
          padding-left: 1em;
          font-size: var(--font-size);
        }

        #download-summary p {
          max-width: 58em;
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

            #basepack-wrapper {
              max-width: 69em;
              background: white;
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

        ${mediumBreakPoint(
        css`
            .basePackage h2 {
              font-size: 33px;
              max-width: 10em;

              margin-top: 0;
              margin-bottom: 1em;
            }

            .basePackage p {
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

            .basePackage h2 {
              font-size: 33px;

              margin-top: 0;
              margin-bottom: 1em;
            }

            .basePackage p {
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

  async doWebGenerate() {
    this.loading = true;

    this.blob = undefined;
    this.errorMessage = undefined;
    this.errored = false;

    try {
      const generatedPackage = await generateWebPackage();

      if (generatedPackage) {
        this.blob = generatedPackage;
      }
    } catch (err) {
      this.errorMessage = ((err as Error) || '').toString();
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

  cancel() {
    this.blob = undefined;
    this.errored = false;
    this.errorMessage = undefined;
  }

  render() {
    return html`
      <app-modal @app-modal-close="${() => this.cancel()}" ?open="${this.blob ? true : false}" heading="Base Package Download"
        .body="${localeStrings.input.publish.base_package.download}" id="test-download-modal">
        <img class="modal-image" slot="modal-image" src="/assets/images/warning.svg" alt="warning icon" />
      
        <div slot="modal-actions">
          <app-button @click="${() => this.download()}">Download</app-button>
        </div>
      </app-modal>
      
      <app-modal heading="Wait a minute!" .body="${this.errorMessage || ''}" ?open="${this.errored}" id="error-modal">
        <img class="modal-image" slot="modal-image" src="/assets/warning.svg" alt="warning icon" />
      
        <div slot="modal-actions">
          <fast-anchor target="_blank" rel="noopener" href="https://github.com/pwa-builder/PWABuilder/issues/new/choose"
            id="report-link" appearance="button">Report an Issue</fast-anchor>
        </div>
      </app-modal>
      
      <div id="basepack-wrapper">
        <app-header></app-header>
      
        <div id="grid" class="${classMap({
            'grid-mobile': this.isDeskTopView == false,
          })}">
          <app-sidebar id="desktop-sidebar"></app-sidebar>
      
          <div>
            <content-header class="basePackage">
              <h2 slot="hero-container">
                ${localeStrings.text.base_package.top_section.h1}
              </h2>
              <p id="hero-p" slot="hero-container">
                ${localeStrings.text.base_package.top_section.p}
              </p>
            </content-header>
      
            <app-sidebar id="tablet-sidebar"></app-sidebar>
      
            <section class="container">
              <div id="top-container">
                <div id="download-summary">
                  <h3>${localeStrings.text.base_package.summary_body.h1}</h3>
      
                  <p>${localeStrings.text.base_package.summary_body.p}</p>
                </div>
      
                <div id="download-actions">
                  <loading-button ?loading="${this.loading}" @click="${() => this.doWebGenerate()}">Generate</loading-button>
                </div>
              </div>
      
              <div id="up-next">
                <h5>Next Steps</h5>
      
                <p>
                  You're steps away from being able to package your PWA for the
                  store. After you download your base files be sure to
                </p>
      
                <ol>
                  <li>
                    <a href="https://github.com/pwa-builder/pwabuilder-web/blob/V2/src/assets/next-steps.md" rel="noopener"
                      target="_blank">Open documentation</a>
                    in order to accurately add files or links to your server.
                  </li>
      
                  <li>
                    After you have updated your files, submit your PWA through
                    our testing hub again to be sure that all is accurate with
                    your updates.
                  </li>
      
                  <li>
                    After acing your PWA test and review, go ahead and package
                    for the app stores!
                  </li>
                </ol>
              </div>
      
              <div class="action-buttons">
                <fast-anchor href="https://github.com/pwa-builder/pwabuilder-web/blob/V2/src/assets/next-steps.md"
                  rel="noopener" target="_blank" appearance="button">
                  Documentation
                </fast-anchor>
      
                <app-button @click="${() => this.reTest()}">Test Updated App</app-button>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  }
}
