import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import '../components/app-header';
import '../components/app-card';
import '../components/app-modal';
import '../components/app-button';
import '../components/loading-button';
import '../components/windows-form';
import '../components/android-form';
import '../components/hover-tooltip';
import { Router } from '@vaadin/router';

import {
  BreakpointValues,
  smallBreakPoint,
  largeBreakPoint,
  mediumBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

//@ts-ignore
import style from '../../../styles/layout-defaults.css';
import { fastAnchorCss } from '../utils/css/fast-elements';
import { fileSave } from 'browser-fs-access';
import {
  checkResults,
  finalCheckForPublish,
} from '../services/publish/publish-checks';
import { generatePackage, Platform } from '../services/publish';
import { getReportErrorUrl } from '../utils/error';
import { styles as ToolTipStyles } from '../components/tooltip';
import { localeStrings } from '../../locales';
@customElement('app-publish')
export class AppPublish extends LitElement {
  @state() errored = false;
  @state() errorMessage: string | undefined;

  @state() blob: Blob | File | null | undefined;
  @state() testBlob: Blob | File | null | undefined;

  @state() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @state() isDeskTopView = this.mql.matches;

  @state() open_windows_options = false;
  @state() open_android_options = false;
  @state() open_samsung_modal = false;

  @state() generating = false;

  @state() finalChecks: checkResults | undefined;

  @state() reportPackageErrorUrl = '';

  constructor() {
    super();

    this.mql.addEventListener('change', e => {
      this.isDeskTopView = e.matches;
    });
  }

  static get styles() {
    return [
      style,
      fastAnchorCss,
      ToolTipStyles,
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
          padding: 16px 16px 16px 36px;
          border-bottom: var(--list-border);

          margin-right: 2em;
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

        .container {
          padding: 16px 16px 16px 36px;
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

        .container .action-buttons fast-anchor,
        .container .action-buttons app-button {
          --button-width: 127px;
          height: 44px;
          width: var(--button-width);
        }

        .container .action-buttons fast-anchor {
          /** 
             Seems like a magic value but really
             this is just to match the back button next to it
           */
          color: white;
          box-shadow: var(--button-shadow);
          border-radius: var(--button-radius);
          font-weight: bold;
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
          max-width: 530px;
        }

        content-header::part(header) {
          display: none;
        }

        .modal-image {
          width: 50px;
        }

        #error-modal::part(modal-body) {
          max-height: 36vh;
          overflow-y: auto;
          max-width: inherit;
          overflow-x: hidden;
        }

        #error-modal::part(modal-body-contents) {
          white-space: pre;
          text-align: left;
          overflow: auto;
          max-height: 300px;
          padding: 20px;
        }

        #error-link {
          color: white;
          font-weight: var(--font-bold);
          border-radius: var(--button-radius);
          background: var(--error-color);
          margin-right: 8px;
          padding-left: 10px;
          padding-right: 10px;
          box-shadow: var(--button-shadow);
        }

        #test-package-button {
          display: block;
          margin-top: 15px;
        }

        #test-package-button::part(underlying-button) {
          --button-font-color: var(--font-color);
        }

        #platform-actions-block app-button,
        #platform-actions-block loading-button::part(underlying-button) {
          --button-width: 152px;
        }

        #actions {
          display: flex;
          flex-direction: column;
        }

        #actions fast-anchor.button,
        #actions app-button {
          margin-right: 0;
          margin-top: 8px;
        }

        .tooltip {
          height: 16px;
          width: 16px;
        }

        hover-tooltip::part(tooltip-image) {
          display: none;
        }
      `,
      xxxLargeBreakPoint(
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

          #publish-wrapper {
            max-width: 69em;
            background: white;
          }
        `
      ),
      largeBreakPoint(
        css`
          #tablet-sidebar {
            display: block;
          }

          #desktop-sidebar {
            display: none;
          }
        `
      ),
      mediumBreakPoint(
        css`
          .publish h2 {
            font-size: 33px;
            max-width: 10em;

            margin-top: 0;
            margin-bottom: 1em;
          }

          .publish p {
            display: none;
          }

          li {
            flex-direction: column;
            align-items: flex-start;
          }

          #title-block {
            width: 100%;
          }

          #title-block p {
            width: unset;
          }

          #platform-actions-block {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 2em;
          }
        `
      ),
      mediumBreakPoint(
        css`
          loading-button {
            --loading-button-height: 64px;
          }
          loading-button::part(underlying-button) {
            --font-size: 22px;
          }
          .container .action-buttons fast-anchor,
          .container .action-buttons app-button {
            --button-width: 127px;
            font-size: var(--mobile-button-fontsize);
            height: var(--mobile-button-height);
            width: var(--button-width);
            margin: 22px;
          }
        `,
        'no-lower'
      ),
      smallBreakPoint(css`
        #error-modal::part(modal-layout) {
          width: 100vw;
        }

        #test-package-button app-button::part(underlying-button) {
          font-size: var(--font-size);
        }

        li {
          flex-direction: column;
          align-items: flex-start;
        }

        #title-block {
          width: 100%;
        }

        #title-block p {
          width: unset;
        }

        #platform-actions-block {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 2em;
        }

        .publish h2 {
          font-size: 33px;

          margin-top: 0;
          margin-bottom: 1em;
        }

        .publish p {
          display: none;
        }
      `),
    ];
  }

  async firstUpdated() {
    const checks = await finalCheckForPublish();

    if (checks) {
      this.finalChecks = checks;
    }
  }

  async generate(type: platform, form?: HTMLFormElement, signingFile?: string) {
    if (type === 'windows') {
      // Final checks for Windows
      if (this.finalChecks) {
        const maniCheck = this.finalChecks.manifest;
        const baseIcon = this.finalChecks.baseIcon;
        const validURL = this.finalChecks.validURL;

        if (maniCheck === false || baseIcon === false || validURL === false) {
          this.generating = false;
          this.open_windows_options = false;

          let err = '';

          if (maniCheck === false) {
            err = 'Your PWA does not have a valid Web Manifest';
          } else if (baseIcon === false) {
            err = 'Your PWA needs at least a 512x512 PNG icon';
          } else if (validURL === false) {
            err = 'Your PWA does not have a valid URL';
          }

          this.showAlertModal(err, type);

          return;
        }
      }
    } else if (type === 'android') {
      // Final checks for Android
      if (this.finalChecks) {
        const maniCheck = this.finalChecks.manifest;
        const baseIcon = this.finalChecks.baseIcon;
        const validURL = this.finalChecks.validURL;
        const offlineCheck = this.finalChecks.offline;

        if (maniCheck === false || baseIcon === false || validURL === false) {
          this.generating = false;
          this.open_android_options = false;

          let err = '';

          if (maniCheck === false) {
            err = 'Your PWA does not have a valid Web Manifest';
          } else if (baseIcon === false) {
            err = 'Your PWA needs at least a 512x512 PNG icon';
          } else if (validURL === false) {
            err = 'Your PWA does not have a valid URL';
          } else if (offlineCheck === false) {
            // Extra offline check for Android
            err = 'Your PWA does not work offline';
          }

          this.showAlertModal(err, type);

          return;
        }
      }
    }

    try {
      this.generating = true;

      
      const packageData = await generatePackage(type, form, signingFile);


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
      this.generating = false;
      this.open_android_options = false;
      this.open_windows_options = false;

      this.showAlertModal(err as Error, type);
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

  showAlertModal(error: string | Object, platform: Platform) {
    this.errored = true;

    const errorObj = error as Error;
    if (errorObj.message && errorObj.stack) {
      const is403 = typeof errorObj.message === 'string' && errorObj.message.includes('Responded with status 403');
      const isFailedToFetchManifest = typeof errorObj.message === 'string' && errorObj.message.includes('Failed to retreive PWA manifest for');
      if (is403) {
        // Is it a 403? Then most likely it's anti-bot tech, e.g. Cloudflare, blocking us.
        this.errorMessage = `PWABuilder got a 403 Forbidden error when fetching your site.\nThis can happen when your site is using Cloudflare or other anti-bot technologies.\nTry temporarily pausing Cloudflare or your anti-bot technology while running PWABuilder on your web app.\n\n${errorObj.message}\n\nStack trace: \n${errorObj.stack}`;
      } else if (isFailedToFetchManifest) {
        // Failed to fetch manifest? This is thrown by the Windows platform when we have anti-bot tech blocking us from downloading the manifest.
        this.errorMessage = `PWABuilder was unable to download your manifest.\nThis can happen when your site is using Cloudflare or other anti-bot technology.\nTry temporarily pausing Cloudflare or your anti-bot technology while running PWABuilder on your web app.\n\n${errorObj.message}\n\nStack trace: \n${errorObj.stack}`;
      } else {
        this.errorMessage = `${errorObj.message}\n\nStack trace:\n${errorObj.stack}`;
      }
    } else if (errorObj.message) {
      this.errorMessage = errorObj.message;
    } else {
      this.errorMessage = (error || '').toString();
    }

    this.reportAnError(error, platform);
  }

  showWindowsOptionsModal() {
    this.open_windows_options = true;
  }

  showAndroidOptionsModal() {
    this.open_android_options = true;
  }

  showSamsungModal() {
    this.open_samsung_modal = true;
  }

  renderContentCards() {
    return platforms.map(
      platform =>
        html`<li>
          <div id="title-block">
            <img src="${platform.icon}" alt="platform icon" />
            <h4>${platform.title}</h4>
            <p>${platform.description}</p>
          </div>

          <!-- TODO need to fix the platform action blocks text spacing for the left. -->
          <div id="platform-actions-block">
            ${platform.title.toLowerCase() === 'windows'
              ? html`
                  <app-button
                    class="navigation"
                    id="windows-package-button"
                    @click="${() => this.showWindowsOptionsModal()}"
                    >Store Package</app-button
                  >

                  <div>
                    <loading-button
                      class="navigation secondary"
                      ?loading=${this.generating}
                      id="test-package-button"
                      @click="${() => this.generate('windows')}"
                      >Test Package

                      <hover-tooltip text="Generate a package you can use to test your app on your Windows Device before going to the Microsoft Store." link="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/next-steps.md#1-test-your-app-on-your-windows-machine"></hover-tooltip>

                    </loading-button>
                  </div>
                `
              : null}
            ${platform.title.toLowerCase() === 'android'
              ? html`
                  <app-button
                    class="navigation"
                    id="android-package-button"
                    @click="${() => this.showAndroidOptionsModal()}"
                    >Store Package</app-button
                  >
                `
              : null}
            ${platform.title.toLowerCase() === 'samsung'
              ? html`
                  <app-button
                    class="navigation"
                    @click="${() => this.showSamsungModal()}"
                    >Submit</app-button
                  >
                `
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

  reportAnError(errorDetail: string | Object, platform: string) {
    this.reportPackageErrorUrl = getReportErrorUrl(errorDetail, platform);
  }

  downloadCancel() {
    this.blob = undefined;
    this.errorMessage = undefined;
    this.errored = false;
  }

  downloadTestCancel() {
    this.testBlob = undefined;
    this.errorMessage = undefined;
    this.errored = false;
  }

  storeOptionsCancel() {
    this.open_windows_options = false;
    this.open_android_options = false;
    this.open_samsung_modal = false;
  }

  render() {
    return html`
      <!-- error modal -->
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

        <div id="actions" slot="modal-actions">
          <fast-anchor
            target="__blank"
            id="error-link"
            class="button"
            .href="${this.reportPackageErrorUrl}"
            >Report A Problem</fast-anchor
          >

          <app-button @click="${() => this.returnToFix()}"
            >Return to Manifest Options</app-button
          >
        </div>
      </app-modal>

      <!-- download modal -->
      <app-modal
        ?open="${this.blob ? true : false}"
        title="Download your package"
        body="Your app package is ready for download."
        id="download-modal"
        @app-modal-close="${() => this.downloadCancel()}"
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

      <!-- test package download modal -->
      <app-modal
        ?open="${this.testBlob ? true : false}"
        title="Test Package Download"
        body="${localeStrings.input.publish.windows.test_package}"
        id="test-download-modal"
        @app-modal-close="${() => this.downloadTestCancel()}"
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

      <!-- windows store options modal -->
      <app-modal
        id="windows-options-modal"
        title="Microsoft Store Options"
        body="Customize your Windows package below!"
        ?open="${this.open_windows_options}"
        @app-modal-close="${() => this.storeOptionsCancel()}"

      >
        <windows-form
          slot="modal-form"
          .generating=${this.generating}
          @init-windows-gen="${(ev: CustomEvent) => this.generate('windows', ev.detail.form)}"
        ></windows-form>
      </app-modal>

      <!-- android options modal -->
      <app-modal
        id="android-options-modal"
        title="Google Play Store Options"
        body="Customize your Android package below!"
        ?open="${this.open_android_options === true}"
        @app-modal-close="${() => this.storeOptionsCancel()}"
      >
        <android-form
          slot="modal-form"
          .generating=${this.generating}
          @init-android-gen="${(ev: CustomEvent) => this.generate('android', ev.detail.form, ev.detail.signingFile)}"
        ></android-form>
      </app-modal>

      <!-- samsung modal -->
      <app-modal
        id="samsung-options-modal"
        title="Your PWA has been submitted to Samsung's App Finder"
        body="You can follow up with Samsung at pwasupport@samsung.com for status updates on your submission."
        ?open="${this.open_samsung_modal === true}"
        @app-modal-close="${() => this.storeOptionsCancel()}"
      >
      </app-modal>

      <div id="publish-wrapper">
        <app-header></app-header>

        <div
          id="grid"
          class="${classMap({
            'grid-mobile': this.isDeskTopView == false,
          })}"
        >
          <app-sidebar id="desktop-sidebar"></app-sidebar>

          <div>
            <content-header class="publish">
              <h2 slot="hero-container">Your PWA is Store Ready!</h2>
              <p id="hero-p" slot="hero-container">
                You are now ready to ship your PWA to the app stores!
              </p>
            </content-header>

            <app-sidebar id="tablet-sidebar"></app-sidebar>

            <section id="summary-block">
              <h3>Publish your PWA to stores</h3>

              <p>
                Generate store-ready packages for the Microsoft Store, Google
                Play and more!
              </p>
            </section>

            <section class="container">
              <ul>
                ${this.renderContentCards()}
              </ul>

              <div id="up-next">
                <h5>Congrats!</h5>

                <p>
                  Make sure you check our documentation for help submitting your
                  generated packages! Click next to see what else you can do
                  with your PWA!
                </p>
              </div>

              <div class="action-buttons">
                <app-button @click="${() => this.returnToFix()}"
                  >Back</app-button
                >
                <fast-anchor class="button" href="/congrats">Next</fast-anchor>
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
  icon: string;
}

const platforms: ICardData[] = [
  {
    title: 'Windows',
    description:
      'Publish your PWA to the Microsoft Store to make it available to the 1 billion Windows users worldwide.',
    isActionCard: true,
    icon: '/assets/windows_icon.svg',
  },
  {
    title: 'Android',
    description:
      'Publish your PWA to the Google Play Store to make your app more discoverable for Android users.',
    isActionCard: true,
    icon: '/assets/android_icon.svg',
  },
  {
    title: 'Samsung',
    description:
      'Provide the URL to your PWA to Samsung for inclusion in the Samsung Finder app. You will need to follow up with Samsung after submission for updates on the deployment.',
    isActionCard: true,
    icon: '/assets/samsung_icon.svg',
  },
];
