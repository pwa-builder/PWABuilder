import { LitElement, css, html, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Manifest } from '../utils/interfaces';
import { langCodes, languageCodes } from '../locales';
import { required_fields, validateSingleField, singleFieldValidation } from '@pwabuilder/manifest-validation';
import { errorInTab, insertAfter } from '../utils/helpers';

const settingsFields = ["start_url", "scope", "orientation", "lang", "dir", "display", "display_override"];
const displayOptions: Array<string> =  ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
const overrideOptions: Array<string> =  ['browser', 'fullscreen', 'minimal-ui', 'standalone', 'window-controls-overlay'];
let manifestInitialized: boolean = false;

@customElement('manifest-settings-form')
export class ManifestSettingsForm extends LitElement {

  @property({type: Object, hasChanged(value: Manifest, oldValue: Manifest) {
    if(value !== oldValue && value.name){
      manifestInitialized = true;
      return value !== oldValue;
    }
    return value !== oldValue;
  }}) manifest: Manifest = {};

  private shouldValidateAllFields: boolean = true;
  private validationPromise: Promise<void> | undefined;
  private errorCount: number = 0;

  @state() activeOverrideItems: string[] = [];

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
      sl-menu-item::part(base),
      sl-menu-label::part(base),
      sl-checkbox::part(base) {
        --sl-input-font-size-medium: 16px;
        --sl-font-size-medium: 16px;
        --sl-font-size-small: 14px;
        --sl-input-height-medium: 3em;
        --sl-toggle-size: 16px;
      }
      sl-input::part(base),
      sl-select::part(control),
      sl-details::part(base){
        background-color: #fbfbfb;
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
      .long .form-field {
        width: 100%;
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
      sl-menu {
        width: 100%;
      }

      .error::part(base){
        border-color: #eb5757;
        --sl-input-focus-ring-color: ##eb575770;
        --sl-focus-ring-width: 3px;
        --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
        --sl-input-border-color-focus: #eb5757ac;
      }

      .error::part(control){
        border-color: #eb5757;
      }

      #override-list {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
      }
      #override-item {
        display: flex;
        align-items: center;
        column-gap: 10px;
      }

