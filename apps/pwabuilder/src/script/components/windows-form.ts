import { css, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getManifestContext, getManifestUrl } from '../services/app-info';
import {
  createWindowsPackageOptionsFromManifest,
  emptyWindowsPackageOptions,
} from '../services/publish/windows-publish';
import { WindowsPackageOptions } from '../utils/win-validation';
import { AppPackageFormBase, FormInput } from './app-package-form-base';
import { fetchOrCreateManifest } from '../services/manifest';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { ManifestContext, PackageOptions } from '../utils/interfaces';

@customElement('windows-form')

export class WindowsForm extends AppPackageFormBase {
  @property({ type: Boolean }) generating: boolean = false;
  @state() showAdvanced = false;
  @state() packageOptions: WindowsPackageOptions = emptyWindowsPackageOptions();
  @state() activeLanguages: string[] = [];
  @state() activeLanguageCodes: string[] = [];

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
          font-size: var(--smallish-font-size);
          margin: 0;
          color: rgba(0,0,0,.5);
        }

        #activeLanguages {
          box-sizing: border-box;
          height: 40px;
          border: 1px solid #c5c5c5;
          border-radius: 8px;
          width: 100%;
          margin-bottom: 10px;
          display: flex;
          gap: 5px;
          overflow: auto hidden;
          align-items: center;
          justify-content: flex-start;
          padding: 2px;
}
        #activeLanguages sl-tag::part(base) {
          height: 35px;
          font-size: 16px;
          color: #757575;
          background-color: #f0f0f0;
          border-radius: 8px;
          padding: 8px 15px;
          gap: 40px;
        }

        #languageDrop {
          width: 100%;
        }


        #languageDrop sl-button {
          height: 40px;
          border: 1px solid #c5c5c5;
          border-radius: 8px;
          width: 100%;
        }

        #languageDrop sl-button::part(base) {
          height: 40px;
          border: 1px solid #c5c5c5;
          border-radius: 8px;
          width: 100%;
          padding: 0;
          border: none;
          background: transparent;
          align-items: center;
          justify-content: flex-start;
          color: #757575;
          font-size: 16px;
          font-weight: normal;
        }

        #languageDrop sl-button::part(label) {
          margin-right: auto;
        }

        #languageDrop sl-button::part(caret){
          padding: 10px;
        }

        #langWrapper {
          display: flex;
          flex-direction: column;
          background: lightblue;
          width: 100%;
          height: 200px;
          overflow-y: scroll;
          border-bottom-right-radius: 8px;
          border-bottom-left-radius: 8px;
        }
    `
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    let manifestContext: ManifestContext | undefined = getManifestContext();
    if (manifestContext.isGenerated) {
      manifestContext = await fetchOrCreateManifest();
    }

    this.packageOptions = createWindowsPackageOptionsFromManifest(
      manifestContext!.manifest
    );

    this.packageOptions.targetDeviceFamilies = ['Desktop', 'Holographic'];


    if(this.packageOptions.resourceLanguage){
      let lang = this.packageOptions.resourceLanguage;
      for(let i = 0; i < windowsLanguages.length; i++){
        let cur = windowsLanguages[i];
        if(cur.name === lang){
          this.activeLanguages.push(cur.name);
          this.activeLanguageCodes.push(cur.code);
          break;
        }
      }
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

  /* label: 'Language',
  tooltip: `Optional. The primary language for your app package. Additional languages can be specified in Windows Partner Center. If empty, EN-US will beused.`,
  tooltipLink:
    'https://docs.microsoft.com/en-us/windows/uwp/publish/supported-languages',
  inputId: 'language-input',
  value: this.packageOptions.resourceLanguage,
  placeholder: 'EN-US',
  inputHandler: (val: string) =>
    (this.packageOptions.resourceLanguage = val), */
  renderMultiSelect(formInput: FormInput): TemplateResult {
    return html`
      <label for="${formInput.inputId}">
        ${formInput.label}
        ${this.renderTooltip(formInput)}
      </label>
      <div id="multiSelectBox">
        <div class="multi-wrap">
          <p class="sub-multi">Selected Languages</p>
          <div id="activeLanguages">
            ${this.activeLanguages.map((lang: string, index: number) => html`<sl-tag size="large" @sl-remove=${() => this.removeLanguage(index)} removable>${lang}</sl-tag>`)}
          </div>
        </div>
        <div class="multi-wrap">
          <p class="sub-multi">Selected Multiple Languages</p>
          <sl-dropdown  id="languageDrop" ?stayopenonselect=${true}>
            <sl-button slot="trigger" caret>Select</sl-button>
            <div id="langWrapper"> 
              ${windowsLanguages.map((lang: any) => html`<sl-menu-item ?checked=${this.activeLanguages.includes(lang.name)} @click=${() => this.addLanguage(lang)}>${lang.name}</sl-menu-item>`)}
            </div>
          </sl-dropdown>
        </div>
      </div>
    `;
  }

  addLanguage(lang: any){
    if(!this.activeLanguages.includes(lang.name)){
      this.activeLanguages.push(lang.name);
      this.activeLanguageCodes.push(lang.code);
    } else {
      let index = this.activeLanguages.indexOf(lang.name);
      this.removeLanguage(index);
    }

    console.log(this.activeLanguages);
    console.log(this.activeLanguageCodes);
    this.requestUpdate();
  }

  removeLanguage(index: number){
    this.activeLanguages = this.activeLanguages.filter((_item: any, i: number) => i != index );
    this.activeLanguageCodes = this.activeLanguageCodes.filter((_item: any, i: number) => i != index );

    console.log(this.activeLanguages);
    console.log(this.activeLanguageCodes);

    this.requestUpdate();
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
                  pattern: "[^|$@#><)(!&%*]*$",
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
                ${this.renderMultiSelect({
                  label: 'Language',
                  tooltip: `Optional. The primary language for your app package. Additional languages can be specified in Windows Partner Center. If empty, EN-US will beused.`,
                  tooltipLink:
                    'https://docs.microsoft.com/en-us/windows/uwp/publish/supported-languages',
                  inputId: 'language-input',
                  value: this.activeLanguageCodes,
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
            </div>
          </sl-details>
        </div>

      </form>
    </div>
    `;
  }
}


