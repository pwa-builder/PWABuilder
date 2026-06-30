import { LitElement, html, PropertyValueMap } from 'lit';
import { manifestSettingsFormStyles } from "./manifest-settings-form.styles";
import { customElement, property, state } from 'lit/decorators.js';
import type { singleFieldValidation } from '../../models/single-field-validation';
import { required_fields } from '../../models/manifest-fields';
import type { Manifest } from '../../models/manifest';
import { classMap } from 'lit/directives/class-map.js';
import "./manifest-field-tooltip";
import { errorInTab, insertAfter } from "../../utils/helpers";
import { langCodes, languageCodes } from "../../../locales";
import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
import '@awesome.me/webawesome/dist/components/details/details.js';
import '@awesome.me/webawesome/dist/components/divider/divider.js';
import '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/select/select.js';

const settingsFields = ["start_url", "scope", "orientation", "lang", "dir", "display", "display_override"];
const displayOptions: Array<string> = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
const overrideOptions: Array<string> = ['browser', 'fullscreen', 'minimal-ui', 'standalone', 'window-controls-overlay'];
let manifestInitialized: boolean = false;

@customElement('manifest-settings-form')
export class ManifestSettingsForm extends LitElement {

    @property({
        type: Object, hasChanged(value: Manifest, oldValue: Manifest) {
            if (value !== oldValue && value.name) {
                manifestInitialized = true;
                return value !== oldValue;
            }
            return value !== oldValue;
        }
    }) manifest: Manifest = {};

    private shouldValidateAllFields: boolean = true;
    private validationPromise: Promise<void> | undefined;

    @property({ type: String }) focusOn: string = "";

    @state() errorMap: any = {};
    @state() activeOverrideItems: string[] = [];



    static styles = [manifestSettingsFormStyles];

    constructor() {
        super();
    }

    firstUpdated() {
        let field = this.shadowRoot!.querySelector('[data-field="' + this.focusOn + '"]');
        if (this.focusOn && field) {
            setTimeout(() => { field!.scrollIntoView({ block: "end", behavior: "smooth" }) }, 500)
        }
    }

    protected async updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {

        let field = this.shadowRoot!.querySelector('[data-field="' + this.focusOn + '"]');
        if (this.focusOn && field) {
            setTimeout(() => { field!.scrollIntoView({ block: "end", behavior: "smooth" }) }, 500)
        }

        if (manifestInitialized) {
            manifestInitialized = false;
            this.requestValidateAllFields();
            this.initOverrideList();
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

        const { validateSingleField } = await import('@pwabuilder/manifest-validation');

        for (let i = 0; i < settingsFields.length; i++) {
            let field = settingsFields[i];
            let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');

            // Clear any previous error state for this field first so re-validation is
            // idempotent: a field that has since become valid (e.g. start_url that was
            // missing while the manifest was still loading) sheds its stale error.
            input?.classList.remove("error");
            let existingErrorDiv = this.shadowRoot!.querySelector(`.${field}-error-div`);
            if (existingErrorDiv) {
                existingErrorDiv.parentElement!.removeChild(existingErrorDiv);
            }
            delete this.errorMap[field];

            let invalid = false;
            let errors: string[] = [];

            if (field in this.manifest) {
                const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);
                if (!validation!.valid) {
                    invalid = true;
                    errors = validation.errors ?? [];
                }
            } else if (required_fields.includes(field)) {
                /* This handles the case where the field is not in the manifest..
                we only want to make it red if its REQUIRED. */
                invalid = true;
                errors = [`${field} is required and is missing from your manifest.`];
            }

            if (invalid) {
                input?.classList.add("error");

                let div = document.createElement('div');
                div.classList.add(`${field}-error-div`);
                this.errorMap[field] = 0;
                errors.forEach((error: string) => {
                    let p = document.createElement('p');
                    p.innerText = error;
                    p.style.color = "#eb5757";
                    p.setAttribute('aria-live', 'polite');
                    div.append(p);
                    this.errorMap[field]++;
                });
                if (input) {
                    insertAfter(div, input.parentNode!.lastElementChild);
                }
            }
        }

        this.validationPromise = undefined;
        if (Object.keys(this.errorMap).length === 0) {
            this.dispatchEvent(errorInTab(false, "settings"));
        } else {
            this.dispatchEvent(errorInTab(true, "settings"));
        }
    }

    initOverrideList() {
        this.activeOverrideItems = [];

        if (this.manifest.display_override) {
            this.manifest.display_override!.forEach((item: string) => {
                this.activeOverrideItems.push(item);
            });
        }

    }

