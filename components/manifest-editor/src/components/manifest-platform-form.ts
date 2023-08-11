import { LitElement, css, html, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Manifest, ProtocolHandler, RelatedApplication, ShortcutItem } from '../utils/interfaces';
import { standardCategories } from '../locales/categories';
import { singleFieldValidation, validateSingleField } from '@pwabuilder/manifest-validation';
import { errorInTab, insertAfter } from '../utils/helpers';
import {classMap} from 'lit/directives/class-map.js';
import "./manifest-field-tooltip";

const platformOptions: Array<String> = ["windows", "chrome_web_store", "play", "itunes", "webapp", "f-droid", "amazon"]
const platformText: Array<String> = ["Windows Store", "Google Chrome Web Store", "Google Play Store", "Apple App Store", "Web apps", "F-droid", "Amazon App Store"]

// How to handle categories field?
const platformFields = ["iarc_rating_id", "prefer_related_applications", "related_applications", "shortcuts", "protocol_handlers", "categories", "edge_side_panel"];
let manifestInitialized: boolean = false;
let fieldsValidated: boolean = false;



@customElement('manifest-platform-form')
export class ManifestPlatformForm extends LitElement {

  @property({type: Object, hasChanged(value: Manifest, oldValue: Manifest) {
    if(value !== oldValue && value.name){
      manifestInitialized = true;
      return value !== oldValue;
    }
    return value !== oldValue;
  }}) manifest: Manifest = {};

  @property({type: String}) focusOn: string = "";

