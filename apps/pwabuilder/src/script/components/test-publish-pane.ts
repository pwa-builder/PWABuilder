import { LitElement, css, html, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AnalyticsBehavior, recordProcessStep, recordPWABuilderProcessStep } from '../utils/analytics';
import { getManifestContext, getURL } from '../services/app-info';
import { IOSAppPackageOptions } from '../utils/ios-validation';
import { WindowsPackageOptions } from '../utils/win-validation';
import { AndroidPackageOptions } from '../utils/android-validation';
import { OculusAppPackageOptions } from '../utils/oculus-validation';
import { generatePackage, Platform } from '../services/publish';

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
import './oculus-form';
import { fetchOrCreateManifest } from '../services/manifest';
import { createWindowsPackageOptionsFromManifest } from '../services/publish/windows-publish';
import { ManifestContext } from '../utils/interfaces';

@customElement('test-publish-pane')
export class TestPublishPane extends LitElement {

  // tells page we are generating a package
  @state() generating = false;
  @state() selectedStore = "";

  // Used to download files
  @state() readyToDownload = false;
  @state() blob: Blob | File | null | undefined;
  @state() testBlob: Blob | File | null | undefined;
  @state() downloadFileName: string | null = null;
  @state() errorMessages: TemplateResult[] = [];


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
        height: fit-content;
      }
      #pp-frame-content {
        display: flex;
        flex-direction: column;
        height: fit-content;
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
        height: fit-content;
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
        height: fit-content;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: .75em;
        padding: 1em;
        overflow-y: auto;
      }
      .package-button{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
      .package-button::part(base) {
        all: unset;
        width: 75%;
        background-color: white;
        color: #4F3FB6;
        border: 1px solid #4F3FB6;
        font-size: 14px;
        border-radius: 50px;
        padding: .75em 1em;
        text-align: center;
        font-weight: bold;
      }
      .package-button::part(label){
        padding: 0;
      }
      .package-button:hover {
        cursor: pointer;
      }
      #info-tooltip {
        height: 20px
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

      .error-holder {
        display: flex;
        gap: .5em;
        align-items: flex-start;
        background-color: #FAEDF1;
        padding: .5em;
        position: absolute;
        bottom: 100px;
        border-left: 4px solid #EB5757;
        border-radius: 3px;
        margin: 0 1em;
      }

      .error-holder p {
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
        color: black;
        font-weight: bold;
        font-size: 14px;
      }

      .error-actions > *:hover {
        cursor: pointer;
      }

      .close_error:hover {
        cursor: pointer;
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
      <sl-button id="windows-test-pkg-btn" class="package-button" ?loading=${this.generating} id="test-package-button"
          @click="${this.generateWindowsTestPackage}" .secondary="${true}">
        Download Test Package
      </sl-button>
    `;
  }

  async generateWindowsTestPackage() {
    recordPWABuilderProcessStep("windows_test_package_clicked", AnalyticsBehavior.ProcessCheckpoint);
    let manifestContext: ManifestContext = getManifestContext();
    if (manifestContext.isGenerated) {
      let context = await fetchOrCreateManifest();
      manifestContext = context!;
    }

    const options = createWindowsPackageOptionsFromManifest(manifestContext.manifest);
    await this.generate("windows", options);
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
    } catch (err: any) {
      console.error(err);
      this.renderErrorMessage(err.response);
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

  renderErrorMessage(response: any){
    let stack_trace = "";
    let message = "";
    if(this.selectedStore === "Android"){
      message = response.stack_trace.split("stack:")[0];
      stack_trace = response.stack_trace.split("stack:")[1];
    }
    let error = html`
      <div class="error-holder">
        <img src="/assets/new/stop.svg" alt="invalid result icon" />
        <div class="error-info">
          <p class="error-title">${response.statusText}</p>
          <p class="error-desc">Status code: ${response.status}. ${message}</p>
          <div class="error-actions">
            <button class="copy_stack" @click=${this.copyText(stack_trace)}>Copy stack trace</button>
            <a href="https://docs.pwabuilder.com/#/builder/faq" target="_blank" rel="noopener">Visit FAQ</a>
          </div>
        </div>
        <img @click=${() => this.errorMessages = []} class="close_error" src="assets/images/Close_desk.png" alt="close icon"/>
      </div>
    `
    this.errorMessages.push(error);
  }

  copyText(text: string){
    navigator.clipboard.writeText(text);
  }

  async downloadPackage(){
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
      recordPWABuilderProcessStep("test_publish_pane_closed", AnalyticsBehavior.ProcessCheckpoint);
      document.body.style.height = "unset";
    }
  }

  render() {
    return html`
      <sl-dialog class="dialog" @sl-show=${() => document.body.style.height = "100vh"} @sl-hide=${(e: any) => this.hideDialog(e)} noHeader>
        <div id="pp-frame-wrapper">
          <div id="pp-frame-content">
            <div id="pp-frame-header">
              <h1>Download Test Package</h1>
              <p>If you want to see what your app would look like in its current state, use the test package buttons below!</p>
            </div>
            <div id="store-cards">
              ${this.renderContentCards()}
            </div>
            
            <div id="errors">${this.errorMessages.length > 0 ?  this.errorMessages.map((error: TemplateResult) => error) : html``}</div>
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