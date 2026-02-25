import { required_fields, validateSingleField, singleFieldValidation } from '@pwabuilder/manifest-validation';
import { LitElement, css, html, PropertyValueMap, TemplateResult } from 'lit';
import { repeat } from "lit/directives/repeat.js";
import { customElement, property, state } from 'lit/decorators.js';
import { errorInTab, insertAfter } from '../utils/helpers';
import {
    Icon,
    Lazy,
    Manifest,
} from '../utils/interfaces';
import { resolveUrl } from '../utils/urls';
import { classMap } from 'lit/directives/class-map.js';
import "./manifest-field-tooltip";
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

let manifestInitialized = false;

interface PlatformInformation {
    label: string;
    value: string;
}

const platformsData: Array<PlatformInformation> = [
    { label: "Windows 11", value: 'windows11' },
    { label: "Android", value: 'android' },
    { label: "iOS", value: 'ios' }
];

@customElement('manifest-icons-form')
export class ManifestIconsForm extends LitElement {

    @property({
        type: Object, hasChanged(value: Manifest, oldValue: Manifest) {
            if (value !== oldValue && value.name) {
                manifestInitialized = true;
                return value !== oldValue;
            }
            return value !== oldValue;
        }
    }) manifest: Manifest = {};

    @property({ type: String }) manifestURL: string = "";
    @property({ type: String }) focusOn: string = "";
    @property({ type: String }) analysisId: string = "";
    @property({ type: String }) imageProxyUrl: string = "";

    // Icon state vars
    @state() uploadSelectedImageFile: Lazy<File>;
    @state() canWeGenerate = true;
    @state() generatingZip = false;
    @state() zipGenerated = false;
    @state() uploadImageObjectUrl: string = '';
    @state() errored: boolean = false;
    @state() selectedPlatforms: PlatformInformation[] = [...platformsData];
    @state() srcList: Icon[] = [];
    private shouldValidateAllFields: boolean = true;
    private validationPromise: Promise<void> | undefined;
    private errorCount: number = 0;