      #override-item::part(label){
        font-size: 16px;
      }

      sl-details {
        width: 100%;
      }
      sl-details::part(base){
        width: 100%;
        max-height: fit-content
      }
      sl-details::part(header){
        padding: 10px 15px;
        font-size: 16px;
      }

      .menu-prefix {
        padding: 0 .5em;
        font-weight: 600;
        padding-top: 3px;
      }

      #override-options-grid{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: .25em .5em;
      }

      #override-options-grid sl-checkbox::part(label) {
        font-size: 16px;
        line-height: 16px;
        margin-left: .25em;
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
    if(manifestInitialized){
      manifestInitialized = false;
      this.requestValidateAllFields();
      this.initOverrideList();
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

    for(let i = 0; i < settingsFields.length; i++){
      let field = settingsFields[i];

      if(field in this.manifest){
        const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);
        let passed = validation!.valid;

        if(!passed){
          let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');
          input!.classList.add("error");

          if(this.shadowRoot!.querySelector(`.${field}-error-div`)){
            let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
            error_div!.parentElement!.removeChild(error_div!);
          }
          
          // update error list
          if(validation.errors){
            let div = document.createElement('div');
            div.classList.add(`${field}-error-div`);
            validation.errors.forEach((error: string) => {
              let p = document.createElement('p');
              p.innerText = error;
              p.style.color = "#eb5757";
              div.append(p);
              this.errorCount++;
            });
            insertAfter(div, input!.parentNode!.lastElementChild);
          }
        }
      } else {
        /* This handles the case where the field is not in the manifest.. 
        we only want to make it red if its REQUIRED. */
        if(required_fields.includes(field)){
          let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');
          input!.classList.add("error");

          if(this.shadowRoot!.querySelector(`.${field}-error-div`)){
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
    }

    this.validationPromise = undefined;
    if(this.errorCount == 0){
      this.dispatchEvent(errorInTab(false, "settings"));
    } else {
      this.dispatchEvent(errorInTab(true, "settings"));
    }
  }

  initOverrideList() {
    this.activeOverrideItems = [];

    if(this.manifest.display_override){
      this.manifest.display_override!.forEach((item: string) => {
        this.activeOverrideItems.push(item);
      });
    }

  }

  async handleInputChange(event: InputEvent){

    if(this.validationPromise){
      await this.validationPromise;
    }

    const input = <HTMLInputElement | HTMLSelectElement>event.target;
    let updatedValue = input.value;
    const fieldName = input.dataset['field'];

    let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
      detail: {
          field: fieldName,
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(fieldChangeAttempted);

    const validation: singleFieldValidation = await validateSingleField(fieldName!, updatedValue);
    let passed = validation!.valid;


    if(passed){
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
        this.errorCount--;
        let last = input!.parentNode!.lastElementChild
        input!.parentNode!.removeChild(last!)
      }
    } else {
      if(this.shadowRoot!.querySelector(`.${fieldName}-error-div`)){
        let error_div = this.shadowRoot!.querySelector(`.${fieldName}-error-div`);
        error_div!.parentElement!.removeChild(error_div!);
      }
      
      // update error list
      if(validation.errors){
        let div = document.createElement('div');
        div.classList.add(`${fieldName}-error-div`);
        validation.errors.forEach((error: string) => {
          let p = document.createElement('p');
          p.innerText = error;
          p.style.color = "#eb5757";
          div.append(p);
          this.errorCount++;
        });
        insertAfter(div, input!.parentNode!.lastElementChild);
      }
      
      input.classList.add("error");
    }
    if(this.errorCount == 0){
      this.dispatchEvent(errorInTab(false, "settings"));
    } else {
      this.dispatchEvent(errorInTab(true, "settings"));
    }
  }

  // temporary fix that helps with codes like en-US that we don't cover.
  parseLangCode(code: string){
    if(code){
      return code.split("-")[0];
    } 
    return "";
  }

  async toggleOverrideList(label: string, e: any){

    let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
      detail: {
          field: "display_override",
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(fieldChangeAttempted);

    let active = !e.path[0].checked;
    
    if(active){
      // remove from active list
      let remIndex = this.activeOverrideItems.indexOf(label);
      this.activeOverrideItems.splice(remIndex, 1);

    } else {
      // push to active list
      this.activeOverrideItems.push(label);
    }

    this.validatePlatformList("display_override", this.activeOverrideItems!);

    this.requestUpdate();
  }

  async validatePlatformList(field: string, updatedValue: any[]){

    if(this.validationPromise){
      await this.validationPromise;
    }
    
    let input = this.shadowRoot!.querySelector(`[data-field=${field}]`);
    const validation: singleFieldValidation = await validateSingleField(field, updatedValue);
    let passed = validation!.valid;

    if(passed){

      let manifestUpdated = new CustomEvent('manifestUpdated', {
        detail: {
            field: field,
            change: [...updatedValue]
        },
        bubbles: true,
        composed: true
      });

      this.dispatchEvent(manifestUpdated);

      if(input!.classList.contains("error")){
        input!.classList.toggle("error");
        this.errorCount--;
        let last = input!.parentNode!.lastElementChild;
        last!.parentNode!.removeChild(last!);
      } 
    } else {
      if(this.shadowRoot!.querySelector(`.${field}-error-div`)){
        let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
        error_div!.parentElement!.removeChild(error_div!);
      }
      
      // update error list
      if(validation.errors){
        let div = document.createElement('div');
        div.classList.add(`${field}-error-div`);
        validation.errors.forEach((error: string) => {
          let p = document.createElement('p');
          p.innerText = error;
          p.style.color = "#eb5757";
          div.append(p);
          this.errorCount++;
        });
        insertAfter(div, input!.parentNode!.lastElementChild);
      }

      input!.classList.add("error");
    }
    if(this.errorCount == 0){
      this.dispatchEvent(errorInTab(false, "platform"));
    } else {
      this.dispatchEvent(errorInTab(true, "platform"));
    }
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
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the start url option in your manifest.
                  </p>
                </a>
              </div>

              <p>(required)</p>
            </div>
            <p>The URL that loads when your PWA starts</p>
            <sl-input placeholder="PWA Start URL" value=${this.manifest.start_url! || ""} data-field="start_url" @sl-change=${this.handleInputChange}></sl-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Dir</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/dir"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the dir option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>The text direction of your PWA</p>
            <sl-select placeholder="Select a Direction" data-field="dir" hoist=${true} value=${this.manifest.dir! || ""} @sl-change=${this.handleInputChange}>
              ${dirOptions.map((option: string) => html`<sl-menu-item value=${option}>${option}</sl-menu-item>`)}
            </sl-select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Scope</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/scope"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the scope option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>Which URLs can load within your app</p>
            <sl-input placeholder="PWA Scope" data-field="scope" value=${this.manifest.scope! || ""} @sl-change=${this.handleInputChange}></sl-input>
          </div>
          
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Language</h3>
                <a
                  href="https://www.w3.org/TR/appmanifest/#lang-member"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the language option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>The primary language of your app</p>
            <sl-select placeholder="Select a Language" data-field="lang" hoist=${true} value=${this.parseLangCode(this.manifest.lang!) || ""} @sl-change=${this.handleInputChange}>
              ${languageCodes.map((lang: langCodes) => html`<sl-menu-item value=${lang.code}>${lang.formatted}</sl-menu-item>`)}
            </sl-select>
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
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the orientaiton option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>The default screen orientation of your app</p>
            <sl-select placeholder="Select an Orientation" data-field="orientation" hoist=${true} value=${this.manifest.orientation! || ""} @sl-change=${this.handleInputChange}>
              ${orientationOptions.map((option: string) => html`<sl-menu-item value=${option}>${option}</sl-menu-item>`)}
            </sl-select>
          </div>
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Display</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/display"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the display option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>The appearance of your app window</p>
            <sl-select placeholder="Select a Display" data-field="display" hoist=${true} value=${this.manifest.display! || ""} @sl-change=${this.handleInputChange}>
              ${displayOptions.map((option: string) => html`<sl-menu-item value=${option}>${option}</sl-menu-item>`)}
            </sl-select>
          </div>
        </div>
        <div class="form-row long">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Display Override</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/display_override"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the display override option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>Used to determine the preferred display mode</p>
            <div id="override-list">
            <sl-details summary="Click to edit display override" data-field="display_override">
              <sl-menu>
                <sl-menu-label>Active Override Items</sl-menu-label>
                ${this.activeOverrideItems.length != 0 ?
                this.activeOverrideItems.map((item: string, index: number) =>
                  html`
                    <sl-menu-item class="override-item" value=${item} @click=${(e: CustomEvent) => this.toggleOverrideList(item, e)}>
                      <p slot="prefix" class="menu-prefix">${index + 1}</p>
                      ${item}
                    </sl-menu-item>
                  `) :
                  html`<sl-menu-item disabled>-</sl-menu-item>`
                }
                <sl-divider></sl-divider>
                <div id="override-options-grid">
                  ${overrideOptions.map((item: string) =>
                      html`
                        <sl-checkbox class="override-item" value=${item} @sl-change=${(e: CustomEvent) => this.toggleOverrideList(item, e)} ?checked=${this.activeOverrideItems.includes(item)}>
                          ${item}
                        </sl-checkbox>
                      `)}
                  </div>
              </sl-menu>
            </sl-details>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

const orientationOptions: Array<string> =  ['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary', 'landscape-primary', 'landscape-secondary'];
const dirOptions: Array<string> = ['auto', 'ltr', 'rtl'];