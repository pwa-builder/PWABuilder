import { required_fields, validateSingleField, singleFieldValadation } from '@pwabuilder/manifest-validation';
import { LitElement, css, html, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  Screenshot,
  Manifest,
  Icon,
} from '../utils/interfaces';
import { generateScreenshots } from '../utils/screenshots';
import { resolveUrl } from '../utils/urls';

let manifestInitialized = false;

@customElement('manifest-screenshots-form')
export class ManifestScreenshotsForm extends LitElement {

  @property({type: Object}) manifest: Manifest = {};
  @property({type: String}) manifestURL: string = "";

  @state() screenshotUrlList: Array<string | undefined> = [undefined];
  @state() screenshotListValid: Array<boolean> = [];
  @state() protected addScreenshotUrlDisabled = true;
  @state() protected generateScreenshotButtonDisabled = true;
  @state() protected awaitRequest = false;
  @state() protected screenshotsList: Array<Screenshot> = [];
  @state() initialScreenshotLength = -1;

  // Generation Status
  @state() protected showSuccessMessage = false;
  @state() protected showErrorMessage = false;

  static get styles() {
    return css`
      :host {
        --sl-focus-ring-width: 3px;
        --sl-input-focus-ring-color: #4f3fb670;
        --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
        --sl-input-border-color-focus: #4F3FB6ac;
      }
      sl-input::part(base),
      sl-select::part(control),
      sl-button::part(base) {
        --sl-input-font-size-medium: 16px;
        --sl-input-height-medium: 3em;
        --sl-button-font-size-medium: 14px;
      }
      
      #form-holder {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
      }
      .form-field {
        width: 50%;
        row-gap: .25em;
        display: flex;
        flex-direction: column;
      }
      .form-field {
        display: flex;
        column-gap: 1em;
        width: 100%;
      }
      .form-field h3 {
        font-size: 18px;
        margin: 0;
      }
      .form-field p {
        font-size: 14px;
        margin: 0;
      }
      .field-header{
        display: flex;
        align-items: center;
        column-gap: 5px;
      }
      .toolTip {
        visibility: hidden;
        width: 150px;
        background: black;
        color: white;
        font-weight: 500;
        text-align: center;
        border-radius: 6px;
        padding: .75em;
        /* Position the tooltip */
        position: absolute;
        top: 20px;
        left: -25px;
        z-index: 1;
        box-shadow: 0px 2px 20px 0px #0000006c;
      }
      .field-header a {
        display: flex;
        align-items: center;
        position: relative;
        color: black;
      }
      a:hover .toolTip {
        visibility: visible;
      }
      a:visited, a:focus {
        color: black;
      }
      .sc-gallery {
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
      }
      .screenshot {
        height: 150px;
        width: auto;
      }
      sl-input {
        width: 50%;
      }
      #add-sc {
        width: 50%;
      }
      .center_text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      .screenshots-actions button {
        width: fit-content;
        height: fit-content;
      }

      @keyframes slide {
        0% , 100%{ bottom: -35px}
        25% , 75%{ bottom: -2px}
        20% , 80%{ bottom: 2px}
      }
      @keyframes rotate {
        0% { transform: rotate(-15deg)}
        25% , 75%{ transform: rotate(0deg)}
        100% {  transform: rotate(25deg)}
      }

      .error {
        color: #eb5757;
      }

      @media(max-width: 765px){

        sl-input {
          width: 100%;
        }
        
      }

      @media(max-width: 600px){
        sl-input::part(base),
        sl-select::part(control),
        sl-button::part(base) {
          --sl-input-font-size-medium: 14px;
          --sl-input-height-medium: 2.5em;
          --sl-button-font-size-medium: 12px;
        }
      }

      @media(max-width: 480px){
        .form-field p {
          font-size: 12px;
        }

        .form-field h3 {
          font-size: 16px;
        }
      }
  
    `;
  }

  constructor() {
    super();
  }

