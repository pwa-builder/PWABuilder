import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fetchOrCreateManifest } from '../services/manifest';
import { AppPackageFormBase } from './app-package-form-base';
import {
    createMacOSPackageOptionsFromManifest,
    emptyMacOSPackageOptions,
} from '../services/publish/macos-publish';
import { getManifestContext } from '../services/app-info';
import { ManifestContext, PackageOptions } from '../utils/interfaces';
import { AppNameInputPattern } from '../utils/constants';
import { macosFormStyles } from './macos-form.styles';
import "@awesome.me/webawesome/dist/components/details/details.js";

@customElement('macos-form')
export class MacOSForm extends AppPackageFormBase {
    @property({ type: Boolean }) generating: boolean = false;
    @state() showAllSettings = false;
    @state() packageOptions = emptyMacOSPackageOptions();

    static get styles() {
        return [...super.styles, macosFormStyles];
    }

    constructor() {
        super();
    }

    async firstUpdated() {
        let manifestContext: ManifestContext | undefined = getManifestContext();
        if (manifestContext.isGenerated) {
            manifestContext = await fetchOrCreateManifest();
        }

        this.packageOptions = createMacOSPackageOptionsFromManifest(manifestContext!);
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
        id="macos-options-form"
        slot="modal-form"
        style="width: 100%"
        title=""
      >
        <div id="form-layout">
          <div class="basic-settings">
            <div class="form-group">
              ${super.renderFormInput({
            label: 'Bundle ID',
            tooltip: `The unique identifier of your app. Apple recommends a reverse-domain style string: com.domainname.appname.`,
            tooltipLink: "https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleidentifier",
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
            inputId: 'appNameInput',
            placeholder: 'My PWA',
            value: this.packageOptions.name || 'My PWA',
            required: true,
            spellcheck: false,
            minLength: 3,
            pattern: AppNameInputPattern,
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

          <wa-details>
            <div class="details-summary" slot="summary">
              All Settings
            </div>
            <div class="adv-settings">
              <div class="form-group">
                ${this.renderFormInput({
            label: 'Image URL',
            inputId: 'imageUrlInput',
            tooltip: `The URL of a square 512x512 or larger PNG image from which to generate your macOS app icons.`,
            placeholder: '/images/512x512.png',
            value: this.packageOptions.imageUrl,
            required: true,
            inputHandler: (val: string) => this.packageOptions.imageUrl = val
        })}
              </div>

              <div class="form-group">
                ${this.renderFormInput({
            label: 'Theme color',
            inputId: 'themeColorInput',
            tooltip: `The color applied to the macOS window title bar. We recommend using your manifest's theme_color.`,
            type: 'color',
            placeholder: '#000000',
            value: this.packageOptions.themeColor,
            required: true,
            inputHandler: (val: string) => this.packageOptions.themeColor = val
        })}
              </div>

              <div class="form-group">
                ${this.renderFormInput({
            label: 'Background color',
            inputId: 'backgroundColorInput',
            tooltip: `The background color shown while your PWA is loading. We recommend using your manifest's background_color.`,
            type: 'color',
            placeholder: '#ffffff',
            value: this.packageOptions.backgroundColor,
            required: true,
            inputHandler: (val: string) => this.packageOptions.backgroundColor = val
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
            </div>
          </wa-details>
        </div>
      </form>
    </div>
    `;
    }

    getInputValue(target: EventTarget | null): string {
        const input = target as HTMLInputElement | null;
        return input?.value || "";
    }
}
