import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import '../components/app-header';
import '../components/app-card';
import '../components/app-modal';
import '../components/app-button';
import '../components/loading-button';
import '../components/windows-form';
import '../components/android-form';
import '../components/ios-form';
import '../components/oculus-form';
import '../components/info-circle-tooltip';
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
import { AnalyticsBehavior, recordProcessStep, recordPWABuilderProcessStep } from '../utils/analytics';
import { getManifestContext, getURL } from '../services/app-info';
import { IOSAppPackageOptions } from '../utils/ios-validation';
import { WindowsPackageOptions } from '../utils/win-validation';
import { fetchOrCreateManifest } from '../services/manifest';
import { createWindowsPackageOptionsFromManifest } from '../services/publish/windows-publish';
import { AndroidPackageOptions } from '../utils/android-validation';
import { OculusAppPackageOptions } from '../utils/oculus-validation';

@customElement('app-publish')
export class AppPublish extends LitElement {
  @state() errored = false;
  @state() errorMessage: string | undefined;

  @state() blob: Blob | File | null | undefined;
  @state() testBlob: Blob | File | null | undefined;
  @state() downloadFileName: string | null = null;
  @state() generatedPlatform = '';

  @state() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @state() isDeskTopView = this.mql.matches;

  @state() openWindowsOptions = false;
  @state() openAndroidOptions = false;
  @state() openiOSOptions = false;
  @state() openOculusOptions = false;
  @state() generating = false;
  @state() isGooglePlay = true;
  @state() finalChecks: checkResults | undefined;
  @state() reportPackageErrorUrl = '';

