import { LitElement, PropertyValueMap, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { extensions } from '../utils/extensions';

@customElement('search-extensions')
export class SearchExtensions extends LitElement {
  @property({ type: Number }) index = 0;
  @property({ type: Boolean }) empty = false;
  @property({ type: Object }) file: any = 0;
  @property({ type: Object }) tags: string[] = [];
  @state() filteredList: string[] = [];

  static get styles() {
    return css`
      
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
      
    `;
  }

  constructor() {
    super();
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
  }

  renderPreexisitingTags(type: string){
    return html`<sl-tag size="small" removable>${type}</sl-tag>`
  }

  render() {
    return html`
      <div class="type-box" @click=${() => this.focusInput()} data-index=${this.index}>
        ${!this.empty ? this.file!.accept.map((type: string) => this.renderPreexisitingTags(type)) : html``}
        <input data-index=${this.index} @keyup=${(e: KeyboardEvent) => this.handleNewType(e)} @blur=${() => this.removeFocus()} />
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
    `;
  }
}
