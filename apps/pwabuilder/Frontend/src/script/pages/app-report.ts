import { LitElement, TemplateResult, html } from 'lit';
import { repeat } from "lit/directives/repeat.js";
import { customElement, state } from 'lit/decorators.js';
import { getManifestContext, setManifestContext } from '../services/app-info';
import { Manifest } from '@pwabuilder/manifest-validation';

import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import '../components/app-header';
import '../components/todo-list-item';
import '../components/manifest-editor-frame';
import '../components/publish-pane';
import '../components/test-publish-pane';
import '../components/sw-selector';
import '../components/share-card';
import '../components/manifest-info-card'
import '../components/sw-info-card'
import '../components/arrow-link'

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/button-group/button-group.js';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/details/details.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/progress-ring/progress-ring.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/copy-button/copy-button.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

import { Icon, ManifestContext } from '../utils/interfaces';
import { resolveUrl } from '../utils/url';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
//@ts-ignore
import Color from "../../../node_modules/colorjs.io/dist/color";
import { manifest_fields } from '@pwabuilder/manifest-information';
import { enqueueAnalysis, Analysis, getAnalysis, PwaCapability, PwaCapabilityStatus, PwaCapabilityLevel } from './app-report.api';
import { appReportStyles } from './app-report.styles';
import { createManifestContextFromEmpty } from '../services/manifest';
import { ManifestEditorFrame } from '../components/manifest-editor-frame';

const valid_src = "/assets/new/valid.svg";
const yield_src = "/assets/new/yield.svg";
const stop_src = "/assets/new/stop.svg";
const enhancement_src = "/assets/new/enhancement.svg";
const info_src = "/assets/new/info-circle.png";

@customElement('app-report')
export class AppReport extends LitElement {
    @state() siteUrl = '';
    @state() errorMessage: string | undefined = undefined;
    @state() isAppCardInfoLoading: boolean = false;
    @state() runningTests: boolean = false;
    @state() analysisId: string | null = null;
    @state() analysis: Analysis | null = null;
    @state() lastTested: string = "Last tested seconds ago";
    @state() startingManifestEditorTab: string = "info";
    @state() focusOnME: string = "";
    @state() proxyLoadingImage: boolean = false;
    @state() showIconsErrorBanner: boolean = false;
    @state() showRetestConfirmationModal: boolean = false;
    @state() thingToAdd: string = "";
    @state() retestConfirmed: boolean = false;
    @state() readDenied: boolean = false;
    @state() createdManifest: boolean = false;
    @state() manifestContext: ManifestContext | undefined;
    @state() todoFilters: PwaCapabilityLevel[] = ["Required", "Recommended", "Optional", "Feature"];
    @state() openTooltips: SlDropdown[] = [];
    @state() stopShowingNotificationTooltip: boolean = false;
    @state() closeOpenTooltips: boolean = true;
    @state() darkMode: boolean = false;
    @state() appCard = {
        siteName: 'Site Name',
        description: "Your site's description",
        siteUrl: 'Site URL',
        iconURL: '/assets/new/icon_placeholder.png',
        iconAlt: 'Your sites logo'
    };

    analysisStatusCheckHandle = 0;
    readonly analysisStatusCheckInterval = 2000;
    readonly CardStyles = { backgroundColor: '#ffffff', color: '#292c3a' };
    readonly BorderStyles = { borderTop: '1px solid #00000033' };
    readonly LastEditedStyles = { color: '#000000b3' };

    static styles = [appReportStyles];

