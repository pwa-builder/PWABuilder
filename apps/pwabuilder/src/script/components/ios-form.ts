import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../components/loading-button';
import { fetchOrCreateManifest } from '../services/manifest';
import { AppPackageFormBase } from './app-package-form-base';
import { createIOSPackageOptionsFromManifest, emptyIOSPackageOptions } from '../services/publish/ios-publish';
import { getManifestContext } from '../services/app-info';
import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../utils/analytics';
import { ManifestContext } from '../utils/interfaces';

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

      #form-layout {
        flex-grow: 1;
        display: flex;
        overflow: auto;
        flex-direction: column;
        height: 54vh;
      }

      #form-extras {
        display: flex;
        justify-content: space-between;
        padding: 1em 1.5em;
        background-color: #F2F3FB;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
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

      #form-holder{
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          justify-content: spacve-between;
          height: 100%;
        }

        sl-button::part(label){
          font-size: 16px;
          padding: .5em 2em;
        }

        .arrow_link {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          font-weight: bold;
          margin-bottom: .25em;
          font-size: 14px;
        }
        .arrow_link a {
          text-decoration: none;
          border-bottom: 1px solid rgb(79, 63, 182);
          font-size: 1em;
          font-weight: bold;
          margin: 0px 0.5em 0px 0px;
          line-height: 1em;
          color: rgb(79, 63, 182);
        }
        .arrow_link a:visited {
          color: #4F3FB6;
        }
        .arrow_link:hover {
          cursor: pointer;
        }
        .arrow_link:hover img {
          animation: bounce 1s;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
          }
          40% {
            transform: translateX(-5px);
          }
          60% {
              transform: translateX(5px);
          }
        }

        #tou-link{
          color: 757575;
          font-size: 14px;
        }

        @media(max-width: 640px){
          #form-extras {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1em;
          }
          #form-details-block {
            flex-direction: column;
            gap: .75em;
            align-items: center;
            text-align: center;
            width: 100%;
          }
          #form-options-actions {
            flex-direction: column;
          }
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
    let manifestContext: ManifestContext | undefined = getManifestContext();
    if (manifestContext.isGenerated) {
      manifestContext = await fetchOrCreateManifest();
    }

    this.packageOptions = createIOSPackageOptionsFromManifest(manifestContext!);
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
    recordPWABuilderProcessStep("ios_form_all_settings_expanded", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(0deg)";
  }

  rotateNinety(){
    recordPWABuilderProcessStep("ios_form_all_settings_collapsed", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(90deg)";
  }

  render() {
    return html`
    <div id="form-holder">
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

          <sl-details @sl-show=${() => this.rotateNinety()} @sl-hide=${() => this.rotateZero()}>
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
      </form>
      <div id="form-extras">
        <div id="form-details-block">
          <p> Click below for instructions for submitting to the App Store.</p>
          <div class="arrow_link">
            <a @click=${() => recordPWABuilderProcessStep("ios_packaging_instructions_clicked", AnalyticsBehavior.ProcessCheckpoint)} href="https://docs.pwabuilder.com/#/builder/app-store" target="_blank" rel="noopener">Packaging Instructions</a>
            <img src="/assets/new/arrow.svg" alt="arrow" role="presentation"/>
          </div>
        </div>
        <div id="form-options-actions" class="modal-actions">
          <sl-button  id="generate-submit" type="submit" form="ios-options-form" ?loading="${this.generating}" >
            Download Package
          </sl-button>
          <a 
            target="_blank" 
            rel="noopener" 
            href="https://github.com/pwa-builder/PWABuilder/blob/master/TERMS_OF_USE.md" 
            id="tou-link"
            @click=${() => recordPWABuilderProcessStep("ios_form_TOU_clicked", AnalyticsBehavior.ProcessCheckpoint)}
            >Terms of Use</a>
        </div>
      </div>
    </div>
    `;
  }

  getInputValue(target: EventTarget | null): string {
    const input = target as HTMLInputElement | null;
    return input?.value || "";
  }
}
