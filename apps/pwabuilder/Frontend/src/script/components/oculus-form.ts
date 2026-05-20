import { css, html, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fetchOrCreateManifest } from '../services/manifest';
import {
    createMetaHorizonPackageOptionsFromManifest,
    emptyMetaHorizonPackageOptions,
} from '../services/publish/meta-horizon-publish';
import { ManifestContext, PackageOptions } from '../utils/interfaces';
import { AppPackageFormBase } from './app-package-form-base';
import { getManifestContext } from '../services/app-info';
import { maxSigningKeySizeInBytes, validateAndroidPackageId } from '../utils/android-validation';
import { recordPWABuilderProcessStep, AnalyticsBehavior } from '../utils/analytics';
import { AppNameInputPattern, DnameInputPattern } from '../utils/constants';
import '@shoelace-style/shoelace/dist/components/details/details.js';

@customElement('oculus-form')
export class OculusForm extends AppPackageFormBase {
    @property({ attribute: 'analysis-id' }) analysisId: string | null = null;
    @property({ type: Boolean }) generating = false;
    @state() showAdvanced = false;
    @state() packageOptions = emptyMetaHorizonPackageOptions();
    @state() manifestContext: ManifestContext | undefined = getManifestContext();

    static get styles() {
        const localStyles = css`
      :host {
        width: 100%;
      }

      #oculus-options-form {
        width: 100%;
        display: flex;
        flex-direction: column;
      }

      .signing-key-fields {
        margin-left: 30px;
      }

      #signing-key-file-input {
        border: none;
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

      sl-details::part(base) {
        border: none;
      }

      sl-details::part(summary-icon) {
        display: none;
      }

      .dropdown_icon {
        transform: rotate(0deg);
        transition: transform .5s;
        height: 30px;
      }

      sl-details::part(header) {
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
    `;

        return [
            ...super.styles,
            localStyles,
        ];
    }

    constructor() {
        super();
    }

