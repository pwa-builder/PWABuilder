import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../components/loading-button';
import { fetchOrCreateManifest } from '../services/manifest';
import { ManifestContext } from '../utils/interfaces';
import { AppPackageFormBase } from './app-package-form-base';
import { createIOSPackageOptionsFromManifest, emptyIOSPackageOptions } from '../services/publish/ios-publish';
import { IOSAppPackageOptions } from '../utils/ios-validation';

@customElement('ios-form')
export class IOSForm extends AppPackageFormBase {
  @property({ type: Boolean }) generating: boolean = false;
  @state() showAllSettings = false;
  @state() name = '';
  @state() bundleId = '';
  @state() url = 'Engineering';
  @state() imageUrl = 'US';
  @state() splashColor = '#ffffff';
  @state() progressBarColor = '#000000';
  @state() statusBarColor = '#ffffff';
  @state() permittedUrls: string[] = [];
  @state() defaultOptions = emptyIOSPackageOptions();
  private manifestContext: ManifestContext | null = null;

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
    this.manifestContext = await fetchOrCreateManifest();
    this.defaultOptions = createIOSPackageOptionsFromManifest(this.manifestContext);
  }

  initGenerate(ev: InputEvent) {
    ev.preventDefault();

    this.dispatchEvent(
      new CustomEvent('init-ios-gen', {
        detail: this.getPackageOptions(),
        composed: true,
        bubbles: true,
      })
    );
  }

  getPackageOptions(): IOSAppPackageOptions {
    return {
      name: this.name,
      bundleId: this.bundleId,
      url: this.url,
      imageUrl: this.imageUrl,
      splashColor: this.splashColor,
      progressBarColor: this.progressBarColor,
      statusBarColor: this.statusBarColor,
      permittedUrls: this.permittedUrls,
      manifestUrl: this.manifestContext?.manifestUrl || '',
      manifest: this.manifestContext?.manifest || {}
    };
  }

  toggleSettings(settingsToggleValue: 'basic' | 'advanced') {
    if (settingsToggleValue === 'advanced') {
      this.showAllSettings = true;
    } else if (settingsToggleValue === 'basic') {
      this.showAllSettings = false;
    } else {
      this.showAllSettings = false;
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
        id="ios-options-form"
        slot="modal-form"
        style="width: 100%"
        @submit="${(ev: InputEvent) => this.initGenerate(ev)}"
        title=""
      >
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              ${super.renderFormInput({
                label: 'Bundle ID',
                tooltip: `The unique identifier of your app. It should contain only letters, numbers, and periods. Apple recommends a reverse-domain style string: com.domainname.appname. You'll need this value when uploading your app to the iOS App Store.`,
                inputId: 'bundleIdInput',
                value: this.defaultOptions.bundleId || 'com.domainname.appname',
                required: true,
                placeholder: "com.domainname.appname",
                minLength: 3,
                inputHandler: (val: string) => this.bundleId = val
              })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'App name',
                inputId: 'appNameInput',
                placeholder: 'My PWA',
                value: this.defaultOptions.name || 'My PWA',
                required: true,
                spellcheck: false,
                inputHandler: (val: string) => this.name = val
              })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'URL',
                inputId: 'urlInput',
                placeholder: 'https://domainname.com/app',
                value: this.defaultOptions.url,
                required: true,
                type: 'url',
                inputHandler: (val: string) => this.url = val
              })}
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
                      ${this.renderFormInput({
                        label: 'Image URL',
                        inputId: 'imageUrlInput',
                        tooltip: `The URL of a aquare 512x512 or larger PNG image from which to generate your app icons. This can be an absolute URL or a URL relative to your web manifest.`,
                        placeholder: '/images/512x512.png',
                        value: this.defaultOptions.imageUrl,
                        required: true,
                        inputHandler: (val: string) => this.imageUrl = val
                      })}
                    </div>
                  </div>
                </div>
              </div>             

              <div class="form-group">
                ${this.renderFormInput({
                    label: 'Status bar color',
                    inputId: 'statusBarColorInput',
                    tooltip: `The background color of the iOS status bar while your app is running. We recommend using your manifest's background_color. The status bar shows at the top of the iPhone's screen, containing system information like reception bars, battery life indicator, time, etc. This should typically be the prominent background color of your app.`,
                    type: 'color',
                    placeholder: '#ffffff',
                    value: this.defaultOptions.statusBarColor,
                    required: true,
                    inputHandler: (val: string) => this.statusBarColor = val
                  })}
              </div>

              <div class="form-group">
                ${this.renderFormInput({
                    label: 'Splash screen color',
                    inputId: 'splashColorInput',
                    tooltip: `The background color of the splash screen shown while your PWA is launching. We recommend using your manifest's background_color.`,
                    type: 'color',
                    placeholder: '#ffffff',
                    value: this.defaultOptions.splashColor,
                    required: true,
                    inputHandler: (val: string) => this.splashColor = val
                  })}
              </div>

              <div class="form-group">
                ${this.renderFormInput({
                    label: 'Progress bar color',
                    inputId: 'progressBarColorInput',
                    tooltip: `The color of the progress bar shown on your app's splash screen while your PWA is loaded. We recommend using your manifest's theme_color.`,
                    type: 'color',
                    placeholder: '#000000',
                    value: this.defaultOptions.progressBarColor,
                    required: true,
                    inputHandler: (val: string) => this.progressBarColor = val
                  })}
              </div>

              <div class="form-group">
                ${this.renderFormInput({
                    label: 'Permitted URLs',
                    inputId: 'permittedUrlsInput',
                    tooltip: `Optional. A comma-separated list of URLs or hosts that your PWA should be allowed to navigate to. For example, account.google.com will allow permit all navigations that include account.google.com in the URL.`,
                    placeholder: 'account.google.com, login.microsoft.com',
                    value: this.defaultOptions.permittedUrls.join(', '),
                    inputHandler: (val: string) => this.permittedUrls = val.split(',').map(i => i.trim()).filter(i => !!i)
                  })}
              </div>
            </fast-accordion-item>
          </fast-accordion>
        </div>

        <div id="form-details-block">
          <p>
            Your download will contain
            <a href="https://github.com/pwa-builder/pwabuilder-ios/blob/main/next-steps.md" target="_blank">
              instructions
            </a> 
            for submitting to the App Store.</p>
        </div>

        <div id="form-options-actions" class="modal-actions">
          <loading-button .loading="${this.generating}">
            <input id="generate-submit" type="submit" value="Generate" />
          </loading-button>
        </div>
      </form>
    `;
  }

  getInputValue(target: EventTarget | null): string {
    const input = target as HTMLInputElement | null;
    return input?.value || "";
  }
}
