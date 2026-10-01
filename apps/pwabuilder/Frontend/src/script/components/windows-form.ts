import { html, TemplateResult } from 'lit';
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
import { ManifestContext, PackageOptions } from '../utils/interfaces';
import { AppNameInputPattern } from '../utils/constants';
import '../components/arrow-link';
import { windowsFormStyles } from "./windows-form.styles";
import "@awesome.me/webawesome/dist/components/details/details.js";
import "@awesome.me/webawesome/dist/components/select/select.js";
import "@awesome.me/webawesome/dist/components/radio-group/radio-group.js";
import "@awesome.me/webawesome/dist/components/radio/radio.js";
import "@awesome.me/webawesome/dist/components/option/option.js";
import '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';

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

    static get styles() {
        return [
            ...super.styles,
            windowsFormStyles
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
        if (manifestContext?.manifest.background_color) {
            this.initialBgColor = manifestContext!.manifest.background_color;
        } else {
            this.initialBgColor = "#000000";
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
        const container = this.shadowRoot?.querySelector(
            '#target-device-families'
        );
        const checkboxes = Array.from(container?.querySelectorAll('wa-checkbox') ?? []);
        const checkedCheckboxes = checkboxes.filter(cb => (cb as unknown as { checked: boolean }).checked);
        const desktopCheckbox = this.shadowRoot?.querySelector(
            '#device-family-input-desktop'
        ) as unknown as { setCustomValidity(message: string): void };
        if (checkedCheckboxes.length === 0) {
            desktopCheckbox.setCustomValidity(
                'Please select at least one device family'
            );
        } else {
            desktopCheckbox.setCustomValidity('');
        }
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
          <wa-select id="languageDrop"
            placeholder="Select one or more languages"
            @change=${(e: any) => this.packageOptions.resourceLanguage = e.target.value}
            value=${this.packageOptions.resourceLanguage!}
            multiple
            .maxOptionsVisible=${5}
            size="s"
          >
          ${windowsLanguages.map((lang: any) =>
            html`
              ${lang.codes.map((code: string) =>
                html`
                  <wa-option value=${code}>${lang.name} - ${code}</wa-option>
                `
            )}
            `
        )}
          </wa-select>
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
          <wa-radio-group
            id="icon-bg-radio-group"
            .value=${'transparent'}
            @change=${() => this.toggleIconBgRadios()}
          >
            <wa-radio class="color-radio" size="s" value="transparent">Transparent</wa-radio>
            <wa-radio class="color-radio" size="s" value="custom">Custom Color</wa-radio>
          </wa-radio-group>
          ${this.customSelected ? html`
            ${this.renderFormInput(formInput)}
          ` : null}
        </div>
      </div>
    `;
    }

    toggleIconBgRadios() {
        let input = (this.shadowRoot?.getElementById("icon-bg-radio-group") as any);
        let selected = input.value;

        // update values
        if (this.customSelected) {
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
            tooltip: `The Package ID uniquely identifying your app in the Microsoft Store. Get this value from Microsoft Partner Center.`,
            tooltipLink:
                'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/',
            inputId: 'package-id-input',
            required: true,
            placeholder: 'MyCompany.MyApp',
            value: this.packageOptions.packageId,
            minLength: 3,
            maxLength: 50,
            spellcheck: false,
            pattern: '[a-zA-Z0-9.\\-]*$',
            validationErrorMessage:
                'Package ID must contain only letters, numbers, period, or hyphen.',
            inputHandler: (val: string) =>
                (this.packageOptions.packageId = val),
        })}
            </div>
            <div class="form-group">
              ${this.renderFormInput({
            label: 'Publisher ID',
            tooltip: `The ID of your app's publisher. Get this value from Microsoft Partner Center.`,
            tooltipLink:
                'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/',
            inputId: 'publisher-id-input',
            placeholder: 'CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca',
            value: this.packageOptions.publisher.commonName,
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
            tooltip: `The display name of your app's publisher. Gets this value from Microsoft Partner Center.`,
            tooltipLink:
                'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/',
            inputId: 'publisher-display-name-input',
            required: true,
            minLength: 3,
            spellcheck: false,
            value: this.packageOptions.publisher.displayName,
            validationErrorMessage:
                'Publisher display name must be at least 3 characters. Get this value from Microsoft Partner Center.',
            placeholder: 'Contoso Inc',
            inputHandler: (val: string) => this.packageOptions.publisher.displayName = val,
        })}
            </div>
          </div>
          <!-- "all settings" section of the modal -->
          <wa-details>
            <div class="details-summary" slot="summary">
              All Settings
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
            tooltip: `Optional. Select as many languages as your app supports. Additional languages can be specified in Microsoft Partner Center. If empty, EN-US will be used.`,
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
              <div class="form-group" id="app-uri-handler-picker">
                <label>App URI Handler</label>
                <div class="form-check">
                  ${this.renderFormInput({
                label: 'Enable App URI Handler',
                value: 'AppUriHandler',
                tooltip:
                    'Enables your Windows package to handle URIs for your app. This also allows your app to check if your Windows package is installed.',
                tooltipLink:
                    'https://developer.chrome.com/docs/capabilities/get-installed-related-apps#check-windows',
                inputId: 'app-uri-handler-checkbox',
                type: 'checkbox',
                checked: this.packageOptions.extensions === 'appurihandler',
                inputHandler: (_val: string, checked: boolean) =>
                    (this.packageOptions.extensions = checked ? 'appurihandler' : undefined),
            })}
                </div>
              </div>
            </div>
          </wa-details>
        </div>
      </form>
    </div>
    `;
    }
}