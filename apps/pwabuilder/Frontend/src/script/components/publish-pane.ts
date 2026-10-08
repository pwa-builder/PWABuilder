import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { publishPaneStyles } from "./publish-pane.styles";
import {
    AnalyticsBehavior,
    recordProcessStep,
    recordPWABuilderProcessStep,
} from '../utils/analytics';
import { getURL } from '../services/app-info';
import { generatePackage, Platform } from '../services/publish';
import { showToast } from '../services/toast-service';


import './windows-form';
import './android-form';
import './ios-form';
import './macos-form';
import { AppPackageFormBase } from './app-package-form-base';
import { PackageOptions } from '../utils/interfaces';
import { getDataFromDB, setDataInDB } from '../utils/indexedDB';
import { GooglePlayPackageError } from "../models/google-play-package-error";
import { enqueueGooglePlayPackageJob } from "../services/publish/android-publish";
import { AndroidPackageOptions } from "../utils/android-validation";
import { WindowsPackageOptions } from '../utils/win-validation';
import { Router } from '@vaadin/router';
import { AppStore, packagingCompleted, packagingFailed, packagingStarted } from '../pages/app-report.api';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/callout/callout.js';
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

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
        },
        "macOS":
        {
            "logo": "/assets/apple_icon.svg",
            "packaging_text": "Click below for instructions on how to sideload your macOS app.",
            "package_instructions": "https://docs.pwabuilder.com/#/builder/mac"
        }
    }

    objectStore = 'form-data'

    readonly platforms: ICardData[] = [
        {
            operatingSystem: 'Windows',
            appStore: 'Microsoft Store',
            factoids: [
                "PWAs can be indistinguishable from native apps on Windows",
                "PWAs are first class apps",
                "Collect 100% of revenue generated via third party commerce platforms",
                "1B+ store enabled devices"
            ],
            isActionCard: true,
            icon: '/assets/Publish_Windows.svg',
            renderDownloadButton: () => this.renderWindowsDownloadButton()
        },
        {
            operatingSystem: 'Android',
            appStore: 'Google Play',
            factoids: [
                "PWAs are first class apps",
                "One app store listing for all devices (mobile, tablet, desktop)",
                "2.5 billion store enabled devices"
            ],
            isActionCard: true,
            icon: '/assets/Publish_Android.svg',
            renderDownloadButton: () => this.renderAndroidDownloadButton()
        },

        {
            operatingSystem: 'iOS',
            appStore: 'App Store',
            factoids: [
                "Leverage same codebase across all platforms",
                "Large user base",
                "Premium devices"
            ],
            isActionCard: true,
            icon: '/assets/Publish_Apple.svg',
            renderDownloadButton: () => this.renderiOSDownloadButton()
        },
        {
            operatingSystem: 'macOS',
            appStore: 'Mac',
            factoids: [
                "Full-screen WKWebView app with no browser toolbar",
                "Same experience as Chrome/Edge PWA install",
                "Distribute as a .dmg for sideloading"
            ],
            isActionCard: true,
            icon: '/assets/Publish_Apple.svg',
            renderDownloadButton: () => this.renderMacOSDownloadButton()
        }
    ];
    static styles = [publishPaneStyles];

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

    renderMacOSDownloadButton(): TemplateResult {
        return html`
      <button class="package-button" id="macos-package-button" @click="${() => this.showMacOSOptions()}">
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
        } else if (this.selectedStore === "macOS") {
            return html`<macos-form id="packaging-form" .generating=${this.generating}></macos-form>`
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

    showMacOSOptions() {
        recordPWABuilderProcessStep("macos_store_form_opened", AnalyticsBehavior.ProcessCheckpoint);
        this.selectedStore = "macOS";
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

            const appStore = this.getAppStoreFromPlatform(platform);
            if (this.analysisId && appStore) {
                try {
                    await packagingStarted(this.analysisId, appStore);
                } catch (error) {
                    console.warn("Unable to record packaging start.", error);
                }
            }

            // For Android platforms, queue up the packaging job and navigate to the Google Play package status page.
            if (options && (platform === "android" || platform === "other-android")) {
                const googlePlayPackageOptions = options as AndroidPackageOptions;
                googlePlayPackageOptions.analysisId = this.analysisId || null;
                const jobId = await enqueueGooglePlayPackageJob(googlePlayPackageOptions);
                Router.go("/google-play-packaging-status?jobId=" + encodeURIComponent(jobId));
                return;
            }

            // For Windows, set the analysis ID if available.
            if (options && platform === "windows") {
                (options as WindowsPackageOptions).analysisId = this.analysisId || undefined;
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

                if (this.analysisId && appStore) {
                    try {
                        await packagingCompleted(this.analysisId, appStore);
                    } catch (error) {
                        console.warn("Unable to record packaging completion.", error);
                    }
                }
            }
            this.renderSuccessMessage()
        } catch (err: any) {
            const appStore = this.getAppStoreFromPlatform(platform);
            if (this.analysisId && appStore) {
                try {
                    await packagingFailed(this.analysisId, appStore, err);
                } catch (error) {
                    console.warn("Unable to record packaging failure.", error);
                }
            }

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

    private getAppStoreFromPlatform(platform: Platform): AppStore | null {
        switch (platform) {
            case "windows":
                return "MicrosoftStore";
            case "android":
                return "GooglePlayStore";
            case "ios":
                return "IOSAppStore";
            case "macos":
                return null;
            default:
                return null;
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
        let hyperlinkText: string | null = null; // optional link rendered after the body
        let hyperlinkUrl: string | null = null;


        if (err.message === "Failed to fetch") {
            title = err.message;
            quick_desc = `We couldn't package your PWA for the store`;
            hyperlinkText = "Open an issue on GitHub";
            hyperlinkUrl = "https://github.com/pwa-builder/PWABuilder/issues/new/choose";
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
        // Show the error as a toast (rendered outside the publish pane) and close
        // the dialog so the message isn't hidden behind / overlapping the pane.
        showToast({ title: title || "Error generating package", details: quick_desc, variant: "danger", icon: "exclamation-octagon", countdown: true, hyperlinkText, hyperlinkUrl });
        console.error("Error generating package", { title, quick_desc, stack_trace });
        this.closePane();
    }

    // Closes the publish pane dialog. Setting open=false fires the dialog's
    // wa-hide handler (hideDialog), which resets the pane's state.
    private closePane() {
        const dialog: any = this.shadowRoot?.querySelector(".dialog");
        if (dialog) {
            dialog.open = false;
        }
    }

    // renders successfully downloaded message upon successful downloads
    renderSuccessMessage() {
        this.feedbackMessages.push(html`
            <wa-callout variant="success" class="feedback-callout">
                <wa-icon slot="icon" name="check-circle-fill"></wa-icon>
                <div class="feedback-content">
                    <p class="success-desc">${`Congratulations! Your ${this.selectedStore} package has successfully downloaded!`}</p>
                    <button class="close_feedback" @click=${() => this.feedbackMessages = []} aria-label="Dismiss message">
                        <wa-icon name="x-lg"></wa-icon>
                    </button>
                </div>
            </wa-callout>
        `);
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
          ${(platform.operatingSystem === "iOS" || platform.operatingSystem === "macOS") ?
                    html`
            <div class="experimental-tracker">
            <p>Experimental</p>
            </div>` : null
                }
          <div class="title-block">
            <div class="platform-header">
              <img class="platform-icon" src="${platform.icon}" alt="platform icon" />
              <div class="platform-titles">
                <h2>${platform.appStore}</h2>
                <p class="platform-subtitle">${platform.operatingSystem}</p>
              </div>
            </div>
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
            dialog!.open = false;
            recordPWABuilderProcessStep("publish_pane_closed", AnalyticsBehavior.ProcessCheckpoint);
            this.cardsOrForm = true;
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
            <wa-button  id="generate-submit" type="submit" @click=${this.submitForm} ?loading="${this.generating}" ?disabled=${this.feedbackMessages.length > 0} >
              Download Package
            </wa-button>
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
          <wa-button  id="generate-submit" type="submit" @click=${this.submitForm} ?loading="${this.generating}">
            Download Package
          </wa-button>
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
            const details = platForm.shadowRoot!.querySelector('wa-details') as (HTMLElement & { open: boolean }) | null;
            if (details) {
                details.open = true; // it may contain errors collapsed
            }
            Promise.resolve().then(() => form!.reportValidity());
        }
        this.saveFormData().catch(err => {
            console.error('Error saving form data on submit:', err);
        });
    }

    private getFormKey(): string {
        return `${getURL()}-${this.selectedStore}-form-data`;
    }

    private async focusInitialWindowsField() {
        if (this.selectedStore !== "Windows" || this.cardsOrForm) {
            return;
        }

        const windowsForm = this.shadowRoot?.querySelector('windows-form#packaging-form') as (AppPackageFormBase & { updateComplete: Promise<unknown> }) | null;
        if (!windowsForm) {
            return;
        }

        await windowsForm.updateComplete;

        const packageIdInput = windowsForm.shadowRoot?.getElementById('package-id-input') as HTMLElement | null;
        packageIdInput?.focus();
    }

    private get friendlyStoreName(): string {
        switch (this.selectedStore) {
            case "Windows": return "Microsoft Store";
            case "Android": return "Google Play Store";
            case "iOS": return "Apple iOS App Store";
            case "macOS": return "macOS";
            default: return this.selectedStore;
        }
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

        if ((changedProps.has('cardsOrForm') || changedProps.has('selectedStore')) && !this.cardsOrForm) {
            void this.focusInitialWindowsField();
        }
    }

    render() {
        return html`
      <wa-dialog
        label="Dialog"
        class="dialog"
        light-dismiss
        @wa-hide=${(e: any) => this.hideDialog(e)}
      >
        <div id="pp-frame-wrapper">
          <div id="pp-frame-content">
          ${this.cardsOrForm ?
                html`
              <div id="pp-frame-header">
                <h1>Awesome! Your PWA is store ready!</h1>
                <p>You are now ready to ship your PWA to app stores. Generate store-ready packages for the Microsoft Store, Google Play, and iOS.</p>
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
                    <h1>${this.friendlyStoreName} Package Options</h1>
                    <p>Customize your app for the app store</p>
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
      </wa-dialog>

    `;
    }
}

interface ICardData {
    operatingSystem: 'Windows' | 'Android' | 'iOS' | 'macOS';
    appStore: 'Microsoft Store' | 'Google Play' | 'App Store' | 'Mac';
    factoids: string[];
    isActionCard: boolean;
    icon: string;
    renderDownloadButton: () => TemplateResult;
}