  protected async updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    if(_changedProperties.has("manifest") && !manifestInitialized && this.manifest.name){
      manifestInitialized = true;
      await this.validateAllFields();
      if(this.manifest.screenshots && this.initialScreenshotLength == -1){
        this.initialScreenshotLength = this.manifest.screenshots.length;
      } else {
        this.initialScreenshotLength = 0;
      }
    }
  }

  async validateAllFields(){
    let field = "screenshots";

    if(this.manifest[field]){
      const validation: singleFieldValdation = await validateSingleField(field, this.manifest[field]);
      let passed = validation!.valid;

      if(!passed){
        let title = this.shadowRoot!.querySelector('h3');
        title!.classList.add("error");
        this.errorInTab();
      }
    } else {
      /* This handles the case where the field is not in the manifest.. 
      we only want to make it red if its REQUIRED. */
      if(required_fields.includes(field)){
        let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');
        input!.classList.add("error");
        this.errorInTab();
      }
    }
  }

  errorInTab(){
    let errorInTab = new CustomEvent('errorInTab', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(errorInTab);
  }

  handleInputChange(event: InputEvent){

    const input = <HTMLInputElement | HTMLSelectElement>event.target;
    let updatedValue = input.value;
    const fieldName = input.dataset['field'];

    // Validate using Justin's code
    // if false, show error logic
    // else continue

    let manifestUpdated = new CustomEvent('manifestUpdated', {
      detail: {
          field: fieldName,
          change: updatedValue
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(manifestUpdated);
  }


  renderScreenshotInputUrlList() {
    const renderFn = (url: string | undefined, index: number) => {

      return html`<sl-input
          placeholder="https://www.example.com/screenshot"
          value="${url || ''}"
          @input=${this.handleScreenshotButtonEnabled}
          @sl-change=${this.handleScreenshotUrlChange}
          data-index=${index}
        ></sl-input>`
    };

    return this.screenshotUrlList.map(renderFn);
  }

  handleScreenshotUrlChange(event: CustomEvent) {
    const input = <HTMLInputElement>event.target;
    const index = Number(input.dataset['index']);

    this.screenshotUrlList[index] = input.value;
    this.screenshotListValid = this.validateScreenshotUrlsList(
      this.screenshotUrlList
    );
    this.addScreenshotUrlDisabled = !this.disableAddUrlButton();
    this.generateScreenshotButtonDisabled = !this.hasScreenshotsToGenerate();
  }

  addNewScreenshot() {
    this.screenshotUrlList = [...(this.screenshotUrlList || []), undefined];
    this.addScreenshotUrlDisabled = !this.disableAddUrlButton();
    this.generateScreenshotButtonDisabled = !this.hasScreenshotsToGenerate();
  }

  disableAddUrlButton() {
    return (
      this.screenshotUrlList?.length < 8 && this.hasScreenshotsToGenerate()
    );
  }

  handleScreenshotButtonEnabled() {
    if (this.generateScreenshotButtonDisabled === true) {
      this.generateScreenshotButtonDisabled = false;
    }
  }

  hasScreenshotsToGenerate() {
    return (
      this.screenshotUrlList.length &&
      !this.screenshotListValid.includes(false) &&
      !this.screenshotUrlList.includes(undefined)
    );
  }

  validateScreenshotUrlsList(urls: Array<string | undefined>) {
    const results: Array<boolean> = [];
    const websiteRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w\-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

    const length = urls.length;
    for (let i = 0; i < length; i++) {
      const urlToHandle = urls[i];
      results[i] = urlToHandle ? websiteRegex.test(urlToHandle) : false;
    }

    return results;
  }

  async generateScreenshots() {
    try {
      this.awaitRequest = true;

      if (this.screenshotUrlList && this.screenshotUrlList.length) {
        // to-do: take another type look at this
        // @ts-ignore
        const screenshots = await generateScreenshots(this.screenshotUrlList);
        if (screenshots) {
          this.screenshotsList = screenshots;
          let manifestUpdated = new CustomEvent('manifestUpdated', {
            detail: {
                field: "screenshots",
                change: screenshots
            },
            bubbles: true,
            composed: true
          });
          this.dispatchEvent(manifestUpdated);

          let screenshotsUpdated = new CustomEvent('screenshotsUpdated', {
            detail: {
                screenshots: screenshots
            },
            bubbles: true,
            composed: true
          });
          this.dispatchEvent(screenshotsUpdated);
          // In the future if we wanna show some message it can be tied to this bool
          this.showSuccessMessage = true;
        }
      }
    } catch (e) {
      console.error(e);
      // In the future if we wanna show some message it can be tied to this bool
      this.showErrorMessage = true;
    }

    this.awaitRequest = false;
  }

  screenshotSrcListParse(): string[] {

    if (!this.manifest && !this.manifestURL) {
      return [];
    }

    let screenshotSrcList: string[] = [];
    let initialCounter = this.initialScreenshotLength;

    this.manifest!.screenshots?.forEach((sc: any) => {
      let scURL: string = this.handleImageUrl(sc) || '';
      if(scURL && initialCounter != 0){
        screenshotSrcList.push(scURL as string);
        initialCounter--;
      }
    })

    return screenshotSrcList;
  }

  newScreenshotSrcListParse(): string[] {
    if (!this.manifest && !this.manifestURL) {
      return [];
    }

    let screenshotSrcList: string[] = [];

    if(this.manifest.screenshots && this.manifest.screenshots.length > this.initialScreenshotLength){

      let initialCounter = this.initialScreenshotLength;

      this.manifest!.screenshots?.forEach((sc: any) => {
        if(initialCounter != 0){
          initialCounter--;
        } else {
          let scURL: string = this.handleImageUrl(sc) || '';
          if(scURL){
            screenshotSrcList.push(scURL as string);
          }
        }
      })
    }

    return screenshotSrcList;
  }

  handleImageUrl(icon: Icon) {
    if (icon.src.indexOf('data:') === 0 && icon.src.indexOf('base64') !== -1) {
      return icon.src;
    }

    let url = resolveUrl(this.manifestURL, this.manifest?.startUrl);
    url = resolveUrl(url?.href, icon.src);

    if (url) {
      return url.href;
    }

    return undefined;
  }

  render() {
    return html`
      <div id="form-holder">
        <div class="form-field">
          <div class="field-header">
            <h3>Screenshots</h3>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots"
              target="_blank"
              rel="noopener"
            >
              <img src="/assets/tooltip.svg" alt="info circle tooltip" />
              <p class="toolTip">
                Click for more info on the screenshots option in your manifest.
              </p>
            </a>
          </div>
          <p>Below are the screenshots that are currently in your manifest.</p>
          <div class="sc-gallery">
            ${this.initialScreenshotLength > 0 ? this.screenshotSrcListParse().map((img: any) => html`<img class="screenshot" src=${img} alt="your app screenshot" decoding="async" loading="lazy"/>`) : html`<div class="center_text"><ion-icon name="images"></ion-icon> There are no screenshots in your manifest</div>`}
          </div>
          <h3>Generate Screenshots</h3>
          <p>Specify the URLs to generate desktop and mobile screenshots from. You may add up to 8 screenshots or Store Listings.</p>
          ${this.renderScreenshotInputUrlList()}
          <sl-button id="add-sc" @click=${this.addNewScreenshot} ?disabled=${this.addScreenshotUrlDisabled}>+ Add URL</sl-button>
          <div class="sc-gallery">
            ${this.newScreenshotSrcListParse().map((img: any) => html`<img class="screenshot" alt="your generated screenshot" src=${img} />`)}
          </div>
          <div class="screenshots-actions">
            <sl-button
              type="submit"
              ?loading=${this.awaitRequest}
              ?disabled=${this.generateScreenshotButtonDisabled}
              @click=${this.generateScreenshots}
              >Generate Screenshots</sl-button>
          </div>
        </div>
      </div>
    `;
  }
}
