import { LitElement, css, html, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Manifest } from '../utils/interfaces';
import { langCodes, languageCodes } from '../locales';
import { required_fields, validateSingleField } from '@pwabuilder/manifest-validation';

const settingsFields = ["start_url", "scope", "orientation", "lang", "dir"];
let manifestInitialized: boolean = false;

@customElement('manifest-settings-form')
export class ManifestSettingsForm extends LitElement {

  @property({type: Object}) manifest: Manifest = {};

  static get styles() {
    return css`

      :host {
        --sl-focus-ring-width: 3px;
        --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) #4f3fb670;
        --sl-input-border-color-focus: #4F3FB6ac;
      }

      sl-input::part(base),
      sl-select::part(control),
      sl-menu-item::part(base) {
        --sl-input-font-size-medium: 16px;
        --sl-font-size-medium: 16px;
        --sl-input-height-medium: 3em;
      }
      #form-holder {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
      }
      .form-row {
        display: flex;
        column-gap: 1em;
      }
      .form-row h3 {
        font-size: 18px;
        margin: 0;
      }
      .form-row p {
        font-size: 14px;
        margin: 0;
      }
      .form-field {
        width: 50%;
        row-gap: .25em;
        display: flex;
        flex-direction: column;
      }
      .field-header{
        display: flex;
        align-items: center;
        justify-content: space-between;
        column-gap: 5px;
      }

      .header-left{
        display: flex;
        align-items: center;
        column-gap: 5px;
      }
      .color_field {
        display: flex;
        flex-direction: column;
      }
      .color-holder {
        display: flex;
        align-items: center;
        column-gap: 10px;
      }
      .toolTip {
        visibility: hidden;
        width: 200px;
        background-color: #ffffff;
        color: black;
        text-align: center;
        border-radius: 6px;
        padding: .75em;
        /* Position the tooltip */
        position: absolute;
        top: 10px;
        left: 10px;
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
      sl-menu {
        width: 100%;
      }

      .error::part(base){
        border-color: #eb5757;

        --sl-focus-ring-width: 3px;
        --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) #eb575770;
        --sl-input-border-color-focus: #eb5757ac;
      }

      .error::part(control){
        border-color: #eb5757;
      }

      @media(max-width: 765px){
        .form-row {
          flex-direction: column;
          row-gap: 1em;
        }
        .form-field {
          width: 100%;
        }
      }

      @media(max-width: 480px){
        sl-input::part(base),
        sl-select::part(control),
        sl-menu-item::part(base) {
          --sl-input-font-size-medium: 14px;
          --sl-font-size-medium: 14px;
          --sl-input-height-medium: 2.5em;
        }

        .form-row p {
          font-size: 12px;
        }

        .form-row h3 {
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
    }
  }

  async validateAllFields(){
    for(let i = 0; i < settingsFields.length; i++){
      let field = settingsFields[i];

      if(this.manifest[field]){
        const validation = await validateSingleField(field, this.manifest[field]);
        //console.log(field, validation);
        if(!validation){
          let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');
          input!.classList.add("error");
        }
      } else {
        /* This handles the case where the field is not in the manifest.. 
        we only want to make it red if its REQUIRED. */
        if(required_fields.includes(field)){
          let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');
          input!.classList.add("error");
        }
      }
    }
  }

  async handleInputChange(event: InputEvent){

    const input = <HTMLInputElement | HTMLSelectElement>event.target;
    let updatedValue = input.value;
    const fieldName = input.dataset['field'];

    const validation = await validateSingleField(fieldName!, updatedValue);


    if(validation){
      // Since we already validated, we only send valid updates.
      let manifestUpdated = new CustomEvent('manifestUpdated', {
        detail: {
            field: fieldName,
            change: updatedValue
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(manifestUpdated);

      if(input.classList.contains("error")){
        input.classList.toggle("error");
      }
    } else {
      // toggle error class to display error.
      input.classList.toggle("error");
    }
  }

  // temporary fix that helps with codes like en-US that we don't cover.
  parseLangCode(code: string){
    if(code){
      return code.split("-")[0];
    } 
    return "";
  }

  render() {
    return html`
      <div id="form-holder">
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Start URL</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/start_url"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/new/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the start url option in your manifest.
                  </p>
                </a>
              </div>

              <p>(required)</p>
            </div>
            <p>The relative URL that loads when your app starts</p>
            <sl-input placeholder="PWA Start URL" .value=${this.manifest.start_url! || ""} data-field="start_url" @sl-change=${this.handleInputChange}></sl-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Scope</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/scope"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/new/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the scope option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>Which URLs can load within your app</p>
            <sl-input placeholder="PWA Scope" data-field="scope" .value=${this.manifest.scope! || ""} @sl-change=${this.handleInputChange}></sl-input>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Orientation</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/new/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the orientaiton option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>The default screen orientation of your app</p>
            <sl-select placeholder="Select an Orientation" data-field="orientation" .value=${this.manifest.orientation! || ""} @sl-change=${this.handleInputChange}>
              ${orientationOptions.map((option: string) => html`<sl-menu-item value=${option}>${option}</sl-menu-item>`)}
            </sl-select>
          </div>
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Language</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/language"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/new/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the language option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>The primary language of your app</p>
            <sl-select placeholder="Select a Language" data-field="lang" .value=${this.parseLangCode(this.manifest.lang!) || ""} @sl-change=${this.handleInputChange}>
              ${languageCodes.map((lang: langCodes) => html`<sl-menu-item value=${lang.code}>${lang.formatted}</sl-menu-item>`)}
            </sl-select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Dir</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/dir"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/new/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the dir option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>The base direction in which to display direction-capable members of the manifest</p>
            <sl-select placeholder="Select a Direction" data-field="dir" .value=${this.manifest.dir! || ""} @sl-change=${this.handleInputChange}>
              ${dirOptions.map((option: string) => html`<sl-menu-item value=${option}>${option}</sl-menu-item>`)}
            </sl-select>
          </div>
        </div>
      </div>
    `;
  }
}

const orientationOptions: Array<string> =  ['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary', 'landscape-primary', 'landscape-secondary'];
const dirOptions: Array<string> = ['auto', 'ltr', 'rtl'];