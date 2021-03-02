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

@customElement('windows-form')
export class WindowsForm extends LitElement {
  @property({ type: Boolean }) generating: boolean;

  @internalProperty() show_adv = false;

  static get styles() {
    return [
      ToolTipStyles,
      css`
    
      #form-layout {
        display: grid;
        grid-template-columns: auto auto;
        gap: 30px;

        padding-left: 2em;
        padding-right: 2em;
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
        background: rgba(229, 229, 229, 1);
      }

      #form-layout fast-text-field::part(control) {
        color: var(--font-color);
      }

      #windows-details-block {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 37px;
      }

      #windows-details-block p {
        text-align: center;
        font-weight: 300;
        font-size: var(--small-medium-font-size);

        color: rgba(128, 128, 128, 1);
        line-height: 30px;
      }

      .select-group {
        display: flex;
        margin-bottom: 10px;
        padding-left: 2em;
      }

      @media (min-height: 760px) and (max-height: 1000px) {
        form {
          width: 100%;
          max-height: 68vh;
          overflow-y: scroll;
        }
      }
    `];
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

  render() {
    return html`
      <form id="windows-options-form" slot="modal-form" style="width: 100%">
        <div class="select-group">
          <fast-select
            @change="${ev => this.toggleSettings(ev.target.value)}"
            id="settings-toggle"
          >
            <fast-option value="basic">Basic Settings</fast-option>
            <fast-option value="advanced">All Settings</fast-option>
          </fast-select>
        </div>

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

                ${
                  tooltip("windows-package-id", "The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center. Click to learn more.", "https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md")
                }
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

                ${
                  tooltip("windows-display-name", "The display name of your app's publisher. You can find this in Windows Partner Center. Click to learn more.", "https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md")
                }
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

                ${
                  tooltip("windows-publisher-id", "Your Windows Publisher ID. You can find this value in Windows Partner Center. Click to learn more.", "https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md")
                }
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
          ${this.show_adv
            ? html`<div class="adv-settings">
                <div>
                  <div class="">
                    <div class="form-group">
                      <label for="windowsAppNameInput">
                        App name

                        ${
                          tooltip("windows-app-name", "The name of your app")
                        }
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
                        
                        ${
                            tooltip("windows-app-version", "Your app version in the form of '1.0.0'. This must be greater than classic package version. Click to learn more.", "https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/classic-package.md")
                          }
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

                        ${
                            tooltip("classic-package-version", "The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version. Click to learn more.", "https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/classic-package.md")
                          }
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

                    ${
                      tooltip("windows-pwa-url", "This is the URL for your PWA")
                    }
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

                    ${
                        tooltip("windows-manifest-url", "The URL to your app manifest")
                      }
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

                    ${
                        tooltip("windows-start-url", "Optional. The preferred URL that should be loaded when the user launches the web app. Windows will use this to determine your app's identity, so this value should not change between releases of your app. This can be an absolute or relative path.")
                      }
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

                    ${
                      tooltip("windows-icon-url", "A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger. Click to learn more.", "https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md")
                    }
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

                    ${
                      tooltip("windows-language", "Optional. The primary language for your app package. Additional languages can be specified in Partner Center. If empty, EN-US will be used.")
                    }
                  </label>
                  <fast-text-field
                    type="url"
                    class="form-control"
                    id="windowsLanguageInput"
                    placeholder="EN-US"
                    name="language"
                  ></fast-text-field>
                </div>
              </div>`
            : null}
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
