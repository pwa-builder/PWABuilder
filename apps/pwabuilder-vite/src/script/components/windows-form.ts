import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../components/loading-button';
import { getManifestContext, getManifestUrl } from '../services/app-info';
import {
  createWindowsPackageOptionsFromManifest,
  emptyWindowsPackageOptions,
} from '../services/publish/windows-publish';
import { WindowsPackageOptions } from '../utils/win-validation';
import { localeStrings } from '../../locales';
import { AppPackageFormBase } from './app-package-form-base';
import { fetchOrCreateManifest } from '../services/manifest';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

@customElement('windows-form')
export class WindowsForm extends AppPackageFormBase {
  @property({ type: Boolean }) generating: boolean = false;
  @state() showAdvanced = false;
  @state() packageOptions: WindowsPackageOptions = emptyWindowsPackageOptions();

  static get styles() {
    return [
      super.styles,
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
        #form-extras {
          display: flex;
          flex-direction: column;
          margin-top: auto;
          padding: 1em;
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

        #generate-submit::part(base) {
          background-color: black;
          color: white;
          font-size: 14px;
          height: 3em;
          width: 100%;
          border-radius: 50px;
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
    `
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    let manifestContext = getManifestContext();
    if (manifestContext.isGenerated) {
      manifestContext = await fetchOrCreateManifest();
    }

    this.packageOptions = createWindowsPackageOptionsFromManifest(
      manifestContext.manifest
    );

    this.packageOptions.targetDeviceFamilies = ['Desktop', 'Holographic'];
  }

  initGenerate(ev: InputEvent) {
    ev.preventDefault();
    this.dispatchEvent(
      new CustomEvent('init-windows-gen', {
        detail: this.packageOptions,
        composed: true,
        bubbles: true,
      })
    );
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
    recordPWABuilderProcessStep("android_form_all_settings_expanded", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(0deg)";
    console.log("hello?")
  }

  rotateNinety(){
    recordPWABuilderProcessStep("android_form_all_settings_collapsed", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(90deg)";
  }

  render() {
    return html`
      <form
        id="windows-options-form"
        @submit="${(ev: InputEvent) => this.initGenerate(ev)}"
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
          <sl-details @click="${(ev: Event) => this.toggleAccordion(ev.target)}" @sl-show=${() => this.rotateNinety()} @sl-hide=${() => this.rotateZero()}>
            <div class="details-summary" slot="summary">
              <p>All Settings</p>
              <img class="dropdown_icon" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
            </div>
            <div id="all-settings-header" slot="heading">
              <span>All Settings</span>
              <div
                class="flipper-button"
                aria-label="caret dropdown"
                role="button"
              >
                <ion-icon name="caret-forward-outline"></ion-icon>
              </div>
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
                  validationErrorMessage:
                    'App name must be between 1 and 256 characters',
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
                ${this.renderFormInput({
                  label: 'Language',
                  tooltip: `Optional. The primary language for your app package. Additional languages can be specified in Windows Partner Center. If empty, EN-US will beused.`,
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
            </div>
          </sl-details>
        </div>
        <div id="form-extras">
          <div id="form-details-block">
            <p>${localeStrings.text.publish.windows_platform.p}</p>
          </div>
          <div id="form-options-actions" class="modal-actions">
            <sl-button  id="generate-submit" type="submit" ?loading="${this.generating}" >
              Generate Package
            </sl-button>
          </div>
        </div>
      </form>
    `;
  }
}
