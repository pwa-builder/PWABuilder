import { LitElement, css, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
    AnalyticsBehavior,
    recordProcessStep,
    recordPWABuilderProcessStep,
} from '../utils/analytics';
import { getURL } from '../services/app-info';
import { generatePackage, Platform } from '../services/publish';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

import {
    // smallBreakPoint,
    mediumBreakPoint,
    largeBreakPoint,
    //xLargeBreakPoint,
    xxxLargeBreakPoint,
    smallBreakPoint,
} from '../utils/css/breakpoints';

import './windows-form';
import './android-form';
import './ios-form';
import { AppPackageFormBase } from './app-package-form-base';
import { PackageOptions } from '../utils/interfaces';
import { classMap } from 'lit/directives/class-map.js';
import { getDataFromDB, setDataInDB } from '../utils/indexedDB';
import { GooglePlayPackageError } from "../models/GooglePlayPackageError";
import { enqueueGooglePlayPackageJob } from "../services/publish/android-publish";
import { AndroidPackageOptions } from "../utils/android-validation";
import { Router } from '@vaadin/router';

@customElement('publish-pane')
export class PublishPane extends LitElement {
    @property({ attribute: "analysis-id" }) analysisId: string | null = null;

    // tells page we are generating a package
    @state() generating = false;

    // Used to switch from cards to form true = cards, false = forms
    @state() cardsOrForm = true;


    // Used for google play store
    @state() isGooglePlay = true;
    @state() selectedStore = "";

    // Used to download files
    @state() readyToDownload = false;
    @state() blob: Blob | File | null | undefined;
    @state() testBlob: Blob | File | null | undefined;
    @state() downloadFileName: string | null = null;
    @state() feedbackMessages: TemplateResult[] = [];

    @property({ type: Boolean }) preventClosing = false;

    @state() storeMap: any = {
        "Windows":
        {
            "logo": "/assets/windows_icon.svg",
            "packaging_text": "Click below for instructions on how to submit to the Windows Store.",
            "package_instructions": "https://docs.pwabuilder.com/#/builder/windows"
        },
        "Android":
        {
            "logo": "/assets/android_icon.svg"
            /* Android packaging text is handle in the function so that it will update on apk toggle */
        },
        "iOS":
        {
            "logo": "/assets/apple_icon.svg",
            "packaging_text": "Click below for instructions on how to submit to the Apple App Store.",
            "package_instructions": "https://docs.pwabuilder.com/#/builder/app-store"
        }
    }

    objectStore = 'form-data'

