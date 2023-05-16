import { validateSingleField, singleFieldValidation } from '@pwabuilder/manifest-validation';
import { LitElement, css, html, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { errorInTab, insertAfter } from '../utils/helpers';
import {
  FilesParams,
  Manifest,
} from '../utils/interfaces';
//import {classMap} from 'lit/directives/class-map.js';
import "./manifest-field-tooltip";
import "./search-extensions";
import { SlInput, SlSelect } from '@shoelace-style/shoelace';

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
  @state() files: any = [];
  @state() numOfFiles: number = 0;
  @state() filteredList: string[] = [];
  @state() confirmRemove: boolean = false;

  private shouldValidateAllFields: boolean = true;
  private validationPromise: Promise<void> | undefined;
  private errorCount: number = 0;
  private fileError: number = 0;

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
        border-radius: 5.5px;
      }

      .toggle-button::part(label) {
        color: #292C3A;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
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
        margin-top: -15px;
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

      .remove-file {
        position: absolute;
        top: 5px;
        right: 5px;
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

      .error-message {
        color: #eb5757;
        margin: 5px 0;
        font-size: 14px;
        display: none;
      }

      sl-button::part(base):hover {
        background-color: rgba(79, 63, 182, 0.06);
        border-color: rgba(79, 63, 182, 0.46);
        color: rgb(79, 63, 182);
      }

      .focus {
        color: #4f3fb6;
      }

      .confirm {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        background-color: #ffffff;
        border: 1px dashed #4f3fb67f;
        border-radius: 5.5px;
        gap: 10px;
        padding: 3.5px;
      }

      #class-actions {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .confirm p {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }

      .confirm sl-button::part(base){
        padding: 10px;
        height: 25px;
        border-color: #4f3fb6;
        background-color: #F2F3FB;
      }

      .confirm sl-button::part(base):hover{
        background-color: #dfe2f5;
      }

      .confirm sl-button::part(label){
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }

      #extra-step{
        display: flex;
        gap: 10px;
        align-items: center;
        width: 100%;
        justify-content: flex-start;
      }

      .arrow_link {
        margin: 0;
        border-bottom: 1px solid var(--primary-color);
        white-space: nowrap;
      }

      .arrow_anchor {
        text-decoration: none;
        font-size: var(--arrow-link-font-size);
        font-weight: bold;
        margin: 0px 0.5em 0px 0px;
        line-height: 1em;
        color: var(--primary-color);
        display: flex;
        column-gap: 10px;
        width: fit-content;
      }

      .arrow_anchor:visited {
        color: var(--primary-color);
      }

      .arrow_anchor:hover {
        cursor: pointer;
      }

      .arrow_anchor:hover img {
        animation: bounce 1s;
      }

      #add-new-file {
        width: fit-content
      }

      #add-new-file::part(base){
        padding: 15px 20px;
        height: 30px;
        border-color: #4f3fb6;
        background-color: #F2F3FB;
        min-width: 15%;
        width: fit-content;
      }

      #add-new-file::part(base):hover{
        background-color: #dfe2f5;
      }

      #add-new-file::part(label){
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        font-weight: 600;
        color: #4f3fb6;
      }

      .method sl-option::part(base){
        font-size: var(--body-font-size);
        color: #757575;
      }

      .method sl-option:focus-within::part(base) {
        color: #ffffff;
        background-color: #4F3FB6;
      }

      .method sl-option::part(base):hover{
        color: #ffffff;
        background-color: #4F3FB6;
      }

      .method::part(display-label){
        font-size: var(--body-font-size);
        color: #757575;
      }
        
      @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateX(-5px);
          }
          60% {
            transform: translateX(5px);
          }
      }

      @media(max-width: 600px){
        .form-row {
           flex-direction: column;
        }
        .form-field {
          width: 100%;
        }

        .multi {
          display: flex;
        }

        .confirm {
          flex-direction: column;
          gap: 5px;
          padding: 10px;
        }
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
      this.errorCount = 0;
      this.requestValidateAllFields();
    }

    // inital validation for action being required
    let input = (this.shadowRoot!.querySelector(`[data-field="share_target.action"]`) as unknown as SlInput);
    if(input && input.value.length === 0){
      input.classList.add("error");
      let container = (this.shadowRoot!.querySelector(`.action-error-message`) as HTMLElement);
      container!.style.display = "block";
      this.errorCount++;
    } 

    // initial validation for method = GET or POST
    const validMethods: string[] = ["GET", "POST"]
    let select: SlSelect = this.shadowRoot!.querySelector(`sl-select[data-field="share_target.method"]`) as unknown as SlSelect;
    let container = (this.shadowRoot!.querySelector(`.method-error-message`) as HTMLElement);

    let listedMethod = "";
    (this.manifest.share_target && this.manifest.share_target.method) ? listedMethod = this.manifest.share_target!.method : listedMethod = "";

    if(listedMethod && !validMethods.includes(listedMethod)){
      select.classList.add("error");
      container!.style.display = "block";
      this.errorCount++;
    } else {
      if(select) select.classList.remove("error");
      if(container) container!.style.display = "none";
      if(this.errorCount > 0) this.errorCount--;
    }

    // initial validaiton for params being required
    let param_inputs: NodeList = this.shadowRoot!.querySelectorAll(".params");
    let all_empty = this.areParamsEmpty(param_inputs)

    if(this.addingTarget && param_inputs && all_empty && !this.manifest.share_target?.params?.files){
      this.parameterErrors(true)
    }

    // validation for enctype being required if you specify post
    let enc_input = (this.shadowRoot!.querySelector(`[data-field="share_target.enctype"]`) as unknown as SlInput);
    if(this.postSelected && enc_input.value.length === 0){
      // place error border 
      enc_input.classList.add("error")

      // place error message
      let error_div = (this.shadowRoot!.querySelector(`.enctype-error-message`) as HTMLElement);
      if(error_div){
        error_div.style.display = "block";
      }
      this.errorCount++;
    }
    this.handleErrorCount()
  }

  handleErrorCount(){
    if(this.errorCount == 0 && this.fileError == 0){
      this.dispatchEvent(errorInTab(false, "share"));
    } else {
      this.dispatchEvent(errorInTab(true, "share"));
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
    } 
    this.validationPromise = undefined;
    this.handleErrorCount();
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if(this.manifest.share_target?.method === "POST"){
      this.postSelected = true;
    }
    if(this.manifest.share_target?.params?.files){
      this.composeFiles(this.manifest!.share_target!.params!.files!);
    }
  }

  decideFocus(field: string){
    let decision = this.focusOn === field;
    return {focus: decision}
  }

  toggleForm(adding: boolean){
    this.confirmRemove = false;
    if(adding){
      this.addingTarget = true;
      this.removeClicked = false;
      let manifestUpdated = new CustomEvent('manifestUpdated', {
        detail: {
            field: "share_target",
            change: {method: "GET"}
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(manifestUpdated);

    } else {
      this.confirmRemove = true;
    }
    
  }

  handleMethodChange(){
    let select = (this.shadowRoot!.querySelector(".method") as unknown as SlSelect);
    this.postSelected = select.value === "POST";
    this.handleTopLevelInputChange("method");
  }

  composeFiles(data: FilesParams[]){
    if(data){
      this.files = [];
      for(let i = 0; i < data.length; i++){
        let file: FilesParams = data[i];

        this.files.push({
          index: i,
          html: html`
          <search-extensions 
            .index=${i} 
            .empty=${false} 
            .file=${file} 
            .share_target=${this.manifest.share_target} 
            @fileChanged=${(e: CustomEvent) => this.handleFileChange(e)}
            @deleteFilte=${(e: CustomEvent) => this.removeFile(e)}
            @errorTracker=${(e: CustomEvent) => this.handleFileError(e)}>
          </search-extensions>
        `})
        this.numOfFiles++;
      }
    }
  }

  handleFileError(e: CustomEvent){
    this.fileError = e.detail.count;
    this.handleErrorCount();
  }

  parameterErrors(addingErrors: boolean){
    
    let param_inputs = this.shadowRoot!.querySelectorAll(".params");
    if(addingErrors){
      for(let i = 0; i < param_inputs.length; i++){
        let param = (param_inputs[i] as SlInput);
        param.classList.add("error");
      }
      let error_div = (this.shadowRoot!.querySelector(`.params-error-message`) as HTMLElement);
      if(error_div){
        error_div.style.display = "block";
      }
      this.errorCount++;
      
    } else {
      // remove error fields
      if(param_inputs){
        for(let i = 0; i < param_inputs.length; i++){
          let param = (param_inputs[i] as SlInput);
          param.classList.remove("error");
        }
        let error_div = (this.shadowRoot!.querySelector(`.params-error-message`) as HTMLElement);
        if(error_div){
          error_div.style.display = "none";
        }
        this.errorCount--;
      }
    }
  }

  areParamsEmpty(param_inputs: NodeList): boolean {
    
    for(let i = 0; i < param_inputs.length; i++){
      let param = (param_inputs[i] as SlInput);
      if(param.value.length !== 0){
        return false;
      }
    }
    return true;
  }

  pushEmptyFile(){

    this.parameterErrors(false)

    if(!this.manifest.share_target?.params){
      this.manifest.share_target!["params"] = {};
    }
    if(!this.manifest.share_target?.params.files){
      this.manifest.share_target!.params!["files"] = [];
    }
    let temp = this.manifest.share_target!
    

    let index = this.manifest.share_target!.params!.files?.length;
    this.files.push({
      index: index,
      html: html`
      <search-extensions 
        .index=${index} .empty=${true} 
        .share_target=${this.manifest.share_target}  
        @fileChanged=${(e: CustomEvent) => this.handleFileChange(e)}
        @deleteFilte=${(e: CustomEvent) => this.removeFile(e)}
        @errorTracker=${(e: CustomEvent) => this.handleFileError(e)}>
      </search-extensions>   
    `})

    temp.params!.files!.push({
      "name": "",
      "accept": []
    })

    // update manifest
    let manifestUpdated = new CustomEvent('manifestUpdated', {
      detail: {
          field: "share_target",
          change: temp
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(manifestUpdated);
    this.handleErrorCount();
    this.requestUpdate();
  }

  removeFile(e: CustomEvent){
    let files = this.manifest.share_target?.params?.files;
    let temp_files: FilesParams[] = [];
    
    // remove matching file
    let i = 0;
    while(files![i].name !== e.detail.file.name){
      temp_files.push(files![i]);
      i++;
    }

    // the break ensures that we only delete the first of 
    // files with the same name. files shouldn't have the same name
    // so this shouldn't be an issue but just in case
    temp_files.push(...files!.slice(i + 1));

    if(temp_files.length == 0){
      let param_inputs: NodeList = this.shadowRoot!.querySelectorAll(".params");
      let all_empty = this.areParamsEmpty(param_inputs);
      if(all_empty){
        this.parameterErrors(true);
      }
    }

    // update changedValue with updated list
    let temp = this.manifest.share_target;
    temp!.params!.files = temp_files;

    // update manifest
    let manifestUpdated = new CustomEvent('manifestUpdated', {
      detail: {
          field: "share_target",
          change: temp
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(manifestUpdated);

    this.composeFiles(temp_files);

  }

  renderFiles(){
    return this.files;
  }

  async handleTopLevelInputChange(field: string){
    const form = (this.shadowRoot!.querySelector('form') as HTMLFormElement);
    const formData = new FormData(form);
    const change = (formData.get(field) as string);

    if(field === "method"){
      // validation for method = GET or POST
      const validMethods: string[] = ["GET", "POST"]
      let select: SlSelect = this.shadowRoot!.querySelector(`sl-select[data-field="share_target.method"]`) as unknown as SlSelect;
      let container = (this.shadowRoot!.querySelector(`.method-error-message`) as HTMLElement);

      if(!validMethods.includes(change)){
        select.classList.add("error");
        container!.style.display = "block";
        this.errorCount++;
      } else {
        select.classList.remove("error");
        container!.style.display = "none";
        this.errorCount--;
      }
    }

    if(field === "enctype" && change.trim() === ""){
        let enc_input = (this.shadowRoot!.querySelector(`[data-field="share_target.enctype"]`) as unknown as SlInput);
        
        // place error border 
        enc_input.classList.add("error")
        // place error message
        let error_div = (this.shadowRoot!.querySelector(`.enctype-error-message`) as HTMLElement);
        if(error_div){
          error_div.style.display = "block";
        }
        this.errorCount++;
        this.requestUpdate();
        return;
    } else if(field === "enctype"){
      let enc_input = (this.shadowRoot!.querySelector(`[data-field="share_target.enctype"]`) as unknown as SlInput);
      // place error border 
      enc_input.classList.remove("error")

      // place error message
      let error_div = (this.shadowRoot!.querySelector(`.enctype-error-message`) as HTMLElement);
      if(error_div){
        error_div.style.display = "none";
      }
      this.errorCount--;
    }

    let temp: any = this.manifest.share_target;
    if(temp){
      temp[field] = change;
    }

    const validation: singleFieldValidation = await validateSingleField("share_target", temp);
    let passed = validation!.valid;

    if(passed){
      // remove error border 
      let input = (this.shadowRoot!.querySelector(`[data-field="share_target.${field}"]`) as unknown as SlInput);
      input.classList.remove("error")

      // remove error message
      let error_div = (this.shadowRoot!.querySelector(`.${field}-error-message`) as HTMLElement);
      if(error_div){
        error_div.style.display = "none";
      }

      // update manifest
      let manifestUpdated = new CustomEvent('manifestUpdated', {
        detail: {
            field: "share_target",
            change: temp
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(manifestUpdated);
      this.errorCount--;
    } else {
      // place error border 
      let input = (this.shadowRoot!.querySelector(`[data-field="share_target.action"]`) as unknown as SlInput);
      input.classList.add("error")

      // place error message
      let error_div = (this.shadowRoot!.querySelector(`.${field}-error-message`) as HTMLElement);
      if(error_div){
        error_div.style.display = "block";
      }
      this.errorCount++;
    }
    this.handleErrorCount();
  }

  async handleParameterInputChange(field: string){
    const form = (this.shadowRoot!.querySelector('form') as HTMLFormElement);
    const formData = new FormData(form);
    const change = (formData.get(`${field}`) as string);

    if(change.trim() == ""){
      let param_inputs: NodeList = this.shadowRoot!.querySelectorAll(".params");
      let all_empty = this.areParamsEmpty(param_inputs);
      if(all_empty){
        this.parameterErrors(true);
      }
    }

    let temp: any = this.manifest.share_target;
    if(!temp["params"]){
      temp["params"] = {}
    }
    if(temp){
      temp["params"][field] = change;
    }

    const validation: singleFieldValidation = await validateSingleField("share_target", temp);
    let passed = validation!.valid;

    if(passed){
      this.parameterErrors(false)

      // update manifest
      let manifestUpdated = new CustomEvent('manifestUpdated', {
        detail: {
            field: "share_target",
            change: temp
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(manifestUpdated);

    } else {
      // initial validaiton for params being required
      let param_inputs: NodeList = this.shadowRoot!.querySelectorAll(".params");
      let all_empty = this.areParamsEmpty(param_inputs)

      if(param_inputs && all_empty){
        this.parameterErrors(true)
      }
    }
    this.handleErrorCount();
  }

  async handleFileChange(e: CustomEvent){
    let file = e.detail.file;

    let temp = this.manifest.share_target!
    temp.params!.files![e.detail.index] = file;

    // update manifest
    let manifestUpdated = new CustomEvent('manifestUpdated', {
      detail: {
          field: "share_target",
          change: temp
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(manifestUpdated);
    

  }

  renderAddorRemove(){
    if((this.manifest.share_target && !this.removeClicked) || this.addingTarget){
      if(!this.confirmRemove){
        return html`
          <sl-button class="toggle-button" @click=${() => this.toggleForm(false)}><img src="../assets/minus.svg" alt="minus symbol" /> Remove Share Target</sl-button>
        ` 
      } else {
        return html`
          <div class="confirm">
            <p>Are you sure you want to remove the share target?</p>
            <div id="class-actions">
              <sl-button @click=${() => this.removeShareTarget()}>Yes</sl-button>
              <sl-button @click=${() => this.goBackToAdding()}>No</sl-button>
            </div>
          </div>`
      }
    } else {
      return html`
        <sl-button class="toggle-button" @click=${() => this.toggleForm(true)}><img src="assets/plus.svg" alt="plus symbol" />Add Share Target</sl-button>
      `
    }
  }

  goBackToAdding(){
    this.addingTarget = true;
    this.confirmRemove = false;
  }

  removeShareTarget(){
    this.addingTarget = false;
    this.removeClicked = true;
    this.postSelected = false;
    this.files = [];

    let manifestUpdated = new CustomEvent('manifestUpdated', {
      detail: {
          field: "share_target",
          removal: true
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(manifestUpdated);
  }

  render() {
    return html`
      <div id="form-holder">
        <div id="action-holder">
          ${this.renderAddorRemove()}
        </div>
        

        ${((this.manifest.share_target && !this.removeClicked) || this.addingTarget) ?
          html`
            <div id="extra-step">
              <manifest-field-tooltip .field=${"share_target.extra-step"}></manifest-field-tooltip>
              <a
                class="arrow_anchor"
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/share_target#examples"
                rel="noopener"
                target="_blank"
              >
                <p class="arrow_link">Handle receiving share data in your code</p>
                <img
                  src="/assets/new/arrow.svg"
                  alt="arrow"
                />
              </a>
            </div>
            <form id="share-target-form">
              <div class="form-row">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h3>Action</h3>
                      <manifest-field-tooltip .field=${"share_target.action"}></manifest-field-tooltip>
                    </div>

                    <p class="field-desc">(required)</p>
                  </div>
                  <p class="field-desc">The URL for the web share target </p>
                  <sl-input name="action" placeholder="Add action (ex: /share-receiver)" value=${this.manifest.share_target?.action! || ""} @sl-change=${() => this.handleTopLevelInputChange("action")} data-field="share_target.action"></sl-input>
                  <p class="action-error-message error-message">Action is a required field and must be in the scope of your PWA</p>
                </div>
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h3>Method</h3>
                      <manifest-field-tooltip .field=${"share_target.method"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <p class="field-desc">The HTTP request method to use</p>
                  <sl-select name="method" placeholder="Select a method" class="method" value=${this.manifest.share_target?.method! || "GET"} data-field="share_target.method" @sl-change=${() => this.handleMethodChange()}>
                    <sl-option value=${"GET"}>GET</sl-option>
                    <sl-option value=${"POST"}>POST</sl-option>
                  </sl-select>
                  <p class="method-error-message error-message">Method must be set to GET or POST only.</p>

                </div>
              </div>
              ${this.postSelected ? 
                html`
                <div class="form-row long">
                  <div class="form-field">
                    <div class="field-header">
                      <div class="header-left">
                        <h3>Enctype</h3>
                        <manifest-field-tooltip .field=${"share_target.enctype"}></manifest-field-tooltip>
                      </div>
                    </div>
                    <p class="field-desc">The encoding of the share data when a POST request is used</p>
                    <sl-input name="enctype" placeholder="Add enctype" value=${this.manifest.share_target?.enctype! || ""} @sl-change=${() => this.handleTopLevelInputChange("enctype")} data-field="share_target.enctype"></sl-input>
                    <p class="enctype-error-message error-message">If you have specified POST as your method, specify the encoding of your share data.</p>
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
                      <!-- <manifest-field-tooltip .field=${"share_target.params"}></manifest-field-tooltip> -->
                    </div>
                    <p class="field-desc">(required)</p>
                  </div>
                  <p class="field-desc">An object to configure the share parameters. The object keys correspond to the data object in navigator.share(). The object values can be specified and will be used as query parameters:</p>
                  <p class="params-error-message error-message">Specifying at least one parameter is required.</p>
                </div>
              </div>
              <div class="form-row multi">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">Title</h4>
                      <manifest-field-tooltip .field=${"share_target.params.title"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <sl-input name="title" class="params" placeholder="Add title" value=${this.manifest.share_target?.params?.title! || ""} @sl-change=${() => this.handleParameterInputChange("title")} data-field="share_target.params.title"></sl-input>
                </div>
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">Text</h4>
                      <manifest-field-tooltip .field=${"share_target.params.text"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <sl-input name="text" class="params" placeholder="Add text" value=${this.manifest.share_target?.params?.text! || ""} @sl-change=${() => this.handleParameterInputChange("text")} data-field="share_target.params.text"></sl-input>
                </div>
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">URL</h4>
                      <manifest-field-tooltip .field=${"share_target.params.url"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <sl-input name="url" class="params" placeholder="Add url" value=${this.manifest.share_target?.params?.url! || ""} @sl-change=${() => this.handleParameterInputChange("url")} data-field="share_target.params.url"></sl-input>
                </div>
              </div>
              <div class="form-row long">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">Files</h4>
                      <!-- <manifest-field-tooltip .field=${"share_target.params.files"}></manifest-field-tooltip> -->
                    </div>
                  </div>
                  <p class="field-desc">An object (or an array of objects) defining which files are accepted by the share target</p>
                  ${this.files.map((file: any) => file.html)}
                  <sl-button id="add-new-file" class="params" @click=${() => this.pushEmptyFile()}>Add File</sl-button>
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