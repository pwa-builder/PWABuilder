import { css, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fetchOrCreateManifest } from '../services/manifest';
import { AppPackageFormBase } from './app-package-form-base';
import {
  createOculusPackageOptionsFromManifest,
  emptyOculusPackageOptions,
  emptyOculusSigningKey,
} from '../services/publish/oculus-publish';
import { getManifestContext } from '../services/app-info';
import { SigningMode } from '../utils/oculus-validation';
import { maxSigningKeySizeInBytes } from '../utils/android-validation';
import { recordPWABuilderProcessStep, AnalyticsBehavior } from '../utils/analytics';
import { ManifestContext, PackageOptions } from '../utils/interfaces';
import { AppNameInputPattern } from '../utils/constants';

@customElement('oculus-form')

export class OculusForm extends AppPackageFormBase {
  @property({ type: Boolean }) generating: boolean = false;
  @state() showAllSettings = false;
  @state() packageOptions = emptyOculusPackageOptions();
  @state() existingSigningKey = emptyOculusSigningKey();

  static get styles() {
    const localStyles = css`

      #oculus-options-form {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
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
    return [...super.styles, localStyles];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    let manifestContext: ManifestContext | undefined = getManifestContext();
    if (manifestContext.isGenerated) {
      manifestContext = await fetchOrCreateManifest();
    }

    this.packageOptions =
      createOculusPackageOptionsFromManifest(manifestContext!);
  }

  rotateZero(){
    recordPWABuilderProcessStep("meta_form_all_settings_expanded", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(0deg)";
  }

  rotateNinety(){
    recordPWABuilderProcessStep("meta_form_all_settings_collapsed", AnalyticsBehavior.ProcessCheckpoint);
    let icon: any = this.shadowRoot!.querySelector('.dropdown_icon');
    icon!.style.transform = "rotate(90deg)";
  }

  public getPackageOptions(): PackageOptions {
    return this.packageOptions;
  }

  public getForm(): HTMLFormElement {
    return this.shadowRoot!.querySelector("form")!;
  }

  render() {
    return html`
    <div id="form-holder">
      <form
        id="oculus-options-form"
        slot="modal-form"
        style="width: 100%"
        title=""
      >
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              ${this.renderFormInput({
                label: 'Package ID',
                tooltip: `The ID of your Meta Quest app. We recommend a reverse-domain style string: com.domainname.appname. Letters, numbers, periods, hyphens, and underscores are allowed.`,
                tooltipLink:
                  'https://developer.android.com/guide/topics/manifest/manifest-element.html#package',
                inputId: 'package-id-input',
                required: true,
                placeholder: 'MyCompany.MyApp',
                value: this.packageOptions.packageId,
                minLength: 3,
                maxLength: 50,
                spellcheck: false,
                pattern: '[a-zA-Z0-9.-_]*$',
                validationErrorMessage:
                  'Package ID must contain only letters, numbers, periods, hyphens, and underscores.',
                inputHandler: (val: string) =>
                  (this.packageOptions.packageId = val),
              })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'App name',
                tooltip: `The name of your app as displayed to users`,
                inputId: 'appNameInput',
                placeholder: 'My PWA',
                value: this.packageOptions.name || 'My PWA',
                required: true,
                spellcheck: false,
                minLength:  3,
                pattern: AppNameInputPattern,
                // pattern: // NOTE: avoid using a regex pattern here, as it often has unintended consequences, such as blocking non-English names
                inputHandler: (val: string) => (this.packageOptions.name = val),
              })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'Version name',
                tooltip: `The version of your app displayed to users. This is a string, typically in the form of '1.0.0.0'. This is purely for display purposes to users, Meta Quest Store uses Version Code to determine the latest version of your app.`,
                tooltipLink:
                  'https://developer.android.com/guide/topics/manifest/manifest-element.html#vname',
                inputId: 'version-input',
                required: true,
                placeholder: '1.0.0.0',
                value: this.packageOptions.versionName,
                spellcheck: false,
                inputHandler: (val: string) =>
                  (this.packageOptions.versionName = val),
              })}
            </div>

            <div class="form-group">
              ${this.renderFormInput({
                label: 'Version code',
                tooltip: `A positive integer used as your app's version number. This number is used by the Meta Quest Store to determine whether one version is more recent than another, with higher numbers indicating more recent versions.`,
                tooltipLink:
                  'https://developer.android.com/guide/topics/manifest/manifest-element.html#vcode',
                inputId: 'version-code-input',
                type: 'number',
                minValue: 1,
                maxValue: 2100000000,
                required: true,
                placeholder: '1',
                value: this.packageOptions.versionCode.toString(),
                inputHandler: (val: string) =>
                  (this.packageOptions.versionCode = parseInt(val, 10)),
              })}
            </div>
          </div>


          <sl-details @sl-show=${() => this.rotateNinety()} @sl-hide=${() => this.rotateZero()}>
            <div class="details-summary" slot="summary">
              <p>All Settings</p>
              <img class="dropdown_icon" src="/assets/new/dropdownIcon.svg" alt="dropdown toggler"/>
            </div>
              <div class="adv-settings">
                <div class="form-group">
                  ${this.renderFormInput({
                    label: 'Manifest URL',
                    tooltip: `The absolute URL of your web manifest.`,
                    inputId: 'manifest-url-input',
                    type: 'url',
                    value: this.packageOptions.manifestUrl,
                    readonly: true,
                    placeholder: 'https://myawesomepwa.com/manifest.json',
                    inputHandler: (val: string) =>
                      (this.packageOptions.manifestUrl = val),
                  })}
                </div>

                <div class="form-group">
                  <label>Signing key</label>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'New',
                      tooltip: `Recommended for new Meta Quest apps. PWABuilder will generate a new signing key for you and sign your app package with it. Your download will contain the new signing key details.`,
                      inputId: 'signing-new-input',
                      name: 'signingMode',
                      value: 'new',
                      type: 'radio',
                      checked:
                        this.packageOptions.signingMode === SigningMode.New,
                      inputHandler: () =>
                        this.signingModeChanged(SigningMode.New),
                    })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'None',
                      tooltip:
                        'PWABuilder will generate an unsigned APK. Unsigned APKs cannot be uploaded to the Meta Quest Store; you will need to sign the APK manually via Java keytool before submitting to the Store.',
                      tooltipLink:
                        'https://docs.oracle.com/en/java/javase/12/tools/keytool.html',
                      inputId: 'signing-none-input',
                      name: 'signingMode',
                      value: 'none',
                      type: 'radio',
                      checked:
                        this.packageOptions.signingMode === SigningMode.None,
                      inputHandler: () =>
                        this.signingModeChanged(SigningMode.None),
                    })}
                  </div>
                  <div class="form-check">
                    ${this.renderFormInput({
                      label: 'Existing',
                      tooltip:
                        'Recommended for existing apps in the Meta Quest Store. Use this option if you already have a signing key and you want to publish a new version of an existing app in the Meta Quest Store.',
                      inputId: 'signing-mine-input',
                      name: 'signingMode',
                      value: 'mine',
                      type: 'radio',
                      checked:
                        this.packageOptions.signingMode ===
                        SigningMode.Existing,
                      inputHandler: () =>
                        this.signingModeChanged(SigningMode.Existing),
                    })}
                  </div>

                  ${this.renderSigningKeyFields()}
                </div>
              </div>
            </sl-details>
        </div>
      </form>
      
    </div>
    `;
  }

  renderSigningKeyFields(): TemplateResult {
    // If we're not signing with an existing key, there's nothing to render.
    if (this.packageOptions.signingMode !== SigningMode.Existing) {
      return html``;
    }

    return this.renderExistingSigningKeyFields();
  }

  renderExistingSigningKeyFields(): TemplateResult {
    return html`
      <div class="signing-key-fields">
        <div class="form-group">
          <label for="signing-key-file-input">
            Keystore file
            ${this.renderTooltip({
              label: 'Keystore file',
              inputId: 'signing-key-file-input',
              tooltipLink:
                'https://developer.android.com/studio/publish/app-signing',
              tooltip:
                "Your existing .keystore file used to sign the previous version of your app. If you don't have an existing .keystore file, you should choose 'New' above.",
            })}
          </label>
          <input
            type="file"
            class="form-control"
            id="signing-key-file-input"
            @change="${(e: Event) => this.signingKeyUploaded(e.target)}"
            accept=".keystore"
            required
          />
        </div>

        <div class="form-group">
          ${this.renderFormInput({
            label: 'Keystore password',
            tooltip: 'The password to access the .keystore file',
            tooltipLink:
              'https://developer.android.com/studio/publish/app-signing',
            inputId: 'key-store-password-input',
            type: 'password',
            minLength: 6,
            required: true,
            value: this.existingSigningKey.storePassword,
            inputHandler: (val: string) => {
              this.existingSigningKey.storePassword =
                this.existingSigningKey.password = val;
            },
          })}
        </div>

        <div class="form-group">
          ${this.renderFormInput({
            label: 'Key alias',
            tooltip: 'The alias of the key to sign the app package with.',
            tooltipLink:
              'https://developer.android.com/studio/publish/app-signing',
            inputId: 'key-alias-input',
            required: true,
            placeholder: 'my-key-alias',
            value: this.existingSigningKey.alias,
            spellcheck: false,
            inputHandler: (val: string) =>
              (this.existingSigningKey.alias = val),
          })}
        </div>
      </div>
    `;
  }

  signingKeyUploaded(event: any) {
    const filePicker = event as HTMLInputElement;
    if (filePicker && filePicker.files && filePicker.files.length > 0) {
      const keyFile = filePicker.files[0];
      // Make sure it's a reasonable size.
      if (keyFile && keyFile.size > maxSigningKeySizeInBytes) {
        console.error('Signing key file is too large. Max size:', {
          maxSize: maxSigningKeySizeInBytes,
          fileSize: keyFile.size,
        });
      }

      // Read it in as a Uint8Array and store it in our signing object.
      const fileReader = new FileReader();
      fileReader.onload = () =>
        (this.existingSigningKey.keyStoreFile = fileReader.result as string);

      // Log any errors.
      fileReader.onerror = progressEvent => {
        console.error(
          'Unable to read signing key file',
          fileReader.error,
          progressEvent
        );
      };

      // Kick off reading the file.
      fileReader.readAsDataURL(keyFile as Blob);
    }
  }

  /**
   * Called when the user changes the signing mode.
   */
  signingModeChanged(mode: SigningMode) {
    this.packageOptions.signingMode = mode;

    if (mode === SigningMode.Existing) {
      this.packageOptions.existingSigningKey = this.existingSigningKey;
    } else {
      this.packageOptions.existingSigningKey = null;
    }

    // We need to re-render because Lit isn't watching packageOptions.signing, as it's a nested object.
    this.requestUpdate();
  }
}
