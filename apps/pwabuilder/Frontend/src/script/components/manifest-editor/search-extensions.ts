import { LitElement, PropertyValueMap, html } from 'lit';
import { searchExtensionsStyles } from "./search-extensions.styles";
import { property, customElement, state } from 'lit/decorators.js';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import { extensions } from "../../utils/extensions";
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/tag/tag.js';

@customElement('search-extensions')
export class SearchExtensions extends LitElement {
    @property({ type: Number }) index: any;
    @property({ type: Boolean }) empty = false;
    @property({ type: Object }) share_target: any;
    @property({ type: Object }) file: any = 0;
    @property({ type: Array }) tags: string[] = [];
    @state() filteredList: string[] = [];
    @state() emptyName = false;

    private errorCount: number = 0;

    static styles = [searchExtensionsStyles];

    constructor() {
        super();
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (this.file === 0) {
            this.file = {
                "name": "",
                "accept": []
            }
        }
    }

    handleNewType(e: KeyboardEvent) {
        let input: HTMLInputElement = e.target as HTMLInputElement;
        this.searchExtension(parseInt(input.dataset.index!));
        this.resizeInput(input);
        if (e.key === 'Enter' && input.value.length > 1) {
            // update tag list
            this.file.accept.push(input.value);

            // reset input
            input.value = "";
            input.style.width = "3ch";

            // clear suggestion list and hide drop down
            this.filteredList = [];
            let suggestions = (this.shadowRoot!.querySelector(`.suggestions[data-index="${this.index}"]`) as HTMLElement);
            suggestions.style.display = "none";

            this.handleTagChange()
        }

        return false;
    }

    searchExtension(index: number) {
        let dropdown = (this.shadowRoot!.querySelector(`.suggestions[data-index="${index}"]`) as HTMLElement);
        let input: HTMLInputElement = this.shadowRoot?.querySelector(`input[data-index='${index}']`)!;
        this.filteredList = [];
        if (input.value.length != 0) {
            let searchResults = extensions.filter((ext: string) => ext.indexOf(input.value) !== -1);
            this.filteredList = searchResults;
            dropdown!.style.display = "flex";
        } else {
            this.filteredList = [];
        }

        if (this.filteredList.length == 0) {
            dropdown!.style.display = "none";
        }

    }

    resizeInput(input: HTMLInputElement) {
        input.style.width = (input.value.length + 2) + "ch";
    }

    createTag(value: string) {
        let tag = document.createElement('wa-tag');
        tag.innerHTML = value;
        tag.setAttribute('removable', 'true');
        tag.setAttribute('size', 's');
        return tag;
    }

    focusInput() {
        let input = (this.shadowRoot!.querySelector(`input[data-index="${this.index}"]`) as HTMLInputElement);
        input.parentElement?.classList.add("focused")
        input.focus();
    }

    async removeFocus() {
        let input = (this.shadowRoot!.querySelector(`input[data-index="${this.index}"]`) as HTMLInputElement);
        let before = input.parentElement?.childElementCount;
        let delay = new Promise(resolve => setTimeout(resolve, 100));
        await delay;

        if (before == input.parentElement!.childElementCount) {
            // remove focus ring
            input.parentElement?.classList.remove("focused");

            // hide suggestions
            let suggestions = (this.shadowRoot!.querySelector(`.suggestions[data-index="${this.index}"]`) as HTMLElement);
            if (suggestions.style.display === "flex") {
                suggestions.style.display = "none";
            }
        }

    }

    handleNewTypeFromClick(index: number, ext: string) {
        let input: HTMLInputElement = this.shadowRoot?.querySelector(`input[data-index='${index}']`)!;

        // clear input
        input.value = "";

        // clear suggestion list and hide drop down
        this.filteredList = [];
        let suggestions = (this.shadowRoot!.querySelector(`.suggestions[data-index="${this.index}"]`) as HTMLElement);
        suggestions.style.display = "none";

        // update tag list
        this.file.accept.push(ext);
        this.handleTagChange();
    }

    renderTags(type: string) {
        return html`<wa-tag size="s" removable @wa-remove=${() => this.removeAcceptEntry(type)}>${type}</wa-tag>`
    }

    removeAcceptEntry(type: string) {
        this.file.accept = this.file.accept.filter((ext: string) => ext != type);
        this.requestUpdate("file")
    }

    handleTagChange() {
        let name_input = (this.shadowRoot!.querySelector(`[data-field="share_target.params.files.name"]`) as unknown as WaInput);

        // check if name field is filled out, if not add error.
        if ((name_input.value ?? '').length === 0) {
            // add error border 
            name_input.classList.add("error");

            // add error message
            let error_div = (this.shadowRoot!.querySelector(`.name-error-message`) as HTMLElement);
            if (error_div) {
                error_div.style.display = "block";
                this.errorCount++;
            }
        }

        // remove our own errors
        // remove error border 
        let file_input = (this.shadowRoot!.querySelector(`.type-box`) as unknown as WaInput);
        file_input.classList.remove("error");

        // remove error message
        let error_div = (this.shadowRoot!.querySelector(`.accept-error-message`) as HTMLElement);
        if (error_div && error_div.style.display === "block") {
            error_div.style.display = "none";
            this.errorCount--;
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

        this.updateError()
    }

    handleNameChange() {
        let input = (this.shadowRoot!.querySelector(`[data-field="share_target.params.files.name"]`) as unknown as WaInput);
        this.file.name = input.value;

        if (this.file.accept.length === 0) {
            // add error border 
            let file_input = (this.shadowRoot!.querySelector(`.type-box`) as unknown as WaInput);
            file_input.classList.add("error");

            // add error message
            let error_div = (this.shadowRoot!.querySelector(`.accept-error-message`) as HTMLElement);
            if (error_div) {
                error_div.style.display = "block";
                this.errorCount++;
            }
        }

        // remove error border from tags if necessary
        let file_input = (this.shadowRoot!.querySelector(`.type-box`) as unknown as WaInput);
        file_input.classList.remove("error");

        // remove error message
        let error_div = (this.shadowRoot!.querySelector(`.name-error-message`) as HTMLElement);
        if (error_div && error_div.style.display === "block") {
            error_div.style.display = "none";
            this.errorCount--;
        }

        // remove own error border
        input.classList.remove("error");


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

        this.updateError();
    }

    removeFile() {
        let errors = this.shadowRoot!.querySelectorAll(".error-message")
        if (errors.length > 0) {
            this.errorCount = 0;
            this.updateError();
        }
        let deleteFilte = new CustomEvent('deleteFilte', {
            detail: {
                file: this.file,
                index: this.index
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(deleteFilte);
    }

    updateError() {
        let errorTracker = new CustomEvent('errorTracker', {
            detail: {
                count: this.errorCount
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorTracker);
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
          <wa-input name="params.files.name" placeholder="Add file name" value=${this.file.name || ""} data-field="share_target.params.files.name" @change=${() => this.handleNameChange()}></wa-input>
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
            <input name=${`tag-input-${this.index}`} data-index=${this.index} @keyup=${(e: KeyboardEvent) => this.handleNewType(e)} @blur=${() => this.removeFocus()} />
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
      <wa-button name="x-lg" class="remove-file icon-close" appearance="plain" aria-label="close" style="font-size: .65rem;" @click=${() => this.removeFile()}><wa-icon name="x-lg"></wa-icon></wa-button>
      <p class="accept-error-message error-message">Be sure to specify which file types your share target accepts</p>
      <p class="name-error-message error-message">Be sure to specify the name of the form field used to share files.</p>
    </div>

      
    `;
    }
}
