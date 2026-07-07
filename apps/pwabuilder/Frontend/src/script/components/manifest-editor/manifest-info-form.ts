import { LitElement, html, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { singleFieldValidation } from '../../models/single-field-validation';
import { required_fields } from '../../models/manifest-fields';
import type { Manifest } from '../../models/manifest';
import { classMap } from 'lit/directives/class-map.js';
import "./manifest-field-tooltip";
import { manifestInfoFormStyles } from "./manifest-info-form.styles";
import { errorInTab, insertAfter } from "../../utils/helpers";
import '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/textarea/textarea.js';

const defaultColor: string = "#000000";
let manifestInitialized: boolean = false;

let infoFields = ["name", "short_name", "description", "background_color", "theme_color"];

@customElement('manifest-info-form')
export class ManifestInfoForm extends LitElement {

    @property({
        type: Object, hasChanged(value: Manifest, oldValue: Manifest) {
            if (value !== oldValue && value.name) {
                manifestInitialized = true;
                return value !== oldValue;
            }
            return value !== oldValue;
        }
    }) manifest: Manifest = {};

    @property({ type: String }) focusOn: string = "";

    @state() bgText: string = '';
    @state() themeText: string = '';
    @state() errorMap: any = {};

    private shouldValidateAllFields: boolean = true;
    private validationPromise: Promise<void> | undefined;

    static styles = [manifestInfoFormStyles];

    protected async updated(_changedProperties: PropertyValueMap<this>) {

        let field = this.shadowRoot!.querySelector('[data-field="' + this.focusOn + '"]');
        if (this.focusOn && field) {
            setTimeout(() => { field!.scrollIntoView({ block: "end", behavior: "smooth" }) }, 500)
        }

        if (manifestInitialized) {
            manifestInitialized = false;
            this.initMissingColors();
            this.requestValidateAllFields();
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
        for (let i = 0; i < infoFields.length; i++) {
            let field = infoFields[i];

            if (field in this.manifest) {
                const { validateSingleField } = await import('@pwabuilder/manifest-validation');
                const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);
                let passed = validation!.valid;

                // Validation Failed
                if (!passed) {

                    let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');

                    // Structure of these two fields are different so they need their own logic.
                    if (field === "theme_color" || field === "background_color") {

                        // Remove exisiting error list if there is one.
                        if (this.shadowRoot!.querySelector(`.${field}-error-div`)) {
                            let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
                            error_div!.parentElement!.removeChild(error_div!);
                        }

                        // Update new errors list.
                        if (validation.errors) {
                            this.errorMap[field] = 0;
                            let div = document.createElement('div');
                            div.classList.add(`${field}-error-div`);
                            const errorId = `${field}-error-${Date.now()}`;
                            div.id = errorId;
                            validation.errors.forEach((error: string) => {
                                let p = document.createElement('p');
                                p.innerText = error;
                                p.style.color = "#eb5757";
                                p.setAttribute('aria-live', 'polite');
                                p.setAttribute('role', 'alert');
                                div.append(p);
                                this.errorMap[field]++;
                            });
                            insertAfter(div, input!.parentNode!.parentNode!.lastElementChild);
                            // Associate error with input field
                            input!.setAttribute('aria-describedby', errorId);
                        }

                        input!.classList.add("error-color-field");
                    } else { // All other fields

                        // Remove old errors
                        if (this.shadowRoot!.querySelector(`.${field}-error-div`)) {
                            let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
                            error_div!.parentElement!.removeChild(error_div!);
                        }

                        // Update with new errors.
                        if (validation.errors) {
                            this.errorMap[field] = 0;
                            let div = document.createElement('div');
                            div.classList.add(`${field}-error-div`);
                            const errorId = `${field}-error-${Date.now()}`;
                            div.id = errorId;
                            validation.errors.forEach((error: string) => {
                                let p = document.createElement('p');
                                p.innerText = error;
                                p.style.color = "#eb5757";
                                p.setAttribute('aria-live', 'polite');
                                p.setAttribute('role', 'alert');
                                div.append(p);
                                this.errorMap[field]++;
                            });
                            insertAfter(div, input!.parentNode!.lastElementChild);
                            // Associate error with input field
                            input!.setAttribute('aria-describedby', errorId);
                        }
                    }

                    input!.classList.add("error");

                }
            } else {
                /* This handles the case where the field is not in the manifest.. 
                we only want to make it red if its REQUIRED. */
                if (required_fields.includes(field)) {
                    let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');
                    input!.classList.add("error");

                    if (this.shadowRoot!.querySelector(`.${field}-error-div`)) {
                        let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
                        error_div!.parentElement!.removeChild(error_div!);
                    }
                    this.errorMap[field] = 0;
                    let div = document.createElement('div');
                    div.classList.add(`${field}-error-div`);
                    const errorId = `${field}-error-${Date.now()}`;
                    div.id = errorId;
                    let p = document.createElement('p');
                    p.innerText = `${field} is required and is missing from your manifest.`;
                    p.style.color = "#eb5757";
                    p.setAttribute('aria-live', 'polite');
                    p.setAttribute('role', 'alert');
                    div.append(p);
                    this.errorMap[field]++;
                    insertAfter(div, input!.parentNode!.lastElementChild);
                    // Associate error with input field
                    input!.setAttribute('aria-describedby', errorId);

                }
            }
        }
        this.validationPromise = undefined;
        if (Object.keys(this.errorMap).length === 0) {
            this.dispatchEvent(errorInTab(false, "info"));
        } else {
            this.dispatchEvent(errorInTab(true, "info"));
        }
    }

    initMissingColors() {
        if (!this.manifest.theme_color) {
            let manifestUpdated = new CustomEvent('manifestUpdated', {
                detail: {
                    field: "theme_color",
                    change: "#000000"
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(manifestUpdated);
        }
        if (!this.manifest.background_color) {
            let manifestUpdated = new CustomEvent('manifestUpdated', {
                detail: {
                    field: "background_color",
                    change: "#000000"
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(manifestUpdated);
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
                // Remove aria-describedby when clearing error
                input.removeAttribute('aria-describedby');
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
                const errorId = `${fieldName}-error-${Date.now()}`;
                div.id = errorId;
                this.errorMap[fieldName!] = 0;
                validation.errors.forEach((error: string) => {
                    let p = document.createElement('p');
                    p.innerText = error;
                    p.style.color = "#eb5757";
                    p.setAttribute('aria-live', 'polite');
                    p.setAttribute('role', 'alert');
                    div.append(p);
                    this.errorMap[fieldName!]++;
                });
                insertAfter(div, input!.parentNode!.lastElementChild);
                // Associate error with input field
                input.setAttribute('aria-describedby', errorId);
            }
            input.classList.add("error");
        }
        if (Object.keys(this.errorMap).length == 0) {
            this.dispatchEvent(errorInTab(false, "info"));
        } else {
            this.dispatchEvent(errorInTab(true, "info"));
        }
    }

    handleColorSwitch(field: string) {
        let input = (this.shadowRoot!.getElementById(field + "_picker") as HTMLInputElement);
        let color = input.value;
        let manifestUpdated = new CustomEvent('manifestUpdated', {
            detail: {
                field: field,
                change: color
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(manifestUpdated);

        let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
            detail: {
                field: field,
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(fieldChangeAttempted);

        if (input.classList.contains("error-color-field")) {
            input.classList.toggle("error-color-field");
            delete this.errorMap[field];
            // Remove aria-describedby when clearing error
            input.removeAttribute('aria-describedby');
            let last = input!.parentNode!.parentNode!.lastElementChild;
            input!.parentNode!.parentNode!.removeChild(last!)
        }

        if (Object.keys(this.errorMap).length == 0) {
            this.dispatchEvent(errorInTab(false, "info"));
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
                <h3 class=${classMap(this.decideFocus("name"))}>Name<span class="required-asterisk">*</span></h3>
                <manifest-field-tooltip .field=${"name"}></manifest-field-tooltip>
              </div>

              <p class="field-desc">(required)</p>
            </div>
            <p class="field-desc">The name of your app as displayed to the user</p>
            <wa-input placeholder="PWA Name" value=${this.manifest.name! || ""} data-field="name" @change=${this.handleInputChange} required></wa-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("short_name"))}>Short Name<span class="required-asterisk">*</span></h3>
                <manifest-field-tooltip .field=${"short_name"}></manifest-field-tooltip>
              </div>

              <p class="field-desc">(required)</p>
            </div>
            <p class="field-desc">Used in app launchers</p>
            <wa-input placeholder="PWA Short Name" value=${this.manifest.short_name! || ""} data-field="short_name" @change=${this.handleInputChange} required></wa-input>
          </div>
        </div>

        <div class="form-row long">
          <div class="form-field">
            <div class="field-header">
            <div class="header-left">
              <h3 class=${classMap(this.decideFocus("id"))}>Id</h3>
              <manifest-field-tooltip .field=${"id"}></manifest-field-tooltip>
            </div>
            </div>
            <p class="field-desc">Unique identifier for your PWA that is seperate from fields that could change over time (like name or short name)</p>
            <wa-input 
              placeholder="id" 
              value=${this.manifest.id ?? ""} 
              data-field="id" 
              @change=${this.handleInputChange}></wa-input>
          </div>
        </div>
        
        <div class="form-row long">
          <div class="form-field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("description"))}>Description</h3>
                <manifest-field-tooltip .field=${"description"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">Used in app storefronts and install dialogs</p>
            <wa-textarea placeholder="PWA Description" value=${this.manifest.description! || ""} data-field="description" @change=${this.handleInputChange} resize="none"></wa-textarea>
          </div>
        </div>
        <div class="form-row color-row">
          <div class="form-field color_field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("background_color"))}>Background Color</h3>
                <manifest-field-tooltip .field=${"background_color"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">Select a Background color</p>
            <span class="color-holder">
              <div class="color-section">
                <wa-color-picker id="background_color_picker" value=${this.manifest.background_color! || defaultColor} ?hoist=${true} data-field="background_color" @change=${() => this.handleColorSwitch("background_color")}></wa-color-picker>
                <p id="background_color_string" class="color_string">${this.manifest.background_color?.toLocaleUpperCase() || defaultColor}</p>
              </div>
            </span>
          </div>
          <div class="form-field color_field">
            <div class="field-header">
              <div class="header-left">
                <h3 class=${classMap(this.decideFocus("theme_color"))}>Theme Color</h3>
                <manifest-field-tooltip .field=${"theme_color"}></manifest-field-tooltip>
              </div>
            </div>
            <p class="field-desc">Select a Theme color</p>
            <span class="color-holder">
              <div class="color-section">
                <wa-color-picker id="theme_color_picker" value=${this.manifest.theme_color! || defaultColor} ?hoist=${true} data-field="theme_color" @change=${() => this.handleColorSwitch("theme_color")}></wa-color-picker>
                <p id="theme_color_string" class="color_string">${this.manifest.theme_color?.toLocaleUpperCase() || defaultColor}</p>
              </div>
            </span>
          </div>
        </div>
      </div>
    `;
    }
}