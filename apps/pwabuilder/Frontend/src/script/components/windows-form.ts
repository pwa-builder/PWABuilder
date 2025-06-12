import { css, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getManifestContext, getManifestUrl } from '../services/app-info';
import {
  createWindowsPackageOptionsFromManifest,
  emptyWindowsPackageOptions,
  windowsLanguages,
} from '../services/publish/windows-publish';
import { WindowsPackageOptions } from '../utils/win-validation';
import { AppPackageFormBase, FormInput } from './app-package-form-base';
import { fetchOrCreateManifest } from '../services/manifest';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { ManifestContext, PackageOptions } from '../utils/interfaces';
import { AppNameInputPattern } from '../utils/constants';
import "../components/arrow-link";
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/details/details.js';

import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

import { classMap } from 'lit/directives/class-map.js';
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
let actionsSchemaValidation: any = null;

@customElement('windows-form')

export class WindowsForm extends AppPackageFormBase {
  @property({ type: Boolean }) generating: boolean = false;
  @state() showAdvanced = false;
  @state() customSelected = false;
  @state() initialBgColor: string = '';
  @state() currentSelectedColor: string = '';
  @state() packageOptions: WindowsPackageOptions = emptyWindowsPackageOptions();
  @state() activeLanguages: string[] = [];
  @state() activeLanguageCodes: string[] = [];
  @state() userBackgroundColor: string = "";
  @state() showUploadActionsFile: boolean = false;
  @state() actionsFileError: string | null = null;

  static get styles() {
    return [
      ...super.styles,
      css`
        #windows-options-form {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;

        }
        .flipper-button {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .form-generate-button {
          width: 135px;
          height: 40px;
        }
        .basic-settings, .adv-settings {
          display: flex;
          flex-direction: column;
          gap: .75em;
        }
        #form-layout {
          flex-grow: 1;
          display: flex;
          overflow: auto;
          flex-direction: column;
        }
        .form-check:hover input:disabled {
          color: green;
        }

        .form-check:hover input:disabled {
          color: green;
        }

        sl-details {
          margin-top: 1em;
        }

        sl-details::part(base){
          border: none;
        }

        sl-details::part(summary-icon){
          display: none;
        }

        .dropdown_icon {
          transform: rotate(0deg);
          transition: transform .5s;
          height: 30px;
        }

        sl-details::part(header){
          padding: 0 10px;
        }

        .details-summary {
          display: flex;
          align-items: center;
          width: 100%;
        }

        .details-summary p {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }

        .sub-multi {
          font-size: var(--body-font-size);
          margin: 0;
          color: rgba(0,0,0,.5);
        }

        arrow-link {
          margin: 10px 0;
        }

        :host{
          --sl-focus-ring-width: 3px;
          --sl-input-focus-ring-color: #4f3fb670;
          --sl-focus-ring: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
          --sl-input-border-color-focus: #4F3FB6ac;
          --sl-input-font-size-small: 22px;

        }

        #languageDrop::part(display-input){
          min-height: 40px;
        }

        #languageDrop::part(tag){
          font-size: var(--body-font-size);
          color: #757575;
          background-color: #f0f0f0;
          border-radius: var(--input-border-radius);
        }

        #languageDrop::part(listbox){
          background-color: #ffffff;
          height: 200px;
          overflow-y: scroll;
          border-radius: var(--input-border-radius);
          border: 1px solid #c5c5c5;
          margin-top: 3px;
        }

        #languageDrop sl-option::part(base){
          font-size: var(--body-font-size);
          color: #757575;
        }

        #languageDrop sl-option:focus-within::part(base) {
          color: #ffffff;
          background-color: #4F3FB6;
        }

        #languageDrop sl-option::part(base):hover{
          color: #ffffff;
          background-color: #4F3FB6;
        }

        #languageDrop::part(display-label){
          font-size: var(--body-font-size);
          color: #757575;
        }

        sl-color-picker {
          --grid-width: 315px;
          height: 25px;
        }

        sl-color-picker::part(trigger){
          border-radius: 0;
          height: 25px;
          width: 75px;
          display: flex;
        }

        .color-radio::part(control--checked){
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }

        #ai-hub-label {
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        #ai-hub-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
        }

        #ai-hub-text p {
          margin: 0;
          color: #7f7f7f;
          font-size: 14px;
        }

        .actions-error {
          border-color: var(--error-color) !important;
        }

        .actions-error-message {
          font-size: var(--font-size);
        }

    `
    ];
  }

