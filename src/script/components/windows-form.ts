import { LitElement, css, html } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';

import '../components/loading-button';
import { tooltip, styles as ToolTipStyles } from '../components/tooltip';
//@ts-ignore
import style from '../../../styles/form-styles.css';
//@ts-ignore
import ModalStyles from '../../../styles/modal-styles.css';

import { getURL } from '../services/app-info';
import { getManiURL } from '../services/manifest';
import { createWindowsPackageOptionsFromManifest } from '../services/publish/windows-publish';

import { smallBreakPoint, xxLargeBreakPoint } from '../utils/css/breakpoints';
import { WindowsPackageOptions } from '../utils/win-validation';

import { localeStrings } from '../../locales';

@customElement('windows-form')
export class WindowsForm extends LitElement {
  @property({ type: Boolean }) generating: boolean = false;

  @state() show_adv = false;
  @state() default_options: WindowsPackageOptions | undefined;

  static get styles() {
    return [
      style,
      ModalStyles,
      ToolTipStyles,
      css`
        #form-layout input {
          border: 1px solid rgba(194, 201, 209, 1);
          border-radius: var(--input-radius);
          padding: 10px;
          color: var(--font-color);
        }

        #generate-submit {
          background: transparent;
          color: var(--button-font-color);
          font-weight: bold;
          border: none;
          cursor: pointer;

          height: var(--desktop-button-height);
          width: var(--button-width);
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
    const defaultOptions = await createWindowsPackageOptionsFromManifest();

    if (defaultOptions) {
      this.default_options = defaultOptions;
    }
  }

  initGenerate(ev: InputEvent) {
    ev.preventDefault();
    const form = this.shadowRoot?.querySelector('#windows-options-form');
    console.log('here', form);

    this.dispatchEvent(
      new CustomEvent('init-windows-gen', {
        detail: {
          form: form,
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

  render() {
    return html`
      <form
        id="windows-options-form"
        @submit="${ev => this.initGenerate(ev)}"
        slot="modal-form"
        style="width: 100%"
      >
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              <label for="windowsPackageIdInput">
                <a
                  target="_blank"
                  href="https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/"
                >
                  Package ID
                  <i
                    class="fas fa-info-circle"
                    title="The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center. Click to learn more."
                    aria-label="The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center. Click to learn more."
                    role="definition"
                  ></i>
                </a>

                ${tooltip(
                  'windows-package-id',
                  "The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center. Click to learn more.",
                  'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/'
                )}
              </label>
              <input
                id="windowsPackageIdInput"
                class="form-control"
                placeholder="app.contoso.edge"
                type="text"
                name="packageId"
                maxlength="49"
                required
              />
            </div>

            <div class="form-group">
              <label for="windowsDisplayNameInput">
                <a
                  target="_blank"
                  href="https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/"
                >
                  Publisher display name
                  <i
                    class="fas fa-info-circle"
                    title="The display name of your app's publisher. You can find this in Windows Partner Center. Click to learn more."
                    aria-label="The display name of your app's publisher. You can find this in Windows Partner Center. Click to learn more."
                    role="definition"
                  ></i>
                </a>

                ${tooltip(
                  'windows-display-name',
                  "The display name of your app's publisher. You can find this in Windows Partner Center. Click to learn more.",
                  'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/'
                )}
              </label>
              <input
                type="text"
                class="form-control"
                for="windowsDisplayNameInput"
                required
                placeholder="Contoso Inc"
                name="publisherDisplayName"
              />
            </div>

            <div class="form-group">
              <label for="windowsPublisherIdInput">
                <a
                  target="_blank"
                  href="https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/"
                >
                  Publisher ID
                  <i
                    class="fas fa-info-circle"
                    title="Your Windows Publisher ID. You can find this value in Windows Partner Center. Click to learn more."
                    aria-label="Your Windows Publisher ID. You can find this value in Windows Partner Center. Click to learn more."
                    role="definition"
                  ></i>
                </a>

                ${tooltip(
                  'windows-publisher-id',
                  'Your Windows Publisher ID. You can find this value in Windows Partner Center. Click to learn more.',
                  'https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/'
                )}
              </label>
              <input
                type="text"
                class="form-control"
                id="windowsPublisherIdInput"
                required
                placeholder="CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca"
                name="publisherId"
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
                      <label for="windowsAppNameInput">
                        App name
                        ${tooltip('windows-app-name', 'The name of your app')}
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="windowsAppNameInput"
                        placeholder="My Awesome PWA"
                        name="appName"
                        value="${this.default_options
                          ? this.default_options.name
                          : 'My Awesome PWA'}"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div class="">
                    <div class="form-group">
                      <label for="windowsAppVersionInput">
                        <a
                          target="_blank"
                          href="https://blog.pwabuilder.com/docs/what-is-a-classic-package/"
                        >
                          App version
                          <i
                            class="fas fa-info-circle"
                            title="Your app version in the form of '1.0.0'. This must be greater than classic package version. Click to learn more."
                            aria-label="Your app version in the form of '1.0.0'. This must be greater than classic package version. Click to learn more."
                            role="definition"
                          ></i>
                        </a>

                        ${tooltip(
                          'windows-app-version',
                          "Your app version in the form of '1.0.0'. This must be greater than classic package version. Click to learn more.",
                          'https://blog.pwabuilder.com/docs/what-is-a-classic-package/'
                        )}
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="windowsAppVersionInput"
                        placeholder="1.0.1"
                        name="appVersion"
                        value="${this.default_options
                          ? this.default_options.version
                          : '1.0.0'}"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div class="">
                    <div class="form-group">
                      <label for="windowsClassicAppVersionInput">
                        <a
                          target="_blank"
                          href="https://blog.pwabuilder.com/docs/what-is-a-classic-package/"
                        >
                          Classic package version
                          <i
                            class="fas fa-info-circle"
                            title="The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version. Click to learn more."
                            aria-label="The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version. Click to learn more."
                            role="definition"
                          ></i>
                        </a>

