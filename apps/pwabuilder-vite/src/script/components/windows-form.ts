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
import { ManifestContext } from '../utils/interfaces';

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
        #form-layout {
          flex-grow: 1;
          display: flex;
          overflow: auto;
          flex-direction: column;
          max-height: 400px;
        }

        #form-extras {
          display: flex;
          justify-content: space-between;
          padding: 1em 1.5em;
          background-color: #F2F3FB;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
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

        #form-holder{
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          justify-content: spacve-between;
          height: 100%;
        }

        sl-button::part(label){
          font-size: 16px;
          padding: .5em 2em;
        }

        .arrow_link {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          font-weight: bold;
          margin-bottom: .25em;
          font-size: 14px;
        }
        .arrow_link a {
          text-decoration: none;
          border-bottom: 1px solid rgb(79, 63, 182);
          font-size: 1em;
          font-weight: bold;
          margin: 0px 0.5em 0px 0px;
          line-height: 1em;
          color: rgb(79, 63, 182);
        }
        .arrow_link a:visited {
          color: #4F3FB6;
        }
        .arrow_link:hover {
          cursor: pointer;
        }
        .arrow_link:hover img {
          animation: bounce 1s;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
          }
          40% {
            transform: translateX(-5px);
          }
          60% {
              transform: translateX(5px);
          }
        }

        #tou-link{
          color: 757575;
          font-size: 14px;
        }

        @media(max-width: 640px){
          #form-extras {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1em;
          }
          #form-details-block {
            flex-direction: column;
            gap: .75em;
            align-items: center;
            text-align: center;
            width: 100%;
          }
          #form-options-actions {
            flex-direction: column;
          }
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
  }

  rotateNinety(){
    recordPWABuilderProcessStep("android_form_all_settings_collapsed", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(90deg)";
  }

  render() {
    return html`
    <div id="form-holder">
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

      </form>
      <div id="form-extras">
        <div id="form-details-block">
          <p>${localeStrings.text.publish.windows_platform.p}</p>
          <div class="arrow_link">
            <a @click=${() => recordPWABuilderProcessStep("windows_packaging_instructions_clicked", AnalyticsBehavior.ProcessCheckpoint)} href="https://docs.pwabuilder.com/#/builder/windows" target="_blank" rel="noopener">Packaging Instructions</a>
            <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
          </div>
        </div>
        <div id="form-options-actions" class="modal-actions">
          <sl-button  id="generate-submit" type="submit" form="windows-options-form" ?loading="${this.generating}" >
            Download Package
          </sl-button>
          <a target="_blank" rel="noopener" href="https://github.com/pwa-builder/PWABuilder/blob/master/TERMS_OF_USE.md" id="tou-link">Terms of Use</a>
        </div>
      </div>
    </div>
    `;
  }
}
