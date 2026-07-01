import type { singleFieldValidation } from '../../models/single-field-validation';
import type { Manifest, Screenshot, Icon } from '../../models/manifest';
import { LitElement, html, PropertyValueMap } from 'lit';
import { manifestScreenshotsFormStyles } from "./manifest-screenshots-form.styles";
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import "./manifest-field-tooltip";
import { errorInTab, insertAfter } from "../../utils/helpers";
import { resolveUrl } from "../../utils/url";
import '@awesome.me/webawesome/dist/components/icon/icon.js';

let manifestInitialized = false;

@customElement('manifest-screenshots-form')
export class ManifestScreenshotsForm extends LitElement {

    @property({
        type: Object, hasChanged(value: Manifest, oldValue: Manifest) {
            if (value !== oldValue && value.name) {
                manifestInitialized = true;
                return value !== oldValue;
            }
            return value !== oldValue;
        }
    }) manifest: Manifest = {};
    @property({ type: String }) manifestURL: string = "";
    @property({ type: String }) baseURL: string = "";
    @property({ type: String }) focusOn: string = "";

    @state() screenshotUrlList: Array<string | undefined> = [undefined];
    @state() screenshotListValid: Array<boolean> = [];
    @state() protected addScreenshotUrlDisabled = true;
    @state() protected generateScreenshotButtonDisabled = true;
    @state() protected awaitRequest = false;
    @state() protected screenshotsList: Screenshot[] = [];
    @state() initialScreenshotLength = -1;
    @state() srcList: any = [];
    @state() newSrcList: any = [];

    // Generation Status
    @state() protected showSuccessMessage = false;
    @state() protected showErrorMessage = false;

    private shouldValidateAllFields: boolean = true;
    private validationPromise: Promise<void> | undefined;
    private errorCount: number = 0;

    static styles = [manifestScreenshotsFormStyles];

    constructor() {
        super();
    }

    protected async updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        if (manifestInitialized) {
            manifestInitialized = false;
            this.requestValidateAllFields();
            await this.screenshotSrcListParse();
            if (this.manifest.screenshots && this.initialScreenshotLength == -1) {
                this.initialScreenshotLength = this.manifest.screenshots.length;
            } else {
                this.initialScreenshotLength = 0;
            }
        }
    }

    private async requestValidateAllFields() {

        this.shouldValidateAllFields = true;

        if (this.validationPromise) {
            return;
        }

        while (this.shouldValidateAllFields) {
            this.shouldValidateAllFields = false;

            this.validationPromise = this.validateAllFields();
            await this.validationPromise;
        }

    }

    async validateAllFields() {
        let field = "screenshots";

        if (this.manifest[field]) {
            const { validateSingleField } = await import('@pwabuilder/manifest-validation');
            const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);
            let passed = validation!.valid;

            if (!passed) {

                if (this.shadowRoot!.querySelector(`.error-message`)) {
                    let error_p = this.shadowRoot!.querySelector(`.error-message`);
                    error_p!.parentElement!.removeChild(error_p!);
                }

                let title = this.shadowRoot!.querySelector('h3');
                title!.classList.add("error");

                if (validation.errors) {
                    validation.errors.forEach((error: string) => {
                        let p = document.createElement('p');
                        p.innerText = error;
                        p.style.color = "#eb5757";
                        p.classList.add("error-message");
                        p.setAttribute('aria-live', 'polite');
                        insertAfter(p, title!.parentNode);
                        this.errorCount++;
                    });
                }

            }
        }

        this.validationPromise = undefined;
        if (this.errorCount == 0) {
            this.dispatchEvent(errorInTab(false, "screenshots"));
        } else {
            this.dispatchEvent(errorInTab(true, "screenshots"));
        }
    }

    async screenshotSrcListParse() {

        if (!this.manifest || !this.manifest.screenshots) {
            return;
        }

        let srcList: string[] = [];
        let initialCounter = this.initialScreenshotLength;

        for (let i = 0; i < this.manifest!.screenshots!.length; i++) {
            let sc = this.manifest!.screenshots![i];
            let scURL: string = this.handleImageUrl(sc) || '';

            await this.testImage(scURL).then(
                function fulfilled(_img) {
                },

                function rejected() {
                    scURL = `https://pwabuilder.com/api/images/getSafeImageForAnalysis?imageUrl=${encodeURIComponent(scURL)}`;
                }
            );

            if (scURL && initialCounter != 0) {
                srcList.push(scURL as string);
                initialCounter--;
            }
        }
        this.srcList = srcList;
    }

    testImage(url: string) {

        // Define the promise
        const imgPromise = new Promise(function imgPromise(resolve, reject) {

            // Create the image
            const imgElement = new Image();

            // When image is loaded, resolve the promise
            imgElement.addEventListener('load', function imgOnLoad() {
                resolve(this);
            });

            // When there's an error during load, reject the promise
            imgElement.addEventListener('error', function imgOnError() {
                reject();
            })

            // Assign URL
            imgElement.src = url;

        });

        return imgPromise;
    }

    handleImageUrl(icon: Icon) {
        if (icon.src.indexOf('data:') === 0 && icon.src.indexOf('base64') !== -1) {
            return icon.src;
        }

        let url = resolveUrl(this.manifestURL, this.manifest?.startUrl);
        url = resolveUrl(url?.href, icon.src);

        if (url) {
            return url.href;
        }

        return undefined;
    }

    decideFocus(field: string) {
        let decision = this.focusOn === field;
        return { focus: decision }
    }

    render() {
        return html`
      <div id="form-holder">
        <div class="form-field">
          <div class="field-header">
            <h3 class=${classMap(this.decideFocus("screenshots"))}>Screenshots</h3>
            <manifest-field-tooltip .field=${"screenshots"}></manifest-field-tooltip>
          </div>
          <p>Below are the screenshots that are currently in your manifest.</p>
          <div class="sc-gallery">
            ${this.srcList.length > 0 ? this.srcList.map((img: any) => html`<img class="screenshot" src=${img} alt="your app screenshot" decoding="async" loading="lazy"/>`) : html`<div class="center_text"><wa-icon name="card-image"></wa-icon> There are no screenshots in your manifest</div>`}
          </div>
          <div class="sc-gallery">
            ${this.newSrcList.map((img: any) => html`<img class="screenshot" alt="your generated screenshot" src=${img} />`)}
          </div>
        </div>
      </div>
    `;
    }
}