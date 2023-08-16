import { LitElement, css, html, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Manifest } from '../utils/interfaces';
import { validateSingleField, required_fields, singleFieldValidation } from '@pwabuilder/manifest-validation';
import { insertAfter, errorInTab } from '../utils/helpers';
import {classMap} from 'lit/directives/class-map.js';

import "./manifest-field-tooltip";

const defaultColor: string = "#000000";
let manifestInitialized: boolean = false;

let infoFields = ["name", "short_name", "description", "background_color", "theme_color"];

@customElement('manifest-info-form')
export class ManifestInfoForm extends LitElement {

  @property({type: Object, hasChanged(value: Manifest, oldValue: Manifest) {
    if(value !== oldValue && value.name){
      manifestInitialized = true;
      return value !== oldValue;
    }
    return value !== oldValue;
  }}) manifest: Manifest = {};

  @property({type: String}) focusOn: string = "";

  @state() bgText: string = '';
  @state() themeText: string = '';
  @state() errorMap: any = {};

  private shouldValidateAllFields: boolean = true;
  private validationPromise: Promise<void> | undefined;
  

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
      sl-textarea::part(base),
      sl-option::part(base),
      sl-color-picker::part(base),
      sl-button::part(base) {
        --sl-input-font-size-medium: 16px;
        --sl-font-size-medium: 16px;
        --sl-input-height-medium: 3em;
        --sl-button-font-size-medium: 16px;
      }
      sl-input::part(base),
      sl-textarea::part(base){
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
      .field-desc {
        white-space: no-wrap;
        font-size: 14px;
        margin: 0;
        color: #717171;
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
      .form-field p {
        font-size: 14px;
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
        column-gap: 10px;
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
      .color-section {
        display: flex;
        gap: .5em;
        align-items: center;
        justify-content: flex-start;
      }

      .color-section p {
        font-size: 18px;
        color: #717171;
        display: flex;
        align-items: center;
        height: fit-content;
        margin: 0;
      }

      sl-color-picker {
        --grid-width: 315px;
        height: 25px;
      }

      sl-color-picker::part(trigger){
        border-radius: 0;
        height: 25px;
        width: 75px;
        display: flex;
      }
      sl-menu {
        width: 100%;
      }

      sl-option:focus-within::part(base) {
        color: #ffffff;
        background-color: #4F3FB6;
      }

      sl-option::part(base):hover{
        color: #ffffff;
        background-color: #4F3FB6;
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

      sl-input::part(input), sl-textarea::part(textarea){
        color: #717171;
      }

      .focus {
        color: #4f3fb6;
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
        sl-option::part(base) {
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
        .field-header a:after {
          content: "";
          position: absolute;
          left: -13px;
          top: -13px;
          z-index: -1;
          width: 40px;
          height: 40px;
          border-radius: 7px;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated(){
    
  }

  protected async updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {

    let field = this.shadowRoot!.querySelector('[data-field="' + this.focusOn + '"]');
    if(this.focusOn && field){
      setTimeout(() => {field!.scrollIntoView({block: "end", behavior: "smooth"})}, 500)
    }

    if(manifestInitialized){ // _changedProperties.has("manifest") && _changedProperties.get("manifest") && 
      manifestInitialized = false;
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

      if(field in this.manifest){
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
              this.errorMap[field] = 0;
              let div = document.createElement('div');
              div.classList.add(`${field}-error-div`);
              validation.errors.forEach((error: string) => {
                let p = document.createElement('p');
                p.innerText = error;
                p.style.color = "#eb5757";
                div.append(p);
                this.errorMap[field]++;
              });
              insertAfter(div, input!.parentNode!.parentNode!.lastElementChild);
            }
            
            input!.classList.add("error-color-field");
          } else { // All other fields
            
            // Remove old errors
            if(this.shadowRoot!.querySelector(`.${field}-error-div`)){
              let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
              error_div!.parentElement!.removeChild(error_div!);
            }
  
            // Update with new errors.
            if(validation.errors){
              this.errorMap[field] = 0;
              let div = document.createElement('div');
              div.classList.add(`${field}-error-div`);
              validation.errors.forEach((error: string) => {
                let p = document.createElement('p');
                p.innerText = error;
                p.style.color = "#eb5757";
                div.append(p);
                this.errorMap[field]++;
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

          if(this.shadowRoot!.querySelector(`.${field}-error-div`)){
            let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
            error_div!.parentElement!.removeChild(error_div!);
          }
          this.errorMap[field] = 0;
          let div = document.createElement('div');
          div.classList.add(`${field}-error-div`);
          let p = document.createElement('p');
          p.innerText = `${field} is required and is missing from your manifest.`;
          p.style.color = "#eb5757";
          div.append(p);
          this.errorMap[field]++;
          insertAfter(div, input!.parentNode!.lastElementChild);
          
        }
      }
    }
    this.validationPromise = undefined;
    if(Object.keys(this.errorMap).length === 0){
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
        delete this.errorMap[fieldName!];
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
        this.errorMap[fieldName!] = 0;
        validation.errors.forEach((error: string) => {
          let p = document.createElement('p');
          p.innerText = error;
          p.style.color = "#eb5757";
          div.append(p);
          this.errorMap[fieldName!]++;
        });
        insertAfter(div, input!.parentNode!.lastElementChild);
      }
      input.classList.add("error");
    }
    if(Object.keys(this.errorMap).length == 0){
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

    let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
      detail: {
          field: field,
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(fieldChangeAttempted);

    if(input.classList.contains("error-color-field")){
      input.classList.toggle("error-color-field");
      delete this.errorMap[field];
      let last = input!.parentNode!.parentNode!.lastElementChild;
      input!.parentNode!.parentNode!.removeChild(last!)
    }

    if(Object.keys(this.errorMap).length == 0){
      this.dispatchEvent(errorInTab(false, "info"));
    }
  }

  decideFocus(field: string){
    let decision = this.focusOn === field;
    return {focus: decision}
  }

  render() {
    return html`
      <div id="form-holder">
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("name"))}>Name</h3>
                <manifest-field-tooltip .field=${"name"}></manifest-field-tooltip>
              </div>

              <p class="field-desc">(required)</p>
            </div>
            <p class="field-desc">The name of your app as displayed to the user</p>
            <sl-input placeholder="PWA Name" value=${this.manifest.name! || ""} data-field="name" @sl-change=${this.handleInputChange}></sl-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("short_name"))}>Short Name</h3>
                <manifest-field-tooltip .field=${"short_name"}></manifest-field-tooltip>
              </div>

              <p class="field-desc">(required)</p>
            </div>
            <p class="field-desc">Used in app launchers</p>
            <sl-input placeholder="PWA Short Name" value=${this.manifest.short_name! || ""} data-field="short_name" @sl-change=${this.handleInputChange}></sl-input>
          </div>
        </div>

        <div class="form-row long">
          <div class="form-field">
            <div class="field-header">
            <div class="header-left">
              <h3 class=${classMap(this.decideFocus("id"))}>Id</h3>
              <manifest-field-tooltip .field=${"id"}></manifest-field-tooltip>
            </div>
            </div>
            <p class="field-desc">Unique identifier for your PWA that is seperate from fields that could change over time (like name or short name)</p>
            <sl-input 
              placeholder="id" 
              value=${this.manifest.id ?? ""} 
              data-field="id" 
              @sl-change=${this.handleInputChange}></sl-input>
          </div>
        </div>
        
        <div class="form-row long">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("description"))}>Description</h3>
                <manifest-field-tooltip .field=${"description"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">Used in app storefronts and install dialogs</p>
            <sl-textarea placeholder="PWA Description" value=${this.manifest.description! || ""} data-field="description" @sl-change=${this.handleInputChange} resize="none"></sl-textarea>
          </div>
        </div>
        <div class="form-row color-row">
          <div class="form-field color_field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("background_color"))}>Background Color</h3>
                <manifest-field-tooltip .field=${"background_color"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">Select a Background color</p>
            <span class="color-holder">
              <div class="color-section">
                <sl-color-picker id="background_color_picker" value=${this.manifest.background_color! || defaultColor} hoist=${true} data-field="background_color" @sl-change=${() => this.handleColorSwitch("background_color")}></sl-color-picker>
                <p id="background_color_string" class="color_string">${this.manifest.background_color?.toLocaleUpperCase() || defaultColor}</p>
              </div>
            </span>
          </div>
          <div class="form-field color_field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("theme_color"))}>Theme Color</h3>
                <manifest-field-tooltip .field=${"theme_color"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">Select a Theme color</p>
            <span class="color-holder">
              <div class="color-section">
                <sl-color-picker id="theme_color_picker" value=${this.manifest.theme_color! || defaultColor} hoist=${true} data-field="theme_color" @sl-change=${() => this.handleColorSwitch("theme_color")}></sl-color-picker>
                <p id="theme_color_string" class="color_string">${this.manifest.theme_color?.toLocaleUpperCase() || defaultColor}</p>
              </div>
            </span>
          </div>
        </div>
      </div>
    `;
  }
}