  readonly platforms: ICardData[] = [
    {
      title: 'Windows',
      factoids: [
        "PWAs can be indistinguishable from native apps on Windows",
        "PWAs are first class applications.",
        "Collect 100% of revenue generated via third party commerce platforms.",
        "1B+ store enabled devices."
      ],
      isActionCard: true,
      icon: '/assets/Publish_Windows.svg',
      renderDownloadButton: () => this.renderWindowsDownloadButton()
    },
    {
      title: 'Android',
      factoids: [
        "PWAs are first class applications",
        "One app store listing for all devices (mobile, tablet, desktop)",
        "2.5 billion store enabled devices"
      ],
      isActionCard: true,
      icon: '/assets/Publish_Android.svg',
      renderDownloadButton: () => this.renderAndroidDownloadButton()
    },
    {
      title: 'Meta Quest',
      factoids: [
        "PWAs are first class applications",
        "Bring your 2D apps to VR's immersive screen",
        "Build immersive 3D experiences for VR using WebXR",
        "Currently in developer preview via sideloading"
      ],
      isActionCard: true,
      icon: '/assets/Publish_Meta.svg',
      renderDownloadButton: () => this.renderOculusDownloadButton()
    },
    {
      title: 'iOS',
      factoids: [
        "Leverage same codebase across all platforms",
        "Large user base.",
        "Premium devices."
      ],
      isActionCard: true,
      icon: '/assets/Publish_Apple.svg',
      renderDownloadButton: () => this.renderiOSDownloadButton()
    },
  ];

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
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          row-gap: .5em;
        }

        #summary-block h2 {
          margin: 0;
        }

        #summary-block p {
          margin: 0;
        }

        h1 {
          font-size: var(--xlarge-font-size);
          line-height: 46px;
        }

        #hero-p {
          font-size: var(--font-size);
          line-height: 24px;
          max-width: 406px;
        }

        h2,
        h4 {
          font-size: var(--medium-font-size);
        }

        .container {
          padding: 2em 5em;
          display: flex;
          flex-direction: column;
          justify-items: center;
          align-items: center;
          row-gap: 1em;
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

        #store-cards {
          width: 100%;
          display: grid;
          /* grid-template-columns: repeat(auto-fill, 300px); */
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* causes funky grid spacing */
          grid-gap: 1em;
        }

        .card-wrapper {
          width: 100%;
          height: 400px;
          display: flex;
          flex-direction: column;
          box-shadow: 0px 4px 10px 4px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .title-block {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          width: 100%;
          height: 99%;
          padding: 1em 1.5em;
          row-gap: .45em;
        }

        .title-block h3 {
          margin: 0;
        }

        .factoids {
          width: 100%;
          height: max-content;
          padding-left: 16px;
          margin: 0;
          margin-top: 10px;
        }

        .factoids li {
          font-size: 14px;
        }

        .platform-actions-block {
          align-self: center;
          display: flex;
          flex-direction: column;
          row-gap: 10px;
        }

        .packaged-tracker {
          height: max-content;
          width: 33%;
          background-color: #F1F2FA;
          align-self: flex-end;
          justify-self: flex-end;
          border-bottom-left-radius: 5px;
          padding: 7px;
          padding-left: 9px;
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          column-gap: 5px;
        }

        .packaged-tracker p {
          margin: 0;
          text-align: center;
          color: black;
          font-size: 12px;
          line-height: 12px;
          font-weight: bold;
        }

        .packaged-tracker img {
          width: 16px;
        }

        p {
          font-size: var(--font-size);
          color: var(--font-color);
          max-width: 530px;
        }

        content-header::part(header) {
          display: none;
        }

        #banner-header h1 {
          display: flex;
          flex-direction: column;
          width: max-content;
          margin-bottom: 0;
          font-size: 36px;
        }
        #banner-header h1 span {
          color: #4F3FB6;
        }

        #hero-p {
          margin: 0;
          margin-top: .5em;
          font-size: 17px;
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
          max-height: 200px;
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

        .platform-actions-block app-button,
        .platform-actions-block loading-button::part(underlying-button) {
          --button-width: 223px;
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

        .platform-icon {
          max-width: 37px;
          height: 37px;
          image-rendering: smooth;
        }

        ios-form {
          width: 100%;
        }

        #apk-type {
          display: flex;
          align-items: baseline;
          width: 100%;
          border-bottom: 2px solid #5D5DB9;
          margin-top: 20px;
          margin-bottom: 40px;
        }

        #apk-type p {
          font-size: 20px;
          font-weight: 700;
          line-height: 20px;
          letter-spacing: 0px;
          text-align: center;
          width: 100%;
          white-space: nowrap;
          margin: 0;
          padding: 10px 0;
        }

        #apk-type p:hover {
          cursor: pointer;
        }

        #apk-type info-circle-tooltip {
          pointer-events: none
        }

        #other-android{
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #info-tooltip {
          height: 20px
        }

        .selected-apk {
          border-bottom: 5px solid #5D5DB9;
          color: #5D5DB9;
        }
        
        .unselected-apk {
          border-bottom: 5px solid transparent;
        }

        sl-tooltip::part(base){
          width: 300px;
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
            background: white;
          }

          #windows-options-modal::part(modal-layout) {
            width: 700px;
          }

          #ios-options-modal::part(modal-layout) {
            width: 600px;
          }
          .container {
            padding: 2em 10em;
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
          .publish h1 {
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

          .platform-actions-block {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
        `
      ),
      smallBreakPoint(css`
        #error-modal::part(modal-layout) {
          width: 100vw;
        }

        li {
          flex-direction: column;
          align-items: flex-start;
        }

        .platform-actions-block {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .publish h1 {
          font-size: 33px;

          margin-top: 0;
          margin-bottom: 1em;
        }

        .publish p {
          display: none;
        }
        #banner-header h1 {
          font-size: 18px;
          line-height: 24px;
        }
        .container {
          padding: 2em 2em;
        }
        #summary-block {
          text-align: center;
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

  async generateWindowsTestPackage() {
    recordPWABuilderProcessStep("windows_test_package_clicked", AnalyticsBehavior.ProcessCheckpoint);
    let manifestContext = getManifestContext();
    if (manifestContext.isGenerated) {
      manifestContext = await fetchOrCreateManifest();
    }

    const options = createWindowsPackageOptionsFromManifest(manifestContext.manifest);
    await this.generate("windows", options);
  }

  async generate(platform: Platform, options?: AndroidPackageOptions | IOSAppPackageOptions | WindowsPackageOptions | OculusAppPackageOptions) {
    if(platform === 'other-android'){
      this.generatedPlatform = platform;
      platform = (platform.split("-")[1] as Platform);
    } else {
      this.generatedPlatform = platform;
    }
    // Record analysis results to our analytics portal.
    recordProcessStep(
      'analyze-and-package-pwa',
      `create-${this.generatedPlatform}-package`,
      AnalyticsBehavior.ProcessCheckpoint,
      { url: getURL() });

      recordProcessStep(
        'pwa-builder',
        `create-${this.generatedPlatform}-package`,
        AnalyticsBehavior.ProcessCheckpoint,
        { url: getURL() });

    try {
      this.generating = true;
      const packageData = await generatePackage(platform, options);

      if (packageData) {
        this.downloadFileName = `${packageData.appName}.zip`;
        if (packageData.type === 'test') {
          this.testBlob = packageData.blob;
        } else {
          this.blob = packageData.blob;
        }
      }
    } catch (err) {
      console.error(err);
      this.showAlertModal(err as Error, platform);
      recordProcessStep(
        'analyze-and-package-pwa',
        `create-${this.generatedPlatform}-package-failed`,
        AnalyticsBehavior.CancelProcess,
        {
          url: getURL(),
          error: err
        });
        recordProcessStep(
          'pwa-builder',
          `create-${this.generatedPlatform}-package-failed`,
          AnalyticsBehavior.CancelProcess,
          {
            url: getURL(),
            error: err
          });
    } finally {
      this.generating = false;
      this.storeOptionsCancel();
    }
  }

  async download() {
    recordProcessStep(
    'analyze-and-package-pwa',
    `download-${this.generatedPlatform}-package`,
    AnalyticsBehavior.CompleteProcess,
    { url: getURL() });

    recordProcessStep(
      'pwa-builder',
      `download-${this.generatedPlatform}-package`,
      AnalyticsBehavior.CompleteProcess,
      { url: getURL() });

    if (this.blob || this.testBlob) {
      try{
        await fileSave((this.blob as Blob) || (this.testBlob as Blob), {
          fileName: this.downloadFileName || 'your_pwa.zip',
          extensions: ['.zip'],
        });
      } catch(error){
        recordProcessStep(
          'analyze-and-package-pwa',
          `download-${this.generatedPlatform}-package-stopped`,
          AnalyticsBehavior.ProcessCheckpoint,
          {
            url: getURL(),
            error: error
          });
    
        recordProcessStep(
          'pwa-builder',
          `download-${this.generatedPlatform}-package-stopped`,
          AnalyticsBehavior.ProcessCheckpoint,
          {
            url: getURL(),
            error: error
          }); 
      }

      this.blob = undefined;
      this.testBlob = undefined;
    }
  }

  showAlertModal(error: string | Object, platform: Platform) {
    this.errored = true;

    const errorObj = error as Error;
    if (errorObj.message && errorObj.stack) {
      const is403 =
        typeof errorObj.message === 'string' &&
        errorObj.message.includes('Responded with status 403');
      const isFailedToFetchManifest =
        typeof errorObj.message === 'string' &&
        errorObj.message.includes('Failed to retreive PWA manifest for');
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
    recordPWABuilderProcessStep("windows_store_modal_opened", AnalyticsBehavior.ProcessCheckpoint)
    this.openWindowsOptions = true;
  }

  showAndroidOptionsModal() {
    recordPWABuilderProcessStep("android_store_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
    this.openAndroidOptions = true;
  }

  showiOSOptionsModal() {
    recordPWABuilderProcessStep("ios_store_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
    this.openiOSOptions = true;
  }

  showOculusOptionsModal() {
    recordPWABuilderProcessStep("meta_store_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
    this.openOculusOptions = true;
  }

  renderContentCards(): TemplateResult[] {
    return this.platforms.map(
      platform => html`
        <div class="card-wrapper">
          ${platform.title === "iOS" ? 
            html`
            <sl-tooltip 
              content="iOS does not support PWAs natively and packaging PWAs for iOS is Experimental. We can not guarantee that your app will be accepted into Apple's App Store.">
              <div id="experimental" class="packaged-tracker"> <!-- Used to show ios as experimental -->
                <p>Experimental</p>
                <img src="/assets/new/help.svg" alt="experimental help icon" />
              </div>
            
            </sl-tooltip>` : html``
          }
          <div class="title-block">
            <img class="platform-icon" src="${platform.icon}" alt="platform icon" />
            <h3>${platform.title}</h3>
            <!-- TODO need to fix the platform action blocks text spacing for the left. -->
            <div class="platform-actions-block">
              ${platform.renderDownloadButton()}
            </div>
            <ul class="factoids">
              ${platform.factoids.map((fact: string) => html`<li>${fact}</li>`)}
            </ul>
          </div>
        </div>`
    );
  }

  renderWindowsDownloadButton(): TemplateResult {
    return html`
      <app-button class="navigation" id="windows-package-button" @click="${() => this.showWindowsOptionsModal()}">
        Store Package
      </app-button>
      <div>
        <loading-button id="windows-test-pkg-btn" class="navigation alternate" ?loading=${this.generating} id="test-package-button"
          @click="${this.generateWindowsTestPackage}" .secondary="${true}">
          Test Package
        </loading-button>
        <hover-tooltip anchor="windows-test-pkg-btn"
          text="Generate a package you can use to test your app on your Windows Device before going to the Microsoft Store."
          link="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/next-steps.md#1-test-your-app-on-your-windows-machine">
        </hover-tooltip>
      </div>
    `;
  }

  renderAndroidDownloadButton(): TemplateResult {
    return html`
      <app-button class="navigation" id="android-package-button" @click="${() => this.showAndroidOptionsModal()}">
        Store Package
      </app-button>
    `;
  }

  renderiOSDownloadButton(): TemplateResult {
    return html`
      <app-button class="navigation" id="ios-package-button" @click="${() => this.showiOSOptionsModal()}">
        Store Package
      </app-button>
    `;
  }

  renderOculusDownloadButton(): TemplateResult {
    return html`
      <app-button class="navigation" id="oculus-package-button" @click="${() => this.showOculusOptionsModal()}">
        Store Package
      </app-button>
    `;
  }

  returnToFix() {
    recordPWABuilderProcessStep("back_button_clicked", AnalyticsBehavior.ProcessCheckpoint);
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
    this.openWindowsOptions = false;
    this.openAndroidOptions = false;
    this.openiOSOptions = false;
    this.openOculusOptions = false;

    // resetting google play tabs
    this.isGooglePlay = true;

    let old = this.shadowRoot!.querySelector(".selected-apk");
    old?.classList.replace("selected-apk", "unselected-apk");
    let next = this.shadowRoot?.querySelector('[data-type="play"]')
    next!.classList.replace("unselected-apk", "selected-apk");
  }

  toggleApkType(event: any){
    let old = this.shadowRoot!.querySelector(".selected-apk");
    old?.classList.replace("selected-apk", "unselected-apk");
    let next = event.target;
    next.classList.replace("unselected-apk", "selected-apk");

    if(event.target.dataset.type === "play"){
      this.isGooglePlay = true;
    } else {
      this.isGooglePlay = false;
    }
  }

  render() {
    return html`
      <!-- error modal -->
      <app-modal heading="Wait a minute!" .body="${this.errorMessage || ''}" ?open="${this.errored}" id="error-modal">
        <img class="modal-image" slot="modal-image" src="/assets/warning.svg" alt="warning icon" />
      
        <div id="actions" slot="modal-actions">
          <fast-anchor target="__blank" id="error-link" class="button" .href="${this.reportPackageErrorUrl}">Report A Problem
          </fast-anchor>
      
          <app-button @click="${() => this.returnToFix()}">Return to Manifest Options</app-button>
        </div>
      </app-modal>
      
      <!-- download modal -->
      <app-modal ?open="${this.blob ? true : false}" heading="Download your package"
        body="Your app package is ready for download." id="download-modal" @app-modal-close="${() => this.downloadCancel()}">
        <img class="modal-image" slot="modal-image" src="/assets/images/store_fpo.png" alt="publish icon" />
      
        <div slot="modal-actions">
          <app-button @click="${() => this.download()}">Download</app-button>
        </div>
      </app-modal>
      
      <!-- test package download modal -->
      <app-modal ?open="${this.testBlob ? true : false}" heading="Test Package Download"
        body="${localeStrings.input.publish.windows.test_package}" id="test-download-modal"
        @app-modal-close="${() => this.downloadTestCancel()}">
        <img class="modal-image" slot="modal-image" src="/assets/images/warning.svg" alt="warning icon" />
      
        <div slot="modal-actions">
          <app-button @click="${() => this.download()}">Download</app-button>
        </div>
      </app-modal>
      
      <!-- windows store options modal -->
      <app-modal id="windows-options-modal" heading="Windows App Options" body="Customize your Windows app below"
        ?open="${this.openWindowsOptions}" @app-modal-close="${() => this.storeOptionsCancel()}">
        <windows-form slot="modal-form" .generating=${this.generating} @init-windows-gen="${(ev: CustomEvent) =>
              this.generate('windows', ev.detail as WindowsPackageOptions)}"></windows-form>
      </app-modal>
      
      <!-- android options modal -->
      <app-modal id="android-options-modal" heading="Android App Options" body="Customize your Android app below" nav=${true}
        ?open="${this.openAndroidOptions === true}" @app-modal-close="${() => this.storeOptionsCancel()}">
          
        <div id="apk-type" slot="modal-nav">
          <p class="selected-apk apk-type" @click=${(e: any) => this.toggleApkType(e)} data-type="play">Google Play</p>
          <p class="unselected-apk apk-type" id="other-android" data-type="other" @click=${(e: any) => this.toggleApkType(e)}>
            Other Android
            <info-circle-tooltip @click=${() => 0} id="info-tooltip" text='Generates an unsigned APK.'></info-circle-tooltip>
          </p>
        </div>
        ${this.isGooglePlay ?
          html`<android-form slot="modal-form" .generating=${this.generating} .isGooglePlayApk=${this.isGooglePlay} @init-android-gen="${(e: CustomEvent) =>
            this.generate('android', e.detail as AndroidPackageOptions)}"></android-form>` :
          html`<android-form slot="modal-form" .generating=${this.generating} .isGooglePlayApk=${this.isGooglePlay} @init-android-gen="${(e: CustomEvent) =>
            this.generate('other-android', e.detail as AndroidPackageOptions)}"></android-form>`
        }
    </app-modal>
      
      <!-- ios options modal -->
      <app-modal id="ios-options-modal" heading="iOS App Options" body="Customize your iOS app below"
        ?open="${this.openiOSOptions === true}" @app-modal-close="${() => this.storeOptionsCancel()}">
        <ios-form slot="modal-form" .generating=${this.generating}
          @init-ios-gen="${(ev: CustomEvent) => this.generate('ios', ev.detail)}">
        </ios-form>
      </app-modal>
      
      <!-- oculus options modal -->
      <app-modal id="oculus-options-modal" heading="Meta Quest App Options" body="Customize your Meta Quest app below"
        ?open="${this.openOculusOptions}" @app-modal-close="${() => this.storeOptionsCancel()}">
        <oculus-form slot="modal-form" .generating=${this.generating}
          @init-oculus-gen="${(ev: CustomEvent) => this.generate('oculus', ev.detail)}">
        </oculus-form>
      </app-modal>
      
      <div id="publish-wrapper">
        <app-header></app-header>
      
        <div id="grid" class="${classMap({
                'grid-mobile': this.isDeskTopView == false,
              })}">
          <app-sidebar id="desktop-sidebar"></app-sidebar>
      
          <div>
            <content-header class="publish">
              <div id="banner-header" slot="hero-container">
                <h1> <span>Awesome!</span> Your PWA is Store Ready.</h1>
              </div>
              
              <p id="hero-p" slot="hero-container">
                You are now ready to ship your PWA to the app stores!
              </p>
            </content-header>
      
            <app-sidebar id="tablet-sidebar"></app-sidebar>
      
            <section class="container">
              <div id="summary-block">
                <h2>Publish your PWA to stores</h2>
        
                <p>
                  Generate store-ready packages for the Microsoft Store, Google
                  Play and more!
                </p>
              </div>
              <div id="store-cards">
                ${this.renderContentCards()}
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  }
}

interface ICardData {
  title: 'Windows' | 'Android' | 'iOS' | "Meta Quest";
  factoids: string[];
  isActionCard: boolean;
  icon: string;
  renderDownloadButton: () => TemplateResult;
}