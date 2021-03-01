import {
  css,
  customElement,
  html,
  internalProperty,
  LitElement,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import '../components/app-header';
import '../components/app-card';
import '../components/app-modal';
import '../components/app-button';
import '../components/loading-button';
import {
  createWindowsPackageOptionsFromForm,
  createWindowsPackageOptionsFromManifest,
  generateWindowsPackage,
} from '../services/publish/windows-publish';
import {
  createAndroidPackageOptionsFromManifest,
  generateAndroidPackage,
} from '../services/publish/android-publish';
import { Router } from '@vaadin/router';

import {
  BreakpointValues,
  largeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

//@ts-ignore
import style from '../../../styles/layout-defaults.css';
import { fileSave } from 'browser-fs-access';

@customElement('app-publish')
export class AppPublish extends LitElement {
  @internalProperty() errored = false;
  @internalProperty() errorMessage: string | undefined;

  @internalProperty() blob: Blob | File | undefined;

  @internalProperty() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @internalProperty() isDeskTopView = this.mql.matches;

  @internalProperty() open_windows_options = false;

  @internalProperty() generating = false;

  constructor() {
    super();

    this.mql.addEventListener('change', e => {
      this.isDeskTopView = e.matches;
    });
  }

  static get styles() {
    return [
      style,
      css`
        .header {
          padding: 1rem 3rem;
        }

        .header p {
          width: min(100%, 600px);
        }

        #tablet-sidebar {
          display: none;
        }

        #desktop-sidebar {
          display: block;
        }

        #summary-block {
          padding: 16px;
          border-bottom: var(--list-border);
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

        .container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-items: center;
          align-items: center;
        }

        .container .action-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .container .action-buttons > app-button {
          margin: 1rem;
        }

        #up-next {
          width: 100%;
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

        p {
          font-size: var(--font-size);
          color: var(--font-color);
          max-width: 767px;
        }

        content-header::part(header) {
          display: none;
        }

        .modal-image {
          width: 6em;
        }

        #error-modal::part(modal-layout) {
          max-width: 50vw;
        }

        #form-layout {
          display: grid;
          grid-template-columns: auto auto;
          gap: 30px;

          padding-left: 2em;
          padding-right: 2em;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: var(--small-medium-font-size);
          font-weight: bold;
          line-height: 40px;
        }

        #windows-options-modal::part(modal-layout) {
          width: 64vw;
        }

        #windows-options-actions {
          display: flex;
          justify-content: center;
          margin-top: 37px;
        }

        #form-layout fast-text-field::part(root) {
          border: 1px solid rgba(194, 201, 209, 1);
          border-radius: var(--input-radius);
          background: rgba(229, 229, 229, 1);
        }

        #form-layout fast-text-field::part(control) {
          color: var(--font-color);
        }

        #windows-details-block {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 37px;
        }

        #windows-details-block p {
          text-align: center;
          font-weight: 300;
          font-size: var(--small-medium-font-size);

          color: rgba(128, 128, 128, 1);
          line-height: 30px;
        }

        ${xxxLargeBreakPoint(
          css`
            #report {
              max-width: 69em;
            }

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

  async generatePackage(type: platform, form?: HTMLFormElement) {
    switch (type) {
      case 'windows':
        try {
          this.generating = true;

          if (form) {
            const options = createWindowsPackageOptionsFromForm(form);

            this.open_windows_options = false;

            if (options) {
              this.blob = await generateWindowsPackage('anaheim', options);
              this.generating = false;
            }
          }
          else {
            const options = createWindowsPackageOptionsFromManifest('anaheim');
            this.blob = await generateWindowsPackage('anaheim', options);

            this.generating = false;
          }
        } catch (err) {
          this.generating = false;
          this.showAlertModal(err);
        }
        break;
      case 'android':
        try {
          this.generating = true;

          // eslint-disable-next-line no-case-declarations
          const androidOptions = createAndroidPackageOptionsFromManifest();

          this.blob = await generateAndroidPackage(androidOptions);

          this.generating = false;
        } catch (err) {
          this.generating = false;
          this.showAlertModal(err);
        }
        break;
      case 'samsung':
        console.log('samsung');
        break;
      default:
        console.error(
          `A platform type must be passed, ${type} is not a valid platform.`
        );
    }
  }

  async download() {
    if (this.blob) {
      await fileSave(this.blob, {
        fileName: 'your_pwa.zip',
        extensions: ['.zip'],
      });
    }
  }

  showAlertModal(errorMessage: string) {
    this.errored = true;

    this.errorMessage = errorMessage;
  }

  showWindowsOptionsModal() {
    this.open_windows_options = true;
  }

  showAndroidOptionsModal() {
    console.log('here');
  }

  renderContentCards() {
    return platforms.map(
      platform =>
        html`<li>
          <div id="title-block">
            <h4>${platform.title}</h4>
            <p>${platform.description}</p>
          </div>

          <app-button @click="${platform.title.toLowerCase() === "windows" ? () => this.showWindowsOptionsModal() : () => this.showAndroidOptionsModal()}">Publish</app-button>
        </li>`
    );
  }

  returnToFix() {
    const resultsString = sessionStorage.getItem('results-string');

    // navigate back to report-card page
    // with current manifest results
    Router.go(`/reportcard?results=${resultsString}`);
  }

  render() {
    return html`
      <app-modal
        title="Wait a minute!"
        .body="${this.errorMessage || ''}"
        ?open="${this.errored}"
        id="error-modal"
      >
        <img class="modal-image" slot="modal-image" src="/assets/warning.svg" alt="warning icon" />

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
      >
      <img class="modal-image" slot="modal-image" src="/assets/images/store_fpo.png" alt="publish icon" />

        <div slot="modal-actions">
          <app-button @click="${() => this.download()}"
            >Download</app-button
          >
        </div>
      </app-modal>

      <app-modal id="windows-options-modal" title="Microsoft Store Options" ?open="${this.open_windows_options}">
        <form id="windows-options-form" slot="modal-form" style="width: 100%">
          <div id="form-layout">
            <div class="">
              <div class="form-group">
                <label for="windowsPackageIdInput">
                  <a target="_blank" href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md">
                    Package ID
                    <i
                      class="fas fa-info-circle"
                      title="The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center. Click to learn more."
                      aria-label="The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center. Click to learn more."
                      role="definition"
                    ></i>
                  </a>
                </label>
                <fast-text-field
                  id="windowsPackageIdInput"
                  class="form-control"
                  placeholder="package ID"
                  type="text"
                  name="packageId"
                  required
                ></fast-text-field>
              </div>

              <div>
                <div class="">
                  <div class="form-group">
                    <label for="windowsAppNameInput">App name</label>
                    <fast-text-field
                      type="text"
                      class="form-control"
                      id="windowsAppNameInput"
                      placeholder="My Awesome PWA"
                      name="appName"
                      required
                    ></fast-text-field>
                  </div>
                </div>
              </div>

              <div>
                <div class="">
                  <div class="form-group">
                    <label for="windowsAppVersionInput">
                      <a target="_blank" href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/classic-package.md">
                        App version
                        <i
                          class="fas fa-info-circle"
                          title="Your app version in the form of '1.0.0'. This must be greater than classic package version. Click to learn more."
                          aria-label="Your app version in the form of '1.0.0'. This must be greater than classic package version. Click to learn more."
                          role="definition"
                        ></i>
                      </a>
                    </label>
                    <fast-text-field
                      type="text"
                      class="form-control"
                      id="windowsAppVersionInput"
                      placeholder="1.0.1"
                      name="appVersion"
                      required
                    ></fast-text-field>
                  </div>
                </div>

              </div>

              <div>
                <div class="">
                  <div class="form-group">
                    <label for="windowsClassicAppVersionInput">
                      <a target="_blank" href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/classic-package.md">
                        Classic package version
                        <i
                          class="fas fa-info-circle"
                          title="The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version. Click to learn more."
                          aria-label="The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version. Click to learn more."
                          role="definition"
                        ></i>
                      </a>
                    </label>
                    <fast-text-field
                      type="text"
                      class="form-control"
                      id="windowsClassicAppVersionInput"
                      placeholder="1.0.0"
                      name="classicVersion"
                      required
                    ></fast-text-field>
                  </div>
                </div>

              </div>

              <div class="form-group">
                <label for="windowsUrlInput">
                  URL
                  <i
                    class="fas fa-info-circle"
                    title="This is the URL for your PWA."
                    aria-label="This is the URL for your PWA."
                    role="definition"
                  ></i>
                </label>
                <fast-text-field
                  type="url"
                  class="form-control"
                  id="windowsUrlInput"
                  placeholder="/index.html"
                  name="url"
                  required
                ></fast-text-field>
              </div>

              <div class="form-group">
                <label for="windowsManifestUrlInput">
                  Manifest URL
                  <i
                    class="fas fa-info-circle"
                    title="The URL to your app manifest."
                    aria-label="The URL to your app manifest."
                    role="definition"
                  ></i>
                </label>
                <fast-text-field
                  type="url"
                  class="form-control"
                  id="windowsManifestUrlInput"
                  placeholder="https://mysite.com/manifest.json"
                  name="manifestUrl"
                  required
                ></fast-text-field>
              </div>

              <div class="form-group">
                <label for="windowsStartUrlInput">
                  Start URL
                  <i
                    class="fas fa-info-circle"
                    title="Optional. The preferred URL that should be loaded when the user launches the web app. Windows will use this to determine your app's identity, so this value should not change between releases of your app. This can be an absolute or relative path."
                    aria-label="Optional. The preferred URL that should be loaded when the user launches the web app. Windows will use this to determine your app's identity, so this value should not change between releases of your app. This can be an absolute or relative path."
                    role="definition"
                  ></i>
                </label>
                <fast-text-field
                  type="url"
                  class="form-control"
                  id="windowsStartUrlInput"
                  placeholder="https://mysite.com/startpoint.html"
                  name="startUrl"
                ></fast-text-field>
              </div>

            </div>

            <!-- right half of the options dialog -->
            <div class="">
              
              <div class="form-group">
                <label for="windowsIconUrlInput">
                  <a href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md" target="_blank">
                    Icon URL
                    <i
                      class="fas fa-info-circle"
                      title="A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger. Click to learn more."
                      aria-label="A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger. Click to learn more."
                      role="definition"
                    ></i>
                  </a>
                </label>
                <fast-text-field
                  type="url"
                  class="form-control"
                  id="windowsIconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512.png"
                  name="iconUrl"
                ></fast-text-field>
              </div>

              <div class="form-group">
                  <label for="windowsDisplayNameInput">
                    <a target="_blank" href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md">
                      Publisher display name
                      <i
                        class="fas fa-info-circle"
                        title="The display name of your app's publisher. You can find this in Windows Partner Center. Click to learn more."
                        aria-label="The display name of your app's publisher. You can find this in Windows Partner Center. Click to learn more."
                        role="definition"
                      ></i>
                    </a>
                  </label>
                  <fast-text-field
                    type="text"
                    class="form-control"
                    for="windowsDisplayNameInput"
                    required
                    placeholder="US"
                    name="publisherDisplayName"
                  ></fast-text-field>
                </div>

                <div class="form-group">
                  <label for="windowsPublisherIdInput">
                    <a target="_blank" href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md">
                      Publisher ID
                      <i
                        class="fas fa-info-circle"
                        title="Your Windows Publisher ID. You can find this value in Windows Partner Center. Click to learn more."
                        aria-label="Your Windows Publisher ID. You can find this value in Windows Partner Center. Click to learn more."
                        role="definition"
                      ></i>
                    </a>
                  </label>
                  <fast-text-field
                    type="text"
                    class="form-control"
                    id="windowsPublisherIdInput"
                    required
                    placeholder="CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca"
                    name="publisherId"
                  ></fast-text-field>
                </div>

              <div class="form-group">
                <label for="windowsLanguageInput">
                  Language
                  <i
                    class="fas fa-info-circle"
                    title="Optional. The primary language for your app package. Additional languages can be specified in Partner Center. If empty, EN-US will be used." 
                    aria-label="Optional. The primary language for your app package. Additional languages can be specified in Partner Center. If empty, EN-US will be used."
                    role="definition"
                  ></i>
                </label>
                <fast-text-field
                  type="url"
                  class="form-control"
                  id="windowsLanguageInput"
                  placeholder="EN-US"
                  name="language"
                ></fast-text-field>
              </div>

            </div>
          </div>

          <div id="windows-details-block">
            <p>Your download will contain instructions for submitting your app to the Microsoft Store. Your app will be powered by Chromium-based Edge platform (preview).</p>
          </div>

          <div slot="modal-actions" id="windows-options-actions">
            <loading-button @click="${() =>
              this.generatePackage('windows', this.shadowRoot?.querySelector("#windows-options-form") || undefined)}"
              .loading="${this.generating}"
              >Generate</loading-button
            >
          </div>
        </form>
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
              <h2 slot="hero-container">Small details go a long way.</h2>
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
              <h3>Publish your PWA to stores</h3>

              <p>
                Ready to build your PWA? Tap "Build My PWA" to package your PWA
                for the app stores or tap "Feature Store" to check out the
                latest web components from the PWABuilder team to improve your
                PWA even further!
              </p>
            </section>

            <section class="container">
              <ul>
                ${this.renderContentCards()}
              </ul>

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

type platform = 'windows' | 'android' | 'samsung';

interface ICardData {
  title: string;
  description: string;
  isActionCard: boolean;
}

const platforms: ICardData[] = [
  {
    title: 'Windows',
    description:
      'Publish your PWA to the Microsoft Store to make it available to the 1 billion Windows users worldwide.',
    isActionCard: true,
  },
  {
    title: 'Android',
    description:
      'Publish your PWA to the Google Play Store to make your app more discoverable for Android users.',
    isActionCard: true,
  },
  {
    title: 'Samsung',
    description:
      'Publish your PWA to the Google Play Store to make your app more discoverable for Android users.',
    isActionCard: true,
  },
];