                        ${tooltip(
                          'classic-package-version',
                          "The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version. Click to learn more.",
                          'https://blog.pwabuilder.com/docs/what-is-a-classic-package/'
                        )}
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="windowsClassicAppVersionInput"
                        placeholder="1.0.0"
                        name="classicVersion"
                        .value="${this.default_options
                          ? this.default_options.classicPackage?.version
                          : '1.0.1'}"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="windowsUrlInput">
                    URL
                    <i
                      class="fas fa-info-circle"
                      title="This is the URL for your PWA."
                      aria-label="This is the URL for your PWA."
                      role="definition"
                    ></i>

                    ${tooltip(
                      'windows-pwa-url',
                      'This is the URL for your PWA'
                    )}
                  </label>
                  <input
                    type="url"
                    class="form-control"
                    id="windowsUrlInput"
                    placeholder="/index.html"
                    name="url"
                    required
                    value="${this.default_options
                      ? this.default_options.url
                      : getURL()}"
                  />
                </div>

                <div class="form-group">
                  <label for="windowsManifestUrlInput">
                    Manifest URL
                    <i
                      class="fas fa-info-circle"
                      title="The URL to your app manifest."
                      aria-label="The URL to your app manifest."
                      role="definition"
                    ></i>

                    ${tooltip(
                      'windows-manifest-url',
                      'The URL to your app manifest'
                    )}
                  </label>
                  <input
                    type="url"
                    class="form-control"
                    id="windowsManifestUrlInput"
                    placeholder="https://mysite.com/manifest.json"
                    name="manifestUrl"
                    .value="${this.default_options
                      ? this.default_options.manifestUrl
                      : getManiURL()}"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="iconUrl">
                    <a
                      href="https://blog.pwabuilder.com/docs/image-recommendations-for-windows-pwa-packages/"
                      target="_blank"
                    >
                      Icon URL
                      <i
                        class="fas fa-info-circle"
                        title="A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger. Click to learn more."
                        aria-label="A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger. Click to learn more."
                        role="definition"
                      ></i>
                    </a>

                    ${tooltip(
                      'windows-icon-url',
                      'A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger. Click to learn more.',
                      'https://blog.pwabuilder.com/docs/image-recommendations-for-windows-pwa-packages/'
                    )}
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="iconUrl"
                    placeholder="https://myawesomepwa.com/512x512.png"
                    .value="${this.default_options
                      ? this.default_options.images?.baseImage
                      : ''}"
                    name="iconUrl"
                  />
                </div>

                <div class="form-group">
                  <label for="language">
                    Language
                    <i
                      class="fas fa-info-circle"
                      title="Optional. The primary language for your app package. Additional languages can be specified in Partner Center. If empty, EN-US will be used."
                      aria-label="Optional. The primary language for your app package. Additional languages can be specified in Partner Center. If empty, EN-US will be used."
                      role="definition"
                    ></i>

                    ${tooltip(
                      'windows-language',
                      'Optional. The primary language for your app package. Additional languages can be specified in Partner Center. If empty, EN-US will be used.'
                    )}
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="windowsLanguageInput"
                    placeholder="EN-US"
                    .value="${this.default_options
                      ? this.default_options.manifest?.lang
                      : 'US-EN'}"
                    name="language"
                  />
                </div>
              </div>
            </fast-accordion-item>
          </fast-accordion>
        </div>

        <div id="form-details-block">
          <p>${localeStrings.text.publish.windows_platform.p}</p>
        </div>

        <div id="form-options-actions" class="modal-actions">
          <loading-button .loading="${this.generating}">
            <input id="generate-submit" type="submit" value="Generate"/>
          </loading-button>
        </div>
      </form>
    `;
  }
}