    // Runs when the page loads.
    // Responsible for setting running the initial tests
    async connectedCallback(): Promise<void> {
        super.connectedCallback();

        // understand the users color preference
        const result = window.matchMedia('(prefers-color-scheme: dark)');
        this.darkMode = result.matches; // TRUE if user prefers dark mode

        const search = new URLSearchParams(location.search);
        const site = search.get('site');
        if (site) {
            this.siteUrl = site;
            this.runAllTests(site);
            sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
        }

        setInterval(() => this.pollLastTested(), 120000);

        window.addEventListener('scroll', this.closeTooltipOnScroll.bind(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('scroll', this.closeTooltipOnScroll.bind(this));
    }

    // Polling function that updates the time that the site was last tested
    pollLastTested() {
        let last = new Date(JSON.parse(sessionStorage.getItem('last_tested')!));
        let now = new Date();
        let diff = now.getTime() - last.getTime();

        if (diff < 60000) {
            this.lastTested = "Last tested seconds ago";
        } else if (diff < 3600000) {
            let mins = Math.floor(diff / 60000);
            this.lastTested = "Last tested " + mins + " minutes ago";
        } else if (diff < 86400000) {
            let hours = Math.floor(diff / 3600000);
            this.lastTested = "Last tested " + hours + " hours ago";
        } else {
            let days = Math.floor(diff / 86400000);
            this.lastTested = "Last tested " + days + " days ago";
        }
        this.requestUpdate();
    }

    // Populates the "App Card" from the manifest.
    // Uses the URL for loading the image.
    async populateAppCard(manifestContext: ManifestContext, url?: string) {
        // If we already have an app card with non-default icon, we can skip this.
        if (this.appCard && this.appCard.iconURL !== '/assets/new/icon_placeholder.png') {
            return;
        }

        let cleanURL = url?.replace(/(^\w+:|^)\/\//, '') || '';

        if (manifestContext && !this.createdManifest) {
            const parsedManifestContext = manifestContext;
            let iconUrl = this.analysis?.webManifest?.appIcon || "/assets/icons/icon_512.png";

            this.appCard = {
                siteName: parsedManifestContext.manifest.short_name
                    ? parsedManifestContext.manifest.short_name
                    : (parsedManifestContext.manifest.name ? parsedManifestContext.manifest.name : 'Untitled App'),
                siteUrl: cleanURL,
                iconURL: iconUrl,
                iconAlt: "Your app logo",
                description: parsedManifestContext.manifest.description
                    ? parsedManifestContext.manifest.description
                    : 'Add an app description to your manifest',
            };
        } else {
            this.appCard = this.createMissingAppCard(cleanURL);
        }
    }

    createMissingAppCard(url: string) {
        return {
            siteName: "Missing Name",
            siteUrl: url,
            description: "Your manifest description is missing.",
            iconURL: "/assets/new/icon_placeholder.png",
            iconAlt: "A placeholder for your site's icon"
        };
    }

    // Tests if an image will load
    // If it fails, we use our proxy service to fetch it
    // If it succeeds, we load it
    testImage(url: string) {

        // Define the promise
        const imgPromise = new Promise(function imgPromise(resolve, reject) {

            // Create the image
            const imgElement = new Image();

            // When image is loaded, resolve the promise
            imgElement.addEventListener('load', function imgOnLoad() {
                resolve(this);
            });

            // When there's an error during load, reject the promise
            imgElement.addEventListener('error', function imgOnError() {
                reject();
            })

            // Assign URL
            imgElement.src = url;

        });

        return imgPromise;
    }

    // Looks at the brackground color from the sites manifest
    // If its darker, returns lightColor for the background of app card
    // If its lighter, returns darkColor for the background of app card
    pickTextColorBasedOnBgColorAdvanced(bgColor: string, lightColor: string, darkColor: string): string {

        //@ts-ignore:next-line
        var colors: any = new Color(bgColor).coords;

        var c = colors.map((num: number) => {
            if (num <= 0.03928) {
                return num / 12.92;
            }
            return Math.pow((num + 0.055) / 1.055, 2.4);
        });
        var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
        let chosenColor = (L > 0.3) ? darkColor : lightColor;
        return chosenColor
    }

    private async applyManifestContext(url: string, manifestUrl?: string, manifestRaw?: string) {
        this.isAppCardInfoLoading = false;
        this.manifestContext = await this.processManifest(url, manifestUrl, manifestRaw);
        this.createdManifest = this.manifestContext.isGenerated || false;
        setManifestContext(this.manifestContext);
        await this.populateAppCard(this.manifestContext, manifestUrl);
    }

    async processManifest(appUrl: string, manifestUrl?: string, manifestContents?: string): Promise<ManifestContext> {
        let manifestContext: ManifestContext;
        let manifest: Manifest;

        if (manifestContents) {
            manifest = JSON.parse(manifestContents);

            manifestContext = {
                manifest,
                manifestUrl: manifestUrl || '',
                isEdited: false,
                isGenerated: false,
                siteUrl: appUrl
            }
        }
        else {
            manifestContext = await createManifestContextFromEmpty(appUrl);
            manifestContext.isGenerated = true;
        }

        return manifestContext;
    }

    private async checkAnalysisStatus(): Promise<void> {
        if (this.analysisId) {
            const analysis = await getAnalysis(this.analysisId);
            if (analysis) {
                await this.analysisUpdated(analysis);
            } else {
                console.warn("Queued up analysis but didn't find it on the server.", this.analysisId);
            }

            // If the analysis failed, show an error.
            if (analysis && analysis.status === "Failed") {
                this.analysisFailed();
            }

            // If the analysis is completed, clear the timeout.
            if (analysis && analysis.status === "Completed") {
                this.analysisCompleted();
            }

            // If the analysis is still running, set a timeout to check again.
            const isAnalysisDone = analysis && (analysis.status === "Completed" || analysis.status === "Failed");
            if (!isAnalysisDone || !analysis) {
                this.analysisStatusCheckHandle = window.setTimeout(() => this.checkAnalysisStatus(), this.analysisStatusCheckInterval);
            }
        }
    }

    analysisCompleted(): void {
        this.runningTests = false;
        if (this.analysis) {
            this.applyManifestContext(this.analysis.url, this.analysis.webManifest?.url, this.analysis?.webManifest?.manifestRaw);
        }
    }

    analysisFailed(): void {
        this.runningTests = false;
        this.appCard = this.createMissingAppCard(this.analysis?.url || "");
        this.isAppCardInfoLoading = false;

        this.showAnalysisErrorDialog();
    }

    async analysisUpdated(analysis: Analysis): Promise<void> {
        const unchanged = this.analysis?.lastModifiedAt === analysis.lastModifiedAt && analysis.status !== "Completed";
        if (unchanged) {
            return;
        }

        // The analysis has been updated since we last saw it.
        this.analysis = analysis;

        // Apply the manifest and manifest todos
        if (analysis.webManifest) {
            this.applyManifestContext(analysis.url, analysis.webManifest.url, analysis.webManifest.manifestRaw);
        }
    }

    // Runs the Manifest, SW and SEC Tests. Sets "canPackage" to true or false depending on the results of each test
    async runAllTests(url: string, retryOnFailure = true) {
        this.runningTests = true;
        this.isAppCardInfoLoading = true;

        try {
            this.analysisId = await enqueueAnalysis(url);
            this.analysisStatusCheckHandle = window.setTimeout(() => this.checkAnalysisStatus(), this.analysisStatusCheckInterval);

        } catch (error) {
            console.error("Unable to enqueue analysis due to error. Trying again...");
            if (retryOnFailure) {
                setTimeout(() => this.runAllTests(url, false), 2000);
            } else {
                this.analysisFailed();
            }
        }
    }

    /**
    * Triggers all tests to retest
    * If coming from confirmation is true, we have to delay a bit so a special message can show
    * @param {boolean} comingFromConfirmation
    * @return {void}
    */
    async retest(comingFromConfirmation: boolean) {
        recordPWABuilderProcessStep("retest_clicked", AnalyticsBehavior.ProcessCheckpoint);
        this.retestConfirmed = true;
        if (comingFromConfirmation) {
            await this.delay(3000)
        }
        (this.shadowRoot!.querySelector(".dialog") as any)!.hide();
        if (this.siteUrl) {
            this.resetData();
            this.runAllTests(this.siteUrl);
            sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
        }
    }

    // Delay function. Delays a given amt of ms
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Resets all data btwn tests
    resetData() {
        this.analysis = null;

        // last tested
        this.lastTested = "Last tested seconds ago"

        // hide the detail lists
        let details = this.shadowRoot!.querySelectorAll('sl-details');

        details.forEach((detail: any) => {
            detail.hide();
        });

        this.retestConfirmed = false;
        this.showRetestConfirmationModal = false;
        sessionStorage.clear();
    }

    // Opens share card modal and tracks analytics
    async openShareCardModal() {
        this.closeOpenTooltips = false;
        let dialog: any = this.shadowRoot!.querySelector("share-card")!.shadowRoot!.querySelector(".dialog");

        await dialog!.show();
        recordPWABuilderProcessStep("share_card_opened", AnalyticsBehavior.ProcessCheckpoint);
    }

    // Opens manifest editor and tracks analytics
    async openManifestEditorModal(focusOn = "", tab: string = "info"): Promise<void | undefined> {
        this.closeOpenTooltips = false;
        this.startingManifestEditorTab = tab;
        this.focusOnME = focusOn;
        const frame = this.shadowRoot?.querySelector("manifest-editor-frame") as ManifestEditorFrame;
        if (frame && this.manifestContext) {
            frame.launch(this.siteUrl, this.manifestContext);
        }
        // if (dialog) {
        //   dialog?.show()
        // }
        recordPWABuilderProcessStep("manifest_editor_opened", AnalyticsBehavior.ProcessCheckpoint);
    }

    // Opens SW Selector and tracks analytics
    async openSWSelectorModal() {
        this.closeOpenTooltips = false;
        let dialog: any = this.shadowRoot!.querySelector("sw-selector")!.shadowRoot!.querySelector(".dialog");

        await dialog.show()
        recordPWABuilderProcessStep("sw_selector_opened", AnalyticsBehavior.ProcessCheckpoint);
    }

    // Opens publish pane and tracks analytics
    async openPublishModal() {
        this.closeOpenTooltips = false;
        let dialog: any = this.shadowRoot!.querySelector("publish-pane")!.shadowRoot!.querySelector(".dialog");

        await dialog.show()
        recordPWABuilderProcessStep("publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
    }

    // Opens test publish modal and tracks analytics
    async openTestPublishModal() {
        this.closeOpenTooltips = false;
        let dialog: any = this.shadowRoot!.querySelector("test-publish-pane")!.shadowRoot!.querySelector(".dialog");

        await dialog.show()
        recordPWABuilderProcessStep("test_publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
    }

    // Gets full icon URL from manifest given a manifest icon object
    iconSrcListParse(icon: any) {
        let manifest = getManifestContext().manifest;
        let manifestURL = getManifestContext().manifestUrl;
        let iconURL: string = this.handleImageUrl(icon, manifest, manifestURL) || '';

        return iconURL;
    }

    // Makes sure the icon URL is valid
    handleImageUrl(icon: Icon, manifest: Manifest, manifestURL: string) {
        if (icon.src.indexOf('data:') === 0 && icon.src.indexOf('base64') !== -1) {
            return icon.src;
        }

        let url = resolveUrl(manifestURL, manifest?.startUrl);
        url = resolveUrl(url?.href, icon.src);

        if (url) {
            return url.href;
        }

        return undefined;
    }

    // Decides color of Progress rings depending on required and recommended fields
    decideColor(card: string) {
        const caps = (this.analysis?.capabilities || []);
        let instantRed = false;
        if (card === "manifest") {
            instantRed = caps.some(c => c.category === "WebAppManifest" && c.status === "Failed" && c.level === "Required");
        } else if (card === "sw") {
            instantRed = caps.some(c => c.category === "ServiceWorker" && c.status === "Failed" && c.level === "Required");
        }

        let instantYellow = false;
        if (card === "manifest") {
            instantYellow = caps.some(c => c.category === "WebAppManifest" && c.status === "Failed" && c.level === "Recommended");
        } else if (card === "sw") {
            instantYellow = caps.some(c => c.category === "ServiceWorker" && c.status === "Failed" && c.level === "Recommended");
        }

        if (instantRed) {
            return { "green": false, "red": true, "yellow": false };
        } else if (instantYellow) {
            return { "green": false, "red": false, "yellow": true };
        } else {
            return { "green": true, "red": false, "yellow": false };
        }
    }

    getRingColor(card: string) {
        let ring = this.shadowRoot!.getElementById(`${card}ProgressRing`);
        if (ring) {
            return ring.classList[0];
        }
        return;
    }

    // Swaps messages for each card depending on state of each card
    decideMessage(valid: number, total: number, card: string) {
        const caps = this.analysis?.capabilities || [];
        let instantRed = false;
        let index = 0;
        if (card === "manifest") {
            instantRed = caps.some(c => c.category === "WebAppManifest" && c.status === "Failed" && c.level === "Required");
        } else if (card === "sw") {
            index = 1;
            instantRed = caps.some(c => c.category === "ServiceWorker" && c.status === "Failed" && c.level === "Required");
        }

        let ratio = parseFloat(JSON.stringify(valid)) / total;

        const possibleMessages = [{
            "messages": {
                "green": "PWABuilder has analyzed your Web Manifest and your manifest is ready for packaging! Great job you have a perfect score!",
                "yellow": "PWABuilder has analyzed your Web Manifest and your manifest is ready for packaging! We have identified recommended and optional fields that you can include to make your PWA better. Use our Manifest Editor to edit and update those fields.",
                "blocked": "PWABuilder has analyzed your Web Manifest. You have one or more fields that need to be updated before you can package. Use our Manifest Editor to edit and update those fields. You can package for the store once you have a valid manifest.",
                "none": "PWABuilder has analyzed your site and did not find a Web Manifest. Use our Manifest Editor to generate one. You can package for the store once you have a valid manifest.",
            }
        },
        {
            "messages": {
                "green": "PWABuilder has analyzed your Service Worker and your Service Worker is ready for packaging! Great job you have a perfect score!",
                "yellow": "PWABuilder has analyzed your Service Worker, and has identified additional features you can add to make your app feel more robust.",
                "blocked": "",
                "none": "PWABuilder has analyzed your site and did not find a Service Worker. Having a Service Worker is highly recommended as it enables powerful features that can enhance your PWA. You can generate a Service Worker below or use our documentation to make your own.",
            },
        },
        {
            "messages": {
                "green": "PWABuilder has done a basic analysis of your HTTPS setup and found no issues! Great job you have a perfect score!",
                "yellow": "",
                "blocked": "",
                "none": "PWABuilder has done a basic analysis of your HTTPS setup and has identified required actions before you can package. Check out the documentation linked below to learn more.",
            }
        }];
        let messages = possibleMessages[index].messages;

        if (this.createdManifest || ratio == 0 || (card === "sec" && ratio != 1)) {
            return messages["none"];
        } else if (instantRed) {
            return messages["blocked"];
        } else if (ratio != 1) {
            return messages["yellow"];
        } else {
            return messages["green"];
        }
    }

    // Scrolls and Shakes the respective item from a click of an action item
    async animateItem(e: CustomEvent) {
        e.preventDefault;
        recordPWABuilderProcessStep("todo_item_clicked", AnalyticsBehavior.ProcessCheckpoint);

        // if its not a manifest field
        if (!manifest_fields[e.detail.field]) {
            let frame;
            switch (e.detail.field) {
                case "Manifest":
                case "Service Worker":
                    this.thingToAdd = e.detail.displayString;
                    this.showRetestConfirmationModal = true;
                    return;

                case "Open Manifest Modal":
                    frame = this.shadowRoot!.querySelector("manifest-editor-frame");
                    (frame?.shadowRoot!.querySelector(".dialog")! as any).show();
                    return;

                case "Open SW Modal":
                    frame = this.shadowRoot!.querySelector("sw-selector");
                    (frame?.shadowRoot!.querySelector(".dialog")! as any).show();
                    return;
            }
        }
        return;
    }

    // Rotates the icon on each details drop down to 0 degrees
    rotateZero(card: string, e?: Event) {
        recordPWABuilderProcessStep(card + "_details_expanded", AnalyticsBehavior.ProcessCheckpoint);

        let icon: HTMLImageElement = this.shadowRoot!.querySelector('[data-card="' + card + '"]')!;
        let target: Node = (e!.target as unknown as Node);
        let collapsable: NodeList = this.shadowRoot!.querySelectorAll("sl-details");
        let allowed: boolean = false;

        // added this code because the tooltips that exist on the action items emit the sl-show and
        // sl-hide events. This causes this function to trigger since its nested and the event bubbles.
        // so this ensures that the target for rotating is a detail card and not a tooltip.
        for (let i = 0; i < collapsable.length; i++) {
            if (collapsable[i].isEqualNode(target!)) {
                allowed = true;
                break
            }
        }

        if (icon && allowed) {
            icon!.style.transform = "rotate(0deg)";
        }
    }

    // Rotates the icon on each details drop down to 90 degrees
    rotateNinety(card: string, e?: Event, init?: boolean) {
        recordPWABuilderProcessStep(card + "_details_closed", AnalyticsBehavior.ProcessCheckpoint);

        let icon: HTMLImageElement = this.shadowRoot!.querySelector('[data-card="' + card + '"]')!;

        if (icon && init) {
            icon!.style.transform = "rotate(90deg)";
            return;
        }

        let target: Node = (e!.target as unknown as Node);
        let collapsable: NodeList = this.shadowRoot!.querySelectorAll("sl-details");
        let allowed: boolean = false;

        // added this code because the tooltips that exist on the action items emit the sl-show and
        // sl-hide events. This causes this function to trigger since its nested and the event bubbles.
        // so this ensures that the target for rotating is a detail card and not a tooltip.
        for (let i = 0; i < collapsable.length; i++) {
            if (collapsable[i].isEqualNode(target!)) {
                allowed = true;
                break
            }
        }

        if (icon && allowed) {
            icon!.style.transform = "rotate(90deg)";
        }
    }

    // Renders the indicators for each action item
    renderTodoFilters(): TemplateResult {
        const isLoading = !this.analysis || this.analysis.capabilities.every(c => c.status === "InProgress");
        if (isLoading) {
            return html``;
        }

        let recommended = 0;
        let features = 0;
        let required = 0;
        let optional = 0;

        (this.analysis?.capabilities || [])
            .filter(c => c.status === "Failed")
            .forEach(todo => {
                if (todo.level === "Required") {
                    required++;
                } else if (todo.level === "Feature") {
                    features++;
                } else if (todo.level === "Recommended") {
                    recommended++;
                } else if (todo.level === "Optional") {
                    optional++;
                }
            });

        return html`
      <div id="indicators-holder">
        ${this.renderTodoFilterBtn("Required", required)}
        ${this.renderTodoFilterBtn("Recommended", recommended)}
        ${this.renderTodoFilterBtn("Optional", optional)}
        ${this.renderTodoFilterBtn("Feature", features)}
      </div>
    `;
    }

    renderTodoFilterBtn(level: PwaCapabilityLevel, count: number) {
        const isSelected = this.todoFilters.includes(level);
        const img = level === "Required" ? stop_src : level === "Recommended" ? yield_src : level === "Feature" ? enhancement_src : info_src;
        const pressedAttr = isSelected ? "true" : "false";
        const selectedClass = isSelected ? "selected" : "";
        return html`
      <button type="button" class="indicator ${selectedClass}" aria-pressed="${pressedAttr}" @click="${() => this.toggleTodoFilter(level)}" title="${level}">
        <img src="${img}" alt="" />
        <span>${count}</span>
      </button>
    `;
    };

    handleShowingTooltip(e: CustomEvent, origin: string, field: string) {
        // general counter
        recordPWABuilderProcessStep(`${origin}.tooltip_opened`, AnalyticsBehavior.ProcessCheckpoint);

        field = field.split(" ").join("_");

        //specific field counter
        recordPWABuilderProcessStep(`${origin}.${field}_tooltip_opened`, AnalyticsBehavior.ProcessCheckpoint);

        if (e.detail.entering) {
            if (this.openTooltips.length > 0) {
                this.openTooltips[0].hide();
                this.openTooltips = [];
            }

            e.detail.tooltip.show();
            this.openTooltips.push(e.detail.tooltip)
        } else {
            e.detail.tooltip.hide();
            this.openTooltips = [];
        }
    }

    closeTooltipOnScroll() {
        if (this.openTooltips.length > 0) {
            this.openTooltips[0].hide();
            this.openTooltips = [];
        }
    }

    renderReadDialog(): TemplateResult {
        var dialogContent = html`
      <p>Have you added your new ${this.thingToAdd} to your site?</p>
      <div id="confirmationButtons">
        <sl-button @click=${() => this.retest(true)}> Yes </sl-button>
        <sl-button @click=${() => this.readDenied = true}> No </sl-button>
      </div>
    `

        if (this.retestConfirmed) {
            dialogContent = html`
        <p>Retesting your site now!</p>
      `;
        }
        else if (this.readDenied) {
            dialogContent = html`
        <p>Add your new ${this.thingToAdd}, and then we can retest your site. </p>
      `;
        }

        return dialogContent;
    }

    renderAppCardInfo(): TemplateResult {
        if (this.isAppCardInfoLoading) {
            return html`
        <div id="app-card" class="flex-col skeleton-effects">
          <div id="app-card-header" class="skeleton">
            <sl-skeleton id="app-image-skeleton" effect="pulse"></sl-skeleton>
            <div id="card-info" class="flex-col">
              <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                </div>
                <!-- <sl-skeleton class="app-info-skeleton skeleton-desc" effect="pulse"></sl-skeleton> -->
              </div>
              <div id="app-card-footer">
                <sl-skeleton class="app-info-skeleton-half" effect="pulse"></sl-skeleton>
              </div>
            </div>
        `;
        }

        return html`
      <div id="app-card" class="flex-col" style=${this.createdManifest ? styleMap({ backgroundColor: '#ffffff', color: '#757575' }) : styleMap(this.CardStyles)}>
          <div id="app-card-header">
            <div id="app-card-header-col">
              <div id="pwa-image-holder">
                ${this.proxyLoadingImage || this.appCard.iconURL.length === 0
                ? html`<span class="proxy-loader"></span>`
                : html`<img src=${this.appCard.iconURL} alt=${this.appCard.iconAlt} onerror="this.onerror=null; this.src='/assets/icons/icon_512.png'" />`}
              </div>
              <div id="card-info" class="flex-row">
                <h1 id="site-name">
                  ${this.appCard.siteName}
                  <span class="visually-hidden" aria-live="polite">Report card page for ${this.appCard.siteName}</span>
                </h1>
                <p id="site-url">${this.appCard.siteUrl}</p>
                <p id="app-card-desc" class="app-card-desc-desktop">${this.appCard.description}</p>
              </div>
              <div id="app-card-share-cta">
                ${this.renderShareButton("share-button-desktop")}
              </div>
            </div>
            <div id="app-card-desc-mobile">
              <p id="app-card-desc">${this.appCard.description}</p>
              <div id="share-button-mobile">
                ${this.renderShareButton("share-button-mobile")}
              </div>
            </div>
          </div>
          <div id="app-card-footer">
            ${this.renderAppCardFooter()}
          </div>
        </div>
    `;
    }

    renderShareButton(btnId: string): TemplateResult {
        const isRunningTests = !this.analysis || this.analysis.status === "Processing" || this.analysis.status === "Queued";
        const shareIcon = isRunningTests
            ? html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon_disabled.svg" role="presentation"/>`
            : html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon.svg" role="presentation"/>`
        const noManifest = this.analysis && !this.analysis.webManifest;

        // Don't show the "share score" button if we don't have a manifest.
        if (noManifest) {
            return html``;
        }

        return html`
      <button type="button" id="${btnId}" class="share-banner-buttons" @click=${() => this.openShareCardModal()} ?disabled=${this.runningTests}>
        ${shareIcon} Share score
      </button>
    `;
    }

    renderAppCardFooter(): TemplateResult {
        if (this.runningTests) {
            return html`
        <div id="test" class="in-progress">
            <span>testing in progress</span>
            <div class="loader-round"></div>
          </div>
      `;
        }

        return html`
      <div id="test" style=${styleMap(this.CardStyles)}>
          <p id="last-edited" style=${styleMap(this.LastEditedStyles)}>
            ${this.lastTested}
            <sl-button class="view-log-btn" variant="text" size="small" @click="${this.showAnalysisLog}">
              View log
            </sl-button>
          </p>
          <button type="button" id="retest" @click="${() => this.retest(false)}">
            <img src=${this.getThemedIcon('/assets/new/retest-icon.svg')} alt="retest site" />
          </button>
      </div>
    `;
    }

    renderPackageForStores(): TemplateResult {
        if (this.analysis?.canPackage) {
            return html`
        <button type="button" id="pfs" @click=${() => this.openPublishModal()}>
            Package For Stores
        </button>
      `;
        }

        return html`
      <sl-tooltip class="mani-tooltip">
        ${this.runningTests ?
                html`<div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /> <p>Running tests...</p></div>` :
                html`<div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /><p>Your PWA is not store ready! Check Action Items below and fix the missing requirements.</p></div>`}
            <button
              type="button"
              id="pfs-disabled"
              aria-disabled="true">
                ${this.renderPackageSpinner()}
                Package For Stores
            </button>
      </sl-tooltip>
    `;
    }

    private renderIconErrorBanner(): TemplateResult {
        if (!this.showIconsErrorBanner) {
            return html``;
        }

        return html`
      <div class="feedback-holder type-error">
      <img src="/assets/new/stop.svg" alt="invalid result icon" />
        <div class="error-info">
          <p class="error-title">Manifest icons could not be fetched</p>
          <p class="error-desc">PWABuilder has done a basic analysis of the manifest images and has identified required actions before you can package. Check out the documentation linked below to learn more.</p>
          <div class="error-actions">
            <a href="https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/core-concepts/03" target="_blank" rel="noopener">Manifest Documentation</a>
          </div>
        </div>
      </div>
    `;
    }

    private renderTodoTooltip(): TemplateResult {
        return html`
      <sl-tooltip class="mani-tooltip" id="notifications" ?open=${this.closeOpenTooltips}>
        <div slot="content" class="mani-tooltip-content">
          <img src="/assets/new/waivingMani.svg" alt="Waiving Mani" />
          <p class="mani-tooltip-p"> Filter through notifications <br> as and when you need! </p>
        </div>
        ${this.renderTodoFilters()}
      </sl-tooltip>
    `;
    }

    private renderTodos(): TemplateResult {
        const indicatorOrTooltip = this.stopShowingNotificationTooltip ?
            this.renderTodoFilters()
            : this.renderTodoTooltip();
        const indicatorOrTooltipOrEmpty = (this.analysis?.capabilities || []).filter(c => c.status === "Failed").length === 0
            ? html`` : indicatorOrTooltip;

        const isLoading = !this.analysis || this.analysis.capabilities.some(c => c.status === "InProgress");
        const spinnerClass = isLoading ? "" : "d-none";
        return html`    
     <div id="todo">
        <div id="todo-detail">
          <div id="todo-summary">
            <div id="todo-summary-left">
              <h2>Action Items</h2>
              <sl-spinner class="${spinnerClass}"></sl-spinner>
            </div>
            <div id="todo-indicators">
                ${indicatorOrTooltipOrEmpty}
            </div>
          </div>
          <div class="todo-items-holder">
            ${this.renderFilteredTodoItems()}
          </div>
          <div id="pageStatus" aria-live="polite" aria-atomic="true"></div>
          </div>
        </div>
      </div>
    `;
    }

    private renderManifestSection(): TemplateResult {
        return html`
      <div id="manifest" class="flex-col">
        <div id="manifest-header">
          <div id="mh-content">
            <div id="mh-text" class="flex-col">
              <h2 class="card-header">Manifest</h2>
              ${this.renderManifestScore()}
            </div>
          </div>

          <div id="mh-right">
            ${this.renderManifestScoreRing()}
          </div>
          <div id="mh-actions" class="flex-col">
            ${this.renderEditManifestButton()}
          </div>
        </div>
        
        ${this.renderManifestDetails()}
      </div>
    `;
    }

    renderManifestDetails(): TemplateResult {
        const isLoading = !this.analysis || this.analysis.capabilities.filter(c => c.category === "WebAppManifest").some(c => c.status === "InProgress");
        return html`
      <sl-details id="mani-details" class="details" ?disabled=${isLoading} @sl-show=${(e: Event) => this.rotateNinety("mani-details", e)} @sl-hide=${(e: Event) => this.rotateZero("mani-details", e)}>
        ${this.renderManifestDetailsChecklist()}
      </sl-details>
    `;
    }

    renderManifestDetailsChecklist(): TemplateResult {
        const manifestFieldChecks = this.analysis?.capabilities.filter(c => c.category === "WebAppManifest" && !!c.field && c.isFieldExistenceCheck) || [];
        const isLoading = !this.analysis || manifestFieldChecks.some(c => c.status === "InProgress");
        if (isLoading) {
            return html`
        <div slot="summary">
          <sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton>
        </div>
      `;
        }

        const passedSorter = (a: PwaCapability, b: PwaCapability) => a.status === "Passed" ? -1 : b.status === "Passed" ? 1 : 0;
        const requiredValidations = manifestFieldChecks.filter(c => c.level === "Required").sort(passedSorter);
        const recommendedValidations = manifestFieldChecks.filter(c => c.level === "Recommended").sort(passedSorter);
        const optionalValidations = manifestFieldChecks.filter(c => (c.level === "Optional" || c.level === "Feature")).sort(passedSorter);
        return html`
      <div class="details-summary" slot="summary">
        <p>View Details</p>
        <img class="dropdown_icon" data-card="mani-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
      </div>
      <div id="manifest-detail-grid">
        <div class="detail-list">
          <p class="detail-list-header">Required</p>
          ${this.renderManifestValidations(requiredValidations, "Required")}
        </div>
        <div class="detail-list">
          <p class="detail-list-header">Recommended</p>
          ${this.renderManifestValidations(recommendedValidations, "Recommended")}
        </div>
        <div class="detail-list">
          <p class="detail-list-header">Optional</p>
          ${this.renderManifestValidations(optionalValidations, "Optional")}
        </div>
      </div>
    `;
    }

    private renderManifestValidations(capability: PwaCapability[], category: PwaCapabilityLevel): TemplateResult {
        return html`
      ${repeat(capability, v => this.renderManifestFieldCheck(v.field || "", category, v.errorMessage || v.description || "", v.status))}
    `;
    }

    private renderManifestFieldCheck(field: string, category: PwaCapabilityLevel, tooltipText: string, status: PwaCapabilityStatus): TemplateResult {
        const iconUrl = status === "Passed" ? valid_src :
            category === "Required" ? stop_src :
                yield_src;
        const icon = html`<img src=${iconUrl} alt=""/>`;

        if (tooltipText) {
            return html`
        <div class="test-result" data-field=${field}>
          <sl-tooltip content=${tooltipText} placement="top">
            ${icon}
            <p>${field}</p>
          </sl-tooltip>
        </div>
      `;
        }

        return html`
      <div class="test-result" data-field=${field}>
        ${icon}
        <p>${field}</p>
      </div>
    `;
    }

    private renderEditManifestButton(): TemplateResult {
        const manifestCapabilities = this.analysis?.capabilities.filter(c => c.category === "WebAppManifest") || [];
        const isLoading = !this.analysis || manifestCapabilities.some(c => c.status === "InProgress");
        if (isLoading) {
            return html`
        <div class="flex-col gap">
          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
        </div>
      `;
        }

        const manifestDocsLink = html`
      <a class="arrow_anchor" href="https://docs.pwabuilder.com/#/home/pwa-intro?id=web-app-manifests" rel="noopener"target="_blank" @click=${() => recordPWABuilderProcessStep("manifest_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
        <p class="arrow_link">Manifest Documentation</p>
        <img src="/assets/new/arrow.svg" alt="arrow" />
      </a>
    `;

        if (this.createdManifest) {
            return html`
        <sl-tooltip class="mani-tooltip" ?open=${this.closeOpenTooltips}>
          <div slot="content" class="mani-tooltip-content">
            <img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /> 
            <p>We did not find a manifest on your site before our tests timed out so we have created a manifest for you! <br> Click here to customize it!</p></div>
          <button type="button" class="alternate" @click=${() => this.openManifestEditorModal()}>Edit Your Manifest</button>
        </sl-tooltip>
        ${manifestDocsLink}
      `;
        }

        return html`
      <button type="button" class="alternate" @click=${() => this.openManifestEditorModal()}>Edit Your Manifest</button>
      ${manifestDocsLink}
    `;
    }

    private renderManifestScore(): TemplateResult {
        const manifestCapabilities = this.analysis?.capabilities.filter(c => c.category === "WebAppManifest") || [];
        const isLoading = !this.analysis || manifestCapabilities.some(c => c.status === "InProgress");
        if (isLoading) {
            return html`
        <div class="flex-col gap">
          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
        </div>
      `;
        }

        const validScore = manifestCapabilities.filter(c => c.status === "Passed").length;
        return html`
      <p class="card-desc">
        ${this.decideMessage(validScore, manifestCapabilities.length, "manifest")}
      </p>
    `;
    }

    private renderManifestScoreRing(): TemplateResult {
        const manifestCapabilities = this.analysis?.capabilities.filter(c => c.category === "WebAppManifest") || [];
        const isManifestLoading = !this.analysis || manifestCapabilities.some(c => c.status === "InProgress");
        if (isManifestLoading) {
            return html`<div class="loader-round large"></div>`;
        }

        const validCount = manifestCapabilities.filter(c => c.status === "Passed").length;
        const manifestChecksPassedOrError = this.createdManifest ?
            html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing manifest requirements" />` :
            html`<div>${validCount} / ${manifestCapabilities.length}</div>`;
        return html`
      <sl-progress-ring
        id="manifestProgressRing"
        class=${classMap(this.decideColor("manifest"))}
        value="${this.createdManifest ? 0 : (parseFloat(JSON.stringify(validCount)) / manifestCapabilities.length) * 100}">
          ${manifestChecksPassedOrError}
      </sl-progress-ring>
    `;
    }

    private renderFilteredTodoItems(): TemplateResult {
        // Action items are any PwaCapabilities that are failed.
        const actionItems = (this.analysis?.capabilities || []).filter(c => c.status === "Failed");
        if (actionItems.length === 0 && this.runningTests) {
            return html`<span class="loader"></span>`;
        }

        actionItems.sort((a, b) => this.sortActionItems(a, b));
        return html`
        ${repeat(actionItems, t => t.id, t => this.renderTodo(t))}
    `;
    }

    private renderTodo(todo: PwaCapability): TemplateResult {
        const hiddenClass = this.todoFilters.includes(todo.level) ? "" : "d-none";

        return html`
      <todo-item
        class="${hiddenClass}"
        status=${todo.level}
        field=${todo.field || ""}
        fix=${todo.todoAction}
        card=${todo.category}
        description=${todo.description || ""}
        docsUrl=${todo.learnMoreUrl || ""}
        imageUrl=${todo.imageUrl || ""}
        @todo-clicked=${(e: CustomEvent) => this.animateItem(e)}
        @open-manifest-editor=${(e: CustomEvent) => this.openManifestEditorModal(e.detail.field, e.detail.tab)}
        @trigger-hover=${(e: CustomEvent) => this.handleShowingTooltip(e, "action_items", todo.field || "")}></todo-item>
    `;
    }

    private getThemedIcon(url: string): string {
        return this.darkMode ? url.replace('.svg', '_light.svg') : url;
    }

    render(): TemplateResult {
        return html`
      <app-header .page=${"report"}></app-header>
      <div id="report-wrapper">
        <div id="content-holder">
          <div id="header-row">
            ${this.renderAppCardInfo()}
            <div id="app-actions" class="flex-col">
              <div id="package" class="flex-col-center">
                  ${this.renderPackageForStores()}
                <button type="button" id="test-download" @click=${() => this.openTestPublishModal()} ?disabled=${!this.analysis?.canPackage || this.createdManifest}>
                  <p class="arrow_link">Download Test Package</p>
                </button>
              </div>
              <div id="actions-footer" class="flex-center">
                <p>Available stores:</p>
                <img title="Windows" src="${this.getThemedIcon('/assets/windows_icon.svg')}" alt="Windows" />
                <img title="iOS" src="${this.getThemedIcon('/assets/apple_icon.svg')}" alt="iOS" />
                <img title="Android" src="${this.getThemedIcon('/assets/android_icon_full.svg')}" alt="Android" />
                <img title="Meta Quest" src="${this.getThemedIcon('/assets/meta_icon.svg')}" alt="Meta Quest" />
              </div>
            </div>
          </div>

          ${this.renderIconErrorBanner()}          
          ${this.renderTodos()}
          ${this.renderManifestSection()}

          <div id="two-cell-row">
            ${this.renderServiceWorkerFeaturesSection()}
            ${this.renderAppCapabilitiesSection()}
          </div>
        </div>
      </div>

      <sl-dialog class="dialog" ?open=${this.showRetestConfirmationModal} @sl-hide=${() => { this.showRetestConfirmationModal = false; this.readDenied = false; }} noHeader>
        ${this.renderReadDialog()}
      </sl-dialog>

      ${this.renderShareScore()}

      <publish-pane analysis-id="${this.analysisId || ""}"></publish-pane>
      <test-publish-pane></test-publish-pane>
      ${this.renderManifestEditorDialog()}
      <sw-selector></sw-selector>
      ${this.renderAnalysisInfoDialog()}
      ${this.renderAnalysisErrorDialog()}
    `;
    }

    renderShareScore(): TemplateResult {
        if (!this.analysis) {
            return html``;
        }

        const caps = this.analysis.capabilities;
        const manifestCaps = caps.filter(c => c.category === "WebAppManifest");
        const manifestPassCount = manifestCaps.filter(c => c.status === "Passed").length;
        const manifestTotalCount = manifestCaps.length;
        const manifestStr = `${manifestPassCount}/${manifestTotalCount}/${this.getRingColor("manifest")}/Manifest`;
        const swCaps = caps.filter(c => c.category === "ServiceWorker");
        const swPassCount = swCaps.filter(c => c.status === "Passed").length;
        const features = caps.filter(c => !!c.featureName && c.category !== "ServiceWorker" && c.status === "Passed"); // We skip service worker features here because they're counted in the Service Worker section.

        return html`
      <share-card
        .manifestData=${manifestStr}
        .swData=${`${swPassCount}/purple/Service Worker`}
        .enhancementsData=${`${features.length}/purple/App Capabilities`}
        .siteName=${this.appCard.siteName}>
      </share-card>
    `;
    }

    renderServiceWorkerFeaturesSection(): TemplateResult {
        return html`
      <div id="sw" class="half-width-cards">
        <div id="sw-header" class="flex-col">
          <div id="swh-top">
            <div id="swh-text" class="flex-col">
              <h2 class="card-header">Service Worker</h2>
              ${this.renderServiceWorkerFeaturesHeader()}
            </div>
            ${this.renderServiceWorkerFeaturesRing()}
          </div>
            <div class="icons-holder sw">
              ${this.renderServiceWorkerCapabilities()}
            </div>
          <div id="sw-actions" class="flex-col">
            ${this.renderServiceWorkerActions()}
          </div>
        </div>
      </div>
    `;
    }

    renderServiceWorkerFeaturesHeader(): TemplateResult {
        const swCaps = (this.analysis?.capabilities || []).filter(c => c.category === "ServiceWorker")
        const showLoading = !this.analysis || swCaps.every(c => c.status === "InProgress");
        if (showLoading) {
            return html`
        <div class="flex-col gap">
          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
        </div>
      `;
        }

        const swPassCount = swCaps.filter(c => c.status === "Passed").length;
        const swTotal = swCaps.length;
        return html`
      <p class="card-desc">
        ${this.decideMessage(swPassCount, swTotal, "sw")}
      </p>
    `;
    }

    renderServiceWorkerFeaturesRing(): TemplateResult {
        const swCaps = this.analysis?.capabilities.filter(c => c.category === "ServiceWorker") || [];
        const showLoading = !this.analysis || swCaps.every(c => c.status === "InProgress");
        if (showLoading) {
            return html`<div class="loader-round large"></div>`;
        }

        const passedCount = swCaps.filter(c => c.status === "Passed").length;
        return html`
      <sl-progress-ring
        id="swProgressRing"
        class="counterRing"
        value="${passedCount > 0 ? 100 : 0}"
        >+${passedCount}
      </sl-progress-ring>
    `;
    }

    renderServiceWorkerCapabilities(): TemplateResult {
        if (!this.analysis) {
            return html``;
        }

        const swCaps = this.analysis.capabilities.filter(c => c.category === "ServiceWorker");
        return html`
      ${repeat(swCaps, c => c.id, c => this.renderServiceWorkerCapability(c))}
    `;
    }

    renderServiceWorkerActions(): TemplateResult {
        const swDataLoading = !this.analysis || this.analysis.capabilities.filter(c => c.category === "ServiceWorker").every(c => c.status === "InProgress");
        if (swDataLoading) {
            return html`
        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
      `;
        }

        return html`
      <button type="button" class="alternate" @click=${() => this.openSWSelectorModal()}>
        Generate Service Worker
      </button>
      <a class="arrow_anchor" rel="noopener" target="_blank" href="https://docs.pwabuilder.com/#/home/sw-intro" @click=${() => recordPWABuilderProcessStep("sw_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
        <p class="arrow_link">Service Worker Documentation</p>
        <img src="/assets/new/arrow.svg" alt="" />
      </a>
    `;
    }

    renderServiceWorkerCapability(capability: PwaCapability): TemplateResult {
        const passedCheckIcon = capability.status === "Passed"
            ? html`<img class="valid-marker" src="${valid_src}" alt="valid result indicator" />`
            : capability.status === "InProgress"
                ? html`<sl-spinner class="in-progress-marker"></sl-spinner>`
                : null;
        return html`
      <div class="icon-and-name"  @trigger-hover=${(e: CustomEvent) => this.handleShowingTooltip(e, "service_worker", capability.id || "")}>
        <sw-info-card capabilityId="${capability.id}" description="${capability.description || ""}" docsUrl="${capability.learnMoreUrl || ""}">
          <div class="circle-icon" tabindex="0" role="button" slot="trigger">
            <img class="circle-icon-img" src="${capability.featureIcon || ""}" alt="" />
            ${passedCheckIcon}
          </div>
        </sw-info-card>
        <p>${capability.featureName}</p>
      </div>
      `;

    }

    renderAppCapabilitiesSection(): TemplateResult {
        return html`
      <div id="security" class="half-width-cards">
        <div id="sec-header" class="flex-col">
          <div id="sec-top">
            <div id="sec-text" class="flex-col">
              <h2 class="card-header">App Capabilities</h2>
              ${this.renderAppCapabilitiesHeader()}
            </div>
            ${this.renderAppCapabilitiesRing()}
          </div>
          <div class="icons-holder">
            ${this.renderAppCapabilitiesCards()}
          </div>
          <div class="app-capabilities-links">
            <arrow-link .link=${"https://docs.pwabuilder.com/#/builder/manifest"} .text=${"App Capabilities documentation"}></arrow-link>
            <arrow-link .link=${"https://whatpwacando.today/"} .text=${"WhatPwaCanDo.today"}></arrow-link>
          </div>
        </div>
      </div>
    `;
    }

    renderAppCapabilitiesHeader(): TemplateResult {
        const isLoading = !this.analysis || this.analysis.capabilities.some(v => v.category === "WebAppManifest" && v.level === "Feature" && v.status === "InProgress");
        if (isLoading) {
            return html`
        <div class="flex-col gap">
          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
        </div>
      `;
        }

        return html`
      <p class="card-desc">
        PWABuilder has analyzed your PWA and has identified some app capabilities that could enhance your PWA
      </p>
    `;
    }

    renderAppCapabilitiesRing(): TemplateResult {
        const features = this.analysis?.capabilities.filter(v => v.category === "WebAppManifest" && v.level === "Feature") || [];
        const isLoading = !this.analysis || features.some(v => v.status === "InProgress");
        if (isLoading) {
            return html`<div class="loader-round large"></div>`;
        }

        const featureScore = features.reduce((acc, v) => acc + (v.status === "Passed" ? 1 : 0), 0);
        return html`<sl-progress-ring class="counterRing" value="${featureScore > 0 ? 100 : 0}">+${featureScore}</sl-progress-ring>`;
    }

    renderAppCapabilitiesCards(): TemplateResult {
        const features = this.analysis?.capabilities.filter(v => v.level === "Feature" && v.category === "WebAppManifest") || [];
        return html`
      ${repeat(features, f => this.renderAppCapabilityCard(f))}
    `;
    }

    renderAppCapabilityCard(v: PwaCapability): TemplateResult {
        const validIcon = v.status === "Passed"
            ? html`<img class="valid-marker" src="${valid_src}" alt="valid result indicator" />`
            : null
        return html`
    <div class="icon-and-name" @trigger-hover=${(e: CustomEvent) => this.handleShowingTooltip(e, "app_caps", v.field || "")} @open-manifest-editor=${(e: CustomEvent) => this.openManifestEditorModal(e.detail.field, e.detail.tab)}>
        <manifest-info-card field="${v.field || ""}" placement="bottom" description="${v.description || ""}" docsUrl="${v.learnMoreUrl || ""}" imageUrl="${v.imageUrl || ""}">
          <div class="circle-icon" tabindex="0" role="button" slot="trigger">
            <img class="circle-icon-img" src="${v.featureIcon || ""}" alt="" />
            ${validIcon}
          </div>
        </manifest-info-card>
        <p>${v.featureName || v.field || ""}</p>
      </div>
    `;
    }

    renderPackageSpinner(): TemplateResult {
        const visibleClass = this.runningTests ? '' : 'd-none';
        return html`
      <sl-spinner class="${visibleClass}"></sl-spinner>
    `;
    }

    renderManifestEditorDialog(): TemplateResult {
        if (!this.analysis || this.analysis.capabilities.every(c => c.status === "InProgress")) {
            return html``;
        }

        // @readyForRetest=${() => this.addRetestTodo("Manifest")}
        return html`      
      <manifest-editor-frame 
        analysisId="${this.analysisId || ''}"
        .isGenerated=${this.createdManifest} 
        .startingTab=${this.startingManifestEditorTab} 
        .focusOn=${this.focusOnME}></manifest-editor-frame>
    `;
    }

    renderAnalysisInfoDialog(): TemplateResult {
        if (!this.analysis || this.analysis.status === "Processing" || this.analysis.status === "Queued") {
            return html``;
        }

        return html`
      <sl-dialog class="analysis-logs-dialog" label="Analysis Logs">
        <h3>
          Logs
          <sl-copy-button value="Shoelace rocks!" from="logs-text-area.value"></sl-copy-button>
        </h3>
        <sl-textarea id="logs-text-area" rows="4" readonly value="${this.analysis.logs.join("\r\n")}"></sl-textarea>

        <br >
        <hr />
        <h3>
          JSON
          <sl-copy-button from="logs-json.value"></sl-copy-button>
        </h3>
        <sl-textarea id="logs-json" rows="4" readonly value="${JSON.stringify(this.analysis, null, 2)}"></sl-textarea>
      </sl-dialog>
    `;
    }

    renderAnalysisErrorDialog(): TemplateResult {
        if (!this.analysis || this.analysis.status !== "Failed") {
            return html``;
        }

        const errorInfo = `${this.analysis.url} failed due to an internal error.\r\n\r\n> ${this.analysis.error}\r\n\r\nId: ${this.analysis.id}\r\n\r\nLogs:\r\n> ${this.analysis.logs.join("\r\n")}`;
        const bugLink = `https://github.com/pwa-builder/pwabuilder/issues/new?title=Analysis%20Failed&labels=bug%20:bug:&body=${encodeURIComponent(errorInfo.substring(0, 4000))}`;
        return html`
      <sl-dialog label="Error" class="analysis-error-dialog">
        <p>
          😵 Oh no, PWABuilder was unable to analyze your web app due to an error.
        </p>
        <details>
          <summary>Error details</summary>
          <pre>${errorInfo}</pre>
        </details>
        
        <div slot="footer">
          <sl-button variant="primary" size="small" @click="${() => this.retest(false)}">
            <sl-icon slot="prefix" name="arrow-repeat"></sl-icon>
            <span>Try again</span>
          </sl-button>
          <sl-button variant="default" size="small" href="${bugLink}" target="_blank">
            <sl-icon slot="prefix" name="github"></sl-icon>
            <span>File a bug</span>
          </sl-button>
        </div>        
      </sl-dialog>
    `;
    }

    showAnalysisErrorDialog(): void {
        const dialog = this.shadowRoot?.querySelector(".analysis-error-dialog") as SlDialog | null;
        dialog?.show();
    }

    toggleTodoFilter(level: PwaCapabilityLevel) {
        this.stopShowingNotificationTooltip = true;
        const isFilterEnabled = this.todoFilters.includes(level);
        if (isFilterEnabled) {
            this.todoFilters = this.todoFilters.filter(f => f !== level);
        } else {
            this.todoFilters = [level, ...this.todoFilters];
        }
    }

    showAnalysisLog(): void {
        const dialog = this.shadowRoot?.querySelector(".analysis-logs-dialog") as SlDialog | null;
        dialog?.show();
    }

    sortActionItems(a: PwaCapability, b: PwaCapability): number {
        const levelValue = (level: PwaCapabilityLevel) => level === "Required" ? 0 : level === "Recommended" ? 1 : level === "Optional" ? 2 : 3;
        const sortResult = levelValue(a.level) - levelValue(b.level);

        // If they're both Recommended, prioritize "HasServiceWorker"
        if (a.level === "Recommended" && b.level === "Recommended") {
            if (a.id === "HasServiceWorker") {
                return -1;
            }
            if (b.id === "HasServiceWorker") {
                return 1;
            }
        }

        return sortResult;
    }
}
