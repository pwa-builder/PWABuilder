import { LitElement, html } from 'lit';

import { customElement, property, state, query } from 'lit/decorators.js';

import { FileInputDetails, Lazy } from '../utils/interfaces';
import { ifDefined } from 'lit/directives/if-defined.js';
import { FileInputElement } from '../utils/interfaces.components';
import { appFileInputStyles } from './app-file-input.styles';
import '@awesome.me/webawesome/dist/components/button/button.js';

@customElement('app-file-input')
export class FileInput extends LitElement implements FileInputElement {
    @property({ type: String, attribute: true }) inputId = '';
    @property({ type: String, attribute: true }) accept?: string;
    @query('.file-input') fileInput: Lazy<HTMLInputElement>;

    @state() buttonText = 'Choose File';

    static styles = [appFileInputStyles];

    get input(): any {
        return this.fileInput;
    }

    get value(): any {
        return this.fileInput?.value;
    }

    get files(): any {
        return this.fileInput?.files || undefined;
    }

    constructor() {
        super();
    }

    render() {
        return html`
      <div>
        <wa-button
          variant="default"
          @click=${this.clickModalInput}
        >
          ${this.buttonText}
        </wa-button>
        <input
          id="${ifDefined(this.inputId)}"
          class="file-input hidden"
          type="file"
          accept="${ifDefined(this.accept)}"
          aria-hidden="true"
          @change=${this.handleModalInputFileChosen}
        />
      </div>
    `;
    }

    clickModalInput() {
        this.fileInput?.click();
    }

    handleModalInputFileChosen() {
        if (this.input) {
            const changeEvent = new CustomEvent<FileInputDetails>('input-change', {
                detail: {
                    input: this.input,
                },
                composed: true,
                bubbles: true,
            });

            this.buttonText = this.input?.files?.item(0)?.name;
            this.dispatchEvent(changeEvent);
            this.requestUpdate();
        }
    }

    clearInput() {
        this.buttonText = 'Choose File';

        if (this.fileInput) {
            this.fileInput.files = null;
        }
    }
}
