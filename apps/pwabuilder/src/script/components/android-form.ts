import { css, html, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fetchOrCreateManifest } from '../services/manifest';
import { createAndroidPackageOptionsFromManifest, emptyAndroidPackageOptions } from '../services/publish/android-publish';
import { ManifestContext, PackageOptions } from '../utils/interfaces';
import { localeStrings } from '../../locales';
import { AppPackageFormBase } from './app-package-form-base';
import { getManifestContext } from '../services/app-info';
import { maxSigningKeySizeInBytes } from '../utils/android-validation';
import { recordPWABuilderProcessStep, AnalyticsBehavior } from '../utils/analytics';
import { AppNameInputPattern } from '../utils/constants';

@customElement('android-form')

export class AndroidForm extends AppPackageFormBase {
  @property({ type: Boolean }) generating = false;
  @property({ type: Boolean }) isGooglePlayApk = false;
  @state() showAdvanced = false;
  @state() packageOptions = emptyAndroidPackageOptions();
  @state() manifestContext: ManifestContext | undefined = getManifestContext();

  static get styles() {

    const localStyles = css`
      :host {
        width: 100%;
      }

      #android-options-form {
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

    `;

    return [
      ...super.styles,
      localStyles
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    if (this.manifestContext!.isGenerated) {
      this.manifestContext = await fetchOrCreateManifest();
    }

    this.packageOptions = createAndroidPackageOptionsFromManifest(this.manifestContext!);
  }

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if(_changedProperties.has("isGooglePlayApk")){
      this.packageOptions = createAndroidPackageOptionsFromManifest(this.manifestContext!);
      if(!this.isGooglePlayApk){
        this.packageOptions.features.locationDelegation!.enabled = false;
        this.packageOptions.features.playBilling!.enabled = false;
        this.packageOptions.isChromeOSOnly = false;
        this.packageOptions.enableNotifications = false;
        this.packageOptions.signingMode = "none";
        this.packageOptions.signing = {
                                        file: null,
                                        alias: '',
                                        fullName: '',
                                        organization: '',
                                        organizationalUnit: '',
                                        countryCode: '',
                                        keyPassword: '',
                                        storePassword: ''
                                      };
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

  /**
   * Called when the user changes the signing mode.
   */
  androidSigningModeChanged(mode: 'mine' | 'new' | 'none') {
    this.packageOptions.signingMode = mode;

    // Reset the values as needed.
    if (mode === 'mine' || mode === 'none') {
      this.packageOptions.signing.alias = '';
      this.packageOptions.signing.fullName = '';
      this.packageOptions.signing.organization = '';
      this.packageOptions.signing.organizationalUnit = '';
      this.packageOptions.signing.countryCode = '';
      this.packageOptions.signing.keyPassword = '';
      this.packageOptions.signing.storePassword = '';
    } else if (mode === 'new') {
      this.packageOptions.signing.alias = 'my-key-alias';
      this.packageOptions.signing.fullName = (this.manifestContext!.manifest.short_name || this.manifestContext!.manifest.name || 'My PWA') + ' Admin';
      this.packageOptions.signing.organization = this.manifestContext!.manifest.name || 'PWABuilder';
      this.packageOptions.signing.organizationalUnit = 'Engineering';
      this.packageOptions.signing.countryCode = 'US';
      this.packageOptions.signing.keyPassword = '';
      this.packageOptions.signing.storePassword = '';
      this.packageOptions.signing.file = null;
    }

    // We need to re-render because Lit isn't watching packageOptions.signing, as it's a nested object.
    this.requestUpdate();
  }

  isMetaQuestChanged(checked: boolean) {
    this.packageOptions.isMetaQuest = checked;
    if (checked) {
      this.packageOptions.minSdkVersion = 23;
    } else {
      delete this.packageOptions.minSdkVersion;
    }
  }

  androidSigningKeyUploaded(event: any) {
    const filePicker = event as HTMLInputElement;
    if (filePicker && filePicker.files && filePicker.files.length > 0) {
      const keyFile = filePicker.files[0];
      // Make sure it's a reasonable size.
      if (keyFile && keyFile.size > maxSigningKeySizeInBytes) {
        console.error('Android signing key file is too large. Max size:', {
          maxSize: maxSigningKeySizeInBytes,
          fileSize: keyFile.size,
        });
        this.packageOptions.signingMode = 'none';
      }
      // Read it in as a Uint8Array and store it in our signing object.
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.packageOptions.signing.file = fileReader.result as string;
      };

      fileReader.onerror = progressEvent => {
        console.error(
          'Unable to read Android signing key file',
          fileReader.error,
          progressEvent
        );
        this.packageOptions.signing.file = null;
        this.packageOptions.signingMode = 'none';
      };
      fileReader.readAsDataURL(keyFile as Blob);
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

  public getPackageOptions(): PackageOptions {
    return this.packageOptions;
  }

  public getForm(): HTMLFormElement {
    return this.shadowRoot!.querySelector("form")!;
  }

  render() {
    return html`
    <div id="form-holder">
      <form
        id="android-options-form"
        slot="modal-form"
        style="width: 100%"
      >
        <div id="form-layout">
          <div class="basic-settings">

            <div class="form-group">
              ${this.renderFormInput({
                label: 'Package ID',
                tooltip: `The ID of your app on Google Play. Google recommends a reverse-domain style string: com.domainname.appname. Letters, numbers, periods, hyphens, and underscores are allowed.`,
                tooltipLink: 'https://developer.android.com/guide/topics/manifest/manifest-element.html#package',
                inputId: 'package-id-input',
                required: true,
                placeholder: 'MyCompany.MyApp',
                value: this.packageOptions.packageId,
                minLength: 3,
                maxLength: Number.MAX_SAFE_INTEGER,
                spellcheck: false,
                pattern: "[a-zA-Z0-9.-_]*$",
                validationErrorMessage: "Package ID must contain only letters, numbers, periods, hyphens, and underscores.",
                inputHandler: (val: string) => this.packageOptions.packageId = val
              })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'App name',
                tooltip: `The full name of your app as displayed to end users`,
                tooltipLink: 'https://support.google.com/googleplay/android-developer/answer/9859152?hl=en&visit_id=637726158830539690-3630173317&rd=1#details&zippy=%2Cproduct-details',
                inputId: 'app-name-input',
                required: true,
                placeholder: 'My Awesome PWA',
                value: this.packageOptions.name,
                minLength: 3,
                maxLength: 50,
                spellcheck: false,
                pattern: AppNameInputPattern,
                validationErrorMessage:
                  'App name must not include special characters and be between 3 and 50 characters',
                inputHandler: (val: string) => this.packageOptions.name = val
              })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'Short name',
                tooltip: `The shorter version of your app name displayed on the Android home screen. Google recommends no more than 12 characters.`,
                tooltipLink: 'https://developer.chrome.com/apps/manifest/name#short_name',
                inputId: 'short-name-input',
                required: true,
                placeholder: 'My PWA',
                value: this.packageOptions.launcherName,
                minLength: 3,
                maxLength: 30,
                spellcheck: false,
                validationErrorMessage: "Short name must be between 3 and 30 characters in length. Google recommends 12 characters or fewer.",
                inputHandler: (val: string) => this.packageOptions.launcherName = val
              })}
            </div>
          </div>

          <!-- The "all settings" section of the options dialog -->
          <sl-details @sl-show=${() => this.rotateNinety()} @sl-hide=${() => this.rotateZero()}>
            <div class="details-summary" slot="summary">
              <p>All Settings</p>
              <img class="dropdown_icon" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
            </div>

              <div class="adv-settings">
                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Version',
                    tooltip: `The version of your app displayed to users. This is a string, typically in the form of '1.0.0.0'. Maps to android:versionName.`,
                    tooltipLink: 'https://developer.android.com/guide/topics/manifest/manifest-element.html#vname',
                    inputId: 'version-input',
                    required: true,
                    placeholder: '1.0.0.0',
                    value: this.packageOptions.appVersion,
                    spellcheck: false,
                    inputHandler: (val: string) => this.packageOptions.appVersion = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Version code',
                    tooltip: `A positive integer used as an internal version number. This is not shown to users. This number is used by Google Play to determine whether one version is more recent than another, with higher numbers indicating more recent versions. Maps to android:versionCode.`,
                    tooltipLink: 'https://developer.android.com/guide/topics/manifest/manifest-element.html#vcode',
                    inputId: 'version-code-input',
                    type: 'number',
                    minValue: 1,
                    maxValue: 2100000000,
                    required: true,
                    placeholder: '1',
                    value: this.packageOptions.appVersionCode.toString(),
                    inputHandler: (val: string) => this.packageOptions.appVersionCode = parseInt(val, 10)
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Host',
                    tooltip: `The host portion of your PWA's URL. For example, mypwa.com`,
                    inputId: 'host-input',
                    required: true,
                    placeholder: 'mypwa.com',
                    value: this.packageOptions.host,
                    minLength: 3,
                    spellcheck: false,
                    inputHandler: (val: string) => this.packageOptions.host = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Start URL',
                    tooltip: `The start path for your PWA. Must be relative to the Host URL. If Host URL contains your PWA, you can use '/' to specify a default`,
                    tooltipLink: 'https://docs.pwabuilder.com/#/builder/manifest?id=start_url-string',
                    inputId: 'start-url-input',
                    required: true,
                    placeholder: '/index.html',
                    value: this.packageOptions.startUrl,
                    spellcheck: false,
                    validationErrorMessage: "You must specify a relative start URL. If you don't have a start URL, use '/'",
                    inputHandler: (val: string) => this.packageOptions.startUrl = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Theme color',
                    tooltip: `The theme color used for the Android status bar in your app. Typically, this should be set to your manifest's theme_color.`,
                    inputId: 'theme-color-input',
                    type: 'color',
                    value: this.packageOptions.themeColor,
                    inputHandler: (val: string) => this.packageOptions.themeColor = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Theme dark color',
                    tooltip: `The theme color used for the Android status bar in your app when the Android device is in dark mode.`,
                    inputId: 'theme-dark-color-input',
                    type: 'color',
                    value: this.packageOptions.themeColorDark,
                    inputHandler: (val: string) => this.packageOptions.themeColorDark = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Background color',
                    tooltip: `The background color to use for your app's splash screen. Typically this is set to your manifest's background_color.`,
                    inputId: 'background-color-input',
                    type: 'color',
                    value: this.packageOptions.backgroundColor,
                    inputHandler: (val: string) => this.packageOptions.backgroundColor = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Nav color',
                    tooltip: `The color of the Android navigation bar in your app. Typically this is set to your manifest's theme_color`,
                    inputId: 'nav-color-input',
                    type: 'color',
                    value: this.packageOptions.navigationColor,
                    inputHandler: (val: string) => this.packageOptions.navigationColor = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Nav dark color',
                    tooltip: `The color of the Android navigation bar in your app when the Android device is in dark mode.`,
                    inputId: 'nav-dark-color-input',
                    type: 'color',
                    value: this.packageOptions.navigationColorDark,
                    inputHandler: (val: string) => this.packageOptions.navigationColorDark = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Nav divider color',
                    tooltip: `The color of the Android navigation bar divider in your app.`,
                    inputId: 'nav-divider-color-input',
                    type: 'color',
                    value: this.packageOptions.navigationDividerColor,
                    inputHandler: (val: string) => this.packageOptions.navigationDividerColor = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Nav divider dark color',
                    tooltip: `The color of the Android navigation bar divider in your app when the Android device is in dark mode.`,
                    inputId: 'nav-divider-dark-color-input',
                    type: 'color',
                    value: this.packageOptions.navigationDividerColorDark,
                    inputHandler: (val: string) => this.packageOptions.navigationDividerColorDark = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Icon URL',
                    tooltip: `The URL to a square PNG image to use for your app's icon. Can be absolute or relative to your manifest. Google recommends a 512x512 PNG without shadows.`,
                    tooltipLink: 'https://developer.android.com/distribute/google-play/resources/icon-design-specifications',
                    inputId: 'icon-url-input',
                    required: true,
                    spellcheck: false,
                    value: this.packageOptions.iconUrl,
                    placeholder: '/icons/512x512.png',
                    inputHandler: (val: string) => this.packageOptions.iconUrl = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Maskable icon URL',
                    tooltip: `Optional. The URL to a PNG image with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android versions. Google recommends a 512x512 PNG without shadows.`,
                    tooltipLink: 'https://web.dev/maskable-icon',
                    inputId: 'maskable-icon-url-input',
                    spellcheck: false,
                    value: this.packageOptions.maskableIconUrl || '',
                    placeholder: '/icons/512x512-maskable.png',
                    inputHandler: (val: string) => this.packageOptions.maskableIconUrl = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Monochrome icon URL',
                    tooltip: `Optional. The URL to a PNG image containing only white and black colors, enabling Android to fill the icon with user-specified color or
                    gradient depending on theme, color mode, or Android ontrast settings.`,
                    tooltipLink: 'https://w3c.github.io/manifest/#monochrome-icons-and-solid-fills',
                    inputId: 'monochrome-icon-url-input',
                    spellcheck: false,
                    value: this.packageOptions.monochromeIconUrl || '',
                    placeholder: '/icons/512x512-monochrome.png',
                    inputHandler: (val: string) => this.packageOptions.monochromeIconUrl = val
                  })}
                </div>

                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Manifest URL',
                    tooltip: `The absolute URL of your web manifest.`,
                    inputId: 'manifest-url-input',
                    type: 'url',
                    value: this.packageOptions.webManifestUrl,
                    placeholder: 'https://myawesomepwa.com/manifest.json',
                    inputHandler: (val: string) => this.packageOptions.webManifestUrl = val
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
                    inputHandler: (val: string) => this.packageOptions.splashScreenFadeOutDuration = parseInt(val, 10)
                  })}
                </div>

                <div class="form-group">
                  <label>${localeStrings.text.android.titles.fallback}</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Custom Tabs',
                      tooltip: `When Trusted Web Activity (TWA) is unavailable, use Chrome Custom Tabs as a fallback to run your app.`,
                      tooltipLink: 'https://developer.chrome.com/docs/android/custom-tabs/',
                      inputId: 'chrome-custom-tab-fallback-input',
                      type: 'radio',
                      name: 'fallbackType',
                      value: 'customtabs',
                      checked: this.packageOptions.fallbackType === 'customtabs',
                      inputHandler: () => this.packageOptions.fallbackType = 'customtabs'
                    })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Web View',
                      tooltip: `When Trusted Web Activity (TWA) is unavailable, use a web view as a fallback to run your app.`,
                      tooltipLink: 'https://developer.chrome.com/docs/android/custom-tabs/',
                      inputId: 'web-view-fallback-input',
                      type: 'radio',
                      name: 'fallbackType',
                      value: 'webview',
                      checked: this.packageOptions.fallbackType === 'webview',
                      inputHandler: () => this.packageOptions.fallbackType = 'webview'
                    })}
                  </div>
                </div>

                <div class="form-group">
                  <label>${localeStrings.text.android.titles.display_mode}</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Standalone',
                      tooltip: 'Recommended for most apps. The Android status bar and navigation bar will be shown while your app is running.',
                      tooltipLink: 'https://developer.android.com/training/system-ui/immersive',
                      inputId: 'display-standalone-input',
                      type: 'radio',
                      name: 'displayMode',
                      value: 'standalone',
                      checked: this.packageOptions.display === 'standalone',
                      inputHandler: () => this.packageOptions.display = 'standalone'
                    })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Fullscreen',
                      tooltip: `The Android status bar and navigation bar will be hidden while your app is running. Suitable for immersive experiences such as games or media apps.`,
                      tooltipLink: 'https://developer.android.com/training/system-ui/immersive#immersive',
                      inputId: 'display-fullscreen-input',
                      type: 'radio',
                      name: 'displayMode',
                      value: 'fullscreen',
                      checked: this.packageOptions.display === 'fullscreen',
                      inputHandler: () => this.packageOptions.display = 'fullscreen'
                    })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Fullscreen sticky',
                      tooltip: `The Android status bar and navigation bar will be hidden while your app is running, and if the user swipes from the edge of the Android device, the system bars will be semi-transparent, and the touch gesture will be passed to your app. Recommended for drawing apps, and games that require lots of swiping.`,
                      tooltipLink: 'https://developer.android.com/training/system-ui/immersive#sticky-immersive',
                      inputId: 'display-fullscreen-sticky-input',
                      type: 'radio',
                      name: 'displayMode',
                      value: 'fullscreen-sticky',
                      checked: this.packageOptions.display === 'fullscreen-sticky',
                      inputHandler: () => this.packageOptions.display = 'fullscreen-sticky'
                    })}
                  </div>
                </div>

                ${this.isGooglePlayApk ?
                html`
                <div class="form-group">
                  <label>${localeStrings.text.android.titles.notification}</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Enable',
                      tooltip: `If enabled, your PWA can send push notifications without browser permission prompts.`,
                      tooltipLink: 'https://github.com/GoogleChromeLabs/svgomg-twa/issues/60',
                      inputId: 'notification-delegation-input',
                      type: 'checkbox',
                      checked: this.packageOptions.enableNotifications === true,
                      inputHandler: (_, checked) => this.packageOptions.enableNotifications = checked
                    })}
                  </div>
                </div>` : html``}

                ${this.isGooglePlayApk ?
                html`
                <div class="form-group">
                  <label
                    >${localeStrings.text.android.titles
                      .location_delegation}</label
                  >
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Enable',
                      tooltip: 'If enabled, your PWA can access navigator.geolocation without browser permission prompts.',
                      inputId: 'location-delegation-input',
                      type: 'checkbox',
                      checked: this.packageOptions.features.locationDelegation?.enabled === true,
                      inputHandler: (_, checked) => this.packageOptions.features.locationDelegation!.enabled = checked
                    })}
                  </div>
                </div>` : html``}

                ${this.isGooglePlayApk ?
                html`
                <div class="form-group">
                  <label
                    >${localeStrings.text.android.titles
                      .google_play_billing}</label
                  >
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Enable',
                      tooltip: 'If enabled, your PWA can sell in-app purchases and subscriptions via the Digital Goods API.',
                      tooltipLink: 'https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing/',
                      inputId: 'google-play-billing-input',
                      type: 'checkbox',
                      checked: this.packageOptions.features.playBilling?.enabled === true,
                      inputHandler: (_, checked) => this.packageOptions.features.playBilling!.enabled = checked
                    })}
                  </div>
                </div>` : html``}

                <div class="form-group">
                  <label>
                    ${localeStrings.text.android.titles.settings_shortcut}
                  </label>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Enable',
                      tooltip: 'If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app.',
                      tooltipLink: 'https://github.com/pwa-builder/PWABuilder/issues/1113',
                      inputId: 'site-settings-shortcut-input',
                      type: 'checkbox',
                      checked: this.packageOptions.enableSiteSettingsShortcut === true,
                      inputHandler: (_, checked) => this.packageOptions.enableSiteSettingsShortcut = checked
                    })}
                  </div>
                </div>

                ${this.isGooglePlayApk ?
                html`
                <div class="form-group">
                  <label>
                    ${localeStrings.text.android.titles.chromeos_only}
                  </label>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Enable',
                      tooltip: 'If enabled, your Android package will only run on ChromeOS devices.',
                      inputId: 'chromeos-only-input',
                      type: 'checkbox',
                      checked: this.packageOptions.isChromeOSOnly === true,
                      inputHandler: (_, checked) => this.packageOptions.isChromeOSOnly = checked
                    })}
                  </div>
                </div>` : html``}

                <div class="form-group">
                  <label>
                    ${localeStrings.text.android.titles.metaquest}
                  </label>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Enable',
                      tooltip: 'If enabled, your Android package will be compatible with Meta Quest devices.',
                      inputId: 'metaquest-input',
                      type: 'checkbox',
                      checked: this.packageOptions.isMetaQuest === true,
                      inputHandler: (_, checked) => this.isMetaQuestChanged(checked)
                    })}
                  </div>
                </div>

                <div class="form-group">
                  <label>${localeStrings.text.android.titles.source_code}</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Enable',
                      tooltip: 'If enabled, your download will include the source code for your Android app.',
                      inputId: 'include-src-input',
                      type: 'checkbox',
                      checked: this.packageOptions.includeSourceCode === true,
                      inputHandler: (_, checked) => this.packageOptions.includeSourceCode = checked
                    })}
                  </div>
                </div>

                ${this.isGooglePlayApk ?
                html`
                <div class="form-group">
                  <label>${localeStrings.text.android.titles.signing_key}</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'New',
                      tooltip: `Recommended for new apps in Google Play. PWABuilder will generate a new signing key for you and sign your package with it. Your download will contain the new signing details.`,
                      inputId: 'signing-new-input',
                      name: 'signingMode',
                      value: 'new',
                      type: 'radio',
                      checked: this.packageOptions.signingMode === 'new',
                      inputHandler: () => this.androidSigningModeChanged('new')
                    })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Use mine',
                      tooltip: 'Recommended for existing apps in Google Play. Use this option if you already have a signing key and you want to publish a new version of an existing app in Google Play.',
                      inputId: 'signing-mine-input',
                      name: 'signingMode',
                      value: 'mine',
                      type: 'radio',
                      checked: this.packageOptions.signingMode === 'mine',
                      inputHandler: () => this.androidSigningModeChanged('mine')
                    })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'None',
                      tooltip: 'PWABuilder will generate a raw, unsigned APK. Raw, unsigned APKs cannot be uploaded to the Google Play Store.',
                      inputId: 'signing-none-input',
                      name: 'signingMode',
                      value: 'none',
                      type: 'radio',
                      checked: this.packageOptions.signingMode === 'none',
                      inputHandler: () => this.androidSigningModeChanged('none')
                    })}
                  </div>
                </div>

                ${this.renderSigningKeyFields()}` :
                html``}

              </div>
          </sl-details>
        </div>
      </form>
    </div>
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

    // Otherwise, nothing to render.
    return html``;
  }

  renderNewSigningKeyFields(): TemplateResult {
    return html`
      <div class="signing-key-fields">
        <div class="form-group">
          ${this.renderKeyAlias()}
        </div>

        <div class="form-group">
          ${this.renderFormInput({
            label: 'Key full name',
            tooltip: `Your full name. Used when create the new signing key.`,
            tooltipLink: 'https://developer.android.com/studio/publish/app-signing',
            inputId: 'key-full-name-input',
            required: true,
            placeholder: 'John Doe',
            value: this.packageOptions.signing.fullName || '',
            spellcheck: false,
            inputHandler: (val: string) => this.packageOptions.signing.fullName = val
          })}
        </div>

        <div class="form-group">
          ${this.renderFormInput({
            label: 'Key organization',
            tooltip: `The name of your company or organization. Used as the organization of the new signing key.`,
            tooltipLink: 'https://developer.android.com/studio/publish/app-signing',
            inputId: 'key-org-input',
            required: true,
            placeholder: 'My Company',
            value: this.packageOptions.signing.organization || '',
            spellcheck: false,
            inputHandler: (val: string) => this.packageOptions.signing.organization = val
          })}
        </div>

        <div class="form-group">
          ${this.renderFormInput({
            label: 'Key organizational unit',
            tooltip: `The department you work in, e.g. "Engineering". Used as the organizational unit of the new signing key.`,
            tooltipLink: 'https://developer.android.com/studio/publish/app-signing',
            inputId: 'key-org-unit-input',
            required: true,
            placeholder: 'Engineering Department',
            value: this.packageOptions.signing.organizationalUnit,
            spellcheck: false,
            inputHandler: (val: string) => this.packageOptions.signing.organizationalUnit = val
          })}
        </div>

        <div class="form-group">
          ${this.renderFormInput({
            label: 'Key country code',
            tooltip: `Your country's 2 letter code (e.g. "US"). Used as the country of the new signing key.`,
            tooltipLink: 'https://developer.android.com/studio/publish/app-signing',
            inputId: 'key-country-code-input',
            required: true,
            placeholder: 'US',
            value: this.packageOptions.signing.countryCode,
            spellcheck: false,
            minLength: 2,
            maxLength: 2,
            validationErrorMessage: 'Country code must be 2 characters in length',
            inputHandler: (val: string) => this.packageOptions.signing.countryCode = val
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
            @change="${(e: Event) =>
              this.androidSigningKeyUploaded(e.target)}"
            accept=".keystore"
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
    const tooltip = this.packageOptions.signingMode === 'new' ?
      'The alias to use in the new signing key.' :
      'The alias of your existing signing key.'
    return html`
      <div class="form-group">
        ${this.renderFormInput({
          label: 'Key alias',
          tooltip: tooltip,
          tooltipLink: 'https://developer.android.com/studio/publish/app-signing',
          inputId: 'key-alias-input',
          required: true,
          placeholder: 'my-key-alias',
          value: this.packageOptions.signing.alias || '',
          spellcheck: false,
          inputHandler: (val: string) => this.packageOptions.signing.alias = val
        })}
      </div>
    `;
  }

  renderKeyPassword(): TemplateResult {
    const tooltip = this.packageOptions.signingMode === 'new' ?
      'The password to use for the new signing key. Leave blank to let PWABuilder generate a strong password for you.' :
      'Your existing key password'
    return html`
      <div class="form-group">
        ${this.renderFormInput({
          label: 'Key password',
          tooltip: tooltip,
          tooltipLink: 'https://developer.android.com/studio/publish/app-signing',
          inputId: 'key-password-input',
          type: 'password',
          minLength: 6,
          required: this.packageOptions.signingMode === 'mine',
          value: this.packageOptions.signing.keyPassword,
          inputHandler: (val: string) => this.packageOptions.signing.keyPassword = val
        })}
      </div>
    `;
  }

  renderKeyStorePassword(): TemplateResult {
    const tooltip = this.packageOptions.signingMode === 'new' ?
      'The key store password to use in the new signing key. Leave blank to let PWABuilder generate a strong key store password for you.' :
      'Your existing key store password'
    return html`
      <div class="form-group">
        ${this.renderFormInput({
          label: 'Key store password',
          tooltip: tooltip,
          tooltipLink: 'https://developer.android.com/studio/publish/app-signing',
          inputId: 'key-store-password-input',
          type: 'password',
          minLength: 6,
          required: this.packageOptions.signingMode === 'mine',
          value: this.packageOptions.signing.storePassword,
          inputHandler: (val: string) => this.packageOptions.signing.storePassword = val
        })}
      </div>
    `;
  }
}