import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  Icon,
  Lazy,
  Manifest,
} from '../utils/interfaces';
import { resolveUrl } from '../utils/urls';

import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.73/dist/components/checkbox/checkbox.js';

const baseUrl = 'https://appimagegenerator-prod.azurewebsites.net';

interface PlatformInformation {
  label: string;
  value: string;
}

interface ImageGeneratorServicePostResponse {
  Message: string;
  Uri: string;
}

const platformsData: Array<PlatformInformation> = [
  { label: "Windows 11", value: 'windows11' },
  { label: "Android", value: 'android' },
  { label: "iOS", value: 'ios' }
];

@customElement('manifest-icons-form')
export class ManifestIconsForm extends LitElement {

  @property({type: Object}) manifest: Manifest = {};
  @property({type: String}) manifestURL: string = "";

  // Icon state vars
  @state() uploadSelectedImageFile: Lazy<File>;
  @state() canWeGenerate = true;
  @state() uploadImageObjectUrl: string = '';
  @state() errored: boolean = false;
  @state() selectedPlatforms: PlatformInformation[] = [...platformsData];

  static get styles() {
    return css`
      #form-holder {
        display: flex;
        flex-direction: column;
        row-gap: 1.5em;
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
        width: 200px;
        background-color: #f8f8f8;
        color: black;
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        /* Position the tooltip */
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1;
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
      .image-buttons {
        border: none;
        padding: 10px 0;
        background-color: white;
        border-radius: 44px;
        box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
        width: 50%;
        font-weight: bold;
      }
      .image-buttons:hover {
        cursor: pointer;
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
      #icon-options{
        display: flex;
        column-gap: 10px;
        align-items: flex-start;
      }
      #selected-icon {
        max-width: 115px;
      }
      #platforms-to-generate {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
      }
    `;
  }

  constructor() {
    super();
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

  enterFileSystem(){
    this.shadowRoot!.getElementById('input-file')?.click();
  }

  async handleModalInputFileChange() {
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

  iconSrcListParse() {

    if (!this.manifest && !this.manifestURL) {
      return [];
    }

    let screenshotSrcList: any[] = [];

    this.manifest!.icons?.forEach((icon: any) => {
      let iconURL: string = this.handleImageUrl(icon) || '';
      if(iconURL){
        screenshotSrcList.push({src: (iconURL as string), size: icon.sizes});
      }
    })

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

  handlePlatformChange(e: any, platform: PlatformInformation){
    const checkbox = e.path[0];
    if(checkbox.checked){
      this.selectedPlatforms.push(platform);
    } else {
      let removeIndex = this.selectedPlatforms.indexOf(platform);
      this.selectedPlatforms.splice(removeIndex, 1);
    }
    this.canWeGenerate = this.selectedPlatforms.length != 0;
  }

  async generateZip() {

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
      const colorValue = 'transparent' ;
      const paddingValue = .3;

      form.append('fileName', file as Blob);
      form.append('padding', String(paddingValue));
      form.append('color', colorValue);

      this.selectedPlatforms.forEach((plat: PlatformInformation) => form.append('platform', plat.value));

      const res = await fetch(`${baseUrl}/api/image`, {
        method: 'POST',
        body: form,
      });

      const postRes =
        (await res.json()) as unknown as ImageGeneratorServicePostResponse;

      if (postRes.Message) {
        throw new Error('Error from service: ' + postRes.Message);
      }

      this.downloadZip(`${baseUrl}${postRes.Uri}`);
    } catch (e) {
      console.error(e);
      //this.error = (e as Error).message;
    }
  }

  downloadZip(zipUrl: string) {
    const hyperlink = document.createElement("a");
    hyperlink.href = zipUrl;
    hyperlink.download = "";
    hyperlink.click();
  }

  render() {
    return html`
      <div id="form-holder">
        <div class="form-field">
          <div class="field-header">
            <h3>*App Icons</h3>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/Manifest/icons"
              target="_blank"
              rel="noopener"
            >
              <ion-icon name="information-circle-outline"></ion-icon>
              <p class="toolTip">
                Click for more info on the icons option in your manifest.
              </p>
            </a>
          </div>
          <p>Below are the current Icons in your apps Manifest</p>
          <div class="icon-gallery">
            ${this.iconSrcListParse().map((img: any) => html`<div class="icon-box"><img class="icon" src=${img.src}  alt="your app icon size ${img.size}" decoding="async" loading="lazy" /> <p>${img.size}</p></div>`)}
          </div>

          <h3>Generate Icons</h3>
          <p>We suggest at least one image 512x512 or larger.</p>
          <div id="icon-section">
            <button class="image-buttons" @click=${() => this.enterFileSystem()} >Upload</button>
            <input
              id="input-file"
              class="file-input hidden"
              type="file"
              aria-hidden="true"
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
              html`<button @click=${this.generateZip}>Generate Zip</button>` :
              html`<button @click=${this.generateZip} disabled>Generate Zip</button>`
            }
          </div>` : html``}
        </div>
      </div>
    `;
  }
}