  constructor() {
    super();
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    let manifestContext: ManifestContext | undefined = getManifestContext();
    if (manifestContext.isGenerated) {
      manifestContext = await fetchOrCreateManifest();
    }

    this.packageOptions = createWindowsPackageOptionsFromManifest(
      manifestContext!.manifest
    );

    this.packageOptions.targetDeviceFamilies = ['Desktop', 'Holographic'];

    this.customSelected = this.packageOptions.images?.backgroundColor != 'transparent';
    this.currentSelectedColor = this.packageOptions.images?.backgroundColor!;
    if(manifestContext?.manifest.background_color){
      this.initialBgColor = manifestContext!.manifest.background_color;
    } else {
      this.initialBgColor = "#000000;"
    }
  }

  toggleSettings(settingsToggleValue: 'basic' | 'advanced') {
    if (settingsToggleValue === 'advanced') {
      this.showAdvanced = true;
    } else if (settingsToggleValue === 'basic') {
      this.showAdvanced = false;
    } else {
      this.showAdvanced = false;
    }
  }

  get manifestUrl(): string | null | undefined {
    return getManifestUrl();
  }

  addOrRemoveDeviceFamily(val: string, checked: boolean) {
    if (checked) {
      if (!this.packageOptions.targetDeviceFamilies?.includes(val)) {
        this.packageOptions.targetDeviceFamilies?.push(val);
      }
    } else {
      let index: any = this.packageOptions.targetDeviceFamilies?.indexOf(
        val,
        0
      );
      if (index > -1) {
        this.packageOptions.targetDeviceFamilies?.splice(index, 1);
      }
    }
    this.checkValidityForDeviceFamily();
  }

  checkValidityForDeviceFamily() {
    const checkboxes = this.shadowRoot?.querySelector(
      '#target-device-families'
    );
    const checkedCheckboxes = checkboxes?.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    const desktopCheckbox = this.shadowRoot?.querySelector(
      '#device-family-input-desktop'
    ) as HTMLInputElement;
    if (checkedCheckboxes !== undefined && checkedCheckboxes?.length === 0) {
      desktopCheckbox.setCustomValidity(
        'Please select at least one device family'
      );
    } else {
      desktopCheckbox.setCustomValidity('');
    }
  }

  async updateActionsSelection(checked: boolean) {
    this.showUploadActionsFile = checked;

    if (!checked) {
      delete this.packageOptions.webActionManifestFile;
      actionsSchemaValidation = null;
    } else {
      try {
        const SCHEMA_ID = "https://aka.ms/appactions.schema.json";
        const SCHEMA_URL = "https://raw.githubusercontent.com/microsoft/App-Actions-On-Windows-Samples/refs/heads/main/schema/ActionsSchema.json";
        if (!ajv.getSchema(SCHEMA_ID)) {
          const response = await fetch(SCHEMA_URL);
          const actionsSchema = await response.json();
          ajv.addSchema(actionsSchema, SCHEMA_ID);
        }

        actionsSchemaValidation = ajv.getSchema(SCHEMA_ID);
        this.actionsFileError = null;
      } catch (err) {
        this.actionsFileError = "Schema setup failed.";
      }
    }
  }

