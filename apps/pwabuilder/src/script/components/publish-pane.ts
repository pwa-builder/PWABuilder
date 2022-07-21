import { LitElement, css, html, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AnalyticsBehavior, recordProcessStep, recordPWABuilderProcessStep } from '../utils/analytics';
import { getURL } from '../services/app-info';
import { IOSAppPackageOptions } from '../utils/ios-validation';
import { WindowsPackageOptions } from '../utils/win-validation';
import { AndroidPackageOptions } from '../utils/android-validation';
import { OculusAppPackageOptions } from '../utils/oculus-validation';
import { generatePackage, Platform } from '../services/publish';
import { fileSave } from 'browser-fs-access';

import {
  smallBreakPoint,
  mediumBreakPoint,
  largeBreakPoint,
  //xLargeBreakPoint,
  xxxLargeBreakPoint,
} from '../utils/css/breakpoints';

import './windows-form';
import './android-form';
import './ios-form';
import './oculus-form';

@customElement('publish-pane')
export class PublishPane extends LitElement {

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
    }
  ];

  static get styles() {
    return [
    css`
      * {
        box-sizing: border-box;
      }
      
      #frame-wrapper {
        display: flex;
        flex-direction: column;
        row-gap: .5em;
        width: 100%;
        min-height: 90vh;
      }
      #frame-content {
        display: flex;
        flex-direction: column;
        max-height: 90vh;
      }
      #frame-header {
        display: flex;
        flex-direction: column;
        row-gap: .25em;
        padding: 1em;
        padding-bottom: 0;
      }
      #frame-header > * {
        margin: 0;
      }
      #frame-header h1 {
        font-size: 24px;
      }
      #frame-header p {
        font-size: 14px;
      }
      .card-wrapper {
        width: 100%;
        height: 100%;
        max-height: 330px;
        display: flex;
        flex-direction: column;
        box-shadow: 0px 4px 10px 4px rgba(0, 0, 0, 0.05);
        position: relative;
        padding: 1em;
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
      .title-block {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        width: 100%;
        row-gap: .45em;
      }
      .title-block h3 {
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
        background-color: black;
        color: white; 
        font-size: 14px;
        border-radius: 50px;
        padding: .75em 1em;
        border: none;
        text-align: center;
        font-weight: bold;
      }
      .package-button:hover {
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0.75);
      }
      #apk-type {
        display: flex;
        align-items: baseline;
        width: 100%;
        border-bottom: 2px solid #5D5DB9;
        margin-top: 20px;
        margin-bottom: 14px;
      }
      #apk-type p {
        font-size: 20px;
        font-weight: 700;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: center;
        width: 100%;
        margin: 0;
        padding: 10px 0;
        white-space: nowrap;
      }
      #apk-type p:hover {
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
        border-bottom: 5px solid #5D5DB9;
        color: #5D5DB9;
      }
      
      .unselected-apk {
        border-bottom: 5px solid transparent;
      }
      #form-header {
        display: flex;
        flex-direction: column;
        background-color: #F2F3FB;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        padding: 1em;
        gap: .5em;
      }
      #form-header > img {
        width: 25px;
      }
      #form-header > button {
        all: unset;
      }
      #form-header > button:hover {
        cursor: pointer;
      }
      #form-header-content {
        display: flex;
        gap: 1em;
      }
      #form-header-content img {
        height: 50px;
      }
      #form-header-text {
        display: flex;
        flex-direction: column;
      }
      #form-header-text > * {
        margin: 0;
      }
      #form-header-text h1 {
        font-size: 24px;
        white-space: nowrap;
        line-height: 24px;
      }
      #form-header-text p {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.5)
      }
      #form-area {
        padding: 1em;
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
      }
      .dialog::part(overlay){
        backdrop-filter: blur(10px);
      }
      .dialog::part(close-button__base){
        position: absolute;
        top: 5px;
        right: 5px;
      }

      /* > 1920 */
      ${xxxLargeBreakPoint(css``)}

      /* 640px - 1023px */
      ${largeBreakPoint(css``)}

      /* 480px - 639px */
      ${mediumBreakPoint(css`
      `)}
      /* < 480 */
      ${smallBreakPoint(css`
        #store-cards {
          display: flex;
          flex-direction: column;
          row-gap: .5em;
          overflow-y: auto;
        }
        #frame-header{
          margin-bottom: 10px;
          padding: 1em 2em 0em 1em;
        }
        #frame-header h1 {
          font-size: 20px;
          line-height: 20px;
        }
        #frame-header p {
          font-size: 12px;
        }
        #form-header-content img {
          height: 35px;
        }
        #form-header-text h1 {
          font-size: 20px;
          white-space: nowrap;
          line-height: 20px;
        }
        #form-header-text p {
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

  firstUpdated(){
   
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

  renderOculusDownloadButton(): TemplateResult {
    return html`
      <button class="package-button" id="oculus-package-button" @click="${() => this.showMetaOptions()}">
        Generate Package
      </button>
    `;
  }

  renderForm(){
    if(this.selectedStore === "Windows"){
      return html`<windows-form .generating=${this.generating} @init-windows-gen="${(ev: CustomEvent) =>
        this.generate('windows', ev.detail as WindowsPackageOptions)}"></windows-form>`
    } else if(this.selectedStore === "Android"){
      return html`
      <div id="apk-type">
        <p class="selected-apk apk-type" @click=${(e: any) => this.toggleApkType(e)}>Google Play</p>
        <p class="unselected-apk apk-type" id="other-android" @click=${(e: any) => this.toggleApkType(e)}>
          Other Android
          <info-circle-tooltip  id="info-tooltip" text='Generates an unsigned APK.'></info-circle-tooltip>
        </p> 
      </div>
      ${this.isGooglePlay ?
        html`<android-form .generating=${this.generating} .isGooglePlayApk=${this.isGooglePlay} @init-android-gen="${(e: CustomEvent) =>
          this.generate('android', e.detail as AndroidPackageOptions)}"></android-form>` :
        html`<android-form .generating=${this.generating} .isGooglePlayApk=${this.isGooglePlay} @init-android-gen="${(e: CustomEvent) =>
          this.generate('android', e.detail as AndroidPackageOptions)}"></android-form>`
      }`
    } else if(this.selectedStore === "Meta"){
      return html`<oculus-form .generating=${this.generating}
          @init-oculus-gen="${(ev: CustomEvent) => this.generate('oculus', ev.detail)}">
      </oculus-form>`
    } else {
      return html`<ios-form .generating=${this.generating} @init-ios-gen="${(ev: CustomEvent) => this.generate('ios', ev.detail)}"></ios-form>`
    }
    
  }

  showWindowsOptions() {
    //recordPWABuilderProcessStep("windows_store_page_opened", AnalyticsBehavior.ProcessCheckpoint)
    this.selectedStore = "Windows";
    this.cardsOrForm = false;
    this.requestUpdate();
  }

  showAndroidOptions() {
    //recordPWABuilderProcessStep("android_store_page_opened", AnalyticsBehavior.ProcessCheckpoint);
    this.selectedStore = "Android";
    this.cardsOrForm = false;
    this.requestUpdate();
  }

  toggleApkType(event: any){
    let old = this.shadowRoot!.querySelector(".selected-apk");
    old?.classList.replace("selected-apk", "unselected-apk");
    let next = event.target;
    next.classList.replace("unselected-apk", "selected-apk");

    if(event.target.innerHTML === "Google Play"){
      this.isGooglePlay = true;
    } else {
      this.isGooglePlay = false;
    }
  }

  showiOSOptions() {
    //recordPWABuilderProcessStep("ios_store_page_opened", AnalyticsBehavior.ProcessCheckpoint);
    this.selectedStore = "iOS";
    this.cardsOrForm = false;
    this.requestUpdate();
  }

  showMetaOptions() {
    //recordPWABuilderProcessStep("meta_store_page_opened", AnalyticsBehavior.ProcessCheckpoint);
    this.selectedStore = "Meta";
    this.cardsOrForm = false;
    this.requestUpdate();
  }

  async generate(platform: Platform, options?: AndroidPackageOptions | IOSAppPackageOptions | WindowsPackageOptions | OculusAppPackageOptions) {
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
      console.log("generating files");
      const packageData = await generatePackage(platform, options);

      if (packageData) {
        console.log("succesfully generated files");
        this.downloadFileName = `${packageData.appName}.zip`;
        if (packageData.type === 'test') {
          this.testBlob = packageData.blob;
        } else {
          console.log("non test blob");
          this.blob = packageData.blob;
          this.readyToDownload = true;
        }
      }
    } catch (err) {
      console.log("error");
      console.error(err);
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
      /* this.openAndroidOptions = false;
      this.openWindowsOptions = false;
      this.openiOSOptions = false;
      this.openOculusOptions = false; */
    }
  }

  async downloadPackage(){
    if (this.blob || this.testBlob) {
      await fileSave((this.blob as Blob) || (this.testBlob as Blob), {
        fileName: this.downloadFileName || 'your_pwa.zip',
        extensions: ['.zip'],
      });

      this.blob = undefined;
      this.testBlob = undefined;
    }
  }

  renderContentCards(): TemplateResult[] {
    return this.platforms.map(
      platform => html`
        <div class="card-wrapper">
          ${true ? html`` :
            html`
            <div class="packaged-tracker"> <!-- This will eventually be in an "if packaged previously" -->
            <p>Packaged Previously</p>
            </div>` 
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

  async hideDialog(e: any){
    let dialog: any = this.shadowRoot!.querySelector(".dialog");
    if(e.target === dialog){
      await dialog!.hide();
      recordPWABuilderProcessStep("publish_pane_closed", AnalyticsBehavior.ProcessCheckpoint);
      document.body.style.height = "unset";
    }
  }

  render() {
    return html`
      <sl-dialog class="dialog" @sl-show=${() => document.body.style.height = "100vh"} @sl-hide=${(e: any) => this.hideDialog(e)} noHeader>
        <div id="frame-wrapper">
          <div id="frame-content">
          ${this.cardsOrForm ?
            html`
            <div id="frame-header">
              <h1>Awesome! Your PWA is store ready!</h1>
              <p>You are now ready to ship your PWA to the app stores. Generate store-ready packages for the Microsoft Store, Google Play, iOS and Meta stores.</p>
            </div>
            <div id="store-cards">
              ${this.renderContentCards()}
            </div>`
            :
            html`
            <div id="form-header">
              <button type="button"><img src="/assets/new/back_for_package_form.svg" alt="back to store cards button" @click=${() => this.cardsOrForm = !this.cardsOrForm} /></button>
              <div id="form-header-content">
                <img src="${logoMap[this.selectedStore]}" alt="${this.selectedStore} logo" />
                <div id="form-header-text">
                  <h1>${this.selectedStore} Package Options</h1>
                  <p>Customize your ${this.selectedStore} app below!</p>
                </div>
              </div>
            </div> 
            ${!this.readyToDownload ?   
              // so if this is false then we wanna show the form  
              html`
                <div id="form-area">
                  ${this.renderForm()}
                </div>
              ` :
              // when this becomes true this means that we are ready to download something
              html`
                <button type="button" @click=${() => this.downloadPackage()}>Download package!</button>
              `
            }  
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

const logoMap: any = { 
  "Windows": "/assets/windows_icon.svg",
  "Android": "/assets/android_icon.svg",
  "iOS": "/assets/apple_icon.svg",
  "Meta": "/assets/meta_icon.svg"
}