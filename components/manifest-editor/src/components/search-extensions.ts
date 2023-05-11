import { LitElement, PropertyValueMap, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { extensions } from '../utils/extensions';
import { SlInput } from '@shoelace-style/shoelace';

@customElement('search-extensions')
export class SearchExtensions extends LitElement {
  @property({ type: Number }) index = 0;
  @property({ type: Boolean }) empty = false;
  @property({ type: Object }) share_target: any;
  @property({ type: Object }) file: any = 0;
  @property({ type: Object }) tags: string[] = [];
  @state() filteredList: string[] = [];

  static get styles() {
    return css`

      :host {
        --sl-focus-ring-width: 3px;
        --sl-input-focus-ring-color: #4f3fb670;
        --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
        --sl-input-border-color-focus: #4F3FB6ac;
        --sl-input-font-family: Hind, sans-serif;
      }

      sl-input::part(base) {
        --sl-input-font-size-medium: 16px;
        --sl-font-size-medium: 16px;
        --sl-font-size-small: 14px;
        --sl-input-height-medium: 3em;
        --sl-toggle-size: 16px;
        --sl-toggle-size-small: 16px;
        --sl-input-font-size-small: 16px;
        --sl-button-font-size-medium: 14px;
      }
      sl-input::part(base){
        background-color: #fbfbfb;
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

      .form-row {
        display: flex;
        column-gap: 1em;
      }
      .long .form-field {
        width: 100%;
      }
      
      .type-box {
        max-width: 265px;
        min-height: 40px;
        border: 1px solid #d4d4d8;
        border-radius: .25rem;
        padding: 2px;
        transition: all .1s ease-in-out;
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        align-items: center;
        position: relative;
      }

      .type-box input {
        border: none;
        font-size: 16px;
        width: 2ch;
      }

      .type-box input:focus, input:active, input:focus-visible {
        border: none;
        outline: none;
      }

      .type-box:hover {
        border: 1px solid #a1a1aa;
      }

      .focused {
        border: 1px solid #4F3FB6ac;
        outline: 3px solid #4f3fb670;
      }

      .suggestions {
        display: none;
        position: absolute;
        top: 105%;
        height: fit-content;
        max-height: 200px;
        width: 100%;
        border-radius: 8px;
        z-index: 1;
        overflow-y: scroll;
        flex-direction: column;
        gap: 10px;
        border: 1px solid #C5C5C5;
        background-color: #ffffff;
      }

      .suggestion:first-child{
        margin-top: 5px;
      }

      .suggestions p {
        font-size: 14px;
        margin: 0;
        padding: 5px 10px;
      }

      .suggestions p:hover {
        cursor: pointer;
        background-color: #4f3fb6;
        color: #ffffff;
      }

      .file-holder {
        background: #FBFBFB;
        border: 1px solid #C0C0C0;
        border-radius: 8px;
        padding: 10px;
        position: relative;
      }

      .sub {
        font-size: 18px;
        margin: 0;
        color: #757575;
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

      .error:not(sl-input){
        border: 1px solid #eb5757ac;
      }

      .focused.error  {
        border: 1px solid #eb5757ac;
        outline: 3px solid #eb575770;
      }

      .error-message {
        color: #eb5757;
        margin: 5px 0;
        font-size: 14px;
        display: none;
      }


      
    `;
  }

  constructor() {
    super();
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if(this.file === 0){
      this.file = {
        "name": "",
        "accept": []
      }
    }
  }
  
  handleNewType(e: KeyboardEvent){
    let input: HTMLInputElement = e.target as HTMLInputElement;
    this.searchExtension(parseInt(input.dataset.index!));
    this.resizeInput(input);
    if(e.key === 'Enter' && input.value.length > 1){
      // update tag list
      this.file.accept.push(input.value);

      // reset input
      input.value = "";
      input.style.width = "2ch";
      
      // clear suggestion list and hide drop down
      this.filteredList = [];
      let suggestions = (this.shadowRoot!.querySelector(`.suggestions[data-index="${this.index}"]`) as HTMLElement);
      suggestions.style.display = "none";
    }

    return false;
  }

  searchExtension(index: number) {
    let dropdown = (this.shadowRoot!.querySelector(`.suggestions[data-index="${index}"]`) as HTMLElement);
    let input: HTMLInputElement = this.shadowRoot?.querySelector(`input[data-index='${index}']`)!;
    this.filteredList = [];
    if(input.value.length != 0) {
      let searchResults = extensions.filter((ext: string) => ext.indexOf(input.value) !== -1);
      this.filteredList = searchResults;
      dropdown!.style.display = "flex";
    } else {
      this.filteredList = [];
    }

    if(this.filteredList.length == 0){
      dropdown!.style.display = "none";
    }
    
  }

  resizeInput(input: HTMLInputElement){
    input.style.width = (input.value.length + 2) + "ch";
  }
  
  createTag(value: string){
    let tag = document.createElement('sl-tag');
    tag.innerHTML = value;
    tag.setAttribute('removable', 'true');
    tag.setAttribute('size', 'small');
    return tag;
  }

  focusInput(){
    let input = (this.shadowRoot!.querySelector(`input[data-index="${this.index}"]`) as HTMLInputElement);
    input.parentElement?.classList.add("focused")
    input.focus();
  }

  async removeFocus(){
    let input = (this.shadowRoot!.querySelector(`input[data-index="${this.index}"]`) as HTMLInputElement);
    let before = input.parentElement?.childElementCount;
    let delay = new Promise(resolve => setTimeout(resolve, 100));
    await delay;

    if(before == input.parentElement!.childElementCount){
      // remove focus ring
      input.parentElement?.classList.remove("focused");

      // hide suggestions
      let suggestions = (this.shadowRoot!.querySelector(`.suggestions[data-index="${this.index}"]`) as HTMLElement);
      if(suggestions.style.display === "flex"){
        suggestions.style.display = "none";
      }
    }
    
  }

  handleNewTypeFromClick(index: number, ext: string){
    let input: HTMLInputElement = this.shadowRoot?.querySelector(`input[data-index='${index}']`)!;

    // clear input
    input.value = "";

    // clear suggestion list and hide drop down
    this.filteredList = [];
    let suggestions = (this.shadowRoot!.querySelector(`.suggestions[data-index="${this.index}"]`) as HTMLElement);
    suggestions.style.display = "none";

    // update tag list
    this.file.accept.push(ext);

    console.log(this.file)
  }

  renderTags(type: string){
    return html`<sl-tag size="small" removable>${type}</sl-tag>`
  }

  handleTagChange(){
    let name_input = (this.shadowRoot!.querySelector(`[data-field="share_target.params.files.name"]`) as unknown as SlInput);

    // check if name field is filled out, if not add error.
    if(name_input.value.length === 0){
      // add error border 
      let name_input = (this.shadowRoot!.querySelector(`[data-field="share_target.params.files.name"]`) as unknown as SlInput);
      name_input.classList.add("error");

      // add error message
      let error_div = (this.shadowRoot!.querySelector(`.name-error-message`) as HTMLElement);
      if(error_div){
        error_div.style.display = "block";
      }
      return;
    }

    // remove our own errors
    // remove error border 
    let file_input = (this.shadowRoot!.querySelector(`.type-box`) as unknown as SlInput);
    file_input.classList.remove("error");

    // remove error message
    let error_div = (this.shadowRoot!.querySelector(`.accept-error-message`) as HTMLElement);
    if(error_div){
      error_div.style.display = "none";
    }
    
    // do validation
    let fileChanged = new CustomEvent('fileChanged', {
      detail: {
          file: this.file,
          index: this.index
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(fileChanged);
  }

  handleNameChange(){
    let input = (this.shadowRoot!.querySelector(`[data-field="share_target.params.files.name"]`) as unknown as SlInput);
    this.file.name = input.value;

    if(this.file.accept.length === 0){
      // add error border 
      let file_input = (this.shadowRoot!.querySelector(`.type-box`) as unknown as SlInput);
      file_input.classList.add("error");

      // add error message
      let error_div = (this.shadowRoot!.querySelector(`.accept-error-message`) as HTMLElement);
      if(error_div){
        error_div.style.display = "block";
      }
      return;
    } 

    // remove error border from tags
    let file_input = (this.shadowRoot!.querySelector(`.type-box`) as unknown as SlInput);
    file_input.classList.remove("error");

    // remove own error border
    input.classList.remove("error");

    // remove error message
    let error_div = (this.shadowRoot!.querySelector(`.name-error-message`) as HTMLElement);
    if(error_div){
      error_div.style.display = "none";
    }

    // do validation
    let fileChanged = new CustomEvent('fileChanged', {
      detail: {
          file: this.file,
          index: this.index
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(fileChanged);
  }

  
  render() {
    return html`
    <div class="file-holder">
      <div class="form-row long">
        <div class="form-field">
          <div class="field-header">
            <div class="header-left">
              <h5 class="sub">Name</h5>
              <manifest-field-tooltip .field=${"share_target.params.files.name"}></manifest-field-tooltip>
            </div>
          </div>
          <sl-input name="params.files.name" placeholder="Add file name" value=${this.file.name || ""} data-field="share_target.params.files.name" @sl-change=${() => this.handleNameChange()}></sl-input>
        </div>
        <div class="form-field">
          <div class="field-header">
            <div class="header-left">
              <h5 class="sub">Accept</h5>
              <manifest-field-tooltip .field=${"share_target.params.files.accept"}></manifest-field-tooltip>
            </div>
          </div>
          <div class="type-box" @click=${() => this.focusInput()} data-index=${this.index}>
            ${(!this.empty || (this.file.accept && this.file.accept.length > 0)) ? this.file!.accept.map((type: string) => this.renderTags(type)) : html``}
            <input data-index=${this.index} @keyup=${(e: KeyboardEvent) => this.handleNewType(e)} @blur=${() => this.removeFocus()} @change=${() => this.handleTagChange()} />
            <div class="suggestions" data-index=${this.index}>
              ${this.filteredList && this.filteredList.length > 0 ? 
                this.filteredList.map((ext: string) => 
                  html`
                    <p @click=${() => this.handleNewTypeFromClick(this.index, ext)}>${ext}</p>
                  `) : 
                  html``
              }
            </div>
          </div>
        </div>
      </div>
      <sl-icon-button name="x-lg" class="remove-file" label="close" style="font-size: .5rem;"></sl-icon-button>
      <p class="accept-error-message error-message">Be sure to specify which file types your share target accepts</p>
      <p class="name-error-message error-message">Be sure to specify the name of the form field used to share files.</p>
    </div>

      
    `;
  }
}
