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
import '../components/app-modal';

import { getPlatformsGenerated } from '../services/congrats';
import { fileSave } from 'browser-fs-access';
import { Router } from '@vaadin/router';
import { generatePackage, platform } from '../services/publish';

@customElement('app-congrats')
export class AppCongrats extends LitElement {
  @internalProperty() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @internalProperty() isDeskTopView = this.mql.matches;

  @internalProperty() generatedPlatforms = undefined;

  @internalProperty() generating = false;

  @internalProperty() errored = false;
  @internalProperty() errorMessage: string | undefined;

  @internalProperty() blob: Blob | File | undefined;
  @internalProperty() testBlob: Blob | File | undefined;
  @internalProperty() open_windows_options = false;
  @internalProperty() open_android_options = false;

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
          color: var(--font-color);
          max-width: 767px;
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
          margin-bottom: 8px;
          margin-top: 0px;
        }

        #other-stores {
          padding: 16px;
          border-bottom: var(--list-border);
          margin-right: 2em;
        }

        #test-package-button {
          display: block;
          margin-top: 15px;

          --neutral-fill-rest: white;
          --neutral-fill-active: white;
          --neutral-fill-hover: white;
        }

        #test-package-button::part(underlying-button) {
          --button-font-color: var(--font-color);
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

  async generate(type: platform, form?: HTMLFormElement) {
    try {
      this.generating = true;

      const packageData = await generatePackage(type, form);

      if (packageData) {
        if (packageData.type === 'test') {
          this.testBlob = packageData.blob;
        } else {
          this.blob = packageData.blob;
        }
      }

      this.generating = false;
      this.open_android_options = false;
      this.open_windows_options = false;
    } catch (err) {
      console.error(err);

      this.showAlertModal(err);
    }
  }

  async download() {
    if (this.blob || this.testBlob) {
      await fileSave((this.blob as Blob) || (this.testBlob as Blob), {
        fileName: 'your_pwa.zip',
        extensions: ['.zip'],
      });

      this.blob = undefined;
      this.testBlob = undefined;
    }
  }

  returnToFix() {
    const resultsString = sessionStorage.getItem('results-string');

    // navigate back to report-card page
    // with current manifest results
    Router.go(`/reportcard?results=${resultsString}`);
  }

  showAlertModal(errorMessage: string) {
    this.errored = true;

    this.errorMessage = errorMessage;
  }

  showWindowsOptionsModal() {
    this.open_windows_options = !this.open_windows_options;
  }

  showAndroidOptionsModal() {
    this.open_android_options = !this.open_android_options;
  }

  render() {
    return html`
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
          <app-button @click="${() => this.returnToFix()}"
            >Return to Manifest Options</app-button
          >
        </div>
      </app-modal>

      <app-modal
        ?open="${this.blob ? true : false}"
        title="Download your package"
        body="Your app package is ready for download."
        id="download-modal"
      >
        <img
          class="modal-image"
          slot="modal-image"
          src="/assets/images/store_fpo.png"
          alt="publish icon"
        />

        <div slot="modal-actions">
          <app-button @click="${() => this.download()}">Download</app-button>
        </div>
      </app-modal>

      <app-modal
        ?open="${this.testBlob ? true : false}"
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
        id="windows-options-modal"
        title="Microsoft Store Options"
        body="Customize your Windows package below!"
        ?open="${this.open_windows_options}"
      >
        <windows-form
          slot="modal-form"
          .generating=${this.generating}
          @init-windows-gen="${ev => this.generate('windows', ev.detail.form)}"
        ></windows-form>
      </app-modal>

      <app-modal
        id="android-options-modal"
        title="Google Play Store Options"
        body="Customize your Android package below!"
        ?open="${this.open_android_options}"
      >
        <android-form
          slot="modal-form"
          .generating=${this.generating}
          @init-android-gen="${ev => this.generate('android', ev.detail.form)}"
        ></android-form>
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
                            @click="${() => this.generate('windows')}"
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
