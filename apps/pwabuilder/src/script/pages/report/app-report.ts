import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Validation, enhanced_fields } from '@pwabuilder/manifest-validation';
import {
  BreakpointValues,
} from '../../utils/css/breakpoints';
import {classMap} from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import style from './app-report.styles';

import '../../components/app-header';
import '../../components/todo-list-item';
import '../../components/manifest-editor-frame';
import '../../components/publish-pane';
import '../../components/test-publish-pane';
import '../../components/sw-selector';
import '../../components/share-card';

import {
  ManifestContext,
  RawTestResult,
  TestResult
} from '../../utils/interfaces';


import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../../utils/analytics';

//@ts-ignore
import Color from "colorjs.io/dist/color";
import { manifest_fields } from '@pwabuilder/manifest-information';
import { SlDropdown } from '@shoelace-style/shoelace';
import { getManifest, pollLastTested, populateAppCard, runManifestTests, runSWTests, runSecurityTests } from './app-report.helper';

const valid_src = "/assets/new/valid.svg";
const yield_src = "/assets/new/yield.svg";
const stop_src = "/assets/new/stop.svg";
const enhancement_src = "/assets/new/enhancement.svg";

@customElement('app-report')
export class AppReport extends LitElement {
  @property({ type: Object }) resultOfTest: RawTestResult | undefined;
  @property({ type: Object }) appCard = {
    siteName: 'Site Name',
    description: "Your site's description",
    siteUrl: 'Site URL',
    iconURL: '',
    iconAlt: 'Your sites logo'
  };
  @property({ type: Object }) CardStyles = { backgroundColor: '#ffffff', color: '#292c3a'};
  @property({ type: Object }) BorderStyles = { borderTop: '1px solid #00000033'};
  @property({ type: Object }) LastEditedStyles = { color: '#000000b3'};
  @property() manifestCard = {};
  @property() serviceWorkerCard = {};
  @property() securityCard = {};
  @property() siteURL = '';
  @state() swScore = 0;
  @state() maniScore = 0;
  @state() securityScore = 0;

  @state() errored: boolean = false;
  @state() errorMessage: string | undefined = undefined;
  @state() errorLink: string | undefined = undefined;

  @state() mql = window.matchMedia(
    `(min-width: ${BreakpointValues.largeUpper}px)`
  );

  @state() isAppCardInfoLoading: boolean = false;
  @state() isDeskTopView = this.mql.matches;

  // will be used to control the state of the "Package for store" button.
  @state() runningTests: boolean = false;
  @state() canPackageList: boolean[] = [false, false, false];
  @state() canPackage: boolean = false;
  @state() manifestEditorOpened: boolean = false;
  @state() retestPath: string = "/assets/new/retest-black.svg";

  @state() swSelectorOpen: boolean = false;

  // Controls the last tested section
  @state() lastTested: string = "Last tested seconds ago";

  @state() todoWindow: any[] = [];
  private pageNumber: number = 1;
  private pageSize: number = 5;

  // validation
  @state() validationResults: Validation[] = [];
  @state() manifestTotalScore: number = 0;
  @state() manifestValidCounter: number = 0;
  @state() manifestRequiredCounter: number = 0;
  @state() manifestRecCounter: number = 0;
  @state() manifestEnhancementCounter: number = 0;
  @state() manifestDataLoading: boolean = true;
  @state() manifestMessage: string = "";
  @state() startingManifestEditorTab: string = "info";
  @state() focusOnME: string = "";
  @state() proxyLoadingImage: boolean = false;

  @state() serviceWorkerResults: any[] = [];
  @state() swTotalScore: number = 0;
  @state() swValidCounter: number = 0;
  @state() swRequiredCounter: number = 0;
  @state() swRecCounter: number = 0;
  @state() swDataLoading: boolean = true;
  @state() swMessage: string = "";

  @state() secDataLoading: boolean = false;
  @state() showSecurityBanner: boolean = false;
  @state() securityIssues: string[] = [];
  

  @state() requiredMissingFields: any[] = [];
  @state() recMissingFields: any[] = [];
  @state() optMissingFields: any[] = [];
  @state() enhMissingFields: any[] = [];

  // Confirm Retest stuff
  @state() showConfirmationModal: boolean = false;
  @state() thingToAdd: string = "";
  @state() retestConfirmed: boolean = false;

  @state() createdManifest: boolean = false;  
  @state() manifestContext: ManifestContext | undefined;

  @state() todoItems: any[] = [];
  @state() openTooltips: SlDropdown[] = [];

