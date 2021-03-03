import {
  LitElement,
  css,
  html,
  customElement,
  property,
  internalProperty,
} from 'lit-element';

import '../components/loading-button';
import { tooltip, styles as ToolTipStyles } from '../components/tooltip';

import { xxLargeBreakPoint } from '../utils/css/breakpoints';

@customElement('windows-form')
export class WindowsForm extends LitElement {
  @property({ type: Boolean }) generating: boolean;

  @internalProperty() show_adv = false;

  static get styles() {
    return [
      ToolTipStyles,
      css`
        #form-layout {
          padding-left: 2em;
          padding-right: 2em;
          overflow-y: auto;

          max-height: 14em;
        }

        .tooltip {
          margin-left: 10px;
        }

        .form-group .tooltip a {
          color: #fff;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: var(--small-medium-font-size);
          font-weight: bold;
          line-height: 40px;
          display: flex;
          align-items: center;
        }

        .form-group label a {
          text-decoration: none;
          color: var(--font-color);
        }

        #windows-options-actions {
          display: flex;
          justify-content: center;
          margin-top: 37px;
        }

        #form-layout fast-text-field::part(root) {
          border: 1px solid rgba(194, 201, 209, 1);
          border-radius: var(--input-radius);
        }

        #form-layout fast-text-field::part(control) {
          color: var(--font-color);
          border-radius: var(--input-radius);
        }

        #windows-details-block {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #windows-details-block p {
          text-align: center;
          font-weight: 300;
          font-size: var(--small-medium-font-size);

          color: rgba(128, 128, 128, 1);
          line-height: 30px;

          padding-left: 2em;
          padding-right: 2em;
        }

        .select-group {
          display: flex;
          margin-bottom: 10px;
          padding-left: 2em;
        }

        #all-settings-header {
          color: var(--font-color);
          font-weight: var(--font-bold);
          font-size: 18px;

          display: flex;
          align-items: center;
        }

        fast-accordion {
          margin-top: 15px;
          margin-bottom: 15px;
        }

        fast-accordion,
        fast-accordion-item {
          border: none;
        }

        .flipper-button {
          background: white;
          box-shadow: 0 1px 4px 0px rgb(0 0 0 / 25%);
          border-radius: 50%;
          color: #5231a7;

          height: 16px;
          min-width: 16px;

          margin-left: 5px;
        }

        .flipper-button ion-icon {
          pointer-events: none;

          height: 10px;
          width: 10px;
        }

        .flipper-button::part(control) {
          font-size: 18px;
          padding: 0;
        }

        .flipper-button::part(content) {
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .adv-settings {
          display: grid;
          grid-template-columns: 50% 50%;
          gap: 10px;
        }

        @media (min-height: 760px) and (max-height: 1000px) {
          form {
            width: 100%;
            overflow-y: auto;
          }
        }

        ${xxLargeBreakPoint(
          css`
            #form-layout {
              max-height: 24em;
            }
          `
        )}
      `,
    ];
  }

  constructor() {
    super();
  }

  initGenerate() {
    const form = this.shadowRoot?.querySelector('#windows-options-form');

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
    console.log(settingsToggleValue);
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
      <form id="windows-options-form" slot="modal-form" style="width: 100%">
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              <label for="windowsPackageIdInput">
                <a
                  target="_blank"
                  href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md"
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
                  'https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md'
                )}
              </label>
              <fast-text-field
                id="windowsPackageIdInput"
                class="form-control"
                placeholder="package ID"
                type="text"
                name="packageId"
                required
              ></fast-text-field>
            </div>

            <div class="form-group">
              <label for="windowsDisplayNameInput">
                <a
                  target="_blank"
                  href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md"
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
                  'https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md'
                )}
              </label>
              <fast-text-field
                type="text"
                class="form-control"
                for="windowsDisplayNameInput"
                required
                placeholder="US"
                name="publisherDisplayName"
              ></fast-text-field>
            </div>

            <div class="form-group">
              <label for="windowsPublisherIdInput">
                <a
                  target="_blank"
                  href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md"
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
                  'https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md'
                )}
              </label>
              <fast-text-field
                type="text"
                class="form-control"
                id="windowsPublisherIdInput"
                required
                placeholder="CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca"
                name="publisherId"
              ></fast-text-field>
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
                      <fast-text-field
                        type="text"
                        class="form-control"
                        id="windowsAppNameInput"
                        placeholder="My Awesome PWA"
                        name="appName"
                        required
                      ></fast-text-field>
                    </div>
                  </div>
                </div>

                <div>
                  <div class="">
                    <div class="form-group">
                      <label for="windowsAppVersionInput">
                        <a
                          target="_blank"
                          href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/classic-package.md"
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
                          'https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/classic-package.md'
                        )}
                      </label>
                      <fast-text-field
                        type="text"
                        class="form-control"
                        id="windowsAppVersionInput"
                        placeholder="1.0.1"
                        name="appVersion"
                        required
                      ></fast-text-field>
                    </div>
                  </div>
                </div>

                <div>
                  <div class="">
                    <div class="form-group">
                      <label for="windowsClassicAppVersionInput">
                        <a
                          target="_blank"
                          href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/classic-package.md"
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
                          'https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/classic-package.md'
                        )}
                      </label>
                      <fast-text-field
                        type="text"
                        class="form-control"
                        id="windowsClassicAppVersionInput"
                        placeholder="1.0.0"
                        name="classicVersion"
                        required
                      ></fast-text-field>
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
                  <fast-text-field
                    type="url"
                    class="form-control"
                    id="windowsUrlInput"
                    placeholder="/index.html"
                    name="url"
                    required
                  ></fast-text-field>
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
                  <fast-text-field
                    type="url"
                    class="form-control"
                    id="windowsManifestUrlInput"
                    placeholder="https://mysite.com/manifest.json"
                    name="manifestUrl"
                    required
                  ></fast-text-field>
                </div>

                <div class="form-group">
                  <label for="windowsStartUrlInput">
                    Start URL
                    <i
                      class="fas fa-info-circle"
                      title="Optional. The preferred URL that should be loaded when the user launches the web app. Windows will use this to determine your app's identity, so this value should not change between releases of your app. This can be an absolute or relative path."
                      aria-label="Optional. The preferred URL that should be loaded when the user launches the web app. Windows will use this to determine your app's identity, so this value should not change between releases of your app. This can be an absolute or relative path."
                      role="definition"
                    ></i>

                    ${tooltip(
                      'windows-start-url',
                      "Optional. The preferred URL that should be loaded when the user launches the web app. Windows will use this to determine your app's identity, so this value should not change between releases of your app. This can be an absolute or relative path."
                    )}
                  </label>
                  <fast-text-field
                    type="url"
                    class="form-control"
                    id="windowsStartUrlInput"
                    placeholder="https://mysite.com/startpoint.html"
                    name="startUrl"
                  ></fast-text-field>
                </div>

                <div class="form-group">
                  <label for="windowsIconUrlInput">
                    <a
                      href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md"
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
                      'https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md'
                    )}
                  </label>
                  <fast-text-field
                    type="url"
                    class="form-control"
                    id="windowsIconUrlInput"
                    placeholder="https://myawesomepwa.com/512x512.png"
                    name="iconUrl"
                  ></fast-text-field>
                </div>

                <div class="form-group">
                  <label for="windowsLanguageInput">
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
                  <fast-text-field
                    type="url"
                    class="form-control"
                    id="windowsLanguageInput"
                    placeholder="EN-US"
                    name="language"
                  ></fast-text-field>
                </div>
              </div>
            </fast-accordion-item>
          </fast-accordion>
        </div>

        <div id="windows-details-block">
          <p>
            Your download will contain instructions for submitting your app to
            the Microsoft Store. Your app will be powered by Chromium-based Edge
            platform (preview).
          </p>
        </div>

        <div slot="modal-actions" id="windows-options-actions">
          <loading-button
            @click="${() => this.initGenerate()}"
            .loading="${this.generating}"
            >Generate</loading-button
          >
        </div>
      </form>
    `;
  }
}