    async handleInputChange(event: InputEvent) {

        if (this.validationPromise) {
            await this.validationPromise;
        }

        const input = <HTMLInputElement | HTMLSelectElement>event.target;
        let updatedValue = input.value;
        const fieldName = input.dataset['field'];

        let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
            detail: {
                field: fieldName,
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(fieldChangeAttempted);

        const { validateSingleField } = await import('@pwabuilder/manifest-validation');
        const validation: singleFieldValidation = await validateSingleField(fieldName!, updatedValue);
        let passed = validation!.valid;


        if (passed) {
            // Since we already validated, we only send valid updates.
            let manifestUpdated = new CustomEvent('manifestUpdated', {
                detail: {
                    field: fieldName,
                    change: updatedValue
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(manifestUpdated);

            if (input.classList.contains("error")) {
                input.classList.toggle("error");
                delete this.errorMap[fieldName!];
                let last = input!.parentNode!.lastElementChild
                input!.parentNode!.removeChild(last!)
            }
        } else {
            if (this.shadowRoot!.querySelector(`.${fieldName}-error-div`)) {
                let error_div = this.shadowRoot!.querySelector(`.${fieldName}-error-div`);
                error_div!.parentElement!.removeChild(error_div!);
            }

            // update error list
            if (validation.errors) {
                let div = document.createElement('div');
                div.classList.add(`${fieldName}-error-div`);
                this.errorMap[fieldName!] = 0;
                validation.errors.forEach((error: string) => {
                    let p = document.createElement('p');
                    p.innerText = error;
                    p.style.color = "#eb5757";
                    p.setAttribute('aria-live', 'polite');
                    div.append(p);
                    this.errorMap[fieldName!]++;
                });
                insertAfter(div, input!.parentNode!.lastElementChild);
            }

            input.classList.add("error");
        }
        if (Object.keys(this.errorMap).length == 0) {
            this.dispatchEvent(errorInTab(false, "settings"));
        } else {
            this.dispatchEvent(errorInTab(true, "settings"));
        }
    }

    // temporary fix that helps with codes like en-US that we don't cover.
    parseLangCode(code: string) {
        if (code) {
            return code.split("-")[0];
        }
        return "";
    }

    async toggleOverrideList(label: string, origin: string) {

        let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
            detail: {
                field: "display_override",
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(fieldChangeAttempted);

        let checkbox = origin === "checkbox" ? this.shadowRoot!.querySelector(`wa-checkbox[value="${label}"]`) : this.shadowRoot!.querySelector(`wa-dropdown-item[value="${label}"]`);

        let active = !(checkbox as HTMLInputElement)!.checked;

        if (active) {
            // remove from active list
            let remIndex = this.activeOverrideItems.indexOf(label);
            this.activeOverrideItems.splice(remIndex, 1);

        } else {
            // push to active list
            this.activeOverrideItems.push(label);
        }

        this.validatePlatformList("display_override", this.activeOverrideItems!);

        this.requestUpdate();
    }

    async validatePlatformList(field: string, updatedValue: any[]) {

        if (this.validationPromise) {
            await this.validationPromise;
        }

        let input = this.shadowRoot!.querySelector(`[data-field=${field}]`);
        const { validateSingleField } = await import('@pwabuilder/manifest-validation');
        const validation: singleFieldValidation = await validateSingleField(field, updatedValue);
        let passed = validation!.valid;

        if (passed) {

            let manifestUpdated = new CustomEvent('manifestUpdated', {
                detail: {
                    field: field,
                    change: [...updatedValue]
                },
                bubbles: true,
                composed: true
            });

            this.dispatchEvent(manifestUpdated);

            if (input!.classList.contains("error")) {
                input!.classList.toggle("error");
                delete this.errorMap[field];
                let last = input!.parentNode!.lastElementChild;
                last!.parentNode!.removeChild(last!);
            }
        } else {
            if (this.shadowRoot!.querySelector(`.${field}-error-div`)) {
                let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
                error_div!.parentElement!.removeChild(error_div!);
            }

            // update error list
            if (validation.errors) {
                let div = document.createElement('div');
                div.classList.add(`${field}-error-div`);
                this.errorMap[field] = 0;
                validation.errors.forEach((error: string) => {
                    let p = document.createElement('p');
                    p.innerText = error;
                    p.style.color = "#eb5757";
                    p.setAttribute('aria-live', 'polite');
                    div.append(p);
                    this.errorMap[field]++;
                });
                insertAfter(div, input!.parentNode!.lastElementChild);
            }

            input!.classList.add("error");
        }
        if (Object.keys(this.errorMap).length === 0) {
            this.dispatchEvent(errorInTab(false, "platform"));
        } else {
            this.dispatchEvent(errorInTab(true, "platform"));
        }
    }

    decideFocus(field: string) {
        let decision = this.focusOn === field;
        return { focus: decision }
    }

    render() {
        return html`
      <div id="form-holder">
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("start_url"))}>Start URL<span class="required-asterisk">*</span></h3>
                <manifest-field-tooltip .field=${"start_url"}></manifest-field-tooltip>
              </div>

              <p class="field-desc">(required)</p>
            </div>
            <p class="field-desc">The URL that loads when your PWA starts</p>
            <wa-input placeholder="PWA Start URL" value=${this.manifest.start_url! || ""} data-field="start_url" @change=${this.handleInputChange} required></wa-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("dir"))}>Dir</h3>
                <manifest-field-tooltip .field=${"dir"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">The text direction of your PWA</p>
            <wa-select placeholder="Select a Direction" data-field="dir" ?hoist=${true} value=${this.manifest.dir! || ""} @change=${this.handleInputChange}>
              ${dirOptions.map((option: string) => html`<wa-option value=${option}>${option}</wa-option>`)}
            </wa-select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("scope"))}>Scope</h3>
                <manifest-field-tooltip .field=${"scope"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">Which URLs can load within your app</p>
            <wa-input placeholder="PWA Scope" data-field="scope" value=${this.manifest.scope! || ""} @change=${this.handleInputChange}></wa-input>
          </div>
          
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("lang"))}>Language</h3>
                <manifest-field-tooltip .field=${"lang"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">The primary language of your app</p>
            <wa-select placeholder="Select a Language" data-field="lang" ?hoist=${true} value=${this.parseLangCode(this.manifest.lang!) || ""} @change=${this.handleInputChange}>
              ${languageCodes.map((lang: langCodes) => html`<wa-option value=${lang.code}>${lang.formatted}</wa-option>`)}
            </wa-select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("orientation"))}>Orientation</h3>
                <manifest-field-tooltip .field=${"orientation"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">The default screen orientation of your app</p>
            <wa-select placeholder="Select an Orientation" data-field="orientation" ?hoist=${true} value=${this.manifest.orientation! || ""} @change=${this.handleInputChange}>
              ${orientationOptions.map((option: string) => html`<wa-option value=${option}>${option}</wa-option>`)}
            </wa-select>
          </div>
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("display"))}>Display</h3>
                <manifest-field-tooltip .field=${"display"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">The appearance of your app window</p>
            <wa-select placeholder="Select a Display" data-field="display" ?hoist=${true} value=${this.manifest.display! || ""} @change=${this.handleInputChange}>
              ${displayOptions.map((option: string) => html`<wa-option value=${option}>${option}</wa-option>`)}
            </wa-select>
          </div>
        </div>
        <div class="form-row long">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("display_override"))}>Display Override</h3>
                <manifest-field-tooltip .field=${"display_override"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">Used to determine the preferred display mode</p>
            <div id="override-list">
            <wa-details summary="Click to edit display override" data-field="display_override">
              <div class="override-menu">
                <div class="override-menu-label">Active Override Items</div>
                ${this.activeOverrideItems.length != 0 ?
                this.activeOverrideItems.map((item: string, index: number) =>
                    html`
                    <wa-dropdown-item class="override-item" value=${item} @click=${() => this.toggleOverrideList(item, "menu-item")}>
                      <p slot="icon" class="menu-prefix">${index + 1}</p>
                      ${item}
                    </wa-dropdown-item>
                  `) :
                html`<wa-dropdown-item disabled>-</wa-dropdown-item>`
            }
                <wa-divider></wa-divider>
                <div id="override-options-grid">
                  ${overrideOptions.map((item: string) =>
                html`
                        <wa-checkbox class="override-item" size="s" value=${item} @change=${() => this.toggleOverrideList(item, "checkbox")} ?checked=${this.activeOverrideItems.includes(item)}>
                          ${item}
                        </wa-checkbox>
                      `)}
                  </div>
              </div>
            </wa-details>
            </div>
          </div>
        </div>
      </div>
    `;
    }
}

const orientationOptions: Array<string> = ['any', 'natural', 'landscape', 'portrait', 'portrait-primary', 'portrait-secondary', 'landscape-primary', 'landscape-secondary'];
const dirOptions: Array<string> = ['auto', 'ltr', 'rtl'];