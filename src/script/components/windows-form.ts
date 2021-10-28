import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../components/loading-button';
import '../components/hover-tooltip';
import { getManifestUrl } from '../services/app-info';
import { createWindowsPackageOptionsFromManifest, emptyWindowsPackageOptions } from '../services/publish/windows-publish';
import { WindowsPackageOptions } from '../utils/win-validation';
import { localeStrings } from '../../locales';
import { AppPackageFormBase } from './app-package-form-base';

@customElement('windows-form')
export class WindowsForm extends AppPackageFormBase {
  @property({ type: Boolean }) generating: boolean = false;

  @state() showAdvanced = false;
  @state() defaultOptions: WindowsPackageOptions = emptyWindowsPackageOptions();

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
    const defaultOptions = await createWindowsPackageOptionsFromManifest();
    if (defaultOptions) {
      this.defaultOptions = defaultOptions;
    }
  }

  initGenerate(ev: InputEvent) {
    ev.preventDefault();

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

  get manifestUrl(): string | null | undefined {
    return getManifestUrl();
  }

  render() {
    return html`
      <form id="windows-options-form" @submit="${(ev: InputEvent) => this.initGenerate(ev)}" slot="modal-form"
        style="width: 100%">
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              <label for="windowsPackageIdInput">
                <a target="_blank" href="https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/">
                  Package ID
                  <i class="fas fa-info-circle"
                    title="The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center."
                    aria-label="The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center."
                    role="definition"></i>
                </a>
      
                <hover-tooltip
                  text="The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center."
                  link="https://developer.mozilla.org/en-US/docs/Web/Manifest/icons">
                </hover-tooltip>
      
              </label>
              <input id="windowsPackageIdInput" class="form-control" placeholder="app.contoso.edge" type="text"
                name="packageId" pattern="[a-zA-Z0-9.-]*$" maxlength="50" required />
            </div>
      
            <div class="form-group">
              <label for="windowsDisplayNameInput">
                <a target="_blank" href="https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/">
                  Publisher display name
                  <i class="fas fa-info-circle"
                    title="The display name of your app's publisher. You can find this in Windows Partner Center."
                    aria-label="The display name of your app's publisher. You can find this in Windows Partner Center."
                    role="definition"></i>
                </a>
      
                <hover-tooltip text="The display name of your app's publisher. You can find this in Windows Partner Center."
                  link="https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/">
                </hover-tooltip>
              </label>
              <input type="text" class="form-control" for="windowsDisplayNameInput" required placeholder="Contoso Inc"
                name="publisherDisplayName" />
            </div>
      
            <div class="form-group">
              <label for="windowsPublisherIdInput">
                <a target="_blank" href="https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/">
                  Publisher ID
                  <i class="fas fa-info-circle"
                    title="Your Windows Publisher ID. You can find this value in Windows Partner Center."
                    aria-label="Your Windows Publisher ID. You can find this value in Windows Partner Center."
                    role="definition"></i>
                </a>
      
                <hover-tooltip text="Your Windows Publisher ID. You can find this value in Windows Partner Center."
                  link="https://blog.pwabuilder.com/docs/finding-your-windows-publisher-info/">
                </hover-tooltip>
              </label>
              <input type="text" class="form-control" id="windowsPublisherIdInput" required
                placeholder="CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca" name="publisherId" />
            </div>
          </div>
      
          <!-- right half of the options dialog -->
          <fast-accordion>
            <fast-accordion-item @click="${(ev: Event) => this.opened(ev.target)}">
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
                        <hover-tooltip text="The name of your app"
                          link="https://developer.mozilla.org/en-US/docs/Web/Manifest/name">
                        </hover-tooltip>
                      </label>
                      <input type="text" class="form-control" id="windowsAppNameInput" placeholder="My Awesome PWA"
                        name="appName" value="${this.defaultOptions.name || 'My Awesome PWA'}" required />
                    </div>
                  </div>
                </div>
      
                <div>
                  <div class="">
                    <div class="form-group">
                      <label for="windowsAppVersionInput">
                        <a target="_blank" href="https://blog.pwabuilder.com/docs/what-is-a-classic-package/">
                          App version
                          <i class="fas fa-info-circle"
                            title="Your app version in the form of '1.0.0'. This must be greater than classic package version."
                            aria-label="Your app version in the form of '1.0.0'. This must be greater than classic package version."
                            role="definition"></i>
                        </a>
      
                        <hover-tooltip
                          text="Your app version in the form of '1.0.0'. This must be greater than classic package version."
                          link="https://blog.pwabuilder.com/docs/what-is-a-classic-package/">
                        </hover-tooltip>
                      </label>
                      <input type="text" class="form-control" id="windowsAppVersionInput" placeholder="1.0.1"
                        name="appVersion" value="${this.defaultOptions.version || '1.0.0'}" required />
                    </div>
                  </div>
                </div>
      
                <div>
                  <div class="">
                    <div class="form-group">
                      <label for="windowsClassicAppVersionInput">
                        <a target="_blank" href="https://blog.pwabuilder.com/docs/what-is-a-classic-package/">
                          Classic package version
                          <i class="fas fa-info-circle"
                            title="The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version."
                            aria-label="The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version."
                            role="definition"></i>
                        </a>
                        <hover-tooltip
                          text="The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version."
                          link="https://blog.pwabuilder.com/docs/what-is-a-classic-package/">
                        </hover-tooltip>
                      </label>
                      <input type="text" class="form-control" id="windowsClassicAppVersionInput" placeholder="1.0.0"
                        name="classicVersion" .value="${this.defaultOptions.classicPackage?.version || '1.0.1'}" required />
                    </div>
                  </div>
                </div>
      
                <div class="form-group">
                  <label for="windowsUrlInput">
                    URL
                    <i class="fas fa-info-circle" title="This is the URL for your PWA."
                      aria-label="This is the URL for your PWA." role="definition"></i>
      
                    <hover-tooltip text="This is the URL to your PWA"
                      link="https://blog.pwabuilder.com/docs/windows-store-documentation/">
                    </hover-tooltip>
                  </label>
                  <input type="url" class="form-control" id="windowsUrlInput" placeholder="/index.html" name="url" required
                    value="${this.defaultOptions.url || ''}" />
                </div>
      
                <div class="form-group">
                  <label for="windowsManifestUrlInput">
                    Manifest URL
                    <i class="fas fa-info-circle" title="The URL to your app manifest."
                      aria-label="The URL to your app manifest." role="definition"></i>
      
                    <hover-tooltip text="The URL to your app manifest"
                      link="https://blog.pwabuilder.com/docs/windows-store-documentation/">
                    </hover-tooltip>
                  </label>
                  <input type="url" class="form-control" id="windowsManifestUrlInput"
                    placeholder="https://mysite.com/manifest.json" name="manifestUrl"
                    .value="${this.defaultOptions.manifestUrl || ''}" required />
                </div>
      
                <div class="form-group">
                  <label for="iconUrl">
                    <a href="https://blog.pwabuilder.com/docs/image-recommendations-for-windows-pwa-packages/"
                      target="_blank">
                      Icon URL
                      <i class="fas fa-info-circle"
                        title="A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger."
                        aria-label="A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger."
                        role="definition"></i>
                    </a>
      
                    <hover-tooltip
                      text="A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger."
                      link="https://blog.pwabuilder.com/docs/image-recommendations-for-windows-pwa-packages/">
                    </hover-tooltip>
                  </label>
                  <input type="text" class="form-control" id="iconUrl" placeholder="https://myawesomepwa.com/512x512.png"
                    .value="${this.defaultOptions.images?.baseImage || ''}" name="iconUrl" />
                </div>
      
                <div class="form-group">
                  <label for="language">
                    Language
                    <i class="fas fa-info-circle"
                      title="Optional. The primary language for your app package. Additional languages can be specified in Partner Center. If empty, EN-US will be used."
                      aria-label="Optional. The primary language for your app package. Additional languages can be specified in Partner Center. If empty, EN-US will be used."
                      role="definition"></i>
      
                    <hover-tooltip
                      text="Optional. The primary language for your app package. Additional languages can be specified in Partner Center. If empty, EN-US will be used."
                      link="https://blog.pwabuilder.com/docs/windows-store-documentation/">
                    </hover-tooltip>
                  </label>
                  <input type="text" class="form-control" id="windowsLanguageInput" placeholder="EN-US"
                    .value="${this.defaultOptions.resourceLanguage || this.defaultOptions?.manifest?.lang || ''}"
                    name="language" />
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
            <input id="generate-submit" type="submit" value="Generate" />
          </loading-button>
        </div>
      </form>
    `;
  }
}
