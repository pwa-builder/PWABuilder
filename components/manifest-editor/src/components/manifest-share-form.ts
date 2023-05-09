import { required_fields, validateSingleField, singleFieldValidation } from '@pwabuilder/manifest-validation';
import { LitElement, css, html, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { errorInTab, insertAfter } from '../utils/helpers';
import {
  FilesParams,
  Manifest,
} from '../utils/interfaces';
//import {classMap} from 'lit/directives/class-map.js';
import "./manifest-field-tooltip";
import { SlSelect } from '@shoelace-style/shoelace';

let manifestInitialized = false;

@customElement('manifest-share-form')
export class ManifestShareForm extends LitElement {

  @property({type: Object, hasChanged(value: Manifest, oldValue: Manifest) {
    if(value !== oldValue && value.name){
      manifestInitialized = true;
      return value !== oldValue;
    }
    return value !== oldValue;
  }}) manifest: Manifest = {};

  @property({type: String}) manifestURL: string = "";
  @property({type: String}) focusOn: string = "";

  @state() addingTarget: boolean = false;
  @state() removeClicked: boolean = false;
  @state() postSelected: boolean = false;
  @state() files: TemplateResult[] = [];
  @state() errored: boolean = false;

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
      sl-select::part(form-control),
      sl-option::part(base),
      sl-button::part(base) {
        --sl-input-font-size-medium: 16px;
        --sl-font-size-medium: 16px;
        --sl-font-size-small: 14px;
        --sl-input-height-medium: 3em;
        --sl-toggle-size: 16px;
        --sl-toggle-size-small: 16px;
        --sl-input-font-size-small: 16px;
        --sl-button-font-size-medium: 14px;
      }
      sl-input::part(base),
      sl-select::part(combobox){
        background-color: #fbfbfb;
      }
    
      #form-holder {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
      }

      #share-target-form {
        display: flex;
        flex-direction: column;
        row-gap: 1em;
      }

      #action-holder {
        width: 100%;
      }

      .toggle-button {
        width: 100%;
      }

      .toggle-button::part(base) {
        background-color: #F2F3FB;
        border: 1px dashed #4F3FB6;
        border-radius: 8px;
      }

      .toggle-button::part(label) {
        color: #292C3A;
        font-size: 14px;
        font-weight: 600;
      }

      .form-row {
        display: flex;
        column-gap: 1em;
      }
      .long .form-field {
        width: 100%;
      }
      .multi {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 10px;
      }
      .multi .form-field {
        width: 100%;
      }
      .form-row h3 {
        font-size: 18px;
        margin: 0;
      }
      .sub {
        font-size: 18px;
        margin: 0;
        color: #757575;
      }
      .field-desc {
        font-size: 14px;
        margin: 0;
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
        justify-content: space-between;
        column-gap: 5px;
      }
      .header-left{
        display: flex;
        align-items: center;
        column-gap: 10px;
      }

      .file-holder {
        background: #FBFBFB;
        border: 1px solid #C0C0C0;
        border-radius: 8px;
        padding: 10px;
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
      }

      @media(max-width: 600px){
        
      }

      @media(max-width: 480px){

        sl-button::part(base) {
          --sl-button-font-size-medium: 12px;
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
    let field = "share_target";

    if(this.manifest[field]){
      const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);
      
      let passed = validation!.valid;

      if(!passed){
        if(this.shadowRoot!.querySelectorAll('.error-message')){
          let error_divs = this.shadowRoot!.querySelectorAll('.error-message');
          error_divs.forEach((error: any) => error!.parentElement!.removeChild(error!));
        }
        let title = this.shadowRoot!.querySelector('h3');
        title!.classList.add("error");

        if(validation.errors){
          validation.errors.forEach((error: string) => {
            let p = document.createElement('p');
            p.innerText = error;
            p.style.color = "#eb5757";
            p.classList.add("error-message");
            insertAfter(p, title!.parentNode!.parentNode);
            this.errorCount++;
          });
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
    this.validationPromise = undefined;
    if(this.errorCount == 0){
      this.dispatchEvent(errorInTab(false, "share"));
    } else {
      this.dispatchEvent(errorInTab(true, "share"));
    }
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if(this.manifest.share_target?.method === "POST"){
      this.postSelected = true;
    }
    this.initFiles();
  }

  decideFocus(field: string){
    let decision = this.focusOn === field;
    return {focus: decision}
  }

  toggleForm(adding: boolean){
    if(adding){
      this.addingTarget = true;
      this.removeClicked = false;
    } else {
      this.addingTarget = false;
      this.removeClicked = true;
    }
  }

  handleMethodChange(){
    let select = (this.shadowRoot!.querySelector(".method") as unknown as SlSelect);
    this.postSelected = select.value === "POST";
  }

  initFiles(){
    let filesField = this.manifest.share_target?.params?.files;

    if(filesField){
      for(let i = 0; i < filesField.length; i++){
        let file: FilesParams = filesField[i];

        this.files.push(
          html`
            <div class="file-holder">
              <div class="form-row long">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h5 class="sub">Name</h5>
                      <manifest-field-tooltip .field=${"share_target.share_target.params.files.name"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <sl-input placeholder="Add name" value=${file.name || ""} data-field="share_target.params.url"></sl-input>
                </div>
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h5 class="sub">Accept</h5>
                      <manifest-field-tooltip .field=${"share_target.share_target.params.files.accept"}></manifest-field-tooltip>
                    </div>
                  </div>
                  ${file.accept.map((type: string) => html`${type}`)}
                </div>
              </div>
            </div>
          `
        )
      }
    }
    console.log(this.files)
  }

  pushEmptyFile(){
    this.files.push(
      html`
        <div class="file-holder">
          <div class="form-row long">
            <div class="form-field">
              <div class="field-header">
                <div class="header-left">
                  <h5 class="sub">Name</h5>
                  <manifest-field-tooltip .field=${"share_target.share_target.params.files.name"}></manifest-field-tooltip>
                </div>
              </div>
              <sl-input placeholder="Add name" value=${""} data-field="share_target.params.url"></sl-input>
            </div>
            <div class="form-field">
              <div class="field-header">
                <div class="header-left">
                  <h5 class="sub">Accept</h5>
                  <manifest-field-tooltip .field=${"share_target.share_target.params.files.accept"}></manifest-field-tooltip>
                </div>
              </div>
              <!-- TODO: Insert empty list -->
            </div>
          </div>
        </div>
      `
    )
    this.requestUpdate();
  }

  render() {
    return html`
      <div id="form-holder">
        <div id="action-holder">
        ${((this.manifest.share_target && !this.removeClicked) || this.addingTarget) ?
          html`
            <sl-button class="toggle-button" @click=${() => this.toggleForm(false)}><!-- <img src="assets/minus.svg" alt="minus symbol" />  -->Remove Share Target</sl-button>
          ` :
          html`
            <sl-button class="toggle-button" @click=${() => this.toggleForm(true)}><!-- <img src="assets/plus.svg" alt="plus symbol" /> -->Add Share Target</sl-button>
          `
        }
        </div>

        ${((this.manifest.share_target && !this.removeClicked) || this.addingTarget) ?
          html`
            <form id="share-target-form">
              <div class="form-row">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h3>Action</h3>
                      <manifest-field-tooltip .field=${"share_target.name"}></manifest-field-tooltip>
                    </div>

                    <p class="field-desc">(required)</p>
                  </div>
                  <p class="field-desc">The URL for the web share target </p>
                  <sl-input placeholder="Add action" value=${this.manifest.share_target?.action! || ""} data-field="share_target.name"></sl-input>
                </div>
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h3>Method</h3>
                      <manifest-field-tooltip .field=${"share_target.method"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <p class="field-desc">The HTTP request method to use</p>
                  <sl-select placeholder="Select a method" class="method" value=${this.manifest.share_target?.method! || ""} data-field="share_target.method" @sl-change=${() => this.handleMethodChange()}>
                    <sl-option value=${"GET"}>GET</sl-option>
                    <sl-option value=${"POST"}>POST</sl-option>
                  </sl-select>
                </div>
              </div>
              ${this.postSelected ? 
                html`
                <div class="form-row long">
                  <div class="form-field">
                    <div class="field-header">
                      <div class="header-left">
                        <h3>enctype</h3>
                        <manifest-field-tooltip .field=${"share_target.enctype"}></manifest-field-tooltip>
                      </div>
                    </div>
                    <p class="field-desc">The encoding of the share data when a POST request is used</p>
                    <sl-input placeholder="Add encytpe" value=${this.manifest.share_target?.enctype! || ""} data-field="share_target.enctype"></sl-input>
                  </div>
                </div>
                ` :
                html``
              }
              <div class="form-row long">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h3>Parameters</h3>
                      <manifest-field-tooltip .field=${"share_target.params"}></manifest-field-tooltip>
                    </div>
                    <p class="field-desc">(required)</p>
                  </div>
                  <p class="field-desc">An object to configure the share parameters. The object keys correspond to the data object in navigator.share(). The object values can be specified and will be used as query parameters:</p>
                </div>
              </div>
              <div class="form-row multi">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">Title</h4>
                      <manifest-field-tooltip .field=${"share_target.parameters.title"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <sl-input placeholder="Add title" value=${this.manifest.share_target?.params?.title! || ""} data-field="share_target.params.title"></sl-input>
                </div>
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">Text</h4>
                      <manifest-field-tooltip .field=${"share_target.params.text"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <sl-input placeholder="Add text" value=${this.manifest.share_target?.params?.text! || ""} data-field="share_target.params.text"></sl-input>
                </div>
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">URL</h4>
                      <manifest-field-tooltip .field=${"share_target.params.url"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <sl-input placeholder="Add url" value=${this.manifest.share_target?.params?.url! || ""} data-field="share_target.params.url"></sl-input>
                </div>
              </div>
              <div class="form-row long">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">Files</h4>
                      <manifest-field-tooltip .field=${"share_target.params.files"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <p class="field-desc">An object (or an array of objects) defining which files are accepted by the share target</p>
                  ${this.files.map((template: TemplateResult) => template)}
                  <sl-button @click=${() => this.pushEmptyFile()}>Add File</sl-button>
                </div>
              </div>
              
            </form>
          ` : 
          html``
        }
      </div>
    `;
  }
}