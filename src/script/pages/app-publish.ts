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
import '../components/windows-form';
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

          margin-right: 2em;
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

        #windows-options-modal::part(modal-layout) {
          width: 64vw;
        }

        #test-package-button {
          margin-top: 15px;
          --neutral-fill-rest: white;
          --neutral-fill-active: white;
          --neutral-fill-hover: white;
        }

        #test-package-button::part(underlying-button) {
          color: var(--font-color);
        }

        #platform-actions-block app-button::part(underlying-button) {
          width: 152px;
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

            if (options) {
              this.blob = await generateWindowsPackage(options);
              this.generating = false;

              this.open_windows_options = false;
            }
          }
          else {
            const options = createWindowsPackageOptionsFromManifest();
            this.blob = await generateWindowsPackage(options);

            this.generating = false;

            this.open_windows_options = false;
          }
        } catch (err) {
          this.generating = false;
          this.open_windows_options = false;
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

          <div id="platform-actions-block">
            <app-button
              @click="${platform.title.toLowerCase() === 'windows'
                ? () => this.showWindowsOptionsModal()
                : () => this.showAndroidOptionsModal()}"
              >Publish</app-button
            >

            ${platform.title.toLocaleLowerCase() === 'windows'
              ? html`<app-button id="test-package-button"
                  @click="${() =>
                    this.generatePackage(
                      "windows"
                    )}"
                  >Test Package</app-button
                >`
              : null}
          </div>
          
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

      <app-modal id="windows-options-modal" title="Microsoft Store Options" body="Customize your Windows package below!" ?open="${this.open_windows_options}">
        <windows-form slot="modal-form" .loading=${this.generating} @init-windows-gen="${(ev) => this.generatePackage('windows', ev.detail.form)}"></windows-form>
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
