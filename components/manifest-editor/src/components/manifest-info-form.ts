import { LitElement, css, html, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Manifest } from '../utils/interfaces';
import { validateSingleField } from '@pwabuilder/manifest-validation';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';

const displayOptions: Array<string> =  ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
const defaultColor: string = "#000000";
let manifestInitialized: boolean = false;

@customElement('manifest-info-form')
export class ManifestInfoForm extends LitElement {

  @property({type: Object}) manifest: Manifest = {};

  @state() bgText: string = '';
  @state() themeText: string = '';

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
      .color_field input[type="radio"]{
        height: 25px;
        width: fit-content;
        margin: 5px;
      }
      .color_selection {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      .color_field input[type="color"]{
        width: 75px;
        height: 25px;
        padding: 0;
        border-radius: 0;
        border: 1px solid #808080;
        outline: none;
      }
      .color_field input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
      }
      .color_field input[type="color"]:hover {
        cursor: pointer;
      }
      .color-holder p {
        font-size: 16px;
        color: #808080;
      }
      sl-menu {
        width: 100%;
      }
      .switch_box {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .switch_box p {
        font-size: 16px;
      }
      sl-switch {
        --height: 22px;
      }
    `;
  }

  constructor() {
    super();
  }

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if(_changedProperties.has("manifest") && !manifestInitialized && this.manifest.name){
      manifestInitialized = true;
      this.initMissingColors();
    }
  }

  initMissingColors(){
    if(!this.manifest.theme_color){
      let manifestUpdated = new CustomEvent('manifestUpdated', {
        detail: {
            field: "theme_color",
            change: "#000000"
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(manifestUpdated);
    }
    if(!this.manifest.background_color){
      let manifestUpdated = new CustomEvent('manifestUpdated', {
        detail: {
            field: "background_color",
            change: "#000000"
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(manifestUpdated);
    }

  }

  async handleInputChange(event: InputEvent){

    const input = <HTMLInputElement | HTMLSelectElement>event.target;
    let updatedValue = input.value;
    const fieldName = input.dataset['field'];
    input.classList.toggle("input-focused");

    const validation = await validateSingleField(fieldName!, updatedValue);
    //console.log("validation", validation);

    if(validation){
      // Since we already validated, we only send valid updates.
      let manifestUpdated = new CustomEvent('manifestUpdated', {
        detail: {
            field: fieldName,
            change: updatedValue
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(manifestUpdated);
    } else {
      console.error("input invalid.");
      // realistically we'll do some visual thing to show it is invalid.
    }

  }

  handleColorSwitch(field: string){
    let color = (this.shadowRoot!.getElementById(field + "_picker") as HTMLInputElement).value;
    let manifestUpdated = new CustomEvent('manifestUpdated', {
      detail: {
          field: field,
          change: color
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
              <h3>*Name</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/name"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the name option in your manifest.
                </p>
              </a>
            </div>
            <p>The name of your app as displayed to the user</p>
            <sl-input placeholder="PWA Name" .value=${this.manifest.name! || ""} data-field="name" @sl-change=${this.handleInputChange}></sl-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3>*Short Name</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/short_name"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the short name option in your manifest.
                </p>
              </a>
            </div>
            <p>Used in app launchers</p>
            <sl-input placeholder="PWA Short Name" .value=${this.manifest.short_name! || ""} data-field="short_name" @sl-change=${this.handleInputChange}></sl-input>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <h3>Description</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/description"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the description option in your manifest.
                </p>
              </a>
            </div>
            <p>Used in app storefronts and install dialogs</p>
            <sl-input placeholder="PWA Description" .value=${this.manifest.description! || ""} data-field="description" @sl-change=${this.handleInputChange}></sl-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3>Display</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/display"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the display option in your manifest.
                </p>
              </a>
            </div>
            <p>The appearance of your app window</p>
            <sl-select placeholder="Select a Display" data-field="display" @sl-change=${this.handleInputChange} .value=${this.manifest.display! || ""}>
              ${displayOptions.map((option: string) => html`<sl-menu-item value=${option}>${option}</sl-menu-item>`)}
            </sl-select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field color_field">
            <div class="field-header">
              <h3>Background Color</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/background_color"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the background color option in your manifest.
                </p>
              </a>
            </div>
            <p>Select a Background color</p>
              <span class="color-holder"><input type="color" id="background_color_picker" .value=${this.manifest.background_color! || defaultColor} data-field="background_color" @change=${() => this.handleColorSwitch("background_color")} /> <p id="background_color_string" class="color_string">${this.manifest.background_color?.toLocaleUpperCase() || defaultColor}</p></span>
            </div>
          <div class="form-field color_field">
            <div class="field-header">
              <h3>Theme Color</h3>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color"
                target="_blank"
                rel="noopener"
              >
                <ion-icon name="information-circle-outline"></ion-icon>
                <p class="toolTip">
                  Click for more info on the theme color option in your manifest.
                </p>
              </a>
            </div>
              <p>Select a Theme color</p>
              <span class="color-holder"><input type="color" id="theme_color_picker" .value=${this.manifest.theme_color! || defaultColor} data-field="theme_color" @change=${() => this.handleColorSwitch("theme_color")} /> <p id="theme_color_string" class="color_string">${this.manifest.theme_color?.toLocaleUpperCase() || defaultColor}</p></span>
          </div>
        </div>
      </div>
    `;
  }
}