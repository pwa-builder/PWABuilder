import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { extensions } from '../utils/extensions';

@customElement('search-extensions')
export class SearchExtensions extends LitElement {
  @property({ type: Number }) index = 0;
  @property({ type: Boolean }) empty = false;
  @property({ type: Object }) file: any = 0;
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

      .suggestions {
        display: none;
        position: absolute;
        top: 105%;
        height: fit-content;
        width: 100%;
        background: green;
        z-index: 1;
        overflow-y: scroll;
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
      let tag = this.createTag(input.value);
      let box = input.parentElement;
      box!.insertBefore(tag, input);
      input.value = "";
      input.style.width = "2ch";
    }
    return false;
  }

  searchExtension(index: number) {
    let dropdown = (this.shadowRoot!.querySelector(`.suggestions[data-index="${index}"]`) as HTMLElement);
    let input: HTMLInputElement = this.shadowRoot?.querySelector(`input[data-index='${index}']`)!;
    this.filteredList = [];
    let searchResults = extensions.filter((ext: string) => ext.indexOf(input.value) !== -1);
    this.filteredList = searchResults;
    console.log(this.filteredList);
    dropdown!.style.display = "block";
    this.requestUpdate("files");
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

  focusInput(index: number){
    let input = (this.shadowRoot!.querySelector(`[data-index="${index}"]`) as HTMLInputElement);
    input.focus();
  }

  handleNewTypeFromClick(index: number, ext: string){
    let input: HTMLInputElement = this.shadowRoot?.querySelector(`input[data-index='${index}']`)!;
    let tag = this.createTag(ext);
    let box = input.parentElement;
    box!.insertBefore(tag, input);
  }

  render() {
    return html`
      <div class="type-box" @click=${() => this.focusInput(this.index)}>
        ${!this.empty ? this.file!.accept.map((type: string) => html`<sl-tag size="small" removable>${type}</sl-tag>`) : html``}
        <input data-index=${this.index} @keyup=${(e: KeyboardEvent) => this.handleNewType(e)} />
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