  private possible_messages = [
    {"messages": {
                  "green": "PWABuilder has analyzed your Web Manifest and your manifest is ready for packaging! Great job you have a perfect score!",
                  "yellow": "PWABuilder has analyzed your Web Manifest and your manifest is ready for packaging! We have identified recommended and optional fields that you can include to make your PWA better. Use our Manifest Editor to edit and update those fields.",
                  "blocked": "PWABuilder has analyzed your Web Manifest. You have one or more fields that need to be updated before you can pacakge. Use our Manifest Editor to edit and update those fields. You can package for the store once you have a valid manifest.",
                  "none": "PWABuilder has analyzed your site and did not find a Web Manifest. Use our Manifest Editor to generate one. You can package for the store once you have a valid manifest.",
                  }
    },
    {"messages": {
                      "green": "PWABuilder has analyzed your Service Worker and your Service Worker is ready for packaging! Great job you have a perfect score!",
                      "yellow": "PWABuilder has analyzed your Service Worker, and has identified additonal features you can add, like offline support, to make your app feel more robust.",
                      "blocked": "",
                      "none": "PWABuilder has analyzed your site and did not find a Service Worker. Having a Service Worker is highly recomeneded by PWABuilder as it enables an array of features that can enhance your PWA. You can genereate a Service Worker below or use our documentation to make your own.",
                  },
     },
      {"messages": {
                    "green": "PWABuilder has done a basic analysis of your HTTPS setup and found no issues! Great job you have a perfect score!",
                    "yellow": "",
                    "blocked": "",
                    "none": "PWABuilder has done a basic analysis of your HTTPS setup and has identified required actions before you can package. Check out the documentation linked below to learn more.",
                  }
      }
    ];

    static get styles() {
      return [
        style
      ]
    }

  /* Legacy code, scared to remove. IDK the application of this code */
  constructor() {
    super();
    this.mql.addEventListener('change', e => {
      this.isDeskTopView = e.matches;
    });
  }
  
  // Runs when the page loads.
  // Responsible for setting running the initial tests
  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    const search = new URLSearchParams(location.search);
    const site = search.get('site');
    if (site) {
      this.siteURL = site;
      this.runAllTests(site);
      sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
    }

    setInterval(() => this.lastTested = pollLastTested(), 120000);
    