  @state() shortcutHTML: TemplateResult[] = [];
  @state() protocolHTML: TemplateResult[] = [];
  @state() relatedAppsHTML: TemplateResult[] = [];
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
      sl-select::part(form-control),
      sl-option::part(base),
      sl-button::part(base),
      sl-checkbox::part(base),
      sl-checkbox::part(control),
      sl-details::part(base) {
        --sl-input-font-size-medium: 16px;
        --sl-button-font-size-medium: 12px;
        --sl-font-size-medium: 16px;
        --sl-input-height-medium: 3em;
        --sl-toggle-size: 16px;
        --sl-toggle-size-small: 16px;
        --sl-input-font-size-small: 16px;
      }
      sl-details::part(base), sl-select::part(combobox), sl-input::part(base){
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
      .form-row p:not(.toolTip) {
        font-size: 14px;
        margin: 0;
        color: #717171;
      }
      sl-input::part(input), 
      sl-select::part(display-input), 
      sl-details::part(summary){
        color: #717171;
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
        column-gap: 10px;
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
      .special-tip {
        left: -120px;
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
      sl-option:focus-within::part(base) {
        color: #ffffff;
        background-color: #4F3FB6;
      }

      sl-option::part(base):hover{
        color: #ffffff;
        background-color: #4F3FB6;
      }
      #cat-field {
        display: grid;
        grid-template-rows: repeat(7, auto);
        grid-auto-flow: column;
        column-gap: 10px;
        padding: 0 1em 1em 1em;
        background: white;
      }
      #cat-field.error {
        border: 1px solid #eb5757;
        border-radius: 5px;
        padding: 1em;
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

      sl-details:focus {
        outline: 5px solid var(--sl-input-focus-ring-color);
        border-radius: 5px;
      }

      sl-details.error:focus {
        outline: 5px solid #eb575770;
        border-radius: 5px;
      }

      .field-holder {
        display: flex;
        flex-direction: column;
      }
      .shortcut-header{
        padding: .5em 0;
        margin: 0;
        font-size: 16px;
      }
      sl-icon-button::part(base){
        padding: 0;
      }
      .field-details::part(content){
        display: flex;
        flex-direction: column;
        row-gap: 10px;
      }
      .field-holder sl-button {
        width: 50%;
        align-self: flex-end;
      }
      .long-items {
        display: flex;
        flex-direction: column;
        row-gap: 10px;
      }
      .long-items h3 {
        font-size: 18px;
        margin: 0;
      }
      .long-items p:not(.toolTip){
        font-size: 14px;
        margin: 0;
        color: #717171;
      }
      .long-items .form-field {
        width: 100%;
      }
      .items-holder {
        display: flex;
        align-items: flex-start;
        column-gap: 10px;
        overflow-x: scroll;
        padding-bottom: 10px;
      }
      .editable {
        display: flex;
        align-items:center;
        justify-content: space-between;
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

      sl-menu-label::part(base) {
        font-size: 16px;
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

      @media(max-width: 765px){
        .form-row {
          flex-direction: column;
          row-gap: 1em;
        }
        .form-field {
          width: 100%;
        }
        #cat-field {
          grid-template-columns: repeat(4, auto);
          grid-auto-flow: unset;
        }
        .special-tip {
          left: -25px;
        }
      }

      @media(max-width: 650px){
        #cat-field {
          grid-template-columns: repeat(3, auto);
        }
      }

      @media(max-width: 480px){
        sl-input::part(base),
        sl-select::part(form-control),
        sl-option::part(base),
        sl-button::part(base),
        sl-checkbox::part(base),
        sl-checkbox::part(control) {
          --sl-input-font-size-medium: 14px;
          --sl-font-size-medium: 14px;
          --sl-input-height-medium: 2.5em;
          --sl-button-font-size-medium: 10px;
          --sl-toggle-size: 14px;
        }

        sl-details::part(header) {
          padding: 5px 10px;
          font-size: 14px;
        }

        .form-row p, .long-items p {
          font-size: 12px;
        }

        .form-row h3, .long-items h3 {
          font-size: 16px;
        }

        #cat-field {
          grid-template-columns: repeat(2, auto);
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

  firstUpdated(){
    
  }

  protected async updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {

    let field = this.shadowRoot!.querySelector('[data-field="' + this.focusOn + '"]');
    if(this.focusOn && field){
      setTimeout(() => {field!.scrollIntoView({block: "end", behavior: "smooth"})}, 500)
    }

    /* The first two checks are to reset the view with the most up to date manifest fields.
     The last check prevents the dropdown selector in related apps from causing everything
     to reset when it changes. It triggers an update event which would cause all of this to
     run again. Its true purpose is to keep the view aligned with the manifest. */
     
    if(manifestInitialized){
      manifestInitialized = false;
      if(!fieldsValidated){
        this.requestValidateAllFields();
        fieldsValidated = true;
      }
      //this.reset();
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
    for(let i = 0; i < platformFields.length; i++){
      let field = platformFields[i];

      if(this.manifest[field]){
        const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);
        let passed = validation!.valid;
        let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');

        if(!passed){
          // Remove old errors
          if(this.shadowRoot!.querySelector(`.${field}-error-div`)){
            let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
            error_div!.parentElement!.removeChild(error_div!);
          }

          // update error list with new errors
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

          // add red outline
          input!.classList.add("error");
        }
      }
    }
    
    this.validationPromise = undefined;
    if(Object.keys(this.errorMap).length === 0){
      this.dispatchEvent(errorInTab(false, "platform"));
    } else {
      this.dispatchEvent(errorInTab(true, "platform"));
    }
  }

  reset() {
    this.initCatGrid();
    this.requestUpdate();
    fieldsValidated = false;
  }

  initCatGrid(){
    if(this.manifest.categories){
      let checks = this.shadowRoot!.querySelectorAll(".cat-check");
      checks.forEach((cat: any) => {
          if(this.manifest.categories!.includes(cat.value)){
              cat.checked = true;
          } else {
              cat.checked = false;
          }
      });
    }
  }
  
dispatchUpdateEvent(field: string, change: any, removal: boolean = false){
  let manifestUpdated = new CustomEvent('manifestUpdated', {
    detail: {
        field: field,
        change: change,
        removal: removal
    },
    bubbles: true,
    composed: true
  });
  this.dispatchEvent(manifestUpdated);

  if(removal){
    let input = this.shadowRoot!.querySelector(`[data-field=${field}]`);
    if(input!.classList.contains("error")){
      input!.classList.toggle("error");
      delete this.errorMap[field!];
      let last = input!.parentNode!.lastElementChild
      input!.parentNode!.removeChild(last!)
    }
    if(Object.keys(this.errorMap).length == 0){
      this.dispatchEvent(errorInTab(false, "platform"));
    } 
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

    if(fieldName === "prefer_related_applications"){
        updatedValue = JSON.parse(updatedValue);
    }

    // special situation for edge side panel
    // since its value is an object we have to validate an object not a string
    let objectValue = {};
    let useOV = false;
    if(fieldName === "edge_side_panel"){
      if(updatedValue === "") {
        this.dispatchUpdateEvent(fieldName, 0, true)
        return;
      }
      objectValue = {"preferred_width": parseInt(updatedValue)};
      useOV = true;
    }

    const validation: singleFieldValidation = await validateSingleField(fieldName!, useOV ? objectValue : updatedValue)
    let passed = validation!.valid;

    if(passed){
      // Since we already validated, we only send valid updates.
      this.dispatchUpdateEvent(fieldName!, useOV ? objectValue : updatedValue, false)

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
        this.errorMap[fieldName!] = 0;
        let div = document.createElement('div');
        div.classList.add(`${fieldName}-error-div`);
        validation.errors.forEach((error: string) => {
          let p = document.createElement('p');
          p.innerText = error;
          p.style.color = "#eb5757";
          div.append(p);
          this.errorMap[fieldName!]++;
        });
        insertAfter(div, input!.parentNode!.lastElementChild);
      }

      // toggle error class to display error.
      input.classList.add("error");
    }

    if(Object.keys(this.errorMap).length == 0){
      this.dispatchEvent(errorInTab(false, "platform"));
    } else {
      this.dispatchEvent(errorInTab(true, "platform"));
    }
  }

  addFieldToHTML(field: string){
    if(field === "shortcuts"){
      this.shortcutHTML.push(
        html`
          <form @submit=${(e: any) => this.addShortcutToManifest(e)} class="field-holder">
            <h4 class="shortcut-header">Shortcut #${this.manifest.shortcuts ? this.manifest.shortcuts.length + 1 : 1}</h4>
            <sl-input class="field-input" name="name" placeholder="Shortcut name" /></sl-input>
            <sl-input class="field-input" name="url" placeholder="Shortcut url" /></sl-input>
            <sl-input class="field-input" name="desc" placeholder="Shortcut description" /></sl-input>
            <sl-button type="submit">Add to Manifest</sl-button>
          </form>
        `
      );
    } else if(field === "protocol_handlers"){
      this.protocolHTML.push(
        html`
          <form class="field-holder" @submit=${(e: any) => this.addProtocolToManifest(e)}>
            <h4 class="shortcut-header">Protocol Handler #${this.manifest.protocol_handlers ? this.manifest.protocol_handlers.length + 1 : 1}</h4>
            <sl-input class="field-input" name="protocol" placeholder="Protocol" /></sl-input>
            <sl-input class="field-input" name="url" placeholder="URL" /></sl-input>
            <sl-button type="submit">Add to Manifest</sl-button>
          </form>
        `
      );
    } else {
      this.relatedAppsHTML!.push(
        html`
          <form class="field-holder" @submit=${(e: any) => this.addRelatedAppToManifest(e)}>
            <h4 class="shortcut-header">Related App #${this.manifest.related_applications ? this.manifest.related_applications.length + 1 : 1}</h4>
            <sl-select placeholder="Select a Platform" hoist=${true} placement="bottom">
              ${platformOptions.map((_, i: number) => html`<sl-option value=${platformOptions[i]}>${platformText[i]}</sl-option>` )}
            </sl-select>
            <sl-input class="field-input" name="url" placeholder="App URL" /></sl-input>
            <sl-input class="field-input" name="id" placeholder="App ID" /></sl-input>
            <sl-button type="submit">Add to Manifest</sl-button>
          </form>
        `
      );
    }
    this.requestUpdate();
  }

  addShortcutToManifest(e: any){
    e.preventDefault();

    let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
      detail: {
          field: "shortcuts",
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(fieldChangeAttempted);

    this.shortcutHTML = [];
    const inputs = [...e.target.querySelectorAll('sl-input')];

    this.updateShortcutsInManifest(inputs, true);
  }

  async updateShortcutsInManifest(inputs: any, push: boolean, removal: boolean = false){
    if(push){
      let name = inputs.filter((input: any) => input.name === "name")[0].value;
      let url = inputs.filter((input: any) => input.name === "url")[0].value;
      let desc = inputs.filter((input: any) => input.name === "desc")[0].value;

      let scObject: ShortcutItem;

      scObject = {
        name: name,
        url: url,
        description: desc
      }
      
      if(!this.manifest.shortcuts){
        this.manifest.shortcuts = []
      }

      this.manifest.shortcuts?.push(scObject)
      this.validatePlatformList("shortcuts", this.manifest.shortcuts!, removal);
    }
    if(this.manifest.shortcuts!.length == 0 && !push){
      this.dispatchUpdateEvent("shortcuts", 0, true)
    }
  }


  addProtocolToManifest(e: any){
    e.preventDefault();

    let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
      detail: {
          field: "protocol_handlers",
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(fieldChangeAttempted);

    this.protocolHTML = [];
    const inputs = [...e.target.querySelectorAll('sl-input')];

    this.updateProtocolsInManifest(inputs, true);
  }

  async updateProtocolsInManifest(inputs: any, push: boolean, removal: boolean = false){

    if(push){
      let protocol: string = inputs.filter((input: any) => input.name === "protocol")[0].value;
      let url: string= inputs.filter((input: any) => input.name === "url")[0].value;
  
      const pObject: ProtocolHandler  = {
        protocol: protocol,
        url: url
      }
  
      if(!this.manifest.protocol_handlers){
        this.manifest.protocol_handlers = []
      }
  
      this.manifest.protocol_handlers?.push(pObject);
      this.validatePlatformList("protocol_handlers", this.manifest.protocol_handlers!, removal);
    }

    if(this.manifest.protocol_handlers!.length == 0 && !push){
      this.dispatchUpdateEvent("protocol_handlers", 0, true)
    }

  }

  addRelatedAppToManifest(e: any){
    e.preventDefault();
    this.relatedAppsHTML = [];
    const inputs = [...e.target.querySelectorAll('sl-input')];
    const select = e.target.querySelector('sl-select');

    let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
      detail: {
          field: "related_applications",
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(fieldChangeAttempted);

    this.updateRelatedAppsInManifest(inputs, select, true);

    
  }

  async updateRelatedAppsInManifest(inputs: any, select: any, push: boolean, removal: boolean = false){
    
    if(push){
      let platform: string = select.value;
      let url: string = inputs.filter((input: any) => input.name === "url")[0].value;
      let id: string = inputs.filter((input: any) => input.name === "id")[0].value;
  
      const appObject: RelatedApplication  = {
        platform: platform,
        url: url,
        id: id
      }
      
      if(!this.manifest.related_applications){
        this.manifest.related_applications = []
      }

      this.manifest.related_applications?.push(appObject);
      
      this.validatePlatformList("related_applications", this.manifest.related_applications!, removal);
    }

    if(this.manifest.related_applications!.length == 0 && !push){
      this.dispatchUpdateEvent("related_applications", 0, true)
    }
  }

  updateCategories(){
    let categories: string[] = [];
    let checks = this.shadowRoot!.querySelectorAll(".cat-check");
    checks.forEach((cat: any) => {
        if(cat.checked){
            categories.push(cat.value);
        }
    });

    let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
      detail: {
          field: "categories",
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(fieldChangeAttempted);

    this.validatePlatformList("categories", categories);
  }

  async validatePlatformList(field: string, updatedValue: any[], removal: boolean = false){
    if(this.validationPromise){
      await this.validationPromise;
    }
    
    let input = this.shadowRoot!.querySelector(`[data-field=${field}]`);
    const validation: singleFieldValidation = await validateSingleField(field, updatedValue);
    let passed = validation!.valid;


    if(passed || removal){
      this.dispatchUpdateEvent(field!, [...updatedValue])
    }

    if(passed){

      if(input!.classList.contains("error")){
        input!.classList.toggle("error");
        delete this.errorMap[field];
        let last = input!.parentNode!.lastElementChild;
        last!.parentNode!.removeChild(last!);
      } 
      this.requestUpdate();

      if(this.errorMap.length === 0){
        this.dispatchEvent(errorInTab(false, "platform"));
      } else {
        this.dispatchEvent(errorInTab(true, "platform"));
      }

    } else {
      if(this.shadowRoot!.querySelector(`.${field}-error-div`)){
        let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
        error_div!.parentElement!.removeChild(error_div!);
      }
      
      // update error list
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

      input!.classList.add("error");
      
    }

    (Object.keys(this.errorMap).length);
    if(Object.keys(this.errorMap).length == 0){
      this.dispatchEvent(errorInTab(false, "platform"));
    } else {
      this.dispatchEvent(errorInTab(true, "platform"));
    }
    
    return passed;
  }


  async removeData(tag: string){
    const split_tag = tag.split(" ");
    const field = split_tag[0]
    const index = parseInt(split_tag[1]);

    if(field === "shortcuts"){
      this.manifest.shortcuts = this.manifest.shortcuts!.filter((_item: any, i: number) => i != index );
      this.updateShortcutsInManifest([], false, true);
    } else if(field === "protocol"){
      this.manifest.protocol_handlers = this.manifest.protocol_handlers!.filter((_item: any, i: number) => i != index);
      this.updateProtocolsInManifest([], false, true);
    } else if(field === "related") {
      this.manifest.related_applications = this.manifest.related_applications!.filter((_item: any, i: number) => i != index);
      this.updateRelatedAppsInManifest([], [], false, true);
    } else {
      return console.error(`${field} not an accepted value for this function`);
    }
  }

  updateExistingData(tag: string){
    const split_tag = tag.split(" ");
    const field = split_tag[0]
    const i = parseInt(split_tag[1]);

    const inputs = [...this.shadowRoot!.querySelectorAll('sl-input[data-tag="' + tag + '"]')];
    const select = this.shadowRoot!.querySelector('sl-select[data-tag="' + tag + '"]');

    if(field === "shortcuts"){

      let name = (inputs.filter((input: any) => input.name === "name")[0] as HTMLInputElement).value;
      let url = (inputs.filter((input: any) => input.name === "url")[0] as HTMLInputElement).value;
      let src = (inputs.filter((input: any) => input.name === "src")[0] as HTMLInputElement).value;
      let desc = (inputs.filter((input: any) => input.name === "desc")[0] as HTMLInputElement).value;

      let scObject: ShortcutItem;

      if(src.length == 0){
        scObject = {
          name: name,
          url: url,
          description: desc
        }
      } else {
        scObject = {
          name: name,
          url: url,
          icons: [
            {
              src: src
            }
          ],
          description: desc
        }
      }

      this.manifest.shortcuts!.splice(i, 1, scObject);

      this.validatePlatformList("shortcuts", this.manifest.shortcuts!);
      
    } else if(field === "protocol"){
      let protocol: string = (inputs.filter((input: any) => input.name === "protocol")[0] as HTMLInputElement).value;
      let url: string = (inputs.filter((input: any) => input.name === "url")[0] as HTMLInputElement).value;
  
      const pObject: ProtocolHandler  = {
        protocol: protocol,
        url: url
      }

      this.manifest.protocol_handlers!.splice(i, 1, pObject);

      this.validatePlatformList("protocol_handlers", this.manifest.protocol_handlers!);

    } else {
      let platform: string = (select as HTMLSelectElement).value;
      let url: string = (inputs.filter((input: any) => input.name === "url")[0] as HTMLInputElement).value;
      let id: string = (inputs.filter((input: any) => input.name === "id")[0] as HTMLInputElement).value;
  
      const appObject: RelatedApplication  = {
        platform: platform,
        url: url,
        id: id
      }

      this.manifest.related_applications!.splice(i, 1, appObject);

      this.validatePlatformList("related_applications", this.manifest.related_applications!);
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
              <h3 class=${classMap(this.decideFocus("iarc_rating_id"))}>IARC Rating ID</h3>
              <manifest-field-tooltip .field=${"iarc_rating_id"}></manifest-field-tooltip>
            </div>
            <p>Displays the suitable ages for your PWA</p>
            <sl-input placeholder="PWA IARC Rating ID" value=${this.manifest.iarc_rating_id! || ""} data-field="iarc_rating_id" @sl-change=${this.handleInputChange}></sl-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3 class=${classMap(this.decideFocus("prefer_related_applications"))}>Prefer Related Applications</h3>
              <manifest-field-tooltip .field=${"prefer_related_applications"}></manifest-field-tooltip>
            </div>
            <p>Should a user prefer a related app to this one</p>
            <sl-select placeholder="Select an option" data-field="prefer_related_applications" hoist=${true} @sl-change=${this.handleInputChange} value=${JSON.stringify(this.manifest.prefer_related_applications!) || ""}>
              <sl-option value="true">true</sl-option>
              <sl-option value="false">false</sl-option>
            </sl-select>
          </div>
        </div>
        <div class="long-items">
          <div class="form-field">
            <div class="field-header">
              <h3 class=${classMap(this.decideFocus("related_applications"))}>Related Applications</h3>
              <manifest-field-tooltip .field=${"related_applications"}></manifest-field-tooltip>
            </div>
            <p>Applications that provide similar functionality to your PWA</p>
            <sl-details class="field-details" summary="Click to edit related apps" data-field="related_applications">
              <sl-button @click=${() => this.addFieldToHTML("related_applications")} ?disabled=${this.relatedAppsHTML.length != 0}>Add App</sl-button>
              <div class="items-holder">
                ${ this.manifest.related_applications && Array.isArray(this.manifest.related_applications) ? this.manifest.related_applications.map((app: any, i: number) =>
                  html`
                    <div class="field-holder">
                      <div class="editable">
                        <h4 class="shortcut-header">Related App #${i + 1}</h4>
                        <sl-icon-button name="x-lg" label="close" style="font-size: 1rem;" data-tag=${"related " + i.toString()} @click=${() => this.removeData("related " + i.toString())}></sl-icon-button>
                      </div>
                      <sl-select placeholder="Select a Platform" placement="bottom" hoist=${true} value=${app.platform || ""} name="platform" data-tag=${"related " + i.toString()} @sl-change=${() => this.updateExistingData("related " + i.toString())}>
                        ${platformOptions.map((_, i: number) => html`<sl-option value=${platformOptions[i]}>${platformText[i]}</sl-option>` )}
                      </sl-select>
                      <sl-input class="field-input" placeholder="App URL" value=${app.url || ""} name="url" data-tag=${"related " + i.toString()} @sl-change=${() => this.updateExistingData("related " + i.toString())}></sl-input>
                      <sl-input class="field-input" placeholder="App ID" value=${app.id || ""} name="id" data-tag=${"related " + i.toString()} @sl-change=${() => this.updateExistingData("related " + i.toString())}></sl-input>
                    </div>
                  `
                ): html``}
                ${this.relatedAppsHTML ? this.relatedAppsHTML.map((ele: TemplateResult) => ele) : html``}
              </div>
            </sl-details>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3 class=${classMap(this.decideFocus("shortcuts"))}>Shortcuts</h3>
              <manifest-field-tooltip .field=${"shortcuts"}></manifest-field-tooltip>
            </div>
            <p>Links to key tasks or pages within your PWA</p>
            <sl-details class="field-details" summary="Click to edit shortcuts" data-field="shortcuts">
              <sl-button @click=${() => this.addFieldToHTML("shortcuts")} ?disabled=${this.shortcutHTML.length != 0}>Add Shortcut</sl-button>
              <div class="items-holder">
                ${this.manifest.shortcuts && Array.isArray(this.manifest.shortcuts) ? this.manifest.shortcuts!.map((sc: any, i: number) =>
                  html`
                    <div class="field-holder">
                      <div class="editable">
                        <h4 class="shortcut-header">Shortcut #${i + 1}</h4>
                        <sl-icon-button name="x-lg" label="close" style="font-size: 1rem;" data-tag=${"shortcuts " + i.toString()} @click=${() => this.removeData("shortcuts " + i.toString())}></sl-icon-button>                      
                      </div>
                      <sl-input class="field-input" name="name" placeholder="Shortcut name" value=${sc.name || ""} data-tag=${"shortcuts " + i.toString()} @sl-change=${() => this.updateExistingData("shortcuts " + i.toString())}></sl-input>
                      <sl-input class="field-input" name="url" placeholder="Shortcut url" value=${sc.url || ""} data-tag=${"shortcuts " + i.toString()} @sl-change=${() => this.updateExistingData("shortcuts " + i.toString())}></sl-input>
                      <sl-input class="field-input" name="desc" placeholder="Shortcut description" value=${sc.description || ""} data-tag=${"shortcuts " + i.toString()} @sl-change=${() => this.updateExistingData("shortcuts " + i.toString())}></sl-input>
                    </div>
                  `
                ) : html``}
                ${this.shortcutHTML.map((ele: TemplateResult) => ele)}
                </div>
            </sl-details>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3 class=${classMap(this.decideFocus("protocol_handlers"))}>Protocol Handlers</h3>
              <manifest-field-tooltip .field=${"protocol_handlers"}></manifest-field-tooltip>
            </div>
            <p>Protocols this web app can register and handle</p>
            <sl-details class="field-details" summary="Click to edit protocol handlers" data-field="protocol_handlers">
              <sl-button @click=${() => this.addFieldToHTML("protocol_handlers")} ?disabled=${this.protocolHTML.length != 0}>Add Protocol</sl-button>
              <div class="items-holder">
                ${this.manifest.protocol_handlers  && Array.isArray(this.manifest.protocol_handlers) ? this.manifest.protocol_handlers.map((p: any, i: number) =>
                  html`
                    <div class="field-holder">
                      <div class="editable">
                        <h4 class="shortcut-header">Protocol Handler #${i + 1}</h4>
                        <sl-icon-button name="x-lg" label="close" style="font-size: 1rem;" data-tag=${"protocol " + i.toString()} @click=${() => this.removeData("protocol " + i.toString())}></sl-icon-button>                      
                      </div>
                      <sl-input class="field-input" name="protocol" placeholder="Protocol" value=${p.protocol || ""} data-tag=${"protocol " + i.toString()} @sl-change=${() => this.updateExistingData("protocol " + i.toString())}></sl-input>
                      <sl-input class="field-input" name="url" placeholder="URL" value=${p.url || ""} data-tag=${"protocol " + i.toString()} @sl-change=${() => this.updateExistingData("protocol " + i.toString())}></sl-input>
                    </div>
                  `
                ): html``}
                ${this.protocolHTML.map((ele: TemplateResult) => ele)}
                </div>
            </sl-details>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3 class=${classMap(this.decideFocus("categories"))}>Categories</h3>
              <manifest-field-tooltip .field=${"categories"}></manifest-field-tooltip>
            </div>
            <p>The categories your PWA belongs to</p>
              <div id="cat-field"  data-field="categories">
                ${standardCategories.map((cat: string) =>
                    html`<sl-checkbox class="cat-check" size="small" @sl-change=${() => this.updateCategories()} value=${cat} ?checked=${this.manifest.categories?.includes(cat)}>${cat}</sl-checkbox>`
                  )}
                    
              </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <div class="field-header">
                <h3 class=${classMap(this.decideFocus("edge_side_panel"))}>Edge Side Panel</h3>
                <manifest-field-tooltip .field=${"edge_side_panel"}></manifest-field-tooltip>
              </div>
              <p>Indicates whether your PWA supports the side panel in Microsoft Edge</p>
              <sl-input 
                type="number"
                placeholder="Preferred Width" 
                value=${this.manifest.edge_side_panel?.preferred_width ?? ""} 
                data-field="edge_side_panel" 
                @sl-change=${this.handleInputChange}></sl-input>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}