import { LitElement, css, html, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Manifest } from '../utils/interfaces';
import { validateSingleField, required_fields, singleFieldValidation } from '@pwabuilder/manifest-validation';
import { insertAfter, errorInTab } from '../utils/helpers';

const displayOptions: Array<string> =  ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
const defaultColor: string = "#000000";
let manifestInitialized: boolean = false;

let infoFields = ["name", "short_name", "description", "display", "background_color", "theme_color"];

@customElement('manifest-info-form')
export class ManifestInfoForm extends LitElement {

  @property({type: Object}) manifest: Manifest = {};

  @state() bgText: string = '';
  @state() themeText: string = '';

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
        flex-direction: column;
        gap: 10px;
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
      .color-section {
        display: flex;
        gap: .5em;
      }
      .color_field input[type="radio"]{
        height: 25px;
        width: fit-content;
        margin: 5px;
      }
      .color_selection {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      .color_field input[type="color"]{
        width: 75px;
        height: 25px;
        padding: 0;
        border-radius: 0;
        border: 1px solid #808080;
        outline: none;
      }
      .color_field input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
      }
      .color_field input[type="color"]:hover {
        cursor: pointer;
      }
      .color-section p {
        font-size: 16px;
        color: #808080;
      }
      sl-menu {
        width: 100%;
      }
      .switch_box {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .switch_box p {
        font-size: 16px;
      }
      sl-switch {
        --height: 22px;
      }

      .error-color-field{
        border: 1px solid #eb5757 !important;
      }

      .error::part(base){
        border-color: #eb5757;
        --sl-input-focus-ring-color: #eb575770;
        --sl-focus-ring-width: 3px;
        --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
        --sl-input-border-color-focus: #eb5757ac;
      }

      .error::part(control){
        border-color: #eb5757;
      }

      @media(max-width: 765px){
        .form-row:not(.color-row) {
          flex-direction: column;
          row-gap: 1em;
        }
        .form-row:not(.color-row) .form-field {
          width: 100%;
        }
      }

      @media(max-width: 600px){

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

        .color-row {
          gap: 1em;
          flex-direction: column;
        }

        .color-row .form-field {
          width: 100%;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  protected async updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    if(_changedProperties.has("manifest") && _changedProperties.get("manifest") && !manifestInitialized){
      manifestInitialized = true;
      this.initMissingColors();
      
      this.requestValidateAllFields();
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
    for(let i = 0; i < infoFields.length; i++){
      let field = infoFields[i];

      if(this.manifest[field]){
        const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);
        let passed = validation!.valid;

        // Validation Failed
        if(!passed){
          let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');

          // Structure of these two fields are different so they need their own logic.
          if(field === "theme_color" || field === "background_color"){

            // Remove exisiting error list if there is one.
            if(this.shadowRoot!.querySelector(`.${field}-error-div`)){
              let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
              error_div!.parentElement!.removeChild(error_div!);
            }

            // Update new errors list.
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
              insertAfter(div, input!.parentNode!.parentNode!.lastElementChild);
            }
            
            input!.classList.add("error-color-field");
          } else { // All other fields
            
            // Remove old errors
            if(this.shadowRoot!.querySelector(".error-div")){
              let error_div = this.shadowRoot!.querySelector(".error-div");
              error_div!.parentElement!.removeChild(error_div!);
            }
  
            // Update with new errors.
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

          input!.classList.add("error");

        }
      } else {
        /* This handles the case where the field is not in the manifest.. 
        we only want to make it red if its REQUIRED. */
        if(required_fields.includes(field)){
          let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');
          input!.classList.add("error");
          this.errorCount++;
        }
      }
    }
    this.validationPromise = undefined;
    if(this.errorCount == 0){
      this.dispatchEvent(errorInTab(false, "info"));
    } else {
      this.dispatchEvent(errorInTab(true, "info"));
    }
  }

  

  initMissingColors(){
    if(!this.manifest.theme_color){
      let manifestUpdated = new CustomEvent('manifestUpdated', {
        detail: {
            field: "theme_color",
            change: "#000000"
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(manifestUpdated);
    }
    if(!this.manifest.background_color){
      let manifestUpdated = new CustomEvent('manifestUpdated', {
        detail: {
            field: "background_color",
            change: "#000000"
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(manifestUpdated);
    }

  }

  async handleInputChange(event: InputEvent){
    if(this.validationPromise){
      await this.validationPromise;
    }

    const input = <HTMLInputElement | HTMLSelectElement>event.target;
    let updatedValue = input.value;
    const fieldName = input.dataset['field'];

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
      this.dispatchEvent(errorInTab(false, "info"));
    } else {
      this.dispatchEvent(errorInTab(true, "info"));
    }
  }

  handleColorSwitch(field: string){
    let input = (this.shadowRoot!.getElementById(field + "_picker") as HTMLInputElement);
    let color = input.value;
    let manifestUpdated = new CustomEvent('manifestUpdated', {
      detail: {
          field: field,
          change: color
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(manifestUpdated);

    if(input.classList.contains("error-color-field")){
      input.classList.toggle("error-color-field");
      this.errorCount--;
      let last = input!.parentNode!.parentNode!.lastElementChild;
      input!.parentNode!.parentNode!.removeChild(last!)
    }

    if(this.errorCount == 0){
      this.dispatchEvent(errorInTab(false, "info"));
    }
  }

  render() {
    return html`
      <div id="form-holder">
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Name</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/name"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the name option in your manifest.
                  </p>
                </a>
              </div>

              <p>(required)</p>
            </div>
            <p>The name of your app as displayed to the user</p>
            <sl-input placeholder="PWA Name" value=${this.manifest.name! || ""} data-field="name" @sl-change=${this.handleInputChange}></sl-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Short Name</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/short_name"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the short name option in your manifest.
                  </p>
                </a>
              </div>

              <p>(required)</p>
            </div>
            <p>Used in app launchers</p>
            <sl-input placeholder="PWA Short Name" value=${this.manifest.short_name! || ""} data-field="short_name" @sl-change=${this.handleInputChange}></sl-input>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3>Description</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/description"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the description option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>Used in app storefronts and install dialogs</p>
            <sl-input placeholder="PWA Description" value=${this.manifest.description! || ""} data-field="description" @sl-change=${this.handleInputChange}></sl-input>
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
            <sl-select placeholder="Select a Display" data-field="display" value=${this.manifest.display! || ""} @sl-change=${this.handleInputChange}>
              ${displayOptions.map((option: string) => html`<sl-menu-item value=${option}>${option}</sl-menu-item>`)}
            </sl-select>
          </div>
        </div>
        <div class="form-row color-row">
          <div class="form-field color_field">
            <div class="field-header">
              <div class="header-left">
                <h3>Background Color</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/background_color"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the background color option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>Select a Background color</p>
            <span class="color-holder">
              <div class="color-section">
                <input type="color" id="background_color_picker" value=${this.manifest.background_color! || defaultColor} data-field="background_color" @change=${() => this.handleColorSwitch("background_color")} /> 
                <p id="background_color_string" class="color_string">${this.manifest.background_color?.toLocaleUpperCase() || defaultColor}</p>
              </div>
            </span>
          </div>
          <div class="form-field color_field">
            <div class="field-header">
              <div class="header-left">
                <h3>Theme Color</h3>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color"
                  target="_blank"
                  rel="noopener"
                >
                  <img src="/assets/tooltip.svg" alt="info circle tooltip" />
                  <p class="toolTip">
                    Click for more info on the theme color option in your manifest.
                  </p>
                </a>
              </div>
            </div>
            <p>Select a Theme color</p>
            <span class="color-holder">
              <div class="color-section">
                <input type="color" id="theme_color_picker" value=${this.manifest.theme_color! || defaultColor} data-field="theme_color" @change=${() => this.handleColorSwitch("theme_color")} /> 
                <p id="theme_color_string" class="color_string">${this.manifest.theme_color?.toLocaleUpperCase() || defaultColor}</p>
              </div>
            </span>
          </div>
        </div>
      </div>
    `;
  }
}