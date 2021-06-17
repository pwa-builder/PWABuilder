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
import { capturePageAction } from '../utils/analytics';
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
    capturePageAction({
      pageName: 'android-form-used',
      uri: `${location.pathname}`,
      pageHeight: window.innerHeight,
    });
  }

  toggleSettings(settingsToggleValue: 'basic' | 'advanced') {
    if (settingsToggleValue === 'advanced') {
      this.show_adv = true;
    } else if (settingsToggleValue === 'basic') {
      this.show_adv = false;
    } else {
      this.show_adv = false;
    }
    capturePageAction({
      pageName: 'android-settings-toggled',
      uri: `${location.pathname}`,
      pageHeight: window.innerHeight,
    });
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
      fileReader.readAsDataURL(keyFile as Blob);
    }
  }

  render() {
    return html`
      <form id="android-options-form" slot="modal-form" style="width: 100%">
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              <label for="packageIdInput">
                ${localeStrings.text.android.titles.package_name}
                <i class="fas fa-info-circle"
                  title="${localeStrings.text.android.description.package_name}"
                  aria-label="${
                    localeStrings.text.android.description.package_name
                  }"
                  role="definition"></i>

                  ${tooltip(
                    'android-package-name',
                    localeStrings.text.android.description.package_name
                  )}
              </label>
              <fast-text-field id="packageIdInput" class="form-control" placeholder="${
                localeStrings.text.android.titles.package_name
              }" type="text" required
                name="packageId"></fast-text-field>
            </div>

            <div class="form-group">
              <label for="appNameInput">${
                localeStrings.text.android.titles.app_name
              }</label>
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
                ${localeStrings.text.android.titles.launcher_name}
                <i class="fas fa-info-circle"
                  title="${
                    localeStrings.text.android.description.launcher_name
                  }"
                  aria-label="${
                    localeStrings.text.android.description.launcher_name
                  }"
                  role="definition"></i>

                  ${tooltip(
                    'android-launcher-name',
                    localeStrings.text.android.description.launcher_name
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
                <span>${localeStrings.text.android.titles.all_settings}</span>

                <fast-button class="flipper-button" mode="stealth">
                  <ion-icon name="caret-forward-outline"></ion-icon>
                </fast-button>
              </div>

              <div class="adv-settings">
                <div>
                  <div class="">
                    <div class="form-group">
                      <label for="appVersionInput">
                        ${localeStrings.text.android.titles.app_version}
                        <i class="fas fa-info-circle"
                          title="${
                            localeStrings.text.android.description.app_version
                          }"
                          aria-label role="definition"></i>

                          ${tooltip(
                            'android-version',
                            localeStrings.text.android.description.app_version
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
                        rel="noopener">${
                          localeStrings.text.android.titles.app_version_code
                        }</a>
                      <i class="fas fa-info-circle"
                        title="${
                          localeStrings.text.android.description
                            .app_version_code
                        }"
                        aria-label="${
                          localeStrings.text.android.description
                            .app_version_code
                        }"
                        role="definition" style="margin-left: 5px;"></i>

                        ${tooltip(
                          'android-version-code',
                          localeStrings.text.android.description
                            .app_version_code
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
                    <label for="hostInput">${
                      localeStrings.text.android.titles.host
                    }</label>
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
                  ${localeStrings.text.android.titles.start_url}
                  <i class="fas fa-info-circle"
                    title="${localeStrings.text.android.description.start_url}"
                    aria-label="${
                      localeStrings.text.android.description.start_url_short
                    }" role="definition"></i>

                    ${tooltip(
                      'android-start-url',
                      localeStrings.text.android.description.start_url
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
                  ${localeStrings.text.android.titles.theme_color}
                  <i class="fas fa-info-circle"
                    title="${
                      localeStrings.text.android.description.theme_color
                    }"
                    aria-label="${
                      localeStrings.text.android.description.theme_color
                    }"
                    role="definition"></i>

                    ${tooltip(
                      'android-status-bar-color',
                      localeStrings.text.android.description.theme_color
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
                  ${localeStrings.text.android.titles.splash_color}
                  <i class="fas fa-info-circle"
                    title="${
                      localeStrings.text.android.description.splash_color
                    }"
                    aria-label="${
                      localeStrings.text.android.description.splash_color
                    }"
                    role="definition"></i>

                    ${tooltip(
                      'android-splash-color',
                      localeStrings.text.android.description.splash_color
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
                  ${localeStrings.text.android.titles.nav_color}
                  <i class="fas fa-info-circle"
                    title="${localeStrings.text.android.description.nav_color}"
                    aria-label="${
                      localeStrings.text.android.description.nav_color
                    }"
                    role="definition"></i>
                </label>

                ${tooltip(
                  'android-nav-color',
                  localeStrings.text.android.description.nav_color
                )}
                <input type="color" class="form-control" id="navigationColorInput" name="navigationColor" value="${
                  this.default_options
                    ? this.default_options.navigationColor
                    : 'black'
                }" />
              </div>

              <div class="form-group">
                <label for="navigationColorDarkInput">
                  ${localeStrings.text.android.titles.dark_color}
                  <i class="fas fa-info-circle"
                    title="${localeStrings.text.android.description.dark_color}"
                    aria-label="${
                      localeStrings.text.android.description.dark_color
                    }"
                    role="definition"></i>

                    ${tooltip(
                      'android-nav-color-dark',
                      localeStrings.text.android.description.dark_color
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
                  ${localeStrings.text.android.titles.div_color}
                  <i class="fas fa-info-circle" title="${
                    localeStrings.text.android.description.div_color
                  }"
                    aria-label="${
                      localeStrings.text.android.description.div_color
                    }" role="definition"></i>

                    ${tooltip(
                      'android-divider-color',
                      localeStrings.text.android.description.div_color
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
                  ${localeStrings.text.android.titles.div_dark_color}
                  <i class="fas fa-info-circle"
                    title="${
                      localeStrings.text.android.description.div_dark_color
                    }"
                    aria-label="${
                      localeStrings.text.android.description.div_dark_color
                    }"
                    role="definition"></i>

                    ${tooltip(
                      'android-divider-color-dark',
                      localeStrings.text.android.description.div_dark_color
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
                <label for="iconUrlInput">${
                  localeStrings.text.android.titles.icon_url
                }</label>
                <fast-text-field type="url" class="form-control" id="iconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512.png" name="iconUrl" value="${
                    this.default_options ? this.default_options.iconUrl : ''
                  }" />
                </fast-text-field>
              </div>

              <div class="form-group">
                <label for="maskIconUrlInput">
                  <a href="https://web.dev/maskable-icon" title="Read more about maskable icons" target="_blank"
                    rel="noopener" aria-label="Read more about maskable icons">${
                      localeStrings.text.android.titles.mask_icon_url
                    }</a>
                  <i class="fas fa-info-circle"
                    title="${
                      localeStrings.text.android.description.mask_icon_url
                    }"
                    aria-label="${
                      localeStrings.text.android.description.mask_icon_url
                    }"
                    role="definition"></i>

                    ${tooltip(
                      'maskable-icon-url',
                      localeStrings.text.android.description.mask_icon_url
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
                    rel="noopener">${
                      localeStrings.text.android.titles.mono_icon_url
                    }</a>
                  <i class="fas fa-info-circle"
                    title="${
                      localeStrings.text.android.description.mono_icon_url
                    }"
                    aria-label="${
                      localeStrings.text.android.description.mono_icon_url
                    }"
                    role="definition"></i>

                    ${tooltip(
                      'mono-icon-url',
                      localeStrings.text.android.description.mono_icon_url
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
                <label>${localeStrings.text.android.titles.fallback}</label>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="fallbackType" id="fallbackCustomTabsInput"
                    value="customtabs" name="fallbackType" />
                  <label class="form-check-label" for="fallbackCustomTabsInput">
                    ${localeStrings.text.android.titles.custom}
                    <i class="fas fa-info-circle"
                      title="${localeStrings.text.android.description.custom}"
                      aria-label="${
                        localeStrings.text.android.description.custom
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'fallback-behavior',
                        localeStrings.text.android.description.custom
                      )}
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="fallbackType" id="fallbackWebViewInput" value="webview"
                    name="fallbackType" />
                  <label class="form-check-label" for="fallbackWebViewInput">
                    ${localeStrings.text.android.titles.web_view}
                    <i class="fas fa-info-circle"
                      title="${localeStrings.text.android.description.web_view}"
                      aria-label="${
                        localeStrings.text.android.description.web_view
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'fallback-behavior',
                        localeStrings.text.android.titles.web_view
                      )}
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${localeStrings.text.android.titles.display_mode}</label>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="displayMode" id="standaloneDisplayModeInput"
                    value="standalone" name="display" />
                  <label class="form-check-label" for="standaloneDisplayModeInput">
                    ${localeStrings.text.android.titles.standalone}
                    <i class="fas fa-info-circle"
                      title="${
                        localeStrings.text.android.description.standalone
                      }"
                      aria-label="${
                        localeStrings.text.android.description.standalone
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'display-mode-standalone',
                        localeStrings.text.android.description.standalone
                      )}
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="displayMode" id="fullscreenDisplayModeInput"
                    value="fullscreen" name="display" />
                  <label class="form-check-label" for="fullscreenDisplayModeInput">
                    ${localeStrings.text.android.titles.fullscreen}
                    <i class="fas fa-info-circle"
                      title="${
                        localeStrings.text.android.description.fullscreen
                      }"
                      aria-label="${
                        localeStrings.text.android.description.fullscreen
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'display-mode-fullscreen',
                        localeStrings.text.android.description.fullscreen
                      )}
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${localeStrings.text.android.titles.fullscreen}</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="enableNotificationsInput" name="enableNotifications" />
                  <label class="form-check-label" for="enableNotificationsInput">
                    ${localeStrings.text.android.titles.enable}
                    <i class="fas fa-info-circle"
                      title="${
                        localeStrings.text.android.description.fullscreen
                      }"
                      aria-label="${
                        localeStrings.text.android.description.fullscreen
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'push-delegation',
                        localeStrings.text.android.description.fullscreen
                      )}
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${
                  localeStrings.text.android.titles.location_delegation
                }</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="enableLocationInput" name="locationDelegation" />
                  <label class="form-check-label" for="enableLocationInput">
                    ${localeStrings.text.android.titles.enable}
                    <i class="fas fa-info-circle"
                      title="${
                        localeStrings.text.android.description
                          .location_delegation
                      }"
                      aria-label="${
                        localeStrings.text.android.description
                          .location_delegation
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'location-delegation',
                        localeStrings.text.android.description
                          .location_delegation
                      )}
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${
                  localeStrings.text.android.titles.google_play_billing
                }</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="enablePlayBillingInput" name="playBilling" />
                  <label class="form-check-label" for="enablePlayBillingInput">
                    ${localeStrings.text.android.titles.enable}
                    <i class="fas fa-info-circle"
                      title="${
                        localeStrings.text.android.description
                          .google_play_billing
                      }"
                      aria-label="${
                        localeStrings.text.android.description
                          .google_play_billing
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'play-billing',
                        localeStrings.text.android.description
                          .google_play_billing
                      )}
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${
                  localeStrings.text.android.titles.settings_shortcut
                }</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="enableSettingsShortcutInput"
                    name="enableSiteSettingsShortcut" />
                  <label class="form-check-label" for="enableSettingsShortcutInput">
                    ${localeStrings.text.android.titles.enable}
                    <i class="fas fa-info-circle"
                      title="${
                        localeStrings.text.android.description.settings_shortcut
                      }"
                      aria-label="${
                        localeStrings.text.android.description.settings_shortcut
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'settings-shortcut',
                        localeStrings.text.android.description.settings_shortcut
                      )}
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${
                  localeStrings.text.android.titles.chromeos_only
                }</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="chromeOSOnlyInput" name="isChromeOSOnly" />
                  <label class="form-check-label" for="chromeOSOnlyInput">
                    ${localeStrings.text.android.titles.enable}
                    <i class="fas fa-info-circle" title="${
                      localeStrings.text.android.description.chromeos_only
                    }"
                      aria-label="${
                        localeStrings.text.android.description.chromeos_only
                      }" role="definition"></i>

                      ${tooltip(
                        'chromeos-only',
                        localeStrings.text.android.description.chromeos_only
                      )}
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${localeStrings.text.android.titles.source_code}</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="includeSourceCodeInput" name="includeSourceCode" />
                  <label class="form-check-label" for="includeSourceCodeInput">
                    ${localeStrings.text.android.titles.enable}
                    <i class="fas fa-info-circle"
                      title="${
                        localeStrings.text.android.description.source_code
                      }"
                      aria-label="${
                        localeStrings.text.android.description.source_code
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'include-source',
                        localeStrings.text.android.description.source_code
                      )}
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>${localeStrings.text.android.titles.signing_key}</label>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="signingInput" id="generateSigningKeyInput" value="new"
                    name="signingMode" @change="${ev =>
                      this.androidSigningModeChanged(
                        ev.target.value
                      )}" .defaultChecked="${true}" />
                  <label class="form-check-label" for="generateSigningKeyInput">
                    Create new
                    <i class="fas fa-info-circle"
                      title="${
                        localeStrings.text.android.description.signing_key
                      }"
                      aria-label="${
                        localeStrings.text.android.description.signing_key
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'signing-key-new',
                        localeStrings.text.android.description.signing_key
                      )}
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="signingInput" id="unsignedInput" value="none"
                    name="signingMode" @change="${ev =>
                      this.androidSigningModeChanged(ev.target.value)}" />
                  <label class="form-check-label" for="unsignedInput">
                    ${localeStrings.text.android.titles.none}
                    <i class="fas fa-info-circle"
                      title="${
                        localeStrings.text.android.description.unsigned_key
                      }"
                      aria-label="${
                        localeStrings.text.android.description.unsigned_key
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'signing-key-none',
                        localeStrings.text.android.description.unsigned_key
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
                      title="${
                        localeStrings.text.android.description
                          .upload_signing_key
                      }"
                      aria-label="${
                        localeStrings.text.android.description
                          .upload_signing_key
                      }"
                      role="definition"></i>

                      ${tooltip(
                        'signing-key-mine',
                        localeStrings.text.android.description
                          .upload_signing_key
                      )}
                  </label>
                </div>
              </div>

              ${
                this.signingMode === 'mine' || this.signingMode === 'new'
                  ? html`
                  <div style="margin-left: 15px;">

                  ${
                    this.signingMode === 'mine'
                      ? html`
                          <div class="form-group">
                            <label for="signingKeyInput"
                              >${localeStrings.text.android.titles
                                .key_file}</label
                            >
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
                  <label for="signingKeyAliasInput">${
                    localeStrings.text.android.titles.key_alias
                  }</label>
                  <fast-text-field type="text" class="form-control" id="signingKeyAliasInput" placeholder="my-key-alias"
                    required name="alias" value="${this.alias}" />
                  </fast-text-field>
                </div>

                ${
                  this.signingMode === 'new'
                    ? html`
                <div class="form-group">
                  <label for="signingKeyFullNameInput">${
                    localeStrings.text.android.titles.key_fullname
                  }</label>
                  <fast-text-field type="text" class="form-control" id="signingKeyFullNameInput" required
                    placeholder="John Doe" name="fullName" value="${
                      this.signingKeyFullName
                    }" />
                  </fast-text-field>
                </div>

                <div class="form-group">
                  <label for="signingKeyOrgInput">${
                    localeStrings.text.android.titles.key_org
                  }</label>
                  <fast-text-field type="text" class="form-control" id="signingKeyOrgInput" required placeholder="My Company"
                    name="organization" value="${this.organization}" />
                  </fast-text-field>
                </div>

                <div class="form-group">
                  <label for="signingKeyOrgUnitInput">${
                    localeStrings.text.android.titles.key_org_unit
                  }</label>
                  <fast-text-field type="text" class="form-control" id="signingKeyOrgUnitInput" required
                    placeholder="Engineering Department" name="organizationalUnit" value="${
                      this.organizationalUnit
                    }" />
                  </fast-text-field>
                </div>

                <div class="form-group">
                  <label for="signingKeyCountryCodeInput">
                    ${localeStrings.text.android.titles.key_country_code}
                    <i class="fas fa-info-circle" title="The 2 letter country code to list on the signing key"
                      aria-label="The 2 letter country code to list on the signing key" role="definition"></i>

                      ${tooltip(
                        'key-country-code',
                        localeStrings.text.android.description.key_country_code
                      )}
                  </label>
                  <fast-text-field type="text" class="form-control" id="signingKeyCountryCodeInput" required placeholder="US"
                    name="countryCode" value="${this.countryCode}">
                  </fast-text-field>
                </div>
                `
                    : null
                }

                <div class="form-group">
                  <label for="signingKeyPasswordInput">
                    ${localeStrings.text.android.titles.key_pw}
                    <i class="fas fa-info-circle"
                      aria-label="${
                        localeStrings.text.android.description.key_pw
                      }"
                      title="${localeStrings.text.android.description.key_pw}"
                      role="definition"></i>

                      ${tooltip(
                        'key-password',
                        localeStrings.text.android.description.key_pw
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
                    ${localeStrings.text.android.titles.key_store_pw}
                    <i class="fas fa-info-circle"
                      title="${
                        localeStrings.text.android.description.key_store_pw
                      }"
                      aria-label="${
                        localeStrings.text.android.description.key_store_pw
                      }"
                      role="definition"></i>

                    ${tooltip(
                      'keystore-password',
                      localeStrings.text.android.description.key_store_pw
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
            ${localeStrings.text.android.description.form_details}
          </p>
        </div>

        <div id="form-options-actions" class="modal-actions" >
          <loading-button @click="${() => this.initGenerate()}" .loading="${
      this.generating
    }">${localeStrings.text.android.titles.generate}</loading-button>
        </div>
      </form>
    `;
  }
}