    static get styles() {
        return css`

    :host {
      --sl-input-font-family: Hind, sans-serif;
    }
    

      sl-checkbox::part(base),
      sl-checkbox::part(control),
      sl-button::part(base) {
        --sl-button-font-size-medium: 14px;
        --sl-input-font-size-medium: 16px;
        --sl-toggle-size: 16px;
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

      .field-header{
        display: flex;
        align-items: center;
        justify-content: space-between;
        column-gap: 10px;
      }

      .header-left{
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
      #icon-section {
        display: flex;
        flex-direction: column;
        margin: 10px 0;
      }
      #input-file {
        display: none;
      }
      .icon {
        max-width: 115px;
      }
      .icon-gallery {
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
      }
      .icon-box {
        display: flex;
        flex-direction: column;
      }
      .icon-box p {
        margin: 0 10px;
      }
      #icon-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr .25fr;
        place-items: center;
        gap: .5em;
      }

      #icon-options sl-button {
        grid-column: 2;
      }

      #selected-icon {
        max-width: 115px;
      }
      #platforms-to-generate {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
      }
      .error {
        color: #292c3a;
      }

      sl-button::part(base):hover {
        background-color: rgba(79, 63, 182, 0.06);
        border-color: rgba(79, 63, 182, 0.46);
        color: rgb(79, 63, 182);
      }

      sl-checkbox[checked]::part(control) {
        background-color: #4f3fb6;
        border-color: #4f3fb6;
        color: #ffffff;
      }

      .focus {
        color: #4f3fb6;
      }

      .center_text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        font-size: 16px;
      }

      @media(max-width: 765px){
        sl-checkbox::part(base),
        sl-checkbox::part(control) {
          --sl-input-font-size-medium: 14px;
          --sl-toggle-size: 14px;
        }
      }

      @media(max-width: 600px){
        .icon {
            max-width: 90px;
        }

        #icon-options {
          grid-template-columns: .25fr 1fr;
        }

        #selected-icon {
          max-width: 90px;
        }
        
      }

      @media(max-width: 480px){

        sl-button::part(base) {
          --sl-button-font-size-medium: 12px;
        }

        .form-field p {
          font-size: 12px;
        }

        .form-field h3 {
          font-size: 16px;
        }

        #selected-icon {
          max-width: 70px;
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
        if (manifestInitialized && this.manifest.icons) {
            manifestInitialized = false;
            this.requestValidateAllFields();
            await this.iconSrcListParse();
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

    async validateAllFields() {
        let field = "icons";

        if (this.manifest[field]) {
            const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);

            let passed = validation!.valid;

            if (!passed) {
                if (this.shadowRoot!.querySelectorAll('.error-message')) {
                    let error_divs = this.shadowRoot!.querySelectorAll('.error-message');
                    error_divs.forEach((error: any) => error!.parentElement!.removeChild(error!));
                }
                let title = this.shadowRoot!.querySelector('h3');
                title!.classList.add("error");

                if (validation.errors) {
                    validation.errors.forEach((error: string) => {
                        let p = document.createElement('p');
                        p.innerText = error;
                        p.style.color = "#eb5757";
                        p.classList.add("error-message");
                        p.setAttribute('aria-live', 'polite');
                        insertAfter(p, title!.parentNode!.parentNode);
                        this.errorCount++;
                    });
                }
            }
        } else {
            /* This handles the case where the field is not in the manifest.. 
            we only want to make it red if its REQUIRED. */
            if (required_fields.includes(field)) {
                let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');
                input!.classList.add("error");

                if (this.shadowRoot!.querySelector(`.${field}-error-div`)) {
                    let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
                    error_div!.parentElement!.removeChild(error_div!);
                }

                let div = document.createElement('div');
                div.classList.add(`${field}-error-div`);
                let p = document.createElement('p');
                p.innerText = `${field} is required and is missing from your manifest.`;
                p.style.color = "#eb5757";
                div.append(p);
                this.errorCount++;
                insertAfter(div, input!.parentNode!.lastElementChild);

            }
        }
        this.validationPromise = undefined;
        if (this.errorCount == 0) {
            this.dispatchEvent(errorInTab(false, "icons"));
        } else {
            this.dispatchEvent(errorInTab(true, "icons"));
        }
    }

    enterFileSystem() {
        let uploadIcons = new CustomEvent('uploadIcons', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(uploadIcons);

        this.shadowRoot!.getElementById('input-file')?.click();
    }

    async handleModalInputFileChange() {
        this.zipGenerated = false;
        let input = (this.shadowRoot!.getElementById('input-file') as HTMLInputElement);
        const files = input.files ?? undefined;

        this.uploadSelectedImageFile = files?.item(0) ?? undefined;
        this.canWeGenerate = !!this.validIconInput();

        if (this.canWeGenerate && this.uploadSelectedImageFile) {
            this.uploadImageObjectUrl = URL.createObjectURL(
                this.uploadSelectedImageFile
            );
        } else {
            this.errored = true;
        }
    }

    validIconInput() {
        const supportedFileTypes = ['.png', '.jpg', '.svg'];

        return supportedFileTypes.find(
            fileType =>
                this &&
                this.uploadSelectedImageFile &&
                this.uploadSelectedImageFile.name.endsWith(fileType)
        );
    }

    async iconSrcListParse() {

        if (!this.manifest && !this.manifestURL) {
            return;
        }

        this.srcList = (this.manifest.icons || [])
            .map(i => {
                return {
                    src: this.handleImageUrl(i) || "",
                    sizes: i.sizes
                }
            });
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

    handleImageUrl(icon: Icon): string | undefined {
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

    handlePlatformChange(e: any, platform: PlatformInformation) {
        const checkbox = e.path[0];
        if (checkbox.checked) {
            this.selectedPlatforms.push(platform);
        } else {
            let removeIndex = this.selectedPlatforms.indexOf(platform);
            this.selectedPlatforms.splice(removeIndex, 1);
        }
        this.canWeGenerate = this.selectedPlatforms.length != 0;
    }

    async generateZip() {

        let platformsForEvent: string[] = [];
        this.selectedPlatforms.forEach((plat: any) => platformsForEvent.push(plat.label))
        let generateIconsAttempted = new CustomEvent('generateIconsAttempted', {
            detail: {
                selectedPlatforms: platformsForEvent
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(generateIconsAttempted);

        this.generatingZip = true;

        const file = this.uploadSelectedImageFile

        try {

            const form = new FormData();

            /*
            These two fields are options on pwabuilder.com/imageGenerator
            However, for this first iteration, I just want to get a simple
            use case out. Therefore, I hardcoded in the defaults/suggested
            values. If we want to custom this later, we can do so but taking
            these two values from input fields.
            */
            const colorValue = 'transparent';
            const paddingValue = .3;

            form.append('baseImage', file as Blob);
            form.append('padding', String(paddingValue));
            form.append('backgroundColor', colorValue);

            this.selectedPlatforms.forEach((plat: PlatformInformation) => form.append('platforms', plat.value));

            const createStoreImagesRequest = await fetch("/api/images/generateStoreImages", {
                method: 'POST',
                body: form,
            });

            if (!createStoreImagesRequest.ok) {
                const errorText = await createStoreImagesRequest.text();
                throw new Error(errorText || `Image generation failed with status ${createStoreImagesRequest.status}`);
            }

            const blob = await createStoreImagesRequest.blob();
            const disposition = createStoreImagesRequest.headers.get("Content-Disposition");
            const fileNameMatch = disposition ? /filename="?([^";\n]+)"?/i.exec(disposition) : null;
            const fileName = fileNameMatch?.[1] ?? "appstore-images.zip";
            const url = URL.createObjectURL(blob);

            this.zipGenerated = true;
            setTimeout(() => { this.zipGenerated = false }, 3000);

            this.generatingZip = false;
            this.downloadZip(url, fileName);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            //this.error = (e as Error).message;
        }
    }

    downloadZip(zipUrl: string, fileName: string) {
        const hyperlink = document.createElement("a");
        hyperlink.href = zipUrl;
        hyperlink.download = fileName;
        hyperlink.click();
    }

    decideFocus(field: string) {
        let decision = this.focusOn === field;
        return { focus: decision }
    }

    render() {
        return html`
      <div id="form-holder">
        <div class="form-field">
          <div class="field-header">
            <div class="header-left">
              <h3 class=${classMap(this.decideFocus("icons"))}>App Icons</h3>
              <manifest-field-tooltip .field=${"icons"}></manifest-field-tooltip>
            </div>

            <p>(required)</p>
          </div>
          <p>Below are the current Icons in your apps Manifest</p>
          <div class="icon-gallery">
            ${this.renderIcons()}
          </div>
          <h3>Generate Icons</h3>
          <p>We suggest at least one image 512x512 or larger.</p>
          <div id="icon-section">
            <sl-button class="image-buttons" @click=${() => this.enterFileSystem()} >Upload</sl-button>
            <input
              id="input-file"
              class="file-input hidden"
              type="file"
              aria-hidden="true"
              accept="image/*"
              @change=${() => this.handleModalInputFileChange()}
            />
          </div>
          ${this.uploadImageObjectUrl ?
                html`
          <div id="icon-options">
            <img id="selected-icon" src=${this.uploadImageObjectUrl} />
            <div id="platforms-to-generate">
              <p>Select the platforms to generate images for:</p>
              ${platformsData.map((plat: PlatformInformation) =>
                    html`<sl-checkbox value=${plat.value} @sl-change=${(e: any) => this.handlePlatformChange(e, plat)} checked>${plat.label}</sl-checkbox>`)}
            </div>
            ${this.canWeGenerate ?
                        html`<sl-button @click=${this.generateZip} ?loading=${this.generatingZip}>${!this.zipGenerated ? html`Generate Zip` : html`Zip Generated!`}</sl-button>` :
                        html`<sl-tooltip content="Upload a new icon to generate another zip."><sl-button @click=${this.generateZip} disabled>Generate Zip</sl-button></sl-tooltip>`
                    }
          </div>` : html``}
        </div>
      </div>
    `;
    }

    renderIcons(): TemplateResult {
        if (this.srcList.length === 0) {
            return html`
        <div class="center_text"><sl-icon name="card-image"></sl-icon> There are no icons in your manifest</div>
      `;
        }

        return html`
      ${repeat(this.srcList, i => i.src, i => this.renderIcon(i))}
    `;
    }

    renderIcon(i: Icon): TemplateResult {
        const crossDomainFallbackUrl = `${this.imageProxyUrl}?imageUrl=${encodeURIComponent(i.src)}&analysisId=${this.analysisId}`;
        return html`
      <div class="icon-box">
        <img class="icon" src=${i.src} 
          alt="your app icon size ${i.sizes}" 
          decoding="async" 
          loading="lazy"
          onerror="this.onerror = null; this.src='${crossDomainFallbackUrl}';" />
        <p>${i.sizes}</p>
      </div>
    `;
    }
}