    readonly platforms: ICardData[] = [
        {
            title: 'Windows',
            factoids: [
                "PWAs can be indistinguishable from native apps on Windows",
                "PWAs are first class applications",
                "Collect 100% of revenue generated via third party commerce platforms",
                "1B+ store enabled devices"
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
            title: 'iOS',
            factoids: [
                "Leverage same codebase across all platforms",
                "Large user base",
                "Premium devices"
            ],
            isActionCard: true,
            icon: '/assets/Publish_Apple.svg',
            renderDownloadButton: () => this.renderiOSDownloadButton()
        }
    ];

    static get styles() {
        return [
            css`
      * {
        box-sizing: border-box;
      }

      #pp-frame-wrapper {
        width: 100%;
        height: 90vh;
      }
      #pp-frame-content {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      #pp-frame-header {
        display: flex;
        flex-direction: column;
        row-gap: .25em;
        padding: 1em;
        padding-bottom: 0;
      }
      #pp-frame-header > * {
        margin: 0;
      }
      #pp-frame-header h1 {
        font-size: 24px;
      }
      #pp-frame-header p {
        font-size: 14px;
      }
      .card-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0px 4px 10px 4px rgba(0, 0, 0, 0.05);
        position: relative;
        border-radius: var(--card-border-radius);
      }
      .packaged-tracker {
        height: max-content;
        width: 33%;
        background-color: #E2F2E8;
        align-self: flex-end;
        justify-self: flex-end;
        border-bottom-left-radius: 5px;
        padding: 7px;
        padding-left: 9px;
        position: absolute;
        top: 0;
        right: 0;
      }
      .packaged-tracker p {
        margin: 0;
        text-align: center;
        color: #50BA87;
        font-size: 10px;
        line-height: 12px;
        font-weight: bold;
      }
      .experimental-tracker {
        height: max-content;
        width: 33%;
        background-color: #F2F3FB;
        align-self: flex-end;
        justify-self: flex-end;
        border-bottom-left-radius: 5px;
        padding: 7px;
        padding-left: 9px;
        position: absolute;
        top: 0;
        right: 0;
      }
      .experimental-tracker p {
        margin: 0;
        text-align: center;
        color: #4F3FB6;
        font-size: 10px;
        line-height: 12px;
        font-weight: bold;
      }
      .title-block {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        width: 100%;
        row-gap: .45em;
        padding: 1em;
      }
      .title-block h2 {
        margin: 0;
        font-size: 24px;
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
        justify-content: center;
        row-gap: 10px;
        width: 100%;
      }
      #store-cards {
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: .75em;
        padding: 1em;
        overflow-y: auto;
      }
      app-button {
        display: flex;
        justify-content: center;
      }
      .package-button {
        all: unset;
        width: 75%;
        background-color: var(--font-color);
        color: #ffffff;
        border: 1px solid transparent;
        font-size: 14px;
        border-radius: 50px;
        padding: .75em 1em;
        text-align: center;
        font-weight: bold;
      }
      .package-button:focus, .package-button:hover {
        box-shadow: var(--button-box-shadow);
        border: 1px solid #ffffff;
        outline: 2px solid #000000;
        background-color: rgba(0, 0, 0, 0.75);
        cursor: pointer;
      }
      #apk-tabs {
        display: flex;
        align-items: baseline;
        width: 100%;
        border-bottom: 2px solid var(--primary-color);
        margin-top: 20px;
        margin-bottom: 14px;
      }
      .tab-holder {
        width: 100%;
        display: flex;
        align-items: center;
        gap: .5em;
        justify-content: center;
      }
      .tab-holder p {
        font-size: 20px;
        font-weight: 700;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: center;
        margin: 0;
        padding: 10px 0;
        white-space: nowrap;
      }
      .tab-holder p:hover {
        cursor: pointer;
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
        border-bottom: 5px solid var(--primary-color);
        color: var(--primary-color);
      }

      .unselected-apk {
        border-bottom: 5px solid transparent;
      }
      #pp-form-header {
        display: flex;
        flex-direction: column;
        background-color: #F2F3FB;
        border-top-left-radius: var(--card-border-radius);
        border-top-right-radius: var(--card-border-radius);
        padding: 1em;
        gap: .5em;
      }
      #pp-form-header > img {
        width: 25px;
      }
      #pp-form-header > button {
        all: unset;
      }
      #pp-form-header > button:hover {
        cursor: pointer;
      }
      #pp-form-header > button:focus {
        outline: 2px solid #000000;
        outline-offset: 2px;
        border-radius: 4px;
      }
      #pp-form-header-content {
        display: flex;
        gap: 1em;
      }
      #pp-form-header-content img {
        height: 40px;
      }
      #pp-form-header-text {
        display: flex;
        flex-direction: column;
      }
      #pp-form-header-text > * {
        margin: 0;
      }
      #pp-form-header-text h1 {
        font-size: 24px;
        white-space: nowrap;
        line-height: 24px;
      }
      #pp-form-header-text p {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.5)
      }

      windows-form, android-form, ios-form, oculus-form {
        height: 100%;
      }

      #form-area {
        height: 100%;
        width: 100%;
        overflow: auto;
        position: relative;
      }

      #form-area[data-store="Android"] {
        padding-top: 0;
        flex-direction: column;
      }

      .noX::part(close-button) {
        display: none;
      }

      .dialog::part(body){
        padding: 0;
        width: 100%;
      }
      .dialog::part(title){
        display: none;
      }
      .dialog::part(panel) {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: var(--card-border-radius);
      }
      .dialog::part(overlay){
        backdrop-filter: blur(10px);
      }
      .dialog::part(close-button__base){
        position: absolute;
        top: 5px;
        right: 5px;
        z-index: 1000;
      }

      #unsigned-tooltip{
        position: relative;
      }

      .toolTip {
        visibility: hidden;
        font-size: 14px;
        width: 150px;
        background: var(--font-color);
        color: white;
        font-weight: 500;
        text-align: center;
        border-radius: 6px;
        padding: .75em;
        /* Position the tooltip */
        position: absolute;
        top: 25px;
        left: -100px;
        z-index: 1;
        box-shadow: 0px 2px 20px 0px #0000006c;
      }
      #unsigned-tooltip:hover .toolTip {
        visibility: visible;
      }

      #feedback {
        position: absolute;
        bottom: .5em;
        padding: 0 1em;
        width: 100%;
      }

      .feedback-holder {
        display: flex;
        gap: .5em;
        padding: .5em;
        border-radius: 3px;
        width: 100%;
        word-break: break-word;
      }

      .type-error {
        align-items: flex-start;
        background-color: #FAEDF1;
        border-left: 4px solid var(--error-color);
      }

      .type-success {
        align-items: center;
        background-color: #eefaed;
        border-left: 4px solid var(--success-color);
      }

      .feedback-holder p {
        margin: 0;
        font-size: 14px;
      }

      .error-title {
        font-weight: bold;
      }

      .error-actions {
        display: flex;
        align-items: center;
        gap: 1em;
        margin-top: .25em;
      }

      .error-actions > * {
        all: unset;
        color: var(--font-color);
        font-weight: bold;
        font-size: 14px;
        border-bottom: 1px solid transparent;
      }

      .error-actions > *:hover {
        cursor: pointer;
        border-bottom: 1px solid var(--font-color);
      }

      .error-desc {
        max-height: 175px;
        overflow-y: auto;
        line-height: normal;
      }

      .close_feedback {
        margin-left: auto;
      }

      .close_feedback:hover {
        cursor: pointer;
      }

      #form-extras {
        display: flex;
        justify-content: space-between;
        padding: 1.5em 2em;
        background-color: #F2F3FB;
        border-bottom-right-radius: var(--card-border-radius);
        border-bottom-left-radius: var(--card-border-radius);
      }

      #form-details-block {
        width: 50%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      #form-details-block p {
        font-size: 14px;
        color: #808080;
      }

      #form-options-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .5em;
      }

      #generate-submit::part(base) {
        background-color: var(--font-color);
        color: white;
        height: 3em;
        width: 100%;
        border-radius: 50px;
      }

      #form-extras sl-button::part(label){
        font-size: 16px;
        padding: .5em 2em;
        display: flex;
        align-items: center;
      }

      .arrow_link {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-weight: bold;
        margin-bottom: .25em;
        font-size: 14px;
      }
      .arrow_link a {
        text-decoration: none;
        border-bottom: 1px solid rgb(79, 63, 182);
        font-size: 1em;
        font-weight: bold;
        margin: 0px 0.5em 0px 0px;
        line-height: 1em;
        color: rgb(79, 63, 182);
      }
      .arrow_link a:visited {
        color: #4F3FB6;
      }
      .arrow_link:hover {
        cursor: pointer;
      }
      .arrow_link:hover img {
        animation: bounce 1s;
      }

      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
          transform: translateX(-5px);
        }
        60% {
            transform: translateX(5px);
        }
      }

      #tou-link{
        color: 757575;
        font-size: 14px;
      }

      @media(max-width: 640px){
        #form-extras {
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1em;
        }
        #form-details-block {
          flex-direction: column;
          gap: .75em;
          align-items: center;
          text-align: center;
          width: 100%;
        }
        #form-options-actions {
          flex-direction: column;
        }
      }

      @media(min-height: 900px){
        #pp-frame-wrapper {
          width: 100%;
          height: 85vh;
        }
      }

      /* > 1920 */
      ${xxxLargeBreakPoint(css``)}

      /* 640px - 1023px */
      ${largeBreakPoint(css``)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
        #store-cards {
          display: flex;
          flex-direction: column;
          row-gap: .5em;
          overflow-y: auto;
        }
      `)}
      /* < 480 */
      ${smallBreakPoint(css`
        #store-cards {
          display: flex;
          flex-direction: column;
          row-gap: .5em;
          overflow-y: auto;
        }
        #pp-frame-header{
          margin-bottom: 10px;
          padding: 1em 2em 0em 1em;
        }
        #pp-frame-header h1 {
          font-size: 20px;
          line-height: 20px;
        }
        #pp-frame-header p {
          font-size: 12px;
        }
        #pp-form-header-content img {
          height: 35px;
        }
        #pp-form-header-text h1 {
          font-size: 20px;
          white-space: nowrap;
          line-height: 20px;
        }
        #pp-form-header-text p {
          font-size: 12px;
        }
        #apk-type p {
          font-size: 16px;
        }

        #info-tooltip {
          height: 16px
        }

      `)}

    `
        ];
    }

    constructor() {
        super();
    }

    firstUpdated() {

    }

    renderWindowsDownloadButton(): TemplateResult {
        return html`
      <button class="package-button" id="windows-package-button" @click="${() => this.showWindowsOptions()}">
        Generate Package
      </button>
    `;
    }

    renderAndroidDownloadButton(): TemplateResult {
        return html`
      <button class="package-button" id="android-package-button" @click="${() => this.showAndroidOptions()}">
        Generate Package
      </button>
    `;
    }

    renderiOSDownloadButton(): TemplateResult {
        return html`
      <button class="package-button" id="ios-package-button" @click="${() => this.showiOSOptions()}">
        Generate Package
      </button>
    `;
    }

    renderForm() {
        if (this.selectedStore === "Windows") {
            return html`<windows-form id="packaging-form" .generating=${this.generating}></windows-form>`
        } else if (this.selectedStore === "Android") {
            return html`
      <div id="apk-tabs">
        <div class="tab-holder selected-apk">
          <p class="apk-type" @click=${(e: any) => this.toggleApkType(e)}>Google Play</p>
        </div>
        <div class="tab-holder unselected-apk">
          <p class="apk-type" id="other-android" @click=${(e: any) => this.toggleApkType(e)}>Other Android</p>
          <div id="unsigned-tooltip">
            <img src="/assets/new/tooltip.svg" alt="info circle tooltip" />
            <span class="toolTip">
              Generates an unsigned APK.
            </span>
          </div>
        </div>
      </div>
      ${this.isGooglePlay ?
                    html`<android-form id="packaging-form" .generating=${this.generating} .isGooglePlayApk=${this.isGooglePlay} analysis-id="${this.analysisId || ""}"></android-form>` :
                    html`<android-form id="packaging-form" .generating=${this.generating} .isGooglePlayApk=${this.isGooglePlay} analysis-id="${this.analysisId || ""}"></android-form>`
                }`
        } else if (this.selectedStore === "Meta") {
            return html`<oculus-form id="packaging-form" .generating=${this.generating}>
      </oculus-form>`
        } else {
            return html`<ios-form id="packaging-form" .generating=${this.generating}></ios-form>`
        }

    }

    showWindowsOptions() {
        recordPWABuilderProcessStep("windows_store_form_opened", AnalyticsBehavior.ProcessCheckpoint)
        this.selectedStore = "Windows";
        this.cardsOrForm = false;
        this.requestUpdate();
    }

    showAndroidOptions() {
        recordPWABuilderProcessStep("android_store_form_opened", AnalyticsBehavior.ProcessCheckpoint);
        this.selectedStore = "Android";
        this.cardsOrForm = false;
        this.requestUpdate();
    }

    toggleApkType(event: any) {
        let old = this.shadowRoot!.querySelector(".selected-apk");
        old?.classList.replace("selected-apk", "unselected-apk");
        let next = event.target.parentNode;
        next.classList.replace("unselected-apk", "selected-apk");

        if (event.target.innerHTML === "Google Play") {
            this.isGooglePlay = true;
        } else {
            this.isGooglePlay = false;
        }
    }

    showiOSOptions() {
        recordPWABuilderProcessStep("ios_store_form_opened", AnalyticsBehavior.ProcessCheckpoint);
        this.selectedStore = "iOS";
        this.cardsOrForm = false;
        this.requestUpdate();
    }

    showMetaOptions() {
        recordPWABuilderProcessStep("meta_store_form_opened", AnalyticsBehavior.ProcessCheckpoint);
        this.selectedStore = "Meta";
        this.cardsOrForm = false;
        this.requestUpdate();
    }

    async generate(platform: Platform, options?: PackageOptions) {
        // Record analysis results to our analytics portal.
        recordProcessStep(
            'analyze-and-package-pwa',
            `create-${platform}-package`,
            AnalyticsBehavior.CompleteProcess,
            { url: getURL() });

        recordProcessStep(
            'pwa-builder',
            `create-${platform}-package`,
            AnalyticsBehavior.CompleteProcess,
            { url: getURL() });

        try {
            this.generating = true;

            // For Android platforms, queue up the packaging job and navigate to the Google Play package status page.
            if (options && (platform === "android" || platform === "other-android")) {
                const googlePlayPackageOptions = options as AndroidPackageOptions;
                googlePlayPackageOptions.analysisId = this.analysisId || null;
                const jobId = await enqueueGooglePlayPackageJob(googlePlayPackageOptions);
                Router.go("/google-play-packaging-status?jobId=" + encodeURIComponent(jobId));
                return;
            }

            const packageData = await generatePackage(platform, options);

            if (packageData) {
                this.downloadFileName = `${packageData.appName}.zip`;
                if (packageData.type === 'test') {
                    this.testBlob = packageData.blob;
                } else {
                    this.blob = packageData.blob;
                    this.readyToDownload = true;
                    this.downloadPackage()
                }
            }
            this.renderSuccessMessage()
        } catch (err: any) {
            this.renderErrorMessage(err);
            //this.showAlertModal(err as Error, platform);
            recordProcessStep(
                'analyze-and-package-pwa',
                `create-${platform}-package-failed`,
                AnalyticsBehavior.CancelProcess,
                {
                    url: getURL(),
                    error: err
                });
            recordProcessStep(
                'pwa-builder',
                `create-${platform}-package-failed`,
                AnalyticsBehavior.CancelProcess,
                {
                    url: getURL(),
                    error: err
                });
        } finally {
            this.generating = false;
        }
    }

    // takes the information from the selectedStore and error and forms a card to
    // convey the error message to the user in a user friendly way
    // directs users towards FAQ
    renderErrorMessage(err: any) {
        let response = err.response;
        let stack_trace = `Running analysis on ${getURL()}\n`; // stored in copy st button
        let title = ""; // first line of error message
        let message = ""; // text that comes after error code in quick desc
        let quick_desc = ""; // the quick description they get to read (searchable)


        if (err.message === "Failed to fetch") {
            title = err.message;
            quick_desc = "Our service was unable to package your PWA. Please open an issue on github here: https://github.com/pwa-builder/PWABuilder/issues/new/choose"
            stack_trace += "No stack trace available";
        }
        else if (this.selectedStore === "Windows") {
            let errString = err.stack;
            stack_trace += errString.slice(
                errString.indexOf(" at ") + 1
            );
            title = errString.split(",")[0]; // first line of error message
            quick_desc = errString.slice(
                errString.indexOf("Details:") + 8,
                errString.indexOf(" at ")
            ); // the quick description they get to read (searchable)

        } else if (this.selectedStore === "Android") {
            const googlePlayError = err as GooglePlayPackageError | null;
            if (googlePlayError && googlePlayError.message) {
                //showErrorToast(googlePlayError.message, googlePlayError.packageJob?.logs.join("\n") || googlePlayError.packageJob?.pwaUrl || "No Google Play package error details are available.");
            }
            title = googlePlayError?.message || "Error generating package";
            stack_trace += (googlePlayError?.packageJob?.logs || []).join("\n");
            message = (googlePlayError?.packageJob?.errors || []).join(", ");
            quick_desc = googlePlayError?.packageJob?.errors[0] || message || title;
        } else {
            title = response.statusText;
            stack_trace += err.stack;
            quick_desc = `Status code: ${response.status}. ${response.stack_trace}`
        }
        let error = html`
      <div class="feedback-holder type-error">
        <img src="/assets/new/stop.svg" alt="invalid result icon" />
        <div class="error-info">
          <p class="error-title">${title}</p>
          <p class="error-desc">${quick_desc}</p>
          <div class="error-actions">
            <button class="copy_stack" @click=${() => this.copyText(stack_trace)}>Copy stack trace</button>
            <a href="https://docs.pwabuilder.com/#/builder/faq" target="_blank" rel="noopener">Visit FAQ</a>
          </div>
        </div>
        <img @click=${() => this.feedbackMessages = []} class="close_feedback" src="assets/images/Close_desk.png" alt="close icon" />
      </div>
    `
        this.feedbackMessages.push(error);
    }

    // renders successfully downloaded message upon successful downloads
    renderSuccessMessage() {
        this.feedbackMessages.push(html`
            <div class="feedback-holder type-success">
                <img src="/assets/new/valid.svg" alt="successful download icon" />
                <p class="success-desc">${`Congratulations! Your ${this.selectedStore} package has successfully downloaded!`}</p>
                <img @click=${() => this.feedbackMessages = []} class="close_feedback" src="assets/images/Close_desk.png" alt="close icon" />
            </div>
        `);
    }

    // copy string to clipboard
    copyText(text: string) {
        navigator.clipboard.writeText(text);
    }

    // before we downloaded the package using a service
    // now we just do it the vanilla js way
    async downloadPackage() {
        let blob = (this.blob || this.testBlob);
        if (blob) {
            let filename = this.downloadFileName || 'your_pwa.zip';
            var element = document.createElement('a');
            element.href = URL.createObjectURL(blob!)
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);

            this.blob = undefined;
            this.testBlob = undefined;
        }
    }

    // renders the store cards with their associated factoids from this.platforms
    renderContentCards(): TemplateResult[] {
        return this.platforms.map(
            platform => html`
        <div class="card-wrapper">
          ${platform.title != "iOS" ? null :
                    html`
            <div class="experimental-tracker">
            <p>Experimental</p>
            </div>`
                }
          <div class="title-block">
            <img class="platform-icon" src="${platform.icon}" alt="platform icon" />
            <h2>${platform.title}</h2>
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

    async hideDialog(e: any) {
        let dialog: any = this.shadowRoot!.querySelector(".dialog");
        if (e.target === dialog) {
            this.saveFormData().catch(err => {
                console.error('Error saving form data on dialog hide:', err);
            });
            this.blob = undefined;
            this.generating = false;
            this.feedbackMessages = [];
            await dialog!.hide();
            recordPWABuilderProcessStep("publish_pane_closed", AnalyticsBehavior.ProcessCheckpoint);
            document.body.style.height = "unset";
            this.cardsOrForm = true;
        }
    }

    handleRequestClose(e: Event) {
        if (this.preventClosing) {
            e.preventDefault();
        }
    }

    // goes from form back to cards when you click the back arrow
    backToCards() {
        this.cardsOrForm = !this.cardsOrForm;
        this.feedbackMessages = [];
        this.saveFormData().catch(err => {
            console.error('Error saving form data on back to cards:', err);
        });
        recordPWABuilderProcessStep(`left_${this.selectedStore}_form`, AnalyticsBehavior.ProcessCheckpoint);
    }

    // the footer of the pane that has links to packaging instructions and download button
    renderFormFooter() {
        // Special case for Android since we have to toggle some info due to the "Other Android" scenario
        if (this.selectedStore === "Android") {
            return html`
        <div id="form-extras">
          <div id="form-details-block">
            <p>${this.isGooglePlay ? "Click below for instructions on how to submit to the Google Play Store." : "Click below for instructions on how to submit to other Android stores."}</p>
            <div class="arrow_link">
              <a @click=${() => recordPWABuilderProcessStep(`${this.isGooglePlay ? this.selectedStore.toLowerCase() : `other_${this.selectedStore.toLowerCase()}`}_packaging_instructions_clicked`, AnalyticsBehavior.ProcessCheckpoint)} href=${this.isGooglePlay ? "https://docs.pwabuilder.com/#/builder/android" : "https://docs.pwabuilder.com/#/builder/other-android"} target="_blank" rel="noopener">Packaging Instructions</a>
              <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
            </div>
          </div>
          <div id="form-options-actions" class="modal-actions">
            <sl-button  id="generate-submit" type="submit" @click=${this.submitForm} ?loading="${this.generating}" ?disabled=${this.feedbackMessages.length > 0} >
              Download Package
            </sl-button>
            <a
              target="_blank"
              rel="noopener"
              href="https://github.com/pwa-builder/PWABuilder/blob/master/TERMS_OF_USE.md"
              id="tou-link"
              @click=${() => recordPWABuilderProcessStep("TOU_clicked", AnalyticsBehavior.ProcessCheckpoint)}
              >Terms of Use</a>
          </div>
        </div>
    `
        }
        return html`
      <div id="form-extras">
        <div id="form-details-block">
          <p>${this.storeMap[this.selectedStore].packaging_text}</p>
          <div class="arrow_link">
            <a @click=${() => recordPWABuilderProcessStep(`${this.selectedStore.toLowerCase()}_packaging_instructions_clicked`, AnalyticsBehavior.ProcessCheckpoint)} href=${this.storeMap[this.selectedStore].package_instructions} target="_blank" rel="noopener">Packaging Instructions</a>
            <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
          </div>
        </div>
        <div id="form-options-actions" class="modal-actions">
          <sl-button  id="generate-submit" type="submit" @click=${this.submitForm} ?loading="${this.generating}">
            Download Package
          </sl-button>
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/pwa-builder/PWABuilder/blob/master/TERMS_OF_USE.md"
            id="tou-link"
            @click=${() => recordPWABuilderProcessStep("TOU_clicked", AnalyticsBehavior.ProcessCheckpoint)}
            >Terms of Use</a>
        </div>
      </div>
    `
    }

    // validates packaging options and downloads package if valid
    // reports validity if not
    submitForm() {
        let platForm = (this.shadowRoot!.getElementById("packaging-form") as AppPackageFormBase); // windows-form | android-form | ios-form | oculus-form
        let form = platForm.getForm(); // the actual form element inside the platform form.

        if (form!.checkValidity()) {
            let packagingOptions = platForm!.getPackageOptions();
            this.generate(this.selectedStore.toLowerCase() as Platform, packagingOptions);
        } else {
            const details = platForm.shadowRoot!.querySelector('sl-details');
            const expanding = details ? details.show() : Promise.resolve();
            expanding.then(() => form!.reportValidity()); // it may contain errors collapsed
        }
        this.saveFormData().catch(err => {
            console.error('Error saving form data on submit:', err);
        });
    }

    private getFormKey(): string {
        return `${getURL()}-${this.selectedStore}-form-data`;
    }

    // Save form data to IndexedDB
    async saveFormData() {
        try {
            const platForm = this.shadowRoot!.getElementById("packaging-form") as AppPackageFormBase;
            if (platForm && platForm.getForm) {
                const form = platForm.getForm();
                if (form) {
                    const data: Record<string, any> = {};
                    Array.from(form.elements).forEach((el: any) => {
                        if (el.id) {
                            if (el.type === "checkbox" || el.type === "radio") {
                                data[el.id] = el.checked;
                            } else {
                                data[el.id] = el.value;
                            }
                        }
                    });
                    await setDataInDB(this.objectStore, this.getFormKey(), data);
                }
            }
        } catch (error) {
            console.error('Failed to save form data:', error);
            throw error;
        }
    }

    // Load form data from IndexedDB
    async loadFormData() {
        try {
            const platForm = this.shadowRoot!.getElementById("packaging-form") as AppPackageFormBase;
            if (platForm && platForm.getForm) {
                const form = platForm.getForm();
                if (form) {
                    const data = await getDataFromDB(this.objectStore, this.getFormKey());
                    if (data) {
                        (Array.from(form.elements) as HTMLInputElement[]).forEach(el => {
                            if (el.id && data.hasOwnProperty(el.id) && !el.classList.contains("no-form-data-restoration")) {
                                if (el.type === "checkbox" || el.type === "radio") {
                                    el.checked = data[el.id];
                                } else {
                                    el.value = data[el.id];
                                }

                                el.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event to update its model
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load form data:', error);
        }
    }

    // Load form data after rendering the form
    updated(changedProps: Map<string, any>) {
        if (changedProps.has('cardsOrForm') && !this.cardsOrForm) {
            // COMMENTED OUT: this was causing all kinds of unintended problems.
            // setTimeout(() => this.loadFormData(), 0);
        }
    }

    render() {
        return html`
      <sl-dialog
        label="Dialog"
        class=${classMap({ noX: this.preventClosing, dialog: true })}
        @sl-hide=${(e: any) => this.hideDialog(e)}
        @sl-request-close=${(e: any) => this.handleRequestClose(e)}
        noHeader
      >
        <div id="pp-frame-wrapper">
          <div id="pp-frame-content">
          ${this.cardsOrForm ?
                html`
              <div id="pp-frame-header">
                <h1>Awesome! Your PWA is store ready!</h1>
                <p>You are now ready to ship your PWA to the app stores. Generate store-ready packages for the Microsoft Store, Google Play, iOS and Meta stores.</p>
              </div>
              <div id="store-cards">
                ${this.renderContentCards()}
              </div>
            `
                :
                html`
              <div id="pp-form-header">
                <button type="button" @click=${() => this.backToCards()}><img src="/assets/new/back_for_package_form.svg" alt="back to store cards button" /></button>
                <div id="pp-form-header-content">
                  <img src="${this.storeMap[this.selectedStore].logo}" alt="${this.selectedStore} logo" />
                  <div id="pp-form-header-text">
                    <h1>${this.selectedStore} Package Options</h1>
                    <p>Customize your ${this.selectedStore} app below!</p>
                  </div>
                </div>
              </div>
              <div id="form-area" data-store=${this.selectedStore}>
                ${this.renderForm()}
                <div id="feedback">${this.feedbackMessages.length > 0 ? this.feedbackMessages.map((error: TemplateResult) => error) : null}</div>
              </div>
              ${this.renderFormFooter()}
            `
            }
          </div>
        </div>
      </sl-dialog>

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
