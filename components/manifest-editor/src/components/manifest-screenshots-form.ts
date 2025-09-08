import { validateSingleField, singleFieldValidation } from '@pwabuilder/manifest-validation';
import { LitElement, css, html, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { errorInTab, insertAfter } from '../utils/helpers';
import {
  Screenshot,
  Manifest,
  Icon,
} from '../utils/interfaces';
import { resolveUrl } from '../utils/urls';
import {classMap} from 'lit/directives/class-map.js';
import "./manifest-field-tooltip";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";

let manifestInitialized = false;

@customElement('manifest-screenshots-form')
export class ManifestScreenshotsForm extends LitElement {

  @property({type: Object, hasChanged(value: Manifest, oldValue: Manifest) {
    if(value !== oldValue && value.name){
      manifestInitialized = true;
      return value !== oldValue;
    }
    return value !== oldValue;
  }}) manifest: Manifest = {};
  @property({type: String}) manifestURL: string = "";
  @property({type: String}) baseURL: string = "";
  @property({type: String}) focusOn: string = "";

  @state() screenshotUrlList: Array<string | undefined> = [undefined];
  @state() screenshotListValid: Array<boolean> = [];
  @state() protected addScreenshotUrlDisabled = true;
  @state() protected generateScreenshotButtonDisabled = true;
  @state() protected awaitRequest = false;
  @state() protected screenshotsList: Array<Screenshot> = [];
  @state() initialScreenshotLength = -1;
  @state() srcList: any = [];
  @state() newSrcList: any = [];

  // Generation Status
  @state() protected showSuccessMessage = false;
  @state() protected showErrorMessage = false;

  private shouldValidateAllFields: boolean = true;
  private validationPromise: Promise<void> | undefined;
  private errorCount: number = 0;

  static get styles() {
    return css`
      :host {
        --sl-focus-ring-width: 3px;
        --sl-input-focus-ring-color: #4f3fb670;
        --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
        --sl-input-border-color-focus: #4F3FB6ac;
        --sl-input-font-family: Hind, sans-serif;
      }
      sl-input::part(base),
      sl-select::part(control),
      sl-button::part(base) {
        --sl-input-font-size-medium: 16px;
        --sl-input-height-medium: 3em;
        --sl-button-font-size-medium: 14px;
      }

      sl-input::part(base),
      sl-select::part(control){
        background-color: #fbfbfb;
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
      .form-field p:not(.toolTip) {
        font-size: 14px;
        margin: 0;
        color: #717171;
      }
      sl-input::part(input){
        color: #717171;
      }
      .field-header{
        display: flex;
        align-items: center;
        column-gap: 10px;
      }
      .toolTip {
        font-size: 14px;
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
        font-size: 16px;
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
        color: #292c3a;
      }

      sl-button::part(base):hover {
        background-color: rgba(79, 63, 182, 0.06);
        border-color: rgba(79, 63, 182, 0.46);
        color: rgb(79, 63, 182);
      }

      .focus {
        color: #4f3fb6;
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

        .field-header a:after {
          content: "";
          position: absolute;
          left: -13px;
          top: -13px;
          z-index: -1;
          width: 40px;
          height: 40px;
        }
      }
  
    `;
  }

  constructor() {
    super();
  }

  protected async updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    if(manifestInitialized){
      manifestInitialized = false;
      this.requestValidateAllFields();
      await this.screenshotSrcListParse();
      if(this.manifest.screenshots && this.initialScreenshotLength == -1){
        this.initialScreenshotLength = this.manifest.screenshots.length;
      } else {
        this.initialScreenshotLength = 0;
      }
    }
  }

  private async requestValidateAllFields() {
    
    this.shouldValidateAllFields = true;

    if (this.validationPromise) {
      return;
    }
    
    while (this.shouldValidateAllFields) {
      this.shouldValidateAllFields = false;

      this.validationPromise = this.validateAllFields();
      await this.validationPromise;
    }

  }

  async validateAllFields(){
    let field = "screenshots";

    if(this.manifest[field]){
      const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);
      let passed = validation!.valid;

      if(!passed){

        if(this.shadowRoot!.querySelector(`.error-message`)){
          let error_p = this.shadowRoot!.querySelector(`.error-message`);
          error_p!.parentElement!.removeChild(error_p!);
        }

        let title = this.shadowRoot!.querySelector('h3');
        title!.classList.add("error");

        if(validation.errors){
          validation.errors.forEach((error: string) => {
            let p = document.createElement('p');
            p.innerText = error;
            p.style.color = "#eb5757";
            p.classList.add("error-message");
            p.setAttribute('aria-live', 'polite');
            insertAfter(p, title!.parentNode);
            this.errorCount++;
          });
        }

      }
    } 

    this.validationPromise = undefined;
    if(this.errorCount == 0){
      this.dispatchEvent(errorInTab(false, "screenshots"));
    } else {
      this.dispatchEvent(errorInTab(true, "screenshots"));
    }
  }

  async screenshotSrcListParse() {

    if (!this.manifest || !this.manifest.screenshots) {
      return;
    }

    let srcList: string[] = [];
    let initialCounter = this.initialScreenshotLength;

    for(let i = 0; i < this.manifest!.screenshots!.length; i++){
      let sc = this.manifest!.screenshots![i];
      let scURL: string = this.handleImageUrl(sc) || '';

      await this.testImage(scURL).then(
        function fulfilled(_img) {
        },

        function rejected() {
          scURL = `https://pwabuilder.com/api/images/getSafeImageForAnalysis?imageUrl=${encodeURIComponent(scURL)}`;
        }
      );

      if(scURL && initialCounter != 0){
        srcList.push(scURL as string);
        initialCounter--;
      }
    }
    this.srcList = srcList;
  }

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

  decideFocus(field: string){
    let decision = this.focusOn === field;
    return {focus: decision}
  }

  render() {
    return html`
      <div id="form-holder">
        <div class="form-field">
          <div class="field-header">
            <h3 class=${classMap(this.decideFocus("screenshots"))}>Screenshots</h3>
            <manifest-field-tooltip .field=${"screenshots"}></manifest-field-tooltip>
          </div>
          <p>Below are the screenshots that are currently in your manifest.</p>
          <div class="sc-gallery">
            ${this.srcList.length > 0 ? this.srcList.map((img: any) => html`<img class="screenshot" src=${img} alt="your app screenshot" decoding="async" loading="lazy"/>`) : html`<div class="center_text"><sl-icon name="card-image"></sl-icon> There are no screenshots in your manifest</div>`}
          </div>
          <div class="sc-gallery">
            ${this.newSrcList.map((img: any) => html`<img class="screenshot" alt="your generated screenshot" src=${img} />`)}
          </div>
        </div>
      </div>
    `;
  }
}