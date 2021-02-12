import {
  LitElement,
  customElement,
  css,
  html,
  property,
  query,
} from 'lit-element';

@customElement('app-file-input')
export class FileInput extends LitElement {
  @property({ type: String }) inputId;

  @query('.file-input') fileInput: HTMLInputElement;

  static get styles() {
    return [
      css`
        fast-button.file-button {
          --accent-foreground-active: var(--secondary-font-color);
          --accent-foreground-hover: var(--secondary-font-color);
        }

        fast-button::part(control) {
          color: var(--secondary-font-color);
        }

        .hidden {
          display: none;
          visibility: hidden;
        }
      `,
    ];
  }

  get input() {
    return this.fileInput;
  }

  get value() {
    return this.fileInput.value;
  }

  get files() {
    return this.fileInput.files;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div>
        <fast-button
          class="file-button"
          appearance="lightweight"
          @click=${this.clickModalInput}
          >Choose File</fast-button
        >
        <input
          id="${this.inputId}"
          class="file-input hidden"
          type="file"
          aria-hidden="true"
          @change=${this.handleModalInputFileChosen}
        />
      </div>
    `;
  }

  clickModalInput() {
    this.fileInput.click();
  }

  handleModalInputFileChosen(evt: Event) {
    console.log('input change event', evt);

    const changeEvent = new CustomEvent('input-change', {
      detail: {},
      composed: true,
      bubbles: true,
    });

    this.dispatchEvent(changeEvent);
  }
}
