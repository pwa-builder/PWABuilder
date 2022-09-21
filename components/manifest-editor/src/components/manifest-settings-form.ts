import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Manifest } from '../utils/interfaces';
import { langCodes, languageCodes } from '../locales';

// import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';

@customElement('manifest-settings-form')
export class ManifestSettingsForm extends LitElement {

  @property({type: Object}) manifest: Manifest = {};

  static get styles() {
    return css`
      sl-input::part(base),
      sl-select::part(control),
      sl-menu-item::part(base) {
        --sl-input-font-size-medium: 16px;
        --sl-font-size-medium: 16px;
        --sl-input-height-medium: 3em;
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
      .form-row p {
        font-size: 14px;
        margin: 0;
      }
      .form-field {
        width: 50%;
        row-gap: .25em;
        display: flex;
        flex-direction: column;
      }
      .field-header{
        display: flex;
        align-items: center;
        column-gap: 5px;
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
        visibility: hidden;
        width: 200px;
        background-color: #f8f8f8;
        color: black;
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        /* Position the tooltip */
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1;
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
    `;
  }

  constructor() {
    super();
  }

  firstUpdated(){
  }

  handleInputChange(event: InputEvent){

    const input = <HTMLInputElement | HTMLSelectElement>event.target;
    let updatedValue = input.value;
    const fieldName = input.dataset['field'];

    // Validate using Justin's code
    // if false, show error logic
    // else continue

    let manifestUpdated = new CustomEvent('manifestUpdated', {
      detail: {
          field: fieldName,
          change: updatedValue
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(manifestUpdated);
  }

  render() {
    return html`
      <div id="form-holder">
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <h3>*Start URL</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/start_url"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the start url option in your manifest.
                </p>
              </a>
            </div>
            <p>The relative URL that loads when your app starts</p>
            <sl-input placeholder="PWA Start URL" .value=${this.manifest.start_url! || ""} data-field="start_url" @sl-change=${this.handleInputChange}></sl-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3>Scope</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/scope"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the scope option in your manifest.
                </p>
              </a>
            </div>
            <p>Which URLs can load within your app</p>
            <sl-input placeholder="PWA Scope" data-field="scope" .value=${this.manifest.scope! || ""} @sl-change=${this.handleInputChange}></sl-input>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <h3>Orientation</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the orientaiton option in your manifest.
                </p>
              </a>
            </div>
            <p>The default screen orientation of your app</p>
            <sl-select placeholder="Select an Orientation" data-field="orientation" .value=${this.manifest.orientation! || ""} @sl-change=${this.handleInputChange}>
              ${orientationOptions.map((option: string) => html`<sl-menu-item value=${option}>${option}</sl-menu-item>`)}
            </sl-select>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3>Language</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/language"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the language option in your manifest.
                </p>
              </a>
            </div>
            <p>The primary language of your app</p>
            <sl-select placeholder="Select a Language" data-field="lang" .value=${this.manifest.lang! || ""} @sl-change=${this.handleInputChange}>
              ${languageCodes.map((lang: langCodes) => html`<sl-menu-item value=${lang.code}>${lang.formatted}</sl-menu-item>`)}
            </sl-select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <h3>Dir</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/dir"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the dir option in your manifest.
                </p>
              </a>
            </div>
            <p>The base direction in which to display direction-capable members of the manifest</p>
            <sl-select placeholder="Select a Direction" data-field="dir" .value=${this.manifest.dir! || ""} @sl-change=${this.handleInputChange}>
              ${dirOptions.map((option: string) => html`<sl-menu-item value=${option}>${option}</sl-menu-item>`)}
            </sl-select>
          </div>
        </div>
      </div>
    `;
  }
}

const orientationOptions: Array<string> =  ['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary', 'landscape-primary', 'landscape-secondary'];
const dirOptions: Array<string> = ['auto', 'ltr', 'rtl'];