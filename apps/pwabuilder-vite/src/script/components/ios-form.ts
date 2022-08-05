import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../components/loading-button';
import { fetchOrCreateManifest } from '../services/manifest';
import { AppPackageFormBase } from './app-package-form-base';
import { createIOSPackageOptionsFromManifest, emptyIOSPackageOptions } from '../services/publish/ios-publish';
import { getManifestContext } from '../services/app-info';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';

@customElement('ios-form')
export class IOSForm extends AppPackageFormBase {
  @property({ type: Boolean }) generating: boolean = false;
  @state() showAllSettings = false;
  @state() packageOptions = emptyIOSPackageOptions();

  static get styles() {
    const localStyles = css`

      #ios-options-form {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
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
      #form-extras {
        display: flex;
        flex-direction: column;
        margin-top: auto;
        padding: 1em;
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

      #generate-submit::part(base) {
        background-color: black;
        color: white;
        font-size: 14px;
        height: 3em;
        width: 100%;
        border-radius: 50px;
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
      super.styles,
      localStyles
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    let manifestContext = getManifestContext();
    if (manifestContext.isGenerated) {
      manifestContext = await fetchOrCreateManifest();
    }

    this.packageOptions = createIOSPackageOptionsFromManifest(manifestContext);
  }

  initGenerate(ev: InputEvent) {
    ev.preventDefault();

    this.dispatchEvent(
      new CustomEvent('init-ios-gen', {
        detail: this.packageOptions,
        composed: true,
        bubbles: true
      })
    );
  }

  rotateZero(){
    recordPWABuilderProcessStep("android_form_all_settings_expanded", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(0deg)";
    console.log("hello?")
  }

  rotateNinety(){
    recordPWABuilderProcessStep("android_form_all_settings_collapsed", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(90deg)";
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
                tooltip: `The unique identifier of your app. Apple recommends a reverse-domain style string: com.domainname.appname. You'll need this value when uploading your app to the App Store.`,
                tooltipLink: "https://blog.pwabuilder.com/docs/publish-your-pwa-to-the-ios-app-store/#create-your-bundle-id",
                inputId: 'bundleIdInput',
                value: this.packageOptions.bundleId || 'com.domainname.appname',
                required: true,
                placeholder: "com.domainname.appname",
                minLength: 3,
                spellcheck: false,
                inputHandler: (val: string) => this.packageOptions.bundleId = val
              })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'App name',
                tooltip: `The name of your app as displayed to users`,
                tooltipLink: "https://blog.pwabuilder.com/docs/publish-your-pwa-to-the-ios-app-store",
                inputId: 'appNameInput',
                placeholder: 'My PWA',
                value: this.packageOptions.name || 'My PWA',
                required: true,
                spellcheck: false,
                minLength: 3,
                // pattern: // NOTE: avoid using a regex pattern here, as it often has unintended consequences, such as blocking non-English names
                inputHandler: (val: string) => this.packageOptions.name = val
              })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'URL',
                inputId: 'urlInput',
                placeholder: 'https://domainname.com/app',
                value: this.packageOptions.url,
                required: true,
                type: 'url',
                inputHandler: (val: string) => this.packageOptions.url = val
              })}
            </div>
          </div>

          <sl-details @click="${(ev: Event) => this.toggleAccordion(ev.target)}" @sl-show=${() => this.rotateNinety()} @sl-hide=${() => this.rotateZero()}>
            <div class="details-summary" slot="summary">
              <p>All Settings</p>
              <img class="dropdown_icon" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
            </div>
            <div class="adv-settings">
              <div>
                <div class="">
                  <div class="form-group">
                    ${this.renderFormInput({
                      label: 'Image URL',
                      inputId: 'imageUrlInput',
                      tooltip: `The URL of a square 512x512 or larger PNG image from which to generate your iOS app icons. This can be an absolute URL or a URL relative to your web manifest.`,
                      placeholder: '/images/512x512.png',
                      value: this.packageOptions.imageUrl,
                      required: true,
                      inputHandler: (val: string) => this.packageOptions.imageUrl = val
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                  label: 'Status bar color',
                  inputId: 'statusBarColorInput',
                  tooltip: `The background color of the iOS status bar while your app is running. We recommend using your manifest's theme_color or background_color.`,
                  type: 'color',
                  placeholder: '#ffffff',
                  value: this.packageOptions.statusBarColor,
                  required: true,
                  inputHandler: (val: string) => this.packageOptions.statusBarColor = val
                })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                  label: 'Splash screen color',
                  inputId: 'splashColorInput',
                  tooltip: `The background color of the splash screen shown while your PWA is launching. We recommend using your manifest's background_color.`,
                  type: 'color',
                  placeholder: '#ffffff',
                  value: this.packageOptions.splashColor,
                  required: true,
                  inputHandler: (val: string) => this.packageOptions.splashColor = val
                })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                  label: 'Progress bar color',
                  inputId: 'progressBarColorInput',
                  tooltip: `The color of the progress bar shown on your app's splash screen while your PWA is loaded. We recommend using your manifest's theme_color.`,
                  type: 'color',
                  placeholder: '#000000',
                  value: this.packageOptions.progressBarColor,
                  required: true,
                  inputHandler: (val: string) => this.packageOptions.progressBarColor = val
                })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                  label: 'Permitted URLs',
                  inputId: 'permittedUrlsInput',
                  tooltip: `Optional. A comma-separated list of URLs or hosts that your PWA should be allowed to navigate to. You don't need to add your PWA's domain, as it's automatically included.`,
                  placeholder: 'account.google.com, login.microsoft.com',
                  value: this.packageOptions.permittedUrls.join(', '),
                  inputHandler: (val: string) => this.packageOptions.permittedUrls = val.split(',').map(i => i.trim()).filter(i => !!i)
                })}
            </div>
            </sl-details>
        </div>

        <div id="form-extras">
          <div id="form-details-block">
            <p>
              Your download will contain
              <a href="https://blog.pwabuilder.com/docs/build-your-ios-app" target="_blank">instructions</a>
              for submitting to the App Store.</p>
          </div>

          <div id="form-options-actions" class="modal-actions">
            <sl-button  id="generate-submit" type="submit" ?loading="${this.generating}" >
              Generate Package
            </sl-button>
          </div>
        </div>
      </form>
    `;
  }

  getInputValue(target: EventTarget | null): string {
    const input = target as HTMLInputElement | null;
    return input?.value || "";
  }
}