    window.addEventListener('scroll', this.closeTooltipOnScroll.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.closeTooltipOnScroll.bind(this));
  }

  // Expands the Action items details on load
  firstUpdated() {
    this.rotateNinety("todo", undefined, true);
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
    let chosenColor = (L > 0.3) ?  darkColor : lightColor;
    return chosenColor
  }

  // Runs the Manifest, SW and SEC Tests. Sets "canPackage" to true or false depending on the results of each test
  async runAllTests(url: string) {
    this.runningTests = true;
    this.isAppCardInfoLoading = true;

    this.manifestContext = await getManifest(url);

    this.createdManifest = this.manifestContext.isGenerated;
    
    this.appCard = await populateAppCard(this.manifestContext!, url);
    this.isAppCardInfoLoading = false;

    /*************  Manifest Section *************/
    this.manifestDataLoading = true;
    let maniDetails = (this.shadowRoot!.getElementById("mani-details") as any);
    maniDetails!.disabled = true;
    const manifestResults = await runManifestTests(this.manifestContext);
    this.manifestDataLoading = false;
    maniDetails!.disabled = false;

    this.todoItems.push(...manifestResults.todoItems);

    this.validationResults = manifestResults.validationResults;

    this.manifestValidCounter = manifestResults.manifestBreakdown.valid;
    this.manifestTotalScore = manifestResults.manifestBreakdown.total;
    this.manifestRequiredCounter = manifestResults.manifestBreakdown.failedRequired;
    this.manifestRecCounter = manifestResults.manifestBreakdown.failedRecommended;
    this.manifestEnhancementCounter = manifestResults.manifestBreakdown.failedEnhancement;

    this.requiredMissingFields = manifestResults.missingFields.requiredMissingFields;
    this.recMissingFields = manifestResults.missingFields.recMissingFields;
    this.optMissingFields = manifestResults.missingFields.optMissingFields;
    this.enhMissingFields = manifestResults.missingFields.enhMissingFields;

    /*************  Security Section *************/
    this.secDataLoading = true;
    let secDetails = (this.shadowRoot!.getElementById("sec-details") as any);
    secDetails!.disabled = true;
    const securityResults = await runSecurityTests(url);
    this.secDataLoading = false;
    secDetails!.disabled = false;

    this.showSecurityBanner = !securityResults.securityBreakDown.canPackage;
    this.securityIssues = securityResults.securityBreakDown.failedFields

    
    this.canPackage = manifestResults.manifestBreakdown.canPacakge && securityResults.securityBreakDown.canPackage;

    /*************  SW Section *************/

    this.swDataLoading = true;
    let swDetails = (this.shadowRoot!.getElementById("sw-details") as any);
    swDetails!.disabled = true;
    const swResults = await runSWTests(url);
    this.swDataLoading = false;
    swDetails!.disabled = false;

    this.todoItems.push(...swResults.todoItems);

    this.swValidCounter = swResults.swBreakdown.valid;
    this.swTotalScore = swResults.swBreakdown.total;
    this.swRequiredCounter = swResults.swBreakdown.failedRequired
    this.swRecCounter = swResults.swBreakdown.failedRecommended;

    this.serviceWorkerResults = swResults.testResults;

    /********************************************/

    this.runningTests = false;
    this.requestUpdate();
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
    if(comingFromConfirmation){
      await this.delay(3000)
    }
    (this.shadowRoot!.querySelector(".dialog") as any)!.hide();
    if (this.siteURL) {
      this.resetData();
      this.runAllTests(this.siteURL);
      sessionStorage.setItem('last_tested', JSON.stringify(new Date()));
    }
  }

  // Delay function. Delays a given amt of ms
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Resets all data btwn tests
  resetData(){
    // reset scores
    this.manifestValidCounter = 0;
    this.manifestTotalScore = 0;
    this.manifestRequiredCounter = 0;
    this.swValidCounter = 0;
    this.swTotalScore = 0;
    this.swRequiredCounter = 0;


    // reset todo lsit
    this.todoItems = [];

    // reset missing lists
    this.requiredMissingFields = [];
    this.recMissingFields = [];
    this.optMissingFields = [];

    // activate loaders
    this.manifestDataLoading = true;
    this.swDataLoading = true;
    this.secDataLoading = true;
    this.canPackage = false;

    // last tested
    this.lastTested = "Last tested seconds ago"

    // hide the detail lists
    let details = this.shadowRoot!.querySelectorAll('sl-details');

    details.forEach((detail: any) => {
      if(detail.id != "todo-detail"){
        detail.hide();
      } else {
        detail.show()
      }
    });

    // reset retest data
    this.retestConfirmed = false;

    // reset action items page;
    this.pageNumber = 1;
  }

  // Opens share card modal and tracks analytics
  async openShareCardModal() {
    let dialog: any = this.shadowRoot!.querySelector("share-card")!.shadowRoot!.querySelector(".dialog");

    await dialog!.show();
    recordPWABuilderProcessStep("share_card_opened", AnalyticsBehavior.ProcessCheckpoint);
  }  

  // Opens manifest editor and tracks analytics
  async openManifestEditorModal(focusOn = "", tab: string = "info") {
    this.startingManifestEditorTab = tab;
    this.focusOnME = focusOn;
    let dialog: any = this.shadowRoot!.querySelector("manifest-editor-frame")!.shadowRoot!.querySelector(".dialog");

    await dialog!.show();
    recordPWABuilderProcessStep("manifest_editor_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

   // Opens SW Selector and tracks analytics
  async openSWSelectorModal() {
    let dialog: any = this.shadowRoot!.querySelector("sw-selector")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("sw_selector_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

   // Opens publish pane and tracks analytics
  async openPublishModal() {
    let dialog: any = this.shadowRoot!.querySelector("publish-pane")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

   // Opens test publish modal and tracks analytics
  async openTestPublishModal() {
    let dialog: any = this.shadowRoot!.querySelector("test-publish-pane")!.shadowRoot!.querySelector(".dialog");

    await dialog.show()
    recordPWABuilderProcessStep("test_publish_modal_opened", AnalyticsBehavior.ProcessCheckpoint);
  }

  // Decides color of Progress rings depending on required and recommended fields
  decideColor(card: string){

    let instantRed = false;
    if(card === "manifest"){
      instantRed = this.manifestRequiredCounter > 0;
    } else if(card === "sw"){
      instantRed = this.swRequiredCounter > 0;
    }

    let instantYellow = false;
    if(card === "manifest"){
      instantYellow = this.manifestRecCounter > 0;
    } else if(card === "sw"){
      instantYellow = this.swRecCounter > 0;
    } 

    if(instantRed){
      return {"green": false, "red": true, "yellow": false};
    } else if(instantYellow){
      return {"green": false, "red": false, "yellow": true};
    } else {
      return {"green": true, "red": false, "yellow": false};
    }

  }

  getRingColor(card: string) {
    let ring = this.shadowRoot!.getElementById(`${card}ProgressRing`);
    if(ring){
      return ring.classList[0];
    }
    return;
  }

  // Swaps messages for each card depending on state of each card
  decideMessage(valid: number, total: number, card: string){

    let instantRed = false;
    let index = 0;
    if(card === "manifest"){
      instantRed = this.manifestRequiredCounter > 0;
    } else if(card === "sw"){
      index = 1;
      instantRed = this.swRequiredCounter > 0;
    }

    let ratio = parseFloat(JSON.stringify(valid)) / total;

    let messages = this.possible_messages[index].messages;

    if(this.createdManifest || ratio == 0 || (card ==="sec" && ratio != 1)){
      return messages["none"];
    } else if(instantRed){
      return messages["blocked"];
    } else if(ratio != 1){
      return messages["yellow"];
    } else {
      return messages["green"];
    }
  }

  // Scrolls and Shakes the respective item from a click of an action item
  async animateItem(e: CustomEvent){
    e.preventDefault;
    recordPWABuilderProcessStep("todo_item_clicked", AnalyticsBehavior.ProcessCheckpoint);

    // if its not a manifest field
    if(!manifest_fields[e.detail.field]){
      let frame;
      switch(e.detail.field){
        case "Manifest":
        case "Service Worker":
          this.thingToAdd = e.detail.displayString;
          this.showConfirmationModal = true;
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

  // Function to add a special to do to the action items list that tells the user to retest their site.
  addRetestTodo(toAdd: string){
    this.todoItems.push({"card": "retest", "field": toAdd, "fix": `We've noticed you've updated your ${toAdd}. Make sure to add your new ${toAdd} to your server and retest your site!`, "status": "retest", "displayString": toAdd});
    this.requestUpdate();
  }

  // Rotates the icon on each details drop down to 0 degrees
  rotateZero(card: string, e?: Event){
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

    if(icon && allowed){
      icon!.style.transform = "rotate(0deg)";
    }
  }

  // Rotates the icon on each details drop down to 90 degrees
  rotateNinety(card: string, e?: Event, init?: boolean){
    recordPWABuilderProcessStep(card + "_details_closed", AnalyticsBehavior.ProcessCheckpoint);

    let icon: HTMLImageElement = this.shadowRoot!.querySelector('[data-card="' + card + '"]')!;

    if(icon && init) {
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

    if(icon && allowed){
      icon!.style.transform = "rotate(90deg)";
    }
  }

  // Sorts the action items list with the required stuff first
  // -1 = a wins
  // 1 = b wins
  sortTodos(){
    const rank: { [key: string]: number } = { 
      "retest": 0,
      "required": 1,
      "desktop_enhancement": 2,
      "highly recommended": 3,
      "recommended": 4,
      "optional": 5
    };
    this.todoItems.sort((a, b) => {
      if (rank[a.status] < rank[b.status]) {
        return -1;
      } else if (rank[a.status] > rank[b.status]) {
        return 1;
      } else {
        return a.field.localeCompare(b.field);
      }
    }
    );

    return this.todoItems;
  }

  // Pages the action items
  paginate() {
    let array = this.sortTodos();
    let itemsOnPage = array.slice((this.pageNumber - 1) * this.pageSize, this.pageNumber * this.pageSize);

    let holder = (this.shadowRoot?.querySelector(".todo-items-holder") as HTMLElement);
    if(itemsOnPage.length < this.pageSize && this.pageNumber == 1){
      holder.style.display = 'flex';
      holder.style.flexDirection = 'column';
      holder.style.gridTemplateRows = 'unset';
    } else {
      holder.style.height = '280px;'
      holder.style.display = 'grid';
      holder.style.gridTemplateRows = 'repeat(5, 1fr)';
      holder.style.flexDirection = 'unset';
    }
    return itemsOnPage;
  }

  // Moves to the next window in the action items list
  switchPage(up: boolean){
    if(up && this.pageNumber * this.pageSize < this.todoItems.length){
      this.pageNumber++;
    } else if(!up && this.pageNumber != 1){
      this.pageNumber--;
    }
    this.requestUpdate();
  }

  // Returns a list that represents the number of dots need for pagination
  getDots(){
    let dots: any[] = [];

    let totalPages = Math.ceil(this.todoItems.length / this.pageSize);

    for(let i = 0; i < totalPages; i++){
      dots.push("dot");
    }
    return dots;
  }

  // Renders the indicators for each action item
  renderIndicators(){
    let yellow = 0;
    let red = 0;
    let enh = 0;

    this.todoItems.forEach((todo: any) => {
      if(todo.status == "required"){
        red++;
      } else if(todo.status === "desktop_enhancement") {
        enh++;
      } else {
        yellow++;
      }
    })

    if(yellow + red != 0){
      return html`
      <div id="indicators-holder">
        ${red != 0 ? html`<div class="indicator"><img src=${stop_src} alt="invalid result icon"/><p>${red}</p></div>` : html``}
        ${enh != 0 ? html`<div class="indicator"><img src=${enhancement_src} alt="yield result icon"/><p>${enh}</p></div>` : html``}
        ${yellow != 0 ? html`<div class="indicator"><img src=${yield_src} alt="yield result icon"/><p>${yellow}</p></div>` : html``}
      </div>`
    }
    return html``
    
  }

//truncate app card discription
  truncateString(str: String) {
    if (str.length > 125) {
      return str.substring(0, 125) + "...";
    } else {
      return str;
    }
  }
  
  handleShowingTooltip(e: CustomEvent){
    if(e.detail.entering){
      if(this.openTooltips.length > 0){
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
    if(this.openTooltips.length > 0){
      this.openTooltips[0].hide();
      this.openTooltips = [];
    }
  }
  
  render() {
    return html`
      <app-header></app-header>
      <div id="report-wrapper">
        <div id="content-holder">
          <div id="header-row">
          ${this.isAppCardInfoLoading ?
          html`
            <div id="app-card" class="flex-col skeleton-effects">
              <div id="app-card-header">
                <sl-skeleton id="app-image-skeleton" effect="pulse"></sl-skeleton>
                <div id="card-info" class="flex-col">
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                  <sl-skeleton class="app-info-skeleton" effect="pulse"></sl-skeleton>
                </div>
                <sl-skeleton class="app-info-skeleton skeleton-desc" effect="pulse"></sl-skeleton>
              </div>
              <div id="app-card-footer">
                <sl-skeleton class="app-info-skeleton-half" effect="pulse"></sl-skeleton>
              </div>
            </div>`
            :
            html`
            <div id="app-card" class="flex-col" style=${this.createdManifest ? styleMap({ backgroundColor: '#ffffff', color: '#757575' }) : styleMap(this.CardStyles)}>
              <div id="app-card-header">
                <div id="app-card-header-col">
                  <div id="pwa-image-holder">
                    ${this.isAppCardInfoLoading ? html`<span class="proxy-loader"></span>` : html`<img src=${this.appCard.iconURL} alt=${this.appCard.iconAlt} />`}
                  </div>
                  <div id="card-info" class="flex-row">
                    <p id="site-name">${this.appCard.siteName}</p>
                    <p id="site-url">${this.appCard.siteUrl}</p>
                    <p id="app-card-desc" class="app-card-desc-desktop">${this.truncateString(this.appCard.description)}</p>
                  </div>
                  <div id="app-card-share-cta">
                    <button type="button" id="share-button-desktop" class="share-banner-buttons" @click=${() => this.openShareCardModal()} ?disabled=${this.runningTests}>
                    ${this.runningTests ?
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon_disabled.svg" role="presentation"/>` :
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon.svg" role="presentation"/>`
                    } Share score
                    </button>
                  </div>
                </div>
                <div id="app-card-desc-mobile">
                  <p id="app-card-desc">${this.truncateString(this.appCard.description)}</p>
                  <button type="button" id="share-button-mobile" class="share-banner-buttons" @click=${() => this.openShareCardModal()} ?disabled=${this.runningTests}>
                    ${this.runningTests ?
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon_disabled.svg" role="presentation"/>` :
                      html`<img id="share-icon" class="banner-button-icons" src="/assets/share_icon.svg" role="presentation"/>`
                    } Share score
                    </button>

                </div>
              </div>
              <div id="app-card-footer">
                <div id="test" style=${styleMap(this.CardStyles)}>
                  <button
                    type="button"
                    id="retest"
                    @click=${() => {
                      this.retest(false);
                    }}
                    ?disabled=${this.runningTests}
                  >
                    <p id="last-edited" style=${styleMap(this.LastEditedStyles)}>${this.lastTested}</p>

                    <img
                      src=${this.retestPath}
                      alt="retest site"
                      role="presentation"
                    />
                  </button>
                </div>
              </div>
              
            </div>`}
            <div id="app-actions" class="flex-col">
              <div id="package" class="flex-col-center">
                  ${this.canPackage ?
                    html`
                    <button
                      type="button"
                      id="pfs"
                      @click=${() => this.openPublishModal()}
                    >
                      Package For Stores
                    </button>
                    ` :
                    html`
                    <sl-tooltip class="mani-tooltip">
                    ${this.runningTests ?
                      html`<div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /> <p>Running tests...</p></div>` :
                      html`<div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /><p>Your PWA is not store ready! Check your To-do-list and handle all required items!</p></div>`}
                        <button
                          type="button"
                          id="pfs-disabled"
                          aria-disabled="true"
                        >
                          Package For Stores
                        </button>
                    </sl-tooltip>
                    `}
                <button type="button" id="test-download" @click=${() => this.openTestPublishModal()} ?disabled=${!this.canPackage || this.createdManifest}>
                  <p class="arrow_link">Download Test Package</p>
                </button>
              </div>
              <div id="actions-footer" class="flex-center">
                <p>Available stores:</p>
                <img
                  title="Windows"
                  src="/assets/windows_icon.svg"
                  alt="Windows"
                />
                <img title="iOS" src="/assets/apple_icon.svg" alt="iOS" />
                <img
                  title="Android"
                  src="/assets/android_icon_full.svg"
                  alt="Android"
                />
                <img
                  title="Meta Quest"
                  src="/assets/meta_icon.svg"
                  alt="Meta Quest"
                />
              </div>
            </div>
          </div>

          <div id="todo">
            <sl-details
              id="todo-detail"
              @sl-show=${(e: Event) => this.rotateNinety("todo", e)}
              @sl-hide=${(e: Event) => this.rotateZero("todo", e)}
              open
              >
              <div class="details-summary" slot="summary">
                <div id="todo-summary-left">
                  <p>Action Items</p>
                  ${this.todoItems.length > 0 ? this.renderIndicators() : html``}
                </div>
                  <img class="dropdown_icon" data-card="todo" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
                
              </div>
              <div class="todo-items-holder">
                ${this.todoItems.length > 0 ? this.paginate().map((todo: any) =>
                    html`
                      <todo-item
                        .status=${todo.status}
                        .field=${todo.field}
                        .fix=${todo.fix}
                        .card=${todo.card}
                        .displayString=${todo.displayString}
                        @todo-clicked=${(e: CustomEvent) => this.animateItem(e)}
                        @open-manifest-editor=${(e: CustomEvent) => this.openManifestEditorModal(e.detail.field, e.detail.tab)}
                        @trigger-hover=${(e: CustomEvent) => this.handleShowingTooltip(e)}>

                      </todo-item>`
                  ) : html`<span class="loader"></span>`}
              </div>
            ${(this.todoItems.length > this.pageSize) ?
              html`
              <div id="pagination-actions">
                <button class="pagination-buttons" type="button"  @click=${() => this.switchPage(false)}><sl-icon class="pageToggles" name="chevron-left"></sl-icon></button>
                <div id="dots">
                  ${this.getDots().map((_dot: any, index: number) => 
                    this.pageNumber == index + 1 ? 
                      html`
                        <img src="/assets/new/active_dot.svg" alt="active dot" />
                      ` :
                      html`
                        <img src="/assets/new/inactive_dot.svg" alt="inactive dot" />
                      `)}
                </div>
                <button class="pagination-buttons" type="button"  @click=${() => this.switchPage(true)}><sl-icon class="pageToggles" name="chevron-right"></sl-icon></button>
              </div>` : html``}
            </sl-details>
          </div>

          ${
            this.showSecurityBanner ?
            html`Security has issues` :
            html``
          }

          <div id="manifest" class="flex-col">
            <div id="manifest-header">
              <div id="mh-content">
                <div id="mh-text" class="flex-col">
                  <p class="card-header">Manifest</p>
                  ${this.manifestDataLoading ?
                    html`
                      <div class="flex-col gap">
                        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                      </div>
                    ` :
                    html`
                    <p class="card-desc">
                      ${this.decideMessage(this.manifestValidCounter, this.manifestTotalScore, "manifest")}
                    </p>
                  `}
                </div>

                <div id="mh-actions" class="flex-col">
                  ${this.manifestDataLoading ?
                    html`
                      <div class="flex-col gap">
                        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                      </div>
                    ` :
                    html`
                      ${this.createdManifest ?
                      html`
                          <sl-tooltip class="mani-tooltip" open>
                            <div slot="content" class="mani-tooltip-content"><img src="/assets/new/waivingMani.svg" alt="Waiving Mani" /> <p>We did not find a manifest on your site before our tests timed out so we have created a manifest for you! <br> Click here to customize it!</p></div>
                            <button type="button" class="alternate" @click=${() => this.openManifestEditorModal()}>Edit Your Manifest</button>
                          </sl-tooltip>` :
                      html`<button type="button" class="alternate" @click=${() => this.openManifestEditorModal()}>Edit Your Manifest</button>`
                      }

                      <a
                        class="arrow_anchor"
                        href="https://docs.pwabuilder.com/#/home/pwa-intro?id=web-app-manifests"
                        rel="noopener"
                        target="_blank"
                        @click=${() => recordPWABuilderProcessStep("manifest_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}
                      >
                        <p class="arrow_link">Manifest Documentation</p>
                        <img
                          src="/assets/new/arrow.svg"
                          alt="arrow"
                        />
                      </a>
                  `}

                </div>
              </div>

              <div id="mh-right">
                ${this.manifestDataLoading ?
                    html`<sl-skeleton class="progressRingSkeleton" effect="pulse"></sl-skeleton>` :
                    html`<sl-progress-ring
                            id="manifestProgressRing"
                            class=${classMap(this.decideColor("manifest"))}
                            value="${this.createdManifest ? 0 : (parseFloat(JSON.stringify(this.manifestValidCounter)) / this.manifestTotalScore) * 100}"
                          >${this.createdManifest ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing manifest requirements" />` : html`<div class="${classMap(this.decideColor("manifest"))}">${this.manifestValidCounter} / ${this.manifestTotalScore}</div>`}</sl-progress-ring>`
                }
              </div>
            </div>
            <sl-details
              id="mani-details"
              class="details"
              @sl-show=${(e: Event) => this.rotateNinety("mani-details", e)}
              @sl-hide=${(e: Event) => this.rotateZero("mani-details", e)}
              >
              ${this.manifestDataLoading ? html`<div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>` : html`<div class="details-summary" slot="summary"><p>View Details</p><img class="dropdown_icon" data-card="mani-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/></div>`}
              <div id="manifest-detail-grid">
                <div class="detail-list">
                  <p class="detail-list-header">Required</p>

                  ${this.requiredMissingFields.length > 0 ?
                  html`
                    ${this.requiredMissingFields.map((field: string) =>
                    html`<div class="test-result" data-field=${field}>
                          <sl-tooltip content=${field + " is missing from your manifest."} placement="right">
                            <img src=${stop_src} alt="invalid result icon"/>
                          </sl-tooltip>
                      <p>Manifest includes ${field} field</p>
                    </div>`
                    )}
                  ` :
                  html``}
                  
                  ${this.validationResults.map((result: Validation) => result.category === "required" || (result.testRequired && !result.valid) ?
                  html`
                    <div class="test-result" data-field=${result.member}>
                      ${result.valid ?
                        html`<img src=${valid_src} alt="passing result icon"/>` :
                        html`<sl-tooltip content=${result.errorString ? result.errorString : ""} placement="right">
                                <img src=${stop_src} alt="invalid result icon"/>
                              </sl-tooltip>`
                      }
                      <p>${result.displayString}</p>
                    </div>
                  ` :
                  html``)}
                </div>
                <div class="detail-list">
                  <p class="detail-list-header">Recommended</p>
                  ${this.recMissingFields.length > 0 ?
                  html`
                    ${this.recMissingFields.map((field: string) =>
                    html`<div class="test-result" data-field=${field}>
                          <sl-tooltip content=${field + " is missing from your manifest."} placement="right">
                            <img src=${yield_src} alt="yield result icon"/>
                          </sl-tooltip>
                      <p>Manifest includes ${field} field</p>
                    </div>`
                    )}
                  ` :
                  html``}
                  ${this.validationResults.map((result: Validation) => result.category === "recommended"  && ((result.testRequired && result.valid) || !result.testRequired) ?
                  html`
                    <div class="test-result" data-field=${result.member}>
                      ${result.valid ?
                        html`<img src=${valid_src} alt="passing result icon"/>` :
                        html`<sl-tooltip content=${result.errorString ? result.errorString : ""} placement="right">
                                <img src=${yield_src} alt="yield result icon"/>
                              </sl-tooltip>
                        `}
                      <p>${result.displayString}</p>
                    </div>
                  ` : html``)}
                </div>
                <div class="detail-list">
                  <p class="detail-list-header">Desktop Enhancements</p>
                    ${this.enhMissingFields.length > 0 ?
                    html`
                      ${this.enhMissingFields.map((field: string) =>
                      html`
                          <div class="test-result" data-field=${field}>
                            <sl-tooltip content=${field + " is missing from your manifest."} placement="right">
                              <img src=${yield_src} alt="yield result icon"/>
                            </sl-tooltip>
                            <p>Manifest includes ${field} field</p>
                          </div>`
                      )}
                    ` :
                    html``}

                    ${this.validationResults.map((result: Validation) => result.category === "desktop_enhancement" && ((result.testRequired && result.valid) || !result.testRequired) ?
                    html`
                      <div class="test-result" data-field=${result.member}>
                        ${result.valid ?
                          html`<img src=${enhancement_src} alt="enhancement result icon"/>` :
                          html`
                            <sl-tooltip content=${result.errorString ? result.errorString : ""} placement="right">
                              <img src=${yield_src} alt="yield result icon"/>
                            </sl-tooltip>
                          `}
                        <p>${result.displayString}</p>
                      </div>
                    ` : html``)}
                  <p class="detail-list-header">Optional</p>
                  ${this.optMissingFields.length > 0 ?
                  html`
                    ${this.optMissingFields.map((field: string) =>
                    html`
                        <div class="test-result" data-field=${field}>
                          <sl-tooltip content=${field + " is missing from your manifest."} placement="right">
                            <img src=${yield_src} alt="yield result icon"/>
                          </sl-tooltip>
                          <p>Manifest includes ${field} field</p>
                        </div>`
                    )}
                  ` :
                  html``}

                  ${this.validationResults.map((result: Validation) => result.category === "optional" && ((result.testRequired && result.valid) || !result.testRequired) ?
                  html`
                    <div class="test-result" data-field=${result.member}>
                      ${result.valid ?
                        html`<img src=${valid_src} alt="passing result icon"/>` :
                        html`
                          <sl-tooltip content=${result.errorString ? result.errorString : ""} placement="right">
                            <img src=${yield_src} alt="yield result icon"/>
                          </sl-tooltip>
                        `}
                      <p>${result.displayString}</p>
                    </div>
                  ` : html``)}
                </div>
              </div>
            </sl-details>
          </div>

          <div id="two-cell-row">
            <div id="sw" class="half-width-cards">
              <div id="sw-header" class="flex-col">
                <div id="swh-top">
                  <div id="swh-text" class="flex-col">
                    <p class="card-header">Service Worker</p>
                    ${this.swDataLoading ?
                      html`
                        <div class="flex-col gap">
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        </div>
                      ` :
                      html`
                        <p class="card-desc">
                          ${this.decideMessage(this.swValidCounter, this.swTotalScore, "sw")}
                        </p>
                      `
                        }
                  </div>
                  ${this.swDataLoading ?
                    html`<sl-skeleton class="progressRingSkeleton" effect="pulse"></sl-skeleton>` :
                    html`<sl-progress-ring
                    id="swProgressRing"
                    class=${classMap(this.decideColor("sw"))}
                    value="${(parseFloat(JSON.stringify(this.swValidCounter)) / this.swTotalScore) * 100}"
                    >${this.swValidCounter == 0 ? html`<img src="assets/new/macro_error.svg" class="macro_error" alt="missing service worker requirements" />` : html`<div class="${classMap(this.decideColor("sw"))}"> ${this.swValidCounter} / ${this.swTotalScore} </div>`} </sl-progress-ring>
                    `
                  }
                </div>
                <div id="sw-actions" class="flex-col">
                  ${this.swDataLoading ?
                  html`
                    <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                  ` :
                  html`
                    <button type="button" class="alternate" @click=${() => this.openSWSelectorModal()}>
                      Generate Service Worker
                    </button>
                  `}

                  ${this.swDataLoading ?
                    html`
                      <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                    ` :
                    html`
                      <a
                        class="arrow_anchor"
                        rel="noopener"
                        target="_blank"
                        href="https://docs.pwabuilder.com/#/home/sw-intro"
                        @click=${() => recordPWABuilderProcessStep("sw_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
                        <p class="arrow_link">Service Worker Documentation</p>
                        <img
                          src="/assets/new/arrow.svg"
                          alt="arrow"
                        />
                      </a>
                    `
                  }

                </div>
              </div>
              <sl-details
                id="sw-details"
                class="details"
                @sl-show=${(e: Event) => this.rotateNinety("sw-details", e)}
                @sl-hide=${(e: Event) => this.rotateZero("sw-details", e)}
              >
                ${this.swDataLoading ? html`<div slot="summary"><sl-skeleton class="summary-skeleton" effect="pulse"></sl-skeleton></div>` : html`<div class="details-summary" slot="summary"><p>View Details</p><img class="dropdown_icon" data-card="sw-details" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/></div>`}
                <div class="detail-grid">
                  <div class="detail-list">
                    <p class="detail-list-header">Highly Recommended</p>
                    ${this.serviceWorkerResults.map((result: TestResult) => result.category === "highly recommended" ?
                    html`
                      <div class="test-result" data-field=${result.infoString}>
                        ${result.result ? html`<img src=${valid_src} alt="passing result icon"/>` : html`<img src=${yield_src} alt="invalid result icon"/>`}
                        <p>${result.infoString}</p>
                      </div>
                    ` :
                    html``)}
                  </div>
                  <div class="detail-list">
                    <p class="detail-list-header">Recommended</p>
                    ${this.serviceWorkerResults.map((result: TestResult) => result.category === "recommended" ?
                    html`
                    <div class="test-result" data-field=${result.infoString}>
                        ${result.result ? html`<img src=${valid_src} alt="passing result icon"/>` : html`<img src=${yield_src} alt="yield result icon"/>`}
                        <p>${result.infoString}</p>
                      </div>
                    ` :
                    html``)}
                  </div>
                  <div class="detail-list">
                    <p class="detail-list-header">Optional</p>
                    ${this.serviceWorkerResults.map((result: TestResult) => result.category === "optional" ?
                    html`
                      <div class="test-result" data-field=${result.infoString}>
                        ${result.result ? html`<img src=${valid_src} alt="passing result icon"/>` : html`<img src=${yield_src} alt="yield result icon"/>`}
                        <p>${result.infoString}</p>
                      </div>
                    ` :
                    html``)}
                  </div>
                </div>
              </sl-details>
            </div>
            <div id="security" class="half-width-cards">
              <div id="sec-header" class="flex-col">
                <div id="sec-top">
                  <div id="sec-text" class="flex-col">
                    <p class="card-header">App Capabilities</p>
                    ${this.secDataLoading ?
                      html`
                        <div class="flex-col gap">
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                          <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                        </div>
                      ` :
                      html`
                        <p class="card-desc">
                          Make your PWA more app like with these native app capabilities. 
                        </p>
                      `
                        }
                  </div>
                  ${this.secDataLoading ?
                    html`<sl-skeleton class="progressRingSkeleton" effect="pulse"></sl-skeleton>` :
                    html`<sl-progress-ring
                    id="apProgressRing"
                    class="apRing"
                    value=${(this.manifestEnhancementCounter / enhanced_fields.length) * 100}
                    >${this.manifestEnhancementCounter}</sl-progress-ring>
                    `
                  }
                </div>
                <div id="sec-actions" class="flex-col">
                  ${this.secDataLoading ?
                    html`
                      <sl-skeleton class="desc-skeleton" effect="pulse"></sl-skeleton>
                    ` :
                    html`
                      <a
                        class="arrow_anchor"
                        href="https://docs.pwabuilder.com/#/home/native-features" 
                        rel="noopener"
                        target="_blank"
                        @click=${() => recordPWABuilderProcessStep("app_capabilities_documentation_clicked", AnalyticsBehavior.ProcessCheckpoint)}>
                        <p class="arrow_link">App Capabilities Documentation</p>
                        <img
                          src="/assets/new/arrow.svg"
                          alt="arrow"
                        />
                      </a>
                    `
                  }
                </div>
              </div>
              <sl-details
                id="sec-details"
                class="details"
                @sl-show=${(e: Event) => this.rotateNinety("sec-details", e)}
                @sl-hide=${(e: Event) => this.rotateZero("sec-details", e)}
                >
              </sl-details>
            </div>
          </div>
        </div>
      </div>
      

      <sl-dialog class="dialog" ?open=${this.showConfirmationModal} @sl-hide=${() => this.showConfirmationModal = false} noHeader>
        ${this.retestConfirmed ?
          html`
          <p>Retesting your site now!</p>
          ` :
          html`
            <p>Have you added your new ${this.thingToAdd} to your site?</p>
            <div id="confirmationButtons">
              <sl-button>No</sl-button>
              <sl-button @click=${() => this.retest(true)}>Yes</sl-button>
            </div>
          `
        }

      </sl-dialog>

      <share-card 
        .manifestData=${`${this.manifestValidCounter}/${this.manifestTotalScore}/${this.getRingColor("manifest")}/Manifest`}
        .swData=${`${this.swValidCounter}/${this.swTotalScore}/${this.getRingColor("sw")}/Service Worker`}
        .securityData=${`3/3/${this.getRingColor("sec")}/Security`}
        .siteName=${this.appCard.siteName}
      > </share-card>

      <publish-pane></publish-pane>
      <test-publish-pane></test-publish-pane>
      ${this.manifestDataLoading ? html`` : html`<manifest-editor-frame .isGenerated=${this.createdManifest} .startingTab=${this.startingManifestEditorTab} .focusOn=${this.focusOnME} @readyForRetest=${() => this.addRetestTodo("Manifest")}></manifest-editor-frame>`}
      <sw-selector @readyForRetest=${() => this.addRetestTodo("Service Worker")}></sw-selector>

    `;
  }
}