const windowsLanguages = [
  { "code": "ar", "name": "Arabic" },
  { "code": "af", "name": "Afrikaans" },
  { "code": "sq", "name": "Albanian" },
  { "code": "am", "name": "Amharic" },
  { "code": "hy", "name": "Armenian" },
  { "code": "as", "name": "Assamese" },
  { "code": "az-arab", "name": "Azerbaijani" },
  { "code": "eu", "name": "Basque (Basque)" },
  { "code": "be", "name": "Belarusian" },
  { "code": "bn", "name": "Bangla" },
  { "code": "bs", "name": "Bosnian" },
  { "code": "bg", "name": "Bulgarian" },
  { "code": "ca", "name": "Catalan" },
  { "code": "chr-cher", "name": "Cherokee" },
  { "code": "zh-Hans", "name": "Chinese (Simplified)" },
  { "code": "zh-Hant", "name": "Chinese (Traditional)" },
  { "code": "hr", "name": "Croatian" },
  { "code": "cs", "name": "Czech" },
  { "code": "da", "name": "Danish" },
  { "code": "prs", "name": "Dari" },
  { "code": "nl", "name": "Dutch" },
  { "code": "en", "name": "English" },
  { "code": "et", "name": "Estonian" },
  { "code": "fil", "name": "Filipino" },
  { "code": "fi", "name": "Finnish" },
  { "code": "fr", "name": "French" },
  { "code": "gl", "name": "Galician" },
  { "code": "ka", "name": "Georgian" },
  { "code": "de", "name": "German" },
  { "code": "el", "name": "Greek" },
  { "code": "gu", "name": "Gujarati" },
  { "code": "ha", "name": "Hausa" },
  { "code": "he", "name": "Hebrew" },
  { "code": "hi", "name": "Hindi" },
  { "code": "hu", "name": "Hungarian" },
  { "code": "is", "name": "Icelandic" },
  { "code": "ig-ng", "name": "Igbo" },
  { "code": "id", "name": "Indonesian" },
  { "code": "iu-cans", "name": "Inuktitut (Latin)" },
  { "code": "ga", "name": "Irish" },
  { "code": "xh", "name": "isiXhosa" },
  { "code": "zu", "name": "isiZulu" },
  { "code": "it", "name": "Italian" },
  { "code": "ja", "name": "Japanese" },
  { "code": "kn", "name": "Kannada" },
  { "code": "kk", "name": "Kazakh" },
  { "code": "km", "name": "Khmer" },
  { "code": "quc-latn", "name": "K'iche'" },
  { "code": "rw", "name": "Kinyarwanda" },
  { "code": "sw", "name": "KiSwahili" },
  { "code": "kok", "name": "Konkani" },
  { "code": "ko", "name": "Korean" },
  { "code": "ku-arab", "name": "Kurdish" },
  { "code": "ky-kg", "name": "Kyrgyz" },
  { "code": "lo", "name": "Lao" },
  { "code": "lv", "name": "Latvian" },
  { "code": "lt", "name": "Lithuanian" },
  { "code": "lb", "name": "Luxembourgish" },
  { "code": "mk", "name": "Macedonian" },
  { "code": "ms", "name": "Malay" },
  { "code": "ml", "name": "Malayalam" },
  { "code": "mt", "name": "Maltese" },
  { "code": "mi", "name": "Maori" },
  { "code": "mr", "name": "Marathi" },
  { "code": "mn-cyrl", "name": "Mongolian (Cyrillic)" },
  { "code": "ne", "name": "Nepali" },
  { "code": "no", "name": "Norwegian" },
  { "code": "or", "name": "Odia" },
  { "code": "fa", "name": "Persian" },
  { "code": "pl", "name": "Polish" },
  { "code": "pt-br", "name": "Portuguese (Brazil)" },
  { "code": "pt", "name": "Portuguese (Portugal)" },
  { "code": "pa", "name": "Panjabi" },
  { "code": "quz", "name": "Quechua" },
  { "code": "ro", "name": "Romanian" },
  { "code": "ru", "name": "Russian" },
  { "code": "gd-gb", "name": "Scottish Gaelic" },
  { "code": "sr-Latn", "name": "Serbian (Latin)" },
  { "code": "sr-cyrl", "name": "Serbian (Cyrillic)" },
  { "code": "nso", "name": "Sesotho sa Leboa" },
  { "code": "tn", "name": "Setswana" },
  { "code": "sd-arab", "name": "Sindhi" },
  { "code": "si", "name": "Sinhala" },
  { "code": "sk", "name": "Slovak" },
  { "code": "sl", "name": "Slovenian" },
  { "code": "es", "name": "Spanish" },
  { "code": "sv", "name": "Swedish" },
  { "code": "tg-arab", "name": "Tajik (Cyrillic)" },
  { "code": "ta", "name": "Tamil" },
  { "code": "tt", "name": "Tatar" },
  { "code": "te", "name": "Telugu" },
  { "code": "tk-cyrl", "name": "Turkmish" },
  { "code": "uk", "name": "Ukrainian" },
  { "code": "uk", "name": "Ukrainian" },
  { "code": "ur", "name": "Urdu" },
  { "code": "ug-arab", "name": "Uyghur" },
  { "code": "uz", "name": "Uzbek (Latin)" },
  { "code": "vi", "name": "Vietnamese" },
  { "code": "cy", "name": "Welsh" },
  { "code": "wo", "name": "Wolof" },
  { "code": "yo-ng", "name": "Yoruba" },
]