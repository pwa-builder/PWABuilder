import { LitElement, css, html } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import '../components/loading-button';
import { tooltip, styles as ToolTipStyles } from '../components/tooltip';

//@ts-ignore
import style from '../../../styles/form-styles.css';
//@ts-ignore
import ModalStyles from '../../../styles/modal-styles.css';
import { getManifest } from '../services/manifest';
import { createAndroidPackageOptionsFromManifest } from '../services/publish/android-publish';
import { AndroidApkOptions } from '../utils/android-validation';

import { smallBreakPoint, xxLargeBreakPoint } from '../utils/css/breakpoints';
import { Manifest } from '../utils/interfaces';

import { localeStrings } from '../../locales';

@customElement('android-form')
export class AndroidForm extends LitElement {
  @property({ type: Boolean }) generating: boolean = false;

  @state() show_adv = false;

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

  @state() default_options: AndroidApkOptions | undefined;

  form: HTMLFormElement | undefined;
  currentManifest: Manifest | undefined;
  maxKeyFileSizeInBytes = 2097152;

  static get styles() {
    return [
      style,
      ModalStyles,
      ToolTipStyles,
      css`
        fast-text-field::part(root),
        fast-number-field::part(root) {
          border: 1px solid rgba(194, 201, 209, 1);
          border-radius: var(--input-radius);
        }

        fast-text-field::part(control),
        fast-number-field::part(control) {
          color: var(--font-color);
          border-radius: var(--input-radius);
        }

        @media (min-height: 760px) and (max-height: 1000px) {
          form {
            width: 100%;
          }
        }

        ${xxLargeBreakPoint(
          css`
            #form-layout {
              max-height: 17em;
            }
          `
        )}

        ${smallBreakPoint(
          css`
            #form-layout {
              max-height: 20em;
            }
          `
        )}
      `,
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

    this.currentManifest = await getManifest();