    async firstUpdated() {
        if (this.manifestContext!.isGenerated) {
            this.manifestContext = await fetchOrCreateManifest();
        }

        this.packageOptions = createMetaHorizonPackageOptionsFromManifest(this.manifestContext!);
    }

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        // Nothing currently — the Meta Horizon form has no toggle equivalent to Google Play vs Other Android.
        void _changedProperties;
    }

    metaHorizonSigningModeChanged(mode: 'mine' | 'new' | 'none') {
        this.packageOptions.signingMode = mode;
        const signing = this.packageOptions.signing!;

        if (mode === 'mine' || mode === 'none') {
            signing.alias = '';
            signing.fullName = '';
            signing.organization = '';
            signing.organizationalUnit = '';
            signing.countryCode = '';
            signing.keyPassword = '';
            signing.storePassword = '';
        } else if (mode === 'new') {
            signing.alias = 'my-key-alias';
            signing.fullName = (this.manifestContext!.manifest.short_name || this.manifestContext!.manifest.name || 'My PWA') + ' Admin';
            signing.organization = this.manifestContext!.manifest.name || 'PWABuilder';
            signing.organizationalUnit = 'Engineering';
            signing.countryCode = 'US';
            signing.keyPassword = '';
            signing.storePassword = '';
            signing.file = null;
        }

        this.requestUpdate();
    }

    horizonAppModeChanged(mode: '2D' | 'immersive') {
        this.packageOptions.horizonOSAppMode = mode;
        // Keep horizonBilling.horizonOSAppMode in sync with the top-level value.
        if (this.packageOptions.features.horizonBilling) {
            this.packageOptions.features.horizonBilling.horizonOSAppMode = mode;
        }
        this.requestUpdate();
    }

    validatePackageId(packageId: string, input: HTMLInputElement) {
        const validationErrors = validateAndroidPackageId(packageId);
        const errorMessage = validationErrors.length > 0 ? validationErrors[0].error : '';
        input.setCustomValidity(errorMessage);
        input.title = errorMessage;
        if (errorMessage) {
            input.reportValidity();
        }
    }

    metaHorizonSigningKeyUploaded(event: any) {
        const filePicker = event as HTMLInputElement;
        if (filePicker && filePicker.files && filePicker.files.length > 0) {
            const keyFile = filePicker.files[0];
            if (keyFile && keyFile.size > maxSigningKeySizeInBytes) {
                console.error('Meta Horizon signing key file is too large. Max size:', {
                    maxSize: maxSigningKeySizeInBytes,
                    fileSize: keyFile.size,
                });
                this.packageOptions.signingMode = 'none';
            }
            const fileReader = new FileReader();
            fileReader.onload = () => {
                this.packageOptions.signing!.file = fileReader.result as string;
            };
            fileReader.onerror = progressEvent => {
                console.error('Unable to read Meta Horizon signing key file', fileReader.error, progressEvent);
                this.packageOptions.signing!.file = null;
                this.packageOptions.signingMode = 'none';
            };
            fileReader.readAsDataURL(keyFile as Blob);
        }
    }

    rotateZero() {
        recordPWABuilderProcessStep('meta_horizon_form_all_settings_expanded', AnalyticsBehavior.ProcessCheckpoint);
        const icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
        icon!.style.transform = 'rotate(0deg)';
    }

    rotateNinety() {
        recordPWABuilderProcessStep('meta_horizon_form_all_settings_collapsed', AnalyticsBehavior.ProcessCheckpoint);
        const icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
        icon!.style.transform = 'rotate(90deg)';
    }

    public getPackageOptions(): PackageOptions {
        return this.packageOptions;
    }

    public getForm(): HTMLFormElement {
        return this.shadowRoot!.querySelector('form')!;
    }

    render() {
        return html`
    <div id="form-holder">
      <form
        id="oculus-options-form"
        slot="modal-form"
        style="width: 100%"
      >
        <div id="form-layout">
          <div class="basic-settings">

            <div class="form-group">
              ${this.renderFormInput({
                label: 'Package ID',
                tooltip: `The Android applicationId for your Meta Horizon app, e.g. com.companyname.appname. Letters, numbers, periods, hyphens, and underscores are allowed.`,
                tooltipLink: 'https://developers.meta.com/horizon/documentation/web/pwa-packaging/',
                inputId: 'package-id-input',
                required: true,
                placeholder: 'com.companyname.appname',
                value: this.packageOptions.packageId,
                minLength: 3,
                maxLength: Number.MAX_SAFE_INTEGER,
                spellcheck: false,
                pattern: "^[a-zA-Z0-9.\\-_]*$",
                validationErrorMessage: 'Package ID must contain only letters, numbers, periods, hyphens, and underscores.',
                changedHandler: (val: string, _: boolean, input: HTMLInputElement) => {
                    this.packageOptions.packageId = val;
                    this.validatePackageId(val, input);
                }
            })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'App name',
                tooltip: `The full name of your app as displayed to end users on Meta Horizon.`,
                inputId: 'app-name-input',
                required: true,
                placeholder: 'My Awesome PWA',
                value: this.packageOptions.name,
                minLength: 3,
                maxLength: 50,
                spellcheck: false,
                pattern: AppNameInputPattern,
                validationErrorMessage: 'App name must not include special characters and be between 3 and 50 characters',
                inputHandler: (val: string) => this.packageOptions.name = val,
            })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'Short name',
                tooltip: `Shorter version of your app name displayed on the Meta Horizon launcher.`,
                inputId: 'short-name-input',
                required: true,
                placeholder: 'My PWA',
                value: this.packageOptions.launcherName,
                minLength: 3,
                maxLength: 30,
                spellcheck: false,
                validationErrorMessage: 'Short name must be between 3 and 30 characters in length.',
                inputHandler: (val: string) => this.packageOptions.launcherName = val,
            })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'Meta Horizon app ID',
                tooltip: `The numeric Meta Horizon application ID from the Meta Developer Dashboard. Required if Horizon Billing is enabled. See the URL when viewing your app on developers.meta.com/horizon/manage/applications/<this id>/.`,
                tooltipLink: 'https://developers.meta.com/horizon/documentation/web/pwa-packaging/',
                inputId: 'meta-horizon-app-id-input',
                placeholder: '1234567890',
                value: this.packageOptions.metaHorizonAppId || '',
                spellcheck: false,
                pattern: '^[0-9]*$',
                validationErrorMessage: 'Meta Horizon app ID must be a numeric string from the Meta Developer Dashboard.',
                inputHandler: (val: string) => this.packageOptions.metaHorizonAppId = val,
            })}
            </div>

            <div class="form-group">
              <label>Horizon OS app mode</label>
              <div class="form-check">
                ${this.renderFormInput({
                label: 'Immersive (WebXR)',
                tooltip: 'Run the PWA as an immersive WebXR experience inside Horizon OS. Recommended for VR experiences.',
                inputId: 'horizon-app-mode-immersive-input',
                type: 'radio',
                name: 'horizonOSAppMode',
                value: 'immersive',
                checked: this.packageOptions.horizonOSAppMode === 'immersive',
                inputHandler: () => this.horizonAppModeChanged('immersive'),
            })}
              </div>
              <div class="form-check">
                ${this.renderFormInput({
                label: '2D (Flat panel)',
                tooltip: 'Run the PWA as a flat 2D panel app inside Horizon OS.',
                inputId: 'horizon-app-mode-2d-input',
                type: 'radio',
                name: 'horizonOSAppMode',
                value: '2D',
                checked: this.packageOptions.horizonOSAppMode === '2D',
                inputHandler: () => this.horizonAppModeChanged('2D'),
            })}
              </div>
            </div>

            <div class="form-group">
              <label>Include source code</label>
              <div class="form-check">
                ${this.renderFormInput({
                label: 'Enable',
                tooltip: 'If enabled, your download will include the source code for the generated Meta Horizon Android project.',
                inputId: 'include-src-input',
                type: 'checkbox',
                checked: this.packageOptions.includeSourceCode === true,
                inputHandler: (_, checked) => this.packageOptions.includeSourceCode = checked,
            })}
              </div>
            </div>
          </div>

          <sl-details @sl-show=${() => this.rotateNinety()} @sl-hide=${() => this.rotateZero()}>
            <div class="details-summary" slot="summary">
              <p>All Settings</p>
              <img class="dropdown_icon" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
            </div>
              <div class="adv-settings">

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Host',
                tooltip: `The host portion of your PWA's URL, e.g. mypwa.com.`,
                inputId: 'host-input',
                required: true,
                placeholder: 'mypwa.com',
                value: this.packageOptions.host,
                minLength: 3,
                spellcheck: false,
                inputHandler: (val: string) => this.packageOptions.host = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Start URL',
                tooltip: `The start path for your PWA. Must be relative to Host. Use '/' if your start URL is the same as Host.`,
                inputId: 'start-url-input',
                required: true,
                placeholder: '/index.html',
                value: this.packageOptions.startUrl,
                spellcheck: false,
                validationErrorMessage: "You must specify a relative start URL. If you don't have a start URL, use '/'",
                inputHandler: (val: string) => this.packageOptions.startUrl = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Full scope URL',
                tooltip: `Required for Meta Horizon. The absolute URL of your PWA's scope. Navigations outside this scope open in a browser tab.`,
                inputId: 'full-scope-url-input',
                type: 'url',
                required: true,
                value: this.packageOptions.fullScopeUrl,
                placeholder: 'https://mypwa.com/',
                inputHandler: (val: string) => this.packageOptions.fullScopeUrl = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Version',
                tooltip: `The version of your app displayed to users (e.g. '1.0.0.0'). Maps to android:versionName.`,
                inputId: 'version-input',
                required: true,
                placeholder: '1.0.0.0',
                value: this.packageOptions.appVersion,
                spellcheck: false,
                inputHandler: (val: string) => this.packageOptions.appVersion = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Version code',
                tooltip: `Internal version number used by the Horizon Store to determine update ordering. Maps to android:versionCode.`,
                inputId: 'version-code-input',
                type: 'number',
                minValue: 1,
                maxValue: 2100000000,
                required: true,
                placeholder: '1',
                value: this.packageOptions.appVersionCode.toString(),
                inputHandler: (val: string) => this.packageOptions.appVersionCode = parseInt(val, 10),
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Theme color',
                tooltip: `The theme color for your app. Typically set to your manifest's theme_color.`,
                inputId: 'theme-color-input',
                type: 'color',
                value: this.packageOptions.themeColor,
                inputHandler: (val: string) => this.packageOptions.themeColor = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Theme dark color',
                tooltip: `The theme color used in dark mode.`,
                inputId: 'theme-dark-color-input',
                type: 'color',
                value: this.packageOptions.themeColorDark,
                inputHandler: (val: string) => this.packageOptions.themeColorDark = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Background color',
                tooltip: `The background color used for your app's splash screen. Typically set to your manifest's background_color.`,
                inputId: 'background-color-input',
                type: 'color',
                value: this.packageOptions.backgroundColor,
                inputHandler: (val: string) => this.packageOptions.backgroundColor = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Nav color',
                tooltip: `Color of the navigation bar.`,
                inputId: 'nav-color-input',
                type: 'color',
                value: this.packageOptions.navigationColor,
                inputHandler: (val: string) => this.packageOptions.navigationColor = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Nav dark color',
                tooltip: `Color of the navigation bar in dark mode.`,
                inputId: 'nav-dark-color-input',
                type: 'color',
                value: this.packageOptions.navigationColorDark,
                inputHandler: (val: string) => this.packageOptions.navigationColorDark = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Nav divider color',
                tooltip: `Color of the navigation bar divider.`,
                inputId: 'nav-divider-color-input',
                type: 'color',
                value: this.packageOptions.navigationDividerColor,
                inputHandler: (val: string) => this.packageOptions.navigationDividerColor = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Nav divider dark color',
                tooltip: `Color of the navigation bar divider in dark mode.`,
                inputId: 'nav-divider-dark-color-input',
                type: 'color',
                value: this.packageOptions.navigationDividerColorDark,
                inputHandler: (val: string) => this.packageOptions.navigationDividerColorDark = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Icon URL',
                tooltip: `The URL to a square PNG image (512x512 or larger recommended) to use for your app icon. Can be absolute or relative to your manifest.`,
                inputId: 'icon-url-input',
                required: true,
                spellcheck: false,
                value: this.packageOptions.iconUrl,
                placeholder: '/icons/512x512.png',
                inputHandler: (val: string) => this.packageOptions.iconUrl = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Maskable icon URL',
                tooltip: `Optional. The URL to a maskable PNG icon for adaptive icon shapes.`,
                inputId: 'maskable-icon-url-input',
                spellcheck: false,
                value: this.packageOptions.maskableIconUrl || '',
                placeholder: '/icons/512x512-maskable.png',
                inputHandler: (val: string) => this.packageOptions.maskableIconUrl = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Monochrome icon URL',
                tooltip: `Optional. The URL to a monochrome PNG icon used in notifications and themed icons.`,
                inputId: 'monochrome-icon-url-input',
                spellcheck: false,
                value: this.packageOptions.monochromeIconUrl || '',
                placeholder: '/icons/512x512-monochrome.png',
                inputHandler: (val: string) => this.packageOptions.monochromeIconUrl = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Manifest URL',
                tooltip: `The absolute HTTPS URL of your web manifest.`,
                inputId: 'manifest-url-input',
                type: 'url',
                value: this.packageOptions.webManifestUrl,
                placeholder: 'https://myawesomepwa.com/manifest.json',
                inputHandler: (val: string) => this.packageOptions.webManifestUrl = val,
            })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                label: 'Splash fade out duration (ms)',
                tooltip: `How long the splash screen fade out animation should last in milliseconds.`,
                inputId: 'splash-fade-out-input',
                type: 'number',
                value: (this.packageOptions.splashScreenFadeOutDuration || 0).toString(),
                placeholder: '300',
                inputHandler: (val: string) => this.packageOptions.splashScreenFadeOutDuration = parseInt(val, 10),
            })}
                </div>

                <div class="form-group">
                  <label>Site settings shortcut</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Enable',
                tooltip: 'Show a Settings entry from the launcher long-press menu so users can manage your app.',
                inputId: 'site-settings-shortcut-input',
                type: 'checkbox',
                checked: this.packageOptions.enableSiteSettingsShortcut === true,
                inputHandler: (_, checked) => this.packageOptions.enableSiteSettingsShortcut = checked,
            })}
                  </div>
                </div>

                <div class="form-group">
                  <label>Display mode</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Standalone',
                tooltip: 'Recommended for most apps. Shows the system status / nav bars.',
                inputId: 'display-standalone-input',
                type: 'radio',
                name: 'displayMode',
                value: 'standalone',
                checked: this.packageOptions.display === 'standalone',
                inputHandler: () => this.packageOptions.display = 'standalone',
            })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Fullscreen',
                tooltip: `Hides the system bars while your app is running. Suitable for games and immersive media.`,
                inputId: 'display-fullscreen-input',
                type: 'radio',
                name: 'displayMode',
                value: 'fullscreen',
                checked: this.packageOptions.display === 'fullscreen',
                inputHandler: () => this.packageOptions.display = 'fullscreen',
            })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Fullscreen sticky',
                tooltip: `Hides the system bars but lets edge-swipes show them semi-transparently. Recommended for drawing and swipe-heavy games.`,
                inputId: 'display-fullscreen-sticky-input',
                type: 'radio',
                name: 'displayMode',
                value: 'fullscreen-sticky',
                checked: this.packageOptions.display === 'fullscreen-sticky',
                inputHandler: () => this.packageOptions.display = 'fullscreen-sticky',
            })}
                  </div>
                </div>

                <div class="form-group">
                  <label>Notification delegation</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Enable',
                tooltip: `If enabled, your PWA can send push notifications without browser permission prompts.`,
                inputId: 'notification-delegation-input',
                type: 'checkbox',
                checked: this.packageOptions.enableNotifications === true,
                inputHandler: (_, checked) => this.packageOptions.enableNotifications = checked,
            })}
                  </div>
                </div>

                <div class="form-group">
                  <label>Microphone access</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Enable',
                tooltip: `Grants the Android microphone permission. Useful for PWAs using Web Speech / WebRTC inside the Quest browser.`,
                inputId: 'enable-microphone-input',
                type: 'checkbox',
                checked: this.packageOptions.enableMicrophone === true,
                inputHandler: (_, checked) => this.packageOptions.enableMicrophone = checked,
            })}
                  </div>
                </div>

                <div class="form-group">
                  <label>WebXR scene</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Enable',
                tooltip: `Grants the Horizon OS USE_SCENE permission so your PWA can use the WebXR scene mesh and spatial anchors.`,
                inputId: 'enable-xr-scene-input',
                type: 'checkbox',
                checked: this.packageOptions.enableXRScene === true,
                inputHandler: (_, checked) => this.packageOptions.enableXRScene = checked,
            })}
                  </div>
                </div>

                <div class="form-group">
                  <label>Location delegation</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Enable',
                tooltip: 'If enabled, your PWA can access navigator.geolocation without browser permission prompts.',
                inputId: 'location-delegation-input',
                type: 'checkbox',
                checked: this.packageOptions.features.locationDelegation?.enabled === true,
                inputHandler: (_, checked) => this.packageOptions.features.locationDelegation!.enabled = checked,
            })}
                  </div>
                </div>

                <div class="form-group">
                  <label>Horizon Billing</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Enable',
                tooltip: 'Enable Meta Horizon Store in-app purchases. Requires a Meta Horizon app ID above.',
                inputId: 'horizon-billing-input',
                type: 'checkbox',
                checked: this.packageOptions.features.horizonBilling?.enabled === true,
                inputHandler: (_, checked) => {
                    this.packageOptions.features.horizonBilling!.enabled = checked;
                    this.requestUpdate();
                },
            })}
                  </div>
                </div>

                <div class="form-group">
                  <label>Horizon Platform SDK</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Enable',
                tooltip: 'Enable the Horizon Platform SDK for access to Quest platform APIs.',
                inputId: 'horizon-platform-sdk-input',
                type: 'checkbox',
                checked: this.packageOptions.features.horizonPlatformSDK?.enabled === true,
                inputHandler: (_, checked) => this.packageOptions.features.horizonPlatformSDK!.enabled = checked,
            })}
                  </div>
                </div>

                <div class="form-group">
                  <label>ARCore</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Enable',
                tooltip: 'Enable ARCore support for the generated Android project.',
                inputId: 'arcore-input',
                type: 'checkbox',
                checked: this.packageOptions.features.arCore?.enabled === true,
                inputHandler: (_, checked) => this.packageOptions.features.arCore!.enabled = checked,
            })}
                  </div>
                </div>

                <div class="form-group">
                  <label>Signing key</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'New',
                tooltip: `PWABuilder will generate a new signing key and sign your package. Your download will contain the new signing details.`,
                inputId: 'signing-new-input',
                name: 'signingMode',
                value: 'new',
                type: 'radio',
                checked: this.packageOptions.signingMode === 'new',
                inputHandler: () => this.metaHorizonSigningModeChanged('new'),
            })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Use mine',
                tooltip: 'Use this option if you already have a signing key and want to publish a new version of an existing app on Meta Horizon.',
                inputId: 'signing-mine-input',
                name: 'signingMode',
                value: 'mine',
                type: 'radio',
                checked: this.packageOptions.signingMode === 'mine',
                inputHandler: () => this.metaHorizonSigningModeChanged('mine'),
            })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'None',
                tooltip: 'Generate a raw, unsigned package. Unsigned packages cannot be uploaded to the Meta Horizon Store.',
                inputId: 'signing-none-input',
                name: 'signingMode',
                value: 'none',
                type: 'radio',
                checked: this.packageOptions.signingMode === 'none',
                inputHandler: () => this.metaHorizonSigningModeChanged('none'),
            })}
                  </div>
                </div>

                ${this.renderSigningKeyFields()}

                <div class="form-group">
                  <label>Fallback behavior</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Custom Tabs',
                tooltip: `When Trusted Web Activity (TWA) is unavailable, use Chrome Custom Tabs as a fallback to run your app.`,
                inputId: 'chrome-custom-tab-fallback-input',
                type: 'radio',
                name: 'fallbackType',
                value: 'customtabs',
                checked: this.packageOptions.fallbackType === 'customtabs',
                inputHandler: () => this.packageOptions.fallbackType = 'customtabs',
            })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                label: 'Web View',
                tooltip: `When Trusted Web Activity (TWA) is unavailable, use a web view as a fallback to run your app.`,
                inputId: 'web-view-fallback-input',
                type: 'radio',
                name: 'fallbackType',
                value: 'webview',
                checked: this.packageOptions.fallbackType === 'webview',
                inputHandler: () => this.packageOptions.fallbackType = 'webview',
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

    renderSigningKeyFields(): TemplateResult {
        if (this.packageOptions.signingMode === 'new') {
            return this.renderNewSigningKeyFields();
        }
        if (this.packageOptions.signingMode === 'mine') {
            return this.renderExistingSigningKeyFields();
        }
        return html``;
    }

    renderNewSigningKeyFields(): TemplateResult {
        const signing = this.packageOptions.signing!;
        return html`
      <div class="signing-key-fields">
        <div class="form-group">
          ${this.renderKeyAlias()}
        </div>

        <div class="form-group">
          ${this.renderFormInput({
                label: 'Key full name',
                tooltip: `Your full name. Used when creating the new signing key.`,
                inputId: 'key-full-name-input',
                required: true,
                placeholder: 'John Doe',
                value: signing.fullName || '',
                pattern: DnameInputPattern,
                spellcheck: false,
                inputHandler: (val: string) => signing.fullName = val,
            })}
        </div>

        <div class="form-group">
          ${this.renderFormInput({
                label: 'Key organization',
                tooltip: `The name of your company or organization.`,
                inputId: 'key-org-input',
                required: true,
                placeholder: 'My Company',
                value: signing.organization || '',
                pattern: DnameInputPattern,
                spellcheck: false,
                inputHandler: (val: string) => signing.organization = val,
            })}
        </div>

        <div class="form-group">
          ${this.renderFormInput({
                label: 'Key organizational unit',
                tooltip: `The department you work in, e.g. "Engineering".`,
                inputId: 'key-org-unit-input',
                required: true,
                placeholder: 'Engineering Department',
                value: signing.organizationalUnit,
                pattern: DnameInputPattern,
                spellcheck: false,
                inputHandler: (val: string) => signing.organizationalUnit = val,
            })}
        </div>

        <div class="form-group">
          ${this.renderFormInput({
                label: 'Key country code',
                tooltip: `Your country's 2 letter code (e.g. "US").`,
                inputId: 'key-country-code-input',
                required: true,
                placeholder: 'US',
                value: signing.countryCode,
                pattern: DnameInputPattern,
                spellcheck: false,
                minLength: 2,
                maxLength: 2,
                validationErrorMessage: 'Country code must be 2 characters in length',
                inputHandler: (val: string) => signing.countryCode = val,
            })}
        </div>
      </div>
    `;
    }

    renderExistingSigningKeyFields(): TemplateResult {
        return html`
      <div class="signing-key-fields">
        <div class="form-group">
          <label for="signing-key-file-input">Key file</label>
          <input
            type="file"
            class="form-control"
            id="signing-key-file-input"
            @change="${(e: Event) => this.metaHorizonSigningKeyUploaded(e.target)}"
            accept=".keystore, .jks"
            required
          />
        </div>
        ${this.renderKeyAlias()}
        ${this.renderKeyPassword()}
        ${this.renderKeyStorePassword()}
      </div>
    `;
    }

    renderKeyAlias(): TemplateResult {
        const tooltip = this.packageOptions.signingMode === 'new'
            ? 'The alias to use in the new signing key.'
            : 'The alias of your existing signing key.';
        const signing = this.packageOptions.signing!;
        return html`
      <div class="form-group">
        ${this.renderFormInput({
                label: 'Key alias',
                tooltip: tooltip,
                inputId: 'key-alias-input',
                required: true,
                placeholder: 'my-key-alias',
                value: signing.alias || '',
                spellcheck: false,
                inputHandler: (val: string) => signing.alias = val,
            })}
      </div>
    `;
    }

    renderKeyPassword(): TemplateResult {
        const signing = this.packageOptions.signing!;
        const tooltip = this.packageOptions.signingMode === 'new'
            ? 'Optional. Leave blank to let PWABuilder generate a strong password for you.'
            : 'Your existing key password';
        return html`
      <div class="form-group">
        ${this.renderFormInput({
                label: 'Key password',
                tooltip: tooltip,
                inputId: 'key-password-input',
                type: 'password',
                minLength: 6,
                required: this.packageOptions.signingMode === 'mine',
                value: signing.keyPassword,
                inputHandler: (val: string) => signing.keyPassword = val,
            })}
      </div>
    `;
    }

    renderKeyStorePassword(): TemplateResult {
        const signing = this.packageOptions.signing!;
        const tooltip = this.packageOptions.signingMode === 'new'
            ? 'Optional. Leave blank to let PWABuilder generate a strong key store password for you.'
            : 'Your existing key store password';
        return html`
      <div class="form-group">
        ${this.renderFormInput({
                label: 'Key store password',
                tooltip: tooltip,
                inputId: 'key-store-password-input',
                type: 'password',
                minLength: 6,
                required: this.packageOptions.signingMode === 'mine',
                value: signing.storePassword,
                inputHandler: (val: string) => signing.storePassword = val,
            })}
      </div>
    `;
    }
}
