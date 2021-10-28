import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../components/loading-button';
import '../components/hover-tooltip';
import { fetchOrCreateManifest } from '../services/manifest';
import { createAndroidPackageOptionsFromManifest, emptyAndroidPackageOptions } from '../services/publish/android-publish';
import { AndroidApkOptions } from '../utils/android-validation';
import { Manifest } from '../utils/interfaces';
import { localeStrings } from '../../locales';
import { AppPackageFormBase } from './app-package-form-base';

@customElement('android-form')
export class AndroidForm extends AppPackageFormBase {
  @property({ type: Boolean }) generating = false;

  @state() showAdvanced = false;

  // manifest form props
  @state() signingKeyFullName = 'John Doe';
  @state() organization = 'My Company';
  @state() organizationalUnit = 'Engineering';
  @state() countryCode = 'US';
  @state() keyPassword = '';
  @state() storePassword = '';
  @state() alias = 'my-key-alias';
  @state() file: string | undefined = undefined;
  @state() signingMode = 'new';
  @state() defaultOptions: AndroidApkOptions = emptyAndroidPackageOptions();

  form: HTMLFormElement | undefined;
  currentManifest: Manifest | undefined;
  maxKeyFileSizeInBytes = 2097152;

  static get styles() {
    const localStyles = css`
    `;
    return [
      super.styles,
      localStyles
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    const form = this.shadowRoot?.querySelector(
      '#android-options-form'
    ) as HTMLFormElement;

    if (form) {
      this.form = form;
    }

    const manifestContext = await fetchOrCreateManifest();
    this.currentManifest = manifestContext.manifest;

    this.defaultOptions = await createAndroidPackageOptionsFromManifest(manifestContext.manifest);
  }

  initGenerate(ev: InputEvent) {
    ev.preventDefault();

    this.dispatchEvent(
      new CustomEvent('init-android-gen', {
        detail: {
          form: this.form,
          signingFile: this.file,
        },
        composed: true,
        bubbles: true,
      })
    );
  }

  validatePackageId() {
    const packageIdInput = this.form?.packageId;

    if (packageIdInput?.value?.indexOf('if') !== -1) {
      packageIdInput?.setCustomValidity("Package ID cannot include 'if'");
    } else {
      packageIdInput?.setCustomValidity('');
    }
    packageIdInput?.reportValidity();
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

  opened(targetEl: EventTarget | null) {
    if (targetEl) {
      const flipperButton = (targetEl as Element).classList.contains(
        'flipper-button'
      )
        ? (targetEl as Element)
        : (targetEl as Element).querySelector('.flipper-button');

      if (flipperButton) {
        if (flipperButton.classList.contains('opened')) {
          flipperButton.animate(
            [
              {
                transform: 'rotate(0deg)',
              },
            ],
            {
              duration: 200,
              fill: 'forwards',
            }
          );

          flipperButton.classList.remove('opened');
        } else {
          flipperButton.classList.add('opened');

          flipperButton.animate(
            [
              {
                transform: 'rotate(0deg)',
              },
              {
                transform: 'rotate(90deg)',
              },
            ],
            {
              duration: 200,
              fill: 'forwards',
            }
          );
        }
      }
    }
  }

  /**
   * Called when the user changes the signing mode.
   */
  androidSigningModeChanged(mode: 'mine' | 'new' | 'none') {
    if (!this.form) {
      return;
    }

    this.signingMode = mode;

    // If the user chose "mine", clear out existing values.
    if (mode === 'mine' || mode === 'none') {
      this.alias = '';
      this.signingKeyFullName = '';
      this.organization = '';
      this.organizationalUnit = '';
      this.countryCode = '';
      this.keyPassword = '';
      this.storePassword = '';
    } else if (mode === 'new') {
      this.alias = 'my-key-alias';
      this.signingKeyFullName = `${
        this.currentManifest?.short_name || this.currentManifest?.name || 'App'
      } Admin`;
      this.organization = this.currentManifest?.name || 'PWABuilder';
      this.organizationalUnit = 'Engineering';
      this.countryCode = 'US';
      this.keyPassword = '';
      this.storePassword = '';
      this.file = undefined;
    }
  }

  androidSigningKeyUploaded(event: any) {
    if (!this.form) {
      return;
    }

    const filePicker = event as HTMLInputElement;

    if (filePicker && filePicker.files && filePicker.files.length > 0) {
      const keyFile = filePicker.files[0];
      // Make sure it's a reasonable size.
      if (keyFile && keyFile.size > this.maxKeyFileSizeInBytes) {
        console.error('Keystore file is too large.', {
          maxSize: this.maxKeyFileSizeInBytes,
          fileSize: keyFile.size,
        });
        this.signingMode = 'none';
      }
      // Read it in as a Uint8Array and store it in our signing object.
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.file = fileReader.result as string;
        return;
      };
      fileReader.onerror = progressEvent => {
        console.error(
          'Unable to read keystore file',
          fileReader.error,
          progressEvent
        );
        this.file = undefined;
        if (this.form) {
          this.signingMode = 'none';
        }
      };
      fileReader.readAsDataURL(keyFile as Blob);
    }
  }

  render() {
    return html`
      <form
        id="android-options-form"
        slot="modal-form"
        style="width: 100%"
        @submit="${(ev: InputEvent) => this.initGenerate(ev)}"
        title=""
      >
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              <label for="packageIdInput">
                Package ID
                <i
                  class="fas fa-info-circle"
                  title="The unique identifier of your app. It should contain only letters, numbers, and periods. Example: com.companyname.appname"
                  aria-label="The unique identifier of your app. It should contain only letters, numbers, and periods. Example: com.companyname.appname"
                  role="definition"
                ></i>

                <hover-tooltip
                  text="The unique identifier of your app. It should contain only letters, numbers, and periods. Example: com.companyname.appname"
                  link="https://blog.pwabuilder.com/docs/android-platform"
                >
                </hover-tooltip>
              </label>
              <input
                id="packageIdInput"
                class="form-control"
                placeholder="com.contoso.app"
                value="${this.defaultOptions.packageId || 'com.contoso.app'}"
                type="text"
                required
                pattern="[a-zA-Z0-9._]*$"
                name="packageId"
                @change="${this.validatePackageId}"
              />
            </div>

            <div class="form-group">
              <label for="appNameInput">App name</label>
              <input
                type="text"
                class="form-control"
                id="appNameInput"
                placeholder="My Awesome PWA"
                value="${this.defaultOptions.name || 'My Awesome PWA'}"
                required
                name="appName"
              />
            </div>

            <div class="form-group">
              <label for="appLauncherNameInput">
                Launcher name
                <i
                  class="fas fa-info-circle"
                  title="The app name used on the Android launch screen. Typically, this is the short name of the app."
                  aria-label="The app name used on the Android launch screen. Typically, this is the short name of the app."
                  role="definition"
                ></i>

                <hover-tooltip
                  text="The app name used on the Android launch screen. Typically, this is the short name of the app."
                  link="https://blog.pwabuilder.com/docs/android-platform"
                >
                </hover-tooltip>
              </label>
              <input
                type="text"
                class="form-control"
                id="appLauncherNameInput"
                placeholder="Awesome PWA"
                value="${this.defaultOptions.launcherName || 'Awesome PWA'}"
                required
                name="launcherName"
              />
            </div>
          </div>

          <!-- right half of the options dialog -->
          <fast-accordion>
            <fast-accordion-item
              @click="${(ev: Event) => this.opened(ev.target)}"
            >
              <div id="all-settings-header" slot="heading">
                <span>All Settings</span>

                <fast-button class="flipper-button" mode="stealth">
                  <ion-icon name="caret-forward-outline"></ion-icon>
                </fast-button>
              </div>

              <div class="adv-settings">
                <div>
                  <div class="">
                    <div class="form-group">
                      <label for="appVersionInput">
                        App version
                        <i
                          class="fas fa-info-circle"
                          title="The version of your app displayed to users. This is a string, typically in the form of '1.0.0.0'. Maps to android:versionName."
                          aria-label
                          role="definition"
                        ></i>

                        <hover-tooltip
                          text="The version of your app displayed to users. This is a string, typically in the form of '1.0.0.0'. Maps to android:versionName."
                          link="https://blog.pwabuilder.com/docs/android-platform"
                        >
                        </hover-tooltip>
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="appVersionInput"
                        placeholder="1.0.0.0"
                        value="${this.defaultOptions.appVersion || '1.0.0.0'}"
                        required
                        name="appVersion"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="">
                  <div class="form-group">
                    <label for="appVersionCodeInput">
                      <a
                        href="https://developer.android.com/studio/publish/versioning#appversioning"
                        target="_blank"
                        rel="noopener"
                        tabindex="-1"
                        >App version code</a
                      >
                      <i
                        class="fas fa-info-circle"
                        title="A positive integer used as an internal version number. This is not shown to users. Android uses this value to protect against downgrades. Maps to android:versionCode."
                        aria-label="A positive integer used as an internal version number. This is not shown to users. Android uses this value to protect against downgrades. Maps to android:versionCode."
                        role="definition"
                        style="margin-left: 5px;"
                      ></i>

                      <hover-tooltip
                        text="A positive integer used as an internal version number. This is not shown to users. Android uses this value to protect against downgrades. Maps to android:versionCode."
                        link="https://blog.pwabuilder.com/docs/android-platform"
                      >
                      </hover-tooltip>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="2100000000"
                      class="form-control"
                      id="appVersionCodeInput"
                      name="appVersionCode"
                      placeholder="1"
                      required
                      value="${this.defaultOptions.appVersionCode || 1}"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div class="">
                  <div class="form-group">
                    <label for="hostInput">Host</label>
                    <input
                      type="url"
                      class="form-control"
                      id="hostInput"
                      placeholder="https://mysite.com"
                      required
                      name="host"
                      value="${this.defaultOptions.host || 'https://mysite.com'}"
                    />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="startUrlInput">
                  Start URL
                  <i
                    class="fas fa-info-circle"
                    title="The start path for the TWA. Must be relative to the Host URL. You can specify '/' if you don't have a start URL different from Host."
                    aria-label="The start path for the TWA. Must be relative to the Host URL."
                    role="definition"
                  ></i>

                  <hover-tooltip
                    text="The start path for the TWA. Must be relative to the Host URL. You can specify '/' if you don't have a start URL different from Host."
                    link="https://blog.pwabuilder.com/docs/android-platform"
                  >
                  </hover-tooltip>
                </label>
                <!-- has to be a text type as / is not a valid URL in the input in the spec -->
                <input
                  type="text"
                  class="form-control"
                  id="startUrlInput"
                  placeholder="/index.html"
                  required
                  name="startUrl"
                  value="${this.defaultOptions.startUrl || '/'}"
                />
              </div>

              <div class="form-group">
                <label for="themeColorInput">
                  Status bar color
                  <i
                    class="fas fa-info-circle"
                    title="Also known as the theme color, this is the color of the Android status bar in your app. Note: the status bar will be hidden if Display Mode is set to fullscreen."
                    aria-label="Also known as the theme color, this is the color of the Android status bar in your app. Note: the status bar will be hidden if Display Mode is set to fullscreen."
                    role="definition"
                  ></i>

                  <hover-tooltip
                    text="Also known as the theme color, this is the color of the Android status bar in your app. Note: the status bar will be hidden if Display Mode is set to fullscreen."
                    link="https://blog.pwabuilder.com/docs/android-platform"
                  >
                  </hover-tooltip>
                </label>
                <input
                  type="color"
                  class="form-control"
                  id="themeColorInput"
                  name="themeColor"
                  value="${this.defaultOptions.themeColor || 'black'}"
                />
              </div>

              <div class="form-group">
                <label for="bgColorInput">
                  Splash color
                  <i
                    class="fas fa-info-circle"
                    title="Also known as background color, this is the color of the splash screen for your app."
                    aria-label="Also known as background color, this is the color of the splash screen for your app."
                    role="definition"
                  ></i>

                  <hover-tooltip
                    text="Also known as background color, this is the color of the splash screen for your app."
                    link="https://blog.pwabuilder.com/docs/android-platform"
                  >
                  </hover-tooltip>
                </label>
                <input
                  type="color"
                  class="form-control"
                  id="bgColorInput"
                  name="backgroundColor"
                  value="${this.defaultOptions.backgroundColor || 'black'}"
                />
              </div>

              <div class="form-group">
                <label for="navigationColorInput">
                  Nav color
                  <i
                    class="fas fa-info-circle"
                    title="The color of the Android navigation bar in your app. Note: the navigation bar will be hidden if Display Mode is set to fullscreen."
                    aria-label="The color of the Android navigation bar in your app. Note: the navigation bar will be hidden if Display Mode is set to fullscreen."
                    role="definition"
                  ></i>

                  <hover-tooltip
                    text="The color of the Android navigation bar in your app. Note: the navigation bar will be hidden if Display Mode is set to fullscreen."
                    link="https://blog.pwabuilder.com/docs/android-platform"
                  >
                  </hover-tooltip>
                </label>
                <input
                  type="color"
                  class="form-control"
                  id="navigationColorInput"
                  name="navigationColor"
                  value="${this.defaultOptions.navigationColor || 'black'}"
                />
              </div>

              <div class="form-group">
                <label for="navigationColorDarkInput">
                  Nav dark color
                  <i
                    class="fas fa-info-circle"
                    title="The color of the Android navigation bar in your app when Android is in dark mode."
                    aria-label="The color of the Android navigation bar in your app when Android is in dark mode."
                    role="definition"
                  ></i>

                  <hover-tooltip
                    text="The color of the Android navigation bar in your app when Android is in dark mode."
                    link="https://blog.pwabuilder.com/docs/android-platform"
                  >
                  </hover-tooltip>
                </label>
                <input
                  type="color"
                  class="form-control"
                  id="navigationColorDarkInput"
                  name="navigationColorDark"
                  value="${this.defaultOptions.navigationColorDark || 'black'}"
                />
              </div>

              <div class="form-group">
                <label for="navigationDividerColorInput">
                  Nav divider color
                  <i
                    class="fas fa-info-circle"
                    title="The color of the Android navigation bar divider in your app."
                    aria-label="The color of the Android navigation bar divider in your app."
                    role="definition"
                  ></i>

                  <hover-tooltip
                    text="The color of the Android navigation bar divider in your app."
                    link="https://blog.pwabuilder.com/docs/android-platform"
                  >
                  </hover-tooltip>
                </label>
                <input
                  type="color"
                  class="form-control"
                  id="navigationDividerColorInput"
                  name="navigationDividerColor"
                  value="${this.defaultOptions.navigationDividerColor || 'black'}"
                />
              </div>

              <div class="form-group">
                <label for="navigationDividerColorDarkInput">
                  Nav divider dark color
                  <i
                    class="fas fa-info-circle"
                    title="The color of the Android navigation navigation bar divider in your app when Android is in dark mode."
                    aria-label="The color of the Android navigation bar divider in your app when Android is in dark mode."
                    role="definition"
                  ></i>

                  <hover-tooltip
                    text="The color of the Android navigation navigation bar divider in your app when Android is in dark mode."
                    link="https://blog.pwabuilder.com/docs/android-platform"
                  >
                  </hover-tooltip>
                </label>
                <input
                  type="color"
                  class="form-control"
                  id="navigationDividerColorDarkInput"
                  name="navigationDividerColorDark"
                  value="${this.defaultOptions.navigationDividerColorDark || 'black'}"
                />
              </div>

              <div class="form-group">
                <label for="iconUrlInput">Icon URL</label>
                <input
                  type="url"
                  class="form-control"
                  id="iconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512.png"
                  name="iconUrl"
                  value="${this.defaultOptions.iconUrl || ''}"
                />
              </div>

              <div class="form-group">
                <label for="maskIconUrlInput">
                  <a
                    href="https://web.dev/maskable-icon"
                    title="Read more about maskable icons"
                    target="_blank"
                    rel="noopener"
                    aria-label="Read more about maskable icons"
                    tabindex="-1"
                  >
                    Maskable icon URL
                  </a>
                  <i
                    class="fas fa-info-circle"
                    title="Optional. The URL to an icon with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android platforms."
                    aria-label="Optional. The URL to an icon with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android platforms."
                    role="definition"
                  ></i>

                  <hover-tooltip
                    text="Optional. The URL to an icon with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android platforms."
                    link="https://blog.pwabuilder.com/docs/android-platform"
                  >
                  </hover-tooltip>
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="maskIconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512-maskable.png"
                  name="maskableIconUrl"
                  .value="${this.defaultOptions.maskableIconUrl || ''}"
                />
              </div>

              <div class="form-group">
                <label for="monochromeIconUrlInput">
                  <a
                    href="https://w3c.github.io/manifest/#monochrome-icons-and-solid-fills"
                    target="_blank"
                    rel="noopener"
                    tabindex="-1"
                    >Monochrome icon URL</a
                  >
                  <i
                    class="fas fa-info-circle"
                    title="Optional. The URL to an icon containing only white and black colors, enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or contrast settings."
                    aria-label="Optional. The URL to an icon containing only white and black colors, enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or contrast settings."
                    role="definition"
                  ></i>

                  <hover-tooltip
                    text="Optional. The URL to an icon containing only white and black colors, enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or contrast settings."
                    link="https://blog.pwabuilder.com/docs/android-platform"
                  >
                  </hover-tooltip>
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="monochromeIconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512-monochrome.png"
                  name="monochromeIconUrl"
                  .value="${this.defaultOptions.monochromeIconUrl || ''}"
                />
              </div>

              <div class="form-group">
                <label for="webManifestUrlInput"> Manifest URL </label>
                <input
                  type="url"
                  class="form-control"
                  id="webManifestUrlInput"
                  placeholder="https://myawesomepwa.com/manifest.json"
                  name="webManifestUrl"
                  .value="${this.defaultOptions.webManifestUrl || ''}"
                />
              </div>

              <div class="form-group">
                <label for="splashFadeoutInput"
                  >Splash screen fade out duration (ms)</label
                >
                <input
                  type="number"
                  class="form-control"
                  id="splashFadeoutInput"
                  placeholder="300"
                  name="splashScreenFadeOutDuration"
                  value="${this.defaultOptions.splashScreenFadeOutDuration || '300'}"
                />
              </div>

              <div class="form-group">
                <label>${localeStrings.text.android.titles.fallback}</label>
                <div class="form-check">
                  <input
                    .defaultChecked="${true}"
                    value="customtabs"
                    class="form-check-input"
                    type="radio"
                    name="fallbackType"
                    id="fallbackCustomTabsInput"
                    name="fallbackType"
                  />
                  <label class="form-check-label" for="fallbackCustomTabsInput">
                    Custom Tabs
                    <i
                      class="fas fa-info-circle"
                      title="Use Chrome Custom Tabs as a fallback for your PWA when the full trusted web activity (TWA) experience is unavailable."
                      aria-label="When trusted web activity (TWA) is unavailable, use Chrome Custom Tabs as a fallback for your PWA."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="Use Chrome Custom Tabs as a fallback for your PWA when the full trusted web activity (TWA) experience is unavailable."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
                <div class="form-check">
                  <input
                    .defaultChecked="${false}"
                    value="webview"
                    class="form-check-input"
                    type="radio"
                    name="fallbackType"
                    id="fallbackWebViewInput"
                    value="webview"
                    name="fallbackType"
                  />
                  <label class="form-check-label" for="fallbackWebViewInput">
                    Web View
                    <i
                      class="fas fa-info-circle"
                      title="Use a web view as the fallback for your PWA when the full trusted web activity (TWA) experience is unavailable."
                      aria-label="When trusted web activity (TWA) is unavailable, use a web view as the fallback for your PWA."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="Use a web view as the fallback for your PWA when the full trusted web activity (TWA) experience is unavailable."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${localeStrings.text.android.titles.display_mode}</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="displayMode"
                    id="standaloneDisplayModeInput"
                    .defaultChecked="${this.defaultOptions.display === 'standalone'}"
                    value="standalone"
                    name="display"
                  />
                  <label
                    class="form-check-label"
                    for="standaloneDisplayModeInput"
                  >
                    Standalone
                    <i
                      class="fas fa-info-circle"
                      title="Your PWA will use the whole screen but keep the Android status bar and navigation bar."
                      aria-label="Your PWA will use the whole screen but keep the Android status bar and navigation bar."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="Your PWA will use the whole screen but keep the Android status bar and navigation bar."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="displayMode"
                    id="fullscreenDisplayModeInput"
                    .defaultChecked="${this.defaultOptions.display === 'fullscreen'}"
                    value="fullscreen"
                    name="display"
                  />
                  <label
                    class="form-check-label"
                    for="fullscreenDisplayModeInput"
                  >
                    Fullscreen
                    <i
                      class="fas fa-info-circle"
                      title="Your PWA will use the whole screen and remove the Android status bar and navigation bar. Suitable for immersive experiences such as games or media apps."
                      aria-label="Your PWA will use the whole screen and remove the Android status bar and navigation bar. Suitable for immersive experiences such as games or media apps."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="Your PWA will use the whole screen and remove the Android status bar and navigation bar. Suitable for immersive experiences such as games or media apps."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${localeStrings.text.android.titles.notification}</label>
                <div class="form-check">
                  <input
                    .defaultChecked="${true}"
                    class="form-check-input"
                    type="checkbox"
                    id="enableNotificationsInput"
                    name="enableNotifications"
                  />
                  <label
                    class="form-check-label"
                    for="enableNotificationsInput"
                  >
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="Whether to enable Push Notification Delegation. If enabled, your PWA can send push notifications without browser permission prompts."
                      aria-label="Whether to enable Push Notification Delegation. If enabled, your PWA can send push notifications without browser permission prompts."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="Whether to enable Push Notification Delegation. If enabled, your PWA can send push notifications without browser permission prompts."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label
                  >${localeStrings.text.android.titles
                    .location_delegation}</label
                >
                <div class="form-check">
                  <input
                    .defaultChecked="${true}"
                    class="form-check-input"
                    type="checkbox"
                    id="enableLocationInput"
                    name="locationDelegation"
                  />
                  <label class="form-check-label" for="enableLocationInput">
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="Whether to enable Location Delegation. If enabled, your PWA can acess navigator.geolocation without browser permission prompts."
                      aria-label="Whether to enable Location Delegation. If enabled, your PWA can acess navigator.geolocation without browser permission prompts."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="Whether to enable Location Delegation. If enabled, your PWA can acess navigator.geolocation without browser permission prompts."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label
                  >${localeStrings.text.android.titles
                    .google_play_billing}</label
                >
                <div class="form-check">
                  <input
                    .defaultChecked="${false}"
                    class="form-check-input"
                    type="checkbox"
                    id="enablePlayBillingInput"
                    name="playBilling"
                  />
                  <label class="form-check-label" for="enablePlayBillingInput">
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="Whether to enable in-app purchases through Google Play Billing and the Digital Goods API."
                      aria-label="Whether to enable in-app purchases through Google Play Billing and the Digital Goods API."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="Whether to enable in-app purchases through Google Play Billing and the Digital Goods API."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label
                  >${localeStrings.text.android.titles.settings_shortcut}</label
                >
                <div class="form-check">
                  <input
                    .defaultChecked="${true}"
                    class="form-check-input"
                    type="checkbox"
                    id="enableSettingsShortcutInput"
                    name="enableSiteSettingsShortcut"
                  />
                  <label
                    class="form-check-label"
                    for="enableSettingsShortcutInput"
                  >
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app."
                      aria-label="If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label
                  >${localeStrings.text.android.titles.chromeos_only}</label
                >
                <div class="form-check">
                  <input
                    .defaultChecked="${false}"
                    class="form-check-input"
                    type="checkbox"
                    id="chromeOSOnlyInput"
                    name="isChromeOSOnly"
                  />
                  <label class="form-check-label" for="chromeOSOnlyInput">
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="If enabled, your Android package will only run on ChromeOS devices"
                      aria-label="If enabled, your Android package will only run on ChromeOS devices"
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="If enabled, your Android package will only run on ChromeOS devices"
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${localeStrings.text.android.titles.source_code}</label>
                <div class="form-check">
                  <input
                    .defaultChecked="${false}"
                    class="form-check-input"
                    type="checkbox"
                    id="includeSourceCodeInput"
                    name="includeSourceCode"
                  />
                  <label class="form-check-label" for="includeSourceCodeInput">
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="If enabled, your download will include the source code for your Android app."
                      aria-label="If enabled, your download will include the source code for your Android app."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="If enabled, your download will include the source code for your Android app."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${localeStrings.text.android.titles.signing_key}</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="generateSigningKeyInput"
                    value="new"
                    name="signingMode"
                    @change="${(ev: Event) =>
                      this.androidSigningModeChanged((ev.target as any).value)}"
                    .defaultChecked="${true}"
                  />
                  <label class="form-check-label" for="generateSigningKeyInput">
                    Create new
                    <i
                      class="fas fa-info-circle"
                      title="PWABuilder will generate a new signing key for you and sign your APK with it. Your download will contain the new signing key and passwords."
                      aria-label="PWABuilder will generate a new signing key for you and sign your APK with it. Your download will contain the new signing key and passwords."
                      role="definition"
                    ></i>
                    <hover-tooltip
                      text="PWABuilder will generate a new signing key for you and sign your APK with it. Your download will contain the new signing key and passwords."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="unsignedInput"
                    value="none"
                    name="signingMode"
                    @change="${(ev: Event) =>
                      this.androidSigningModeChanged((ev.target as any).value)}"
                  />
                  <label class="form-check-label" for="unsignedInput">
                    None
                    <i
                      class="fas fa-info-circle"
                      title="PWABuilder will generate an unsigned APK. Google Play Store will sign your package. This is Google's recommended approach."
                      aria-label="PWABuilder will generate an unsigned APK. Google Play Store will sign your package. This is Google's recommended approach."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="PWABuilder will generate an unsigned APK. Google Play Store will sign your package. This is Google's recommended approach."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="useMySigningInput"
                    value="mine"
                    name="signingMode"
                    @change="${(ev: Event) =>
                      this.androidSigningModeChanged((ev.target as any).value)}"
                  />
                  <label class="form-check-label" for="useMySigningInput">
                    Use mine
                    <i
                      class="fas fa-info-circle"
                      title="Upload your existing signing key. Use this option if you already have a signing key and you want to publish a new version of an existing app in Google Play."
                      aria-label="Upload your existing signing key. Use this option if you already have a signing key and you want to publish a new version of an existing app in Google Play."
                      role="definition"
                    ></i>

                    <hover-tooltip
                      text="Upload your existing signing key. Use this option if you already have a signing key and you want to publish a new version of an existing app in Google Play."
                      link="https://blog.pwabuilder.com/docs/android-platform"
                    >
                    </hover-tooltip>
                  </label>
                </div>
              </div>

              ${this.signingMode === 'mine' || this.signingMode === 'new'
                ? html`
                    <div style="margin-left: 15px;">
                      ${this.signingMode === 'mine'
                        ? html`
                            <div class="form-group">
                              <label for="signingKeyInput">Key file</label>
                              <input
                                type="file"
                                class="form-control"
                                id="signingKeyInput"
                                @change="${(ev: Event) =>
                                  this.androidSigningKeyUploaded(ev.target)}"
                                accept=".keystore"
                                required
                                style="border: none;"
                                value="${ifDefined(this.file)}"
                              />
                            </div>
                          `
                        : null}

                      <div class="form-group">
                        <label for="signingKeyAliasInput">Key alias</label>
                        <input
                          type="text"
                          class="form-control"
                          id="signingKeyAliasInput"
                          placeholder="my-key-alias"
                          required
                          name="alias"
                          value="${this.alias}"
                        />
                      </div>

                      ${this.signingMode === 'new'
                        ? html`
                            <div class="form-group">
                              <label for="signingKeyFullNameInput"
                                >Key full name</label
                              >
                              <input
                                type="text"
                                class="form-control"
                                id="signingKeyFullNameInput"
                                required
                                placeholder="John Doe"
                                name="fullName"
                                value="${this.signingKeyFullName}"
                              />
                            </div>

                            <div class="form-group">
                              <label for="signingKeyOrgInput"
                                >Key organization</label
                              >
                              <input
                                type="text"
                                class="form-control"
                                id="signingKeyOrgInput"
                                required
                                placeholder="My Company"
                                name="organization"
                                value="${this.organization}"
                              />
                            </div>

                            <div class="form-group">
                              <label for="signingKeyOrgUnitInput"
                                >Key organizational unit</label
                              >
                              <input
                                type="text"
                                class="form-control"
                                id="signingKeyOrgUnitInput"
                                required
                                placeholder="Engineering Department"
                                name="organizationalUnit"
                                value="${this.organizationalUnit}"
                              />
                            </div>

                            <div class="form-group">
                              <label for="signingKeyCountryCodeInput">
                                Key country code
                                <i
                                  class="fas fa-info-circle"
                                  title="The 2 letter country code to list on the signing key"
                                  aria-label="The 2 letter country code to list on the signing key"
                                  role="definition"
                                ></i>

                                <hover-tooltip
                                  text="The 2 letter country code to list on the signing key"
                                  link="https://blog.pwabuilder.com/docs/android-platform"
                                >
                                </hover-tooltip>
                              </label>
                              <input
                                type="text"
                                class="form-control"
                                id="signingKeyCountryCodeInput"
                                required
                                placeholder="US"
                                name="countryCode"
                                value="${this.countryCode}"
                              />
                            </div>
                          `
                        : null}

                      <div class="form-group">
                        <label for="signingKeyPasswordInput">
                          Key password
                          <i
                            class="fas fa-info-circle"
                            title="The password for the signing key. Type a new password or leave empty to use a generated password."
                            aria-label="The password for the signing key. Type a new password or leave empty to use a generated password."
                            role="definition"
                          ></i>

                          <hover-tooltip
                            text="The 2 letter country code to list on the signing key"
                            link="The password for the signing key. Type a new password or leave empty to use a generated password."
                          >
                          </hover-tooltip>
                        </label>
                        <input
                          type="password"
                          class="form-control"
                          id="signingKeyPasswordInput"
                          name="keyPassword"
                          placeholder="Password to your signing key"
                          minlength="6"
                          value="${this.keyPassword}"
                        />
                      </div>

                      <div class="form-group">
                        <label for="signingKeyStorePasswordInput">
                          Key store password
                          <i
                            class="fas fa-info-circle"
                            title="The password for the key store. Type a new password or leave empty to use a generated password."
                            aria-label="The password for the key store. Type a new password or leave empty to use a generated password."
                            role="definition"
                          ></i>

                          <hover-tooltip
                            text="The 2 letter country code to list on the signing key"
                            link="The password for the key store. Type a new password or leave empty to use a generated password."
                          >
                          </hover-tooltip>
                        </label>
                        <input
                          type="password"
                          class="form-control"
                          id="signingKeyStorePasswordInput"
                          name="storePassword"
                          placeholder="Password to your key store"
                          minlength="6"
                          value="${this.storePassword}"
                        />
                      </div>
                    </div>
                  `
                : null}
            </fast-accordion-item>
          </fast-accordion>
        </div>

        <div id="form-details-block">
          <p>${localeStrings.text.android.description.form_details}</p>
        </div>

        <div id="form-options-actions" class="modal-actions">
          <loading-button .loading="${this.generating}">
            <input id="generate-submit" type="submit" value="Generate" />
          </loading-button>
        </div>
      </form>
    `;
  }
}