    this.default_options = await createAndroidPackageOptionsFromManifest();
  }

  initGenerate() {
    this.dispatchEvent(
      new CustomEvent('init-android-gen', {
        detail: {
          form: this.form,
        },
        composed: true,
        bubbles: true,
      })
    );
  }

  toggleSettings(settingsToggleValue: 'basic' | 'advanced') {
    if (settingsToggleValue === 'advanced') {
      this.show_adv = true;
    } else if (settingsToggleValue === 'basic') {
      this.show_adv = false;
    } else {
      this.show_adv = false;
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
  androidSigningModeChanged(mode: 'mine' | 'new') {
    if (!this.form) {
      return;
    }

    this.signingMode = mode;

    // If the user chose "mine", clear out existing values.
    if (mode === 'mine') {
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
      fileReader.onload = () => (this.file = fileReader.result as string);
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
      fileReader.readAsDataURL((keyFile as Blob));
    }
  }

  render() {
    return html`
      <form id="android-options-form" slot="modal-form" style="width: 100%">
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              <label for="packageIdInput">
                Package Name
                <i class="fas fa-info-circle"
                  title="The unique identifier of your app. It should contain only letters, numbers, and periods. Example: com.companyname.appname"
                  aria-label="The unique identifier of your app. It should contain only letters, numbers, and periods. Example: com.companyname.appname"
                  role="definition"></i>

                  ${tooltip(
                    'android-package-name',
                    'The unique identifier of your app. It should contain only letters, numbers, and periods. Example: com.companyname.appname'
                  )}
              </label>
              <fast-text-field id="packageIdInput" class="form-control" placeholder="com.contoso.app" value="${
                  this.default_options
                    ? this.default_options.packageId
                    : 'com.contoso.app'
                }" type="text" required
                name="packageId"></fast-text-field>
            </div>
      
            <div class="form-group">
              <label for="appNameInput">App name</label>
              <fast-text-field type="text" class="form-control" id="appNameInput" placeholder="My Awesome PWA"
                value="${
                  this.default_options
                    ? this.default_options.name
                    : ' My Awesome PWA'
                }" required name="appName" />
              </fast-text-field>
            </div>
      
            <div class="form-group">
              <label for="appLauncherNameInput">
                Launcher name
                <i class="fas fa-info-circle"
                  title="The app name used on the Android launch screen. Typically, this is the short name of the app."
                  aria-label="The app name used on the Android launch screen. Typically, this is the short name of the app."
                  role="definition"></i>

                  ${tooltip(
                    'android-launcher-name',
                    'The app name used on the Android launch screen. Typically, this is the short name of the app.'
                  )}
              </label>
              <fast-text-field type="text" class="form-control" id="appLauncherNameInput" placeholder="Awesome PWA" value="${
                this.default_options
                  ? this.default_options.launcherName
                  : 'Awesome PWA'
              }" required
                name="launcherName" />
              </fast-text-field>
            </div>
          </div>
      
          <!-- right half of the options dialog -->
          <fast-accordion>
            <fast-accordion-item @click="${(ev: Event) =>
              this.opened(ev.target)}">
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
                        <i class="fas fa-info-circle"
                          title="The version of your app displayed to users. This is a string, typically in the form of '1.0.0.0'. Maps to android:versionName."
                          aria-label role="definition"></i>

                          ${tooltip(
                            'android-version',
                            "The version of your app displayed to users. This is a string, typically in the form of '1.0.0.0'. Maps to android:versionName."
                          )}
                      </label>
                      <fast-text-field type="text" class="form-control" id="appVersionInput" placeholder="1.0.0.0" value="${
                        this.default_options
                          ? this.default_options.appVersion
                          : '1.0.0.0'
                      }" required
                        name="appVersion" />
                      </fast-text-field>
                    </div>
                  </div>
                </div>
              </div>
      
              <div>
                <div class="">
                  <div class="form-group">
                    <label for="appVersionCodeInput">
                      <a href="https://developer.android.com/studio/publish/versioning#appversioning" target="_blank"
                        rel="noopener">App version code</a>
                      <i class="fas fa-info-circle"
                        title="A positive integer used as an internal version number. This is not shown to users. Android uses this value to protect against downgrades. Maps to android:versionCode."
                        aria-label="A positive integer used as an internal version number. This is not shown to users. Android uses this value to protect against downgrades. Maps to android:versionCode."
                        role="definition" style="margin-left: 5px;"></i>

                        ${tooltip(
                          'android-version-code',
                          'A positive integer used as an internal version number. This is not shown to users. Android uses this value to protect against downgrades. Maps to android:versionCode.'
                        )}
                    </label>
                    <fast-number-field type="number" min="1" max="2100000000" class="form-control" id="appVersionCodeInput"
                      placeholder="1" required value="${
                        this.default_options
                          ? this.default_options.appVersionCode
                          : '1'
                      }" name="appVersionCode" />
                    </fast-number-field>
                  </div>
                </div>
              </div>
      
              <div>
                <div class="">
                  <div class="form-group">
                    <label for="hostInput">Host</label>
                    <fast-text-field type="url" class="form-control" id="hostInput" placeholder="https://mysite.com" required
                      name="host" value="${
                        this.default_options
                          ? this.default_options.host
                          : 'https://mysite.com'
                      }" />
                    </fast-text-field>
                  </div>
                </div>
              </div>
      
              <div class="form-group">
                <label for="startUrlInput">
                  Start URL
                  <i class="fas fa-info-circle"
                    title="The start path for the TWA. Must be relative to the Host URL. You can specify '/' if you don't have a start URL different from Host."
                    aria-label="The start path for the TWA. Must be relative to the Host URL." role="definition"></i>

                    ${tooltip(
                      'android-start-url',
                      "The start path for the TWA. Must be relative to the Host URL. You can specify '/' if you don't have a start URL different from Host."
                    )}
                </label>
                <fast-text-field type="url" class="form-control" id="startUrlInput" placeholder="/index.html" required
                  name="startUrl" value="${
                    this.default_options ? this.default_options.startUrl : '/'
                  }" />
                </fast-text-field>
              </div>
      
              <div class="form-group">
                <label for="themeColorInput">
                  Status bar color
                  <i class="fas fa-info-circle"
                    title="Also known as the theme color, this is the color of the Android status bar in your app. Note: the status bar will be hidden if Display Mode is set to fullscreen."
                    aria-label="Also known as the theme color, this is the color of the Android status bar in your app. Note: the status bar will be hidden if Display Mode is set to fullscreen."
                    role="definition"></i>

                    ${tooltip(
                      'android-status-bar-color',
                      'Also known as the theme color, this is the color of the Android status bar in your app. Note: the status bar will be hidden if Display Mode is set to fullscreen.'
                    )}
                    
                </label>
                <input type="color" class="form-control" id="themeColorInput" name="themeColor" value="${
                  this.default_options
                    ? this.default_options.themeColor
                    : 'black'
                }" />
              </div>
      
              <div class="form-group">
                <label for="bgColorInput">
                  Splash color
                  <i class="fas fa-info-circle"
                    title="Also known as background color, this is the color of the splash screen for your app."
                    aria-label="Also known as background color, this is the color of the splash screen for your app."
                    role="definition"></i>

                    ${tooltip(
                      'android-splash-color',
                      'Also known as background color, this is the color of the splash screen for your app.'
                    )}
                </label>
                <input type="color" class="form-control" id="bgColorInput" name="backgroundColor" value="${
                  this.default_options
                    ? this.default_options.backgroundColor
                    : 'black'
                }" />
              </div>
      
              <div class="form-group">
                <label for="navigationColorInput">
                  Nav color
                  <i class="fas fa-info-circle"
                    title="The color of the Android navigation bar in your app. Note: the navigation bar will be hidden if Display Mode is set to fullscreen."
                    aria-label="The color of the Android navigation bar in your app. Note: the navigation bar will be hidden if Display Mode is set to fullscreen."
                    role="definition"></i>
                </label>

                ${tooltip(
                  'android-nav-color',
                  'The color of the Android navigation bar in your app. Note: the navigation bar will be hidden if Display Mode is set to fullscreen.'
                )}
                <input type="color" class="form-control" id="navigationColorInput" name="navigationColor" value="${
                  this.default_options
                    ? this.default_options.navigationColor
                    : 'black'
                }" />
              </div>
      
              <div class="form-group">
                <label for="navigationColorDarkInput">
                  Nav dark color
                  <i class="fas fa-info-circle"
                    title="The color of the Android navigation bar in your app when Android is in dark mode."
                    aria-label="The color of the Android navigation bar in your app when Android is in dark mode."
                    role="definition"></i>

                    ${tooltip(
                      'android-nav-color-dark',
                      'The color of the Android navigation bar in your app when Android is in dark mode.'
                    )}
                </label>
                <input type="color" class="form-control" id="navigationColorDarkInput" name="navigationColorDark" value="${
                  this.default_options
                    ? this.default_options.navigationColorDark
                    : 'black'
                }" />
              </div>
      
              <div class="form-group">
                <label for="navigationDividerColorInput">
                  Nav divider color
                  <i class="fas fa-info-circle" title="The color of the Android navigation bar divider in your app."
                    aria-label="The color of the Android navigation bar divider in your app." role="definition"></i>

                    ${tooltip(
                      'android-divider-color',
                      'The color of the Android navigation bar divider in your app.'
                    )}
                </label>
                <input type="color" class="form-control" id="navigationDividerColorInput" name="navigationDividerColor" value="${
                  this.default_options
                    ? this.default_options.navigationDividerColor
                    : 'black'
                }" />
              </div>
      
              <div class="form-group">
                <label for="navigationDividerColorDarkInput">
                  Nav divider dark color
                  <i class="fas fa-info-circle"
                    title="The color of the Android navigation navigation bar divider in your app when Android is in dark mode."
                    aria-label="The color of the Android navigation bar divider in your app when Android is in dark mode."
                    role="definition"></i>

                    ${tooltip(
                      'android-divider-color-dark',
                      'The color of the Android navigation navigation bar divider in your app when Android is in dark mode.'
                    )}
                </label>
                <input type="color" class="form-control" id="navigationDividerColorDarkInput"
                  name="navigationDividerColorDark" value="${
                    this.default_options
                      ? this.default_options.navigationDividerColorDark
                      : 'black'
                  }" />
              </div>
      
              <div class="form-group">
                <label for="iconUrlInput">Icon URL</label>
                <fast-text-field type="url" class="form-control" id="iconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512.png" name="iconUrl" value="${
                    this.default_options ? this.default_options.iconUrl : ''
                  }" />
                </fast-text-field>
              </div>
      
              <div class="form-group">
                <label for="maskIconUrlInput">
                  <a href="https://web.dev/maskable-icon" title="Read more about maskable icons" target="_blank"
                    rel="noopener" aria-label="Read more about maskable icons">Maskable icon</a> URL
                  <i class="fas fa-info-circle"
                    title="Optional. The URL to an icon with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android platforms."
                    aria-label="Optional. The URL to an icon with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android platforms."
                    role="definition"></i>

                    ${tooltip(
                      'maskable-icon-url',
                      'Optional. The URL to an icon with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android platforms.'
                    )}
                </label>
                <fast-text-field type="url" class="form-control" id="maskIconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512-maskable.png" name="maskableIconUrl" .value="${
                    this.default_options
                      ? this.default_options.maskableIconUrl
                      : ''
                  }" />
                </fast-text-field>
              </div>
      
              <div class="form-group">
                <label for="monochromeIconUrlInput">
                  <a href="https://w3c.github.io/manifest/#monochrome-icons-and-solid-fills" target="_blank"
                    rel="noopener">Monochrome icon</a> URL
                  <i class="fas fa-info-circle"
                    title="Optional. The URL to an icon containing only white and black colors, enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or contrast settings."
                    aria-label="Optional. The URL to an icon containing only white and black colors, enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or contrast settings."
                    role="definition"></i>

                    ${tooltip(
                      'mono-icon-url',
                      'Optional. The URL to an icon containing only white and black colors, enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or contrast settings.'
                    )}
                </label>
                <fast-text-field type="url" class="form-control" id="monochromeIconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512-monochrome.png" name="monochromeIconUrl" .value="${
                    this.default_options
                      ? this.default_options.monochromeIconUrl
                      : ''
                  }" />
                </fast-text-field>
              </div>
      
              <div class="form-group">
                <label for="splashFadeoutInput">Splash screen fade out duration (ms)</label>
                <fast-number-field type="number" class="form-control" id="splashFadeoutInput" placeholder="300"
                  name="splashScreenFadeOutDuration" value="${
                    this.default_options
                      ? this.default_options.splashScreenFadeOutDuration
                      : '300'
                  }" />
                </fast-number-field>
              </div>
      
              <div class="form-group">
                <label>Fallback behavior</label>
                <div class="form-check">
                  <input .defaultChecked="${true}" value="customtabs" class="form-check-input" type="radio" name="fallbackType" id="fallbackCustomTabsInput"
                  name="fallbackType" />
                  <label class="form-check-label" for="fallbackCustomTabsInput">
                    Custom Tabs
                    <i class="fas fa-info-circle"
                      title="Use Chrome Custom Tabs as a fallback for your PWA when the full trusted web activity (TWA) experience is unavailable."
                      aria-label="When trusted web activity (TWA) is unavailable, use Chrome Custom Tabs as a fallback for your PWA."
                      role="definition"></i>

                      ${tooltip(
                        'fallback-behavior',
                        'Use Chrome Custom Tabs as a fallback for your PWA when the full trusted web activity (TWA) experience is unavailable.'
                      )}
                  </label>
                </div>
                <div class="form-check">
                  <input .defaultChecked="${false}" value="webview" class="form-check-input" type="radio" name="fallbackType" id="fallbackWebViewInput" value="webview"
                    name="fallbackType" />
                  <label class="form-check-label" for="fallbackWebViewInput">
                    Web View
                    <i class="fas fa-info-circle"
                      title="Use a web view as the fallback for your PWA when the full trusted web activity (TWA) experience is unavailable."
                      aria-label="When trusted web activity (TWA) is unavailable, use a web view as the fallback for your PWA."
                      role="definition"></i>

                      ${tooltip(
                        'fallback-behavior',
                        'Use a web view as the fallback for your PWA when the full trusted web activity (TWA) experience is unavailable.'
                      )}
                  </label>
                </div>
              </div>
      
              <div class="form-group">
                <label>Display mode</label>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="displayMode" id="standaloneDisplayModeInput"
                  .defaultChecked="${
                      this.default_options
                        ? this.default_options.display === "standalone" ? true : false
                        : false
                    }" value="standalone" name="display" />
                  <label class="form-check-label" for="standaloneDisplayModeInput">
                    Standalone
                    <i class="fas fa-info-circle"
                      title="Your PWA will use the whole screen but keep the Android status bar and navigation bar."
                      aria-label="Your PWA will use the whole screen but keep the Android status bar and navigation bar."
                      role="definition"></i>

                      ${tooltip(
                        'display-mode-standalone',
                        'Your PWA will use the whole screen but keep the Android status bar and navigation bar.'
                      )}
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="displayMode" id="fullscreenDisplayModeInput"
                  .defaultChecked="${
                      this.default_options
                        ? this.default_options.display === "fullscreen" ? true : false
                        : false
                    }" value="fullscreen" name="display" />
                  <label class="form-check-label" for="fullscreenDisplayModeInput">
                    Fullscreen
                    <i class="fas fa-info-circle"
                      title="Your PWA will use the whole screen and remove the Android status bar and navigation bar. Suitable for immersive experiences such as games or media apps."
                      aria-label="Your PWA will use the whole screen and remove the Android status bar and navigation bar. Suitable for immersive experiences such as games or media apps."
                      role="definition"></i>

                      ${tooltip(
                        'display-mode-fullscreen',
                        'Your PWA will use the whole screen and remove the Android status bar and navigation bar. Suitable for immersive experiences such as games or media apps.'
                      )}
                  </label>
                </div>
              </div>
      
              <div class="form-group">
                <label>Notification delegation</label>
                <div class="form-check">
                  <input .defaultChecked="${true}" class="form-check-input" type="checkbox" id="enableNotificationsInput" name="enableNotifications" />
                  <label class="form-check-label" for="enableNotificationsInput">
                    Enable
                    <i class="fas fa-info-circle"
                      title="Whether to enable Push Notification Delegation. If enabled, your PWA can send push notifications without browser permission prompts."
                      aria-label="Whether to enable Push Notification Delegation. If enabled, your PWA can send push notifications without browser permission prompts."
                      role="definition"></i>

                      ${tooltip(
                        'push-delegation',
                        'Whether to enable Push Notification Delegation. If enabled, your PWA can send push notifications without browser permission prompts.'
                      )}
                  </label>
                </div>
              </div>
      
              <div class="form-group">
                <label>Location delegation</label>
                <div class="form-check">
                  <input .defaultChecked="${true}" class="form-check-input" type="checkbox" id="enableLocationInput" name="locationDelegation" />
                  <label class="form-check-label" for="enableLocationInput">
                    Enable
                    <i class="fas fa-info-circle"
                      title="Whether to enable Location Delegation. If enabled, your PWA can acess navigator.geolocation without browser permission prompts."
                      aria-label="Whether to enable Location Delegation. If enabled, your PWA can acess navigator.geolocation without browser permission prompts."
                      role="definition"></i>

                      ${tooltip(
                        'location-delegation',
                        'Whether to enable Location Delegation. If enabled, your PWA can acess navigator.geolocation without browser permission prompts.'
                      )}
                  </label>
                </div>
              </div>
      
              <div class="form-group">
                <label>Google Play billing</label>
                <div class="form-check">
                  <input .defaultChecked="${false}" class="form-check-input" type="checkbox" id="enablePlayBillingInput" name="playBilling" />
                  <label class="form-check-label" for="enablePlayBillingInput">
                    Enable
                    <i class="fas fa-info-circle"
                      title="Whether to enable in-app purchases through Google Play Billing and the Digital Goods API."
                      aria-label="Whether to enable in-app purchases through Google Play Billing and the Digital Goods API."
                      role="definition"></i>

                      ${tooltip(
                        'play-billing',
                        'Whether to enable in-app purchases through Google Play Billing and the Digital Goods API.'
                      )}
                  </label>
                </div>
              </div>
      
              <div class="form-group">
                <label>Settings shortcut</label>
                <div class="form-check">
                  <input .defaultChecked="${true}" class="form-check-input" type="checkbox" id="enableSettingsShortcutInput"
                    name="enableSiteSettingsShortcut" />
                  <label class="form-check-label" for="enableSettingsShortcutInput">
                    Enable
                    <i class="fas fa-info-circle"
                      title="If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app."
                      aria-label="If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app."
                      role="definition"></i>

                      ${tooltip(
                        'settings-shortcut',
                        'If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app.'
                      )}
                  </label>
                </div>
              </div>
      
              <div class="form-group">
                <label>ChromeOS only</label>
                <div class="form-check">
                  <input .defaultChecked="${false}" class="form-check-input" type="checkbox" id="chromeOSOnlyInput" name="isChromeOSOnly" />
                  <label class="form-check-label" for="chromeOSOnlyInput">
                    Enable
                    <i class="fas fa-info-circle" title="If enabled, your Android package will only run on ChromeOS devices"
                      aria-label="If enabled, your Android package will only run on ChromeOS devices" role="definition"></i>

                      ${tooltip(
                        'chromeos-only',
                        'If enabled, your Android package will only run on ChromeOS devices'
                      )}
                  </label>
                </div>
              </div>
      
              <div class="form-group">
                <label>Include source code</label>
                <div class="form-check">
                  <input .defaultChecked="${false}" class="form-check-input" type="checkbox" id="includeSourceCodeInput" name="includeSourceCode" />
                  <label class="form-check-label" for="includeSourceCodeInput">
                    Enable
                    <i class="fas fa-info-circle"
                      title="If enabled, your download will include the source code for your Android app."
                      aria-label="If enabled, your download will include the source code for your Android app."
                      role="definition"></i>

                      ${tooltip(
                        'include-source',
                        'If enabled, your download will include the source code for your Android app.'
                      )}
                  </label>
                </div>
              </div>
      
              <div class="form-group">
                <label>Signing key</label>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="signingInput" id="generateSigningKeyInput" value="new"
                    name="signingMode" @change="${ev =>
                      this.androidSigningModeChanged(ev.target.value)}" .defaultChecked="${true}" />
                  <label class="form-check-label" for="generateSigningKeyInput">
                    Create new
                    <i class="fas fa-info-circle"
                      title="PWABuilder will generate a new signing key for you and sign your APK with it. Your download will contain the new signing key and passwords."
                      aria-label="PWABuilder will generate a new signing key for you and sign your APK with it. Your download will contain the new signing key and passwords."
                      role="definition"></i>

                      ${tooltip(
                        'signing-key-new',
                        'PWABuilder will generate a new signing key for you and sign your APK with it. Your download will contain the new signing key and passwords.'
                      )}
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="signingInput" id="unsignedInput" value="none"
                    name="signingMode" @change="${ev =>
                      this.androidSigningModeChanged(ev.target.value)}" />
                  <label class="form-check-label" for="unsignedInput">
                    None
                    <i class="fas fa-info-circle"
                      title="PWABuilder will generate an unsigned APK. Google Play Store will sign your package. This is Google's recommended approach."
                      aria-label="PWABuilder will generate an unsigned APK. Google Play Store will sign your package. This is Google's recommended approach."
                      role="definition"></i>

                      ${tooltip(
                        'signing-key-none',
                        "PWABuilder will generate an unsigned APK. Google Play Store will sign your package. This is Google's recommended approach."
                      )}
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="signingInput" id="useMySigningInput" value="mine"
                    name="signingMode" @change="${ev =>
                      this.androidSigningModeChanged(ev.target.value)}" />
                  <label class="form-check-label" for="useMySigningInput">
                    Use mine
                    <i class="fas fa-info-circle"
                      title="Upload your existing signing key. Use this option if you already have a signing key and you want to publish a new version of an existing app in Google Play."
                      aria-label="Upload your existing signing key. Use this option if you already have a signing key and you want to publish a new version of an existing app in Google Play."
                      role="definition"></i>

                      ${tooltip(
                        'signing-key-mine',
                        'Upload your existing signing key. Use this option if you already have a signing key and you want to publish a new version of an existing app in Google Play.'
                      )}
                  </label>
                </div>
              </div>

              ${
                this.signingMode === 'mine' ||
                this.signingMode === 'new'
                  ? html`
                  <div style="margin-left: 15px;">

                  ${
                    this.signingMode === 'mine'
                      ? html`
                          <div class="form-group">
                            <label for="signingKeyInput">Key file</label>
                            <input
                              type="file"
                              class="form-control"
                              id="signingKeyInput"
                              @change="${ev =>
                                this.androidSigningKeyUploaded(ev.target)}"
                              accept=".keystore"
                              required
                              style="border: none;"
                              value="${ifDefined(this.file)}"
                            />
                          </div>
                        `
                      : null
                  }
      
                <div class="form-group">
                  <label for="signingKeyAliasInput">Key alias</label>
                  <fast-text-field type="text" class="form-control" id="signingKeyAliasInput" placeholder="my-key-alias"
                    required name="alias" value="${this.alias}" />
                  </fast-text-field>
                </div>

                ${this.signingMode === 'new' ? html`
                <div class="form-group">
                  <label for="signingKeyFullNameInput">Key full name</label>
                  <fast-text-field type="text" class="form-control" id="signingKeyFullNameInput" required
                    placeholder="John Doe" name="fullName" value="${
                      this.signingKeyFullName
                    }" />
                  </fast-text-field>
                </div>
      
                <div class="form-group">
                  <label for="signingKeyOrgInput">Key organization</label>
                  <fast-text-field type="text" class="form-control" id="signingKeyOrgInput" required placeholder="My Company"
                    name="organization" value="${this.organization}" />
                  </fast-text-field>
                </div>
      
                <div class="form-group">
                  <label for="signingKeyOrgUnitInput">Key organizational unit</label>
                  <fast-text-field type="text" class="form-control" id="signingKeyOrgUnitInput" required
                    placeholder="Engineering Department" name="organizationalUnit" value="${
                      this.organizationalUnit
                    }" />
                  </fast-text-field>
                </div>
      
                <div class="form-group">
                  <label for="signingKeyCountryCodeInput">
                    Key country code
                    <i class="fas fa-info-circle" title="The 2 letter country code to list on the signing key"
                      aria-label="The 2 letter country code to list on the signing key" role="definition"></i>

                      ${tooltip(
                        'key-country-code',
                        'The 2 letter country code to list on the signing key'
                      )}
                  </label>
                  <fast-text-field type="text" class="form-control" id="signingKeyCountryCodeInput" required placeholder="US"
                    name="countryCode" value="${this.countryCode}">
                  </fast-text-field>
                </div>
                ` : null}
      
                <div class="form-group">
                  <label for="signingKeyPasswordInput">
                    Key password
                    <i class="fas fa-info-circle"
                      title="The password for the signing key. Type a new password or leave empty to use a generated password."
                      aria-label="The password for the signing key. Type a new password or leave empty to use a generated password."
                      role="definition"></i>

                      ${tooltip(
                        'key-password',
                        'The password for the signing key. Type a new password or leave empty to use a generated password.'
                      )}
                  </label>
                  <fast-text-field type="password" class="form-control" id="signingKeyPasswordInput" name="keyPassword"
                    placeholder="Password to your signing key" value="${
                      this.keyPassword
                    }" />
                  </fast-text-field>
                </div>
      
                <div class="form-group">
                  <label for="signingKeyStorePasswordInput">
                    Key store password
                    <i class="fas fa-info-circle"
                      title="The password for the key store. Type a new password or leave empty to use a generated password."
                      aria-label="The password for the key store. Type a new password or leave empty to use a generated password."
                      role="definition"></i>

                    ${tooltip(
                      'keystore-password',
                      'The password for the key store. Type a new password or leave empty to use a generated password.'
                    )}
                  </label>
                  <fast-text-field type="password" class="form-control" id="signingKeyStorePasswordInput" name="storePassword"
                    placeholder="Password to your key store" value="${
                      this.storePassword
                    }" />
                  </fast-text-field>
                </div>
              </div>
                `
                  : null
              }
            </fast-accordion-item>
          </fast-accordion>
      
        </div>
      
        <div id="form-details-block">
          <p>
            Your download will contain instructions for submitting your app to
            the Google Play Store.
          </p>
        </div>
      
        <div id="form-options-actions" class="modal-actions" >
          <loading-button @click="${() => this.initGenerate()}" .loading="${
      this.generating
    }">Generate</loading-button>
        </div>
      </form>
    `;
  }
}