  base64ToArrayBuffer(b64: string) {
    const binStr = atob(b64);
    const len = binStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async actionsFileChanged(e: Event) {
    if (!e) return;

    if (!actionsSchemaValidation) {
      this.actionsFileError = "Please enter the decryption key first.";
      return;
    }

    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    const reader = new FileReader();

    if (file) {
      reader.onload = () => {
        try {
          const text: string = reader.result as string;
          const parsed = JSON.parse(text);

          const isValid = actionsSchemaValidation(parsed);

          if (!isValid) {
            const errorDetails = ajv.errorsText(actionsSchemaValidation.errors, { separator: '\n' });
            throw new Error(`Schema validation failed:\n${errorDetails}`);
          }

          const stringified: string = JSON.stringify(parsed, null, 2);
          this.packageOptions.webActionManifestFile = stringified;
          this.actionsFileError = null;
        } catch (err) {
          console.error('Invalid Actions Manifest file:', err);
          this.actionsFileError = (err as Error).message;
        }
      };

      reader.readAsText(file);
    }
  }

  rotateZero(){
    recordPWABuilderProcessStep("windows_form_all_settings_expanded", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(0deg)";
  }

  rotateNinety(){
    recordPWABuilderProcessStep("windows_form_all_settings_collapsed", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(90deg)";
  }

  public getPackageOptions(): PackageOptions {
    return this.packageOptions;
  }

  public getForm(): HTMLFormElement {
    return this.shadowRoot!.querySelector("form")!;
  }

  renderMultiSelect(formInput: FormInput): TemplateResult {
    return html`
      <label for="${formInput.inputId}">
        ${formInput.label}
        ${this.renderTooltip(formInput)}
      </label>
      <div id="multiSelectBox">
        <div class="multi-wrap">
          <p class="sub-multi">Select Multiple Languages</p>
          <sl-select id="languageDrop"
            placeholder="Select one or more languages"
            @sl-change=${(e: any) => this.packageOptions.resourceLanguage = e.target.value}
            value=${this.packageOptions.resourceLanguage!}
            ?stayopenonselect=${true}
            multiple
            .maxOptionsVisible=${5}
            size="small"
          >
          ${windowsLanguages.map((lang: any) =>
            html`
              ${lang.codes.map((code: string) =>
                html`
                  <sl-option value=${code}>${lang.name} - ${code}</sl-option>
                `
              )}
            `
          )}
          </sl-select>
        </div>
      </div>
    `;
  }

  renderColorToggle(formInput: FormInput): TemplateResult {
    return html`
      <label for="${formInput.inputId}">
        ${formInput.label}
        ${this.renderTooltip(formInput)}
      </label>
      <div id="iconColorPicker">
        <div class="color-wrap">
          <p class="sub-multi">Select your Windows icons background color</p>
          <sl-radio-group
            id="icon-bg-radio-group"
            .value=${'transparent'}
            @sl-change=${() => this.toggleIconBgRadios()}
          >
            <sl-radio class="color-radio" size="small" value="transparent">Transparent</sl-radio>
            <sl-radio class="color-radio" size="small" value="custom">Custom Color</sl-radio>
          </sl-radio-group>
          ${this.customSelected ? html`
            ${this.renderFormInput(formInput)}
          ` : null}
        </div>
      </div>
    `;
  }

  toggleIconBgRadios(){
    let input = (this.shadowRoot?.getElementById("icon-bg-radio-group") as any);
    let selected = input.value;

    // update values
    if(this.customSelected){
      this.packageOptions.images!.backgroundColor = 'transparent';
    } else {
      this.packageOptions.images!.backgroundColor = this.initialBgColor;
      this.currentSelectedColor = this.initialBgColor;
    }

    // switch flag which will trigger update
    this.customSelected = selected !== 'transparent';
  }

  render() {
    return html`
    <div id="form-holder">
      <form
        id="windows-options-form"
        slot="modal-form"
        style="width: 100%"
      >
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              ${this.renderFormInput({
                label: 'Package ID',
                tooltip: `The Package ID uniquely identifying your app in the Microsoft Store. Get this value from Windows Partner Center.`,
                tooltipLink:
                  'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/',
                inputId: 'package-id-input',
                required: true,
                placeholder: 'MyCompany.MyApp',
                minLength: 3,
                maxLength: 50,
                spellcheck: false,
                pattern: '[a-zA-Z0-9.-]*$',
                validationErrorMessage:
                  'Package ID must contain only letters, numbers, period, or hyphen.',
                inputHandler: (val: string) =>
                  (this.packageOptions.packageId = val),
              })}
            </div>
            <div class="form-group">
              ${this.renderFormInput({
                label: 'Publisher ID',
                tooltip: `The ID of your app's publisher. Get this value from Windows Partner Center.`,
                tooltipLink:
                  'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/',
                inputId: 'publisher-id-input',
                placeholder: 'CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca',
                validationErrorMessage:
                  'Publisher ID must be in the format CN=XXXX. Get your publisher ID from Partner Center.',
                pattern: 'CN=.+',
                required: true,
                spellcheck: false,
                minLength: 4,
                inputHandler: (val: string) =>
                  (this.packageOptions.publisher.commonName = val),
              })}
            </div>
            <div class="form-group">
              ${this.renderFormInput({
                label: 'Publisher display name',
                tooltip: `The display name of your app's publisher. Gets this value from Windows Partner Center.`,
                tooltipLink:
                  'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/',
                inputId: 'publisher-display-name-input',
                required: true,
                minLength: 3,
                spellcheck: false,
                validationErrorMessage:
                  'Publisher display name must be at least 3 characters. Get this value from Windows Partner Center.',
                placeholder: 'Contoso Inc',
                inputHandler: (val: string) =>
                  (this.packageOptions.publisher.displayName = val),
              })}
            </div>
            <div class="form-group" id="ai-hub">
              <div id="ai-hub-label">
                <label>Does your app use AI?</label>
                <info-circle-tooltip
                  text="AI Hub is a new curated section in the Microsoft Store that navigates Windows users to the best AI experiences built by the developer community and Microsoft."
                  link="https://blogs.windows.com/windowsdeveloper/2023/05/23/welcoming-ai-to-the-microsoft-store-on-windows/"
                  @click=${() => {
                    recordPWABuilderProcessStep("ai_hub_read_more_link_click", AnalyticsBehavior.ProcessCheckpoint)
                    }
                  }
                  ></info-circle-tooltip>
              </div>
              <div id="ai-hub-text">
                <p>We will promote the best AI experiences built by the developer community on our Microsoft Store's AI Hub.</p>
                <arrow-link .text=${"Join Us"} .link=${"https://aka.ms/MicrosoftStoreAIHub"}></arrow-link>
              </div>
            </div>
          </div>
          <!-- "all settings" section of the modal -->
          <sl-details @sl-show=${() => this.rotateNinety()} @sl-hide=${() => this.rotateZero()}>
            <div class="details-summary" slot="summary">
              <p>All Settings</p>
              <img class="dropdown_icon" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
            </div>
            <div class="adv-settings">
              <div class="form-group">
                ${this.renderFormInput({
                  label: 'App name',
                  tooltip: `The name of your app. This is displayed to users in the Store.`,
                  tooltipLink:
                    'https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-displayname',
                  inputId: 'app-name-input',
                  required: true,
                  minLength: 1,
                  maxLength: 256,
                  value: this.packageOptions.name,
                  placeholder: 'My Awesome PWA',
                  pattern: AppNameInputPattern,
                  validationErrorMessage:
                    'App name must not include special characters and be between 1 and 256 characters',
                  inputHandler: (val: string) =>
                    (this.packageOptions.name = val),
                })}
              </div>
              <div class="form-group">
                ${this.renderFormInput({
                  label: 'App version',
                  tooltip: `Your app version in the form of '1.0.0'. It must not start with zero and must be greater than classic package version. For new apps, this should be set to 1.0.1`,
                  tooltipLink:
                    'https://blog.pwabuilder.com/docs/what-is-a-classic-package/',
                  inputId: 'version-input',
                  required: true,
                  minLength: 5,
                  value: this.packageOptions.version,
                  placeholder: '1.0.1',
                  spellcheck: false,
                  pattern: '^[^0]+\\d*.\\d+.\\d+$',
                  validationErrorMessage:
                    "Version must be in the form of '1.0.0', cannot start with zero, and must be greater than classic version",
                  inputHandler: (val: string) =>
                    (this.packageOptions.version = val),
                })}
              </div>
              <div class="form-group">
                ${this.renderFormInput({
                  label: 'Classic app version',
                  tooltip: `The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0', it cannot start with zero, and must be less than app version. For new apps, this should be set to 1.0.0`,
                  tooltipLink:
                    'https://blog.pwabuilder.com/docs/what-is-a-classic-package/',
                  inputId: 'classic-version-input',
                  required: true,
                  minLength: 5,
                  value: this.packageOptions.classicPackage?.version,
                  placeholder: '1.0.0',
                  pattern: '^[^0]+\\d*.\\d+.\\d+$',
                  validationErrorMessage:
                    "Classic app version must be in the form of '1.0.0', cannot start with zero, and must be less than than app version",
                  inputHandler: (val: string) =>
                    (this.packageOptions.classicPackage!.version = val),
                })}
              </div>
              <div class="form-group">
                ${this.renderFormInput({
                  label: 'Icon URL',
                  tooltip: `The URL of an icon to use for your app. This should be a 512x512 or larger, square PNG image. Additional Windows image sizes will be fetched from your manifest, and any missing Windows image sizes will be generated by PWABuilder. The URL can be an absolute path or relative to your manifest.`,
                  tooltipLink:
                    'https://blog.pwabuilder.com/docs/image-recommendations-for-windows-pwa-packages/',
                  inputId: 'icon-url-input',
                  required: true,
                  type: 'text', // NOTE: can't use URL here, because we allow relative paths.
                  minLength: 2,
                  validationErrorMessage:
                    'Must be an absolute URL or a URL relative to your manifest',
                  value: this.packageOptions.images?.baseImage || '',
                  placeholder: '/images/512x512.png',
                  inputHandler: (val: string) =>
                    (this.packageOptions.images!.baseImage = val),
                })}
              </div>
              <div class="form-group">
                ${this.renderColorToggle({
                  label: 'Icon Background Color',
                  tooltip: `Optional. The background color of the Windows icons that will be generated with your .msix.`,
                  tooltipLink:
                    'https://learn.microsoft.com/en-us/windows/apps/design/style/iconography/app-icon-design#color-contrast',
                  inputId: 'icon-bg-color-input',
                  type: 'color',
                  value: this.packageOptions.images?.backgroundColor!,
                  placeholder: 'transparent',
                  inputHandler: (val: string) => this.packageOptions.images!.backgroundColor = val,
                })}
              </div>
              <div class="form-group">
                ${this.renderMultiSelect({
                  label: 'Language',
                  tooltip: `Optional. Select as many languages as your app supports. Additional languages can be specified in Windows Partner Center. If empty, EN-US will be used.`,
                  tooltipLink:
                    'https://docs.microsoft.com/en-us/windows/uwp/publish/supported-languages',
                  inputId: 'language-input',
                  value: this.packageOptions.resourceLanguage,
                  placeholder: 'EN-US',
                  inputHandler: (val: string) =>
                    (this.packageOptions.resourceLanguage = val),
                })}
              </div>
              <div class="form-group" id="target-device-families">
                <label>Target device families</label>
                <div class="form-check">
                  ${this.renderFormInput({
                    label: 'Desktop',
                    value: 'Desktop',
                    tooltip:
                      'Identifies the device family that your package targets. Both Desktop and Holographic are enabled by default',
                    tooltipLink:
                      'https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-targetdevicefamily',
                    inputId: 'device-family-input-desktop',
                    type: 'checkbox',
                    checked: true,
                    inputHandler: (val: string, checked: boolean) => {
                      this.addOrRemoveDeviceFamily(val, checked);
                    },
                  })}
                </div>
                <div class="form-check">
                  ${this.renderFormInput({
                    label: 'Holographic (HoloLens)',
                    value: 'Holographic',
                    tooltip:
                      'Identifies the device family that your package targets. Both Desktop and Holographic are enabled by default',
                    tooltipLink:
                      'https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-targetdevicefamily',
                    inputId: 'device-family-input-holographic',
                    type: 'checkbox',
                    checked: true,
                    inputHandler: (val: string, checked: boolean) => {
                      this.addOrRemoveDeviceFamily(val, checked);
                    },
                  })}
                </div>
                <div class="form-check">
                  ${this.renderFormInput({
                    label: 'Surface Hub (Team)',
                    value: 'Team',
                    tooltip:
                      'Identifies the device family that your package targets.',
                    tooltipLink:
                      'https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-targetdevicefamily',
                    inputId: 'device-family-input-team',
                    type: 'checkbox',
                    checked: false,
                    inputHandler: (val: string, checked: boolean) => {
                      this.addOrRemoveDeviceFamily(val, checked);
                    },
                  })}
                </div>
              </div>
              <div class="form-group" id="widgets-picker">
                <label>Widgets</label>
                <div class="form-check">
                  ${this.renderFormInput({
                    label: 'Enable Widgets',
                    value: 'Widgets',
                    tooltip:
                      'Enables your Windows package to serve the widgets listed in your web manifest to the Widgets Panel.',
                    tooltipLink:
                      'https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/widgets',
                    inputId: 'widget-checkbox',
                    type: 'checkbox',
                    checked: this.packageOptions.enableWebAppWidgets,
                    disabled: !this.packageOptions.enableWebAppWidgets,
                    disabledTooltipText: "You must have widgets set up in your web manifest to enable Widgets for your Windows package.",
                    inputHandler: (_val: string, checked: boolean) =>
                      (this.packageOptions.enableWebAppWidgets = checked),
                  })}
                </div>
              </div>
              <div class="form-group" id="actions-picker">
                <label>Actions</label>
                <div class="form-check">
                  ${this.renderFormInput({
                    label: 'Enable Actions',
                    value: 'Actions',
                    tooltip:
                      'Enables your Windows package to serve the actions listed in your ActionsManifest.json.',
                    tooltipLink:
                      'https://aka.ms/pwa-winaction',
                    inputId: 'actions-checkbox',
                    type: 'checkbox',
                    checked: this.showUploadActionsFile,
                    disabled: (!this.packageOptions.manifest?.share_target || !this.packageOptions.manifest?.protocol_handlers),
                    disabledTooltipText: "You must have both share_target and protocol_handlers set up in your web manifest to enable Actions.",
                    inputHandler: (_val: string, checked: boolean) =>
                      (this.updateActionsSelection(checked)),
                  })}
                </div>
                ${this.showUploadActionsFile ?
                  html`
                    <input id="actions-file-picker" class=${classMap({ 'actions-error': this.actionsFileError !== null })} type="file" label="actions-manifest-input" accept=".json" @change=${(e: Event) => this.actionsFileChanged(e)}/>
                    ${this.actionsFileError ? html`<div class="actions-error-message">${this.actionsFileError}</div>` : ''}
                  ` :
                  null
                }
              </div>
            </div>
          </sl-details>
        </div>
      </form>
    </div>
    `;
  }
}