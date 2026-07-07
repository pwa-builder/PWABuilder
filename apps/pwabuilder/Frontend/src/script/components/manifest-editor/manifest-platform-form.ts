import { LitElement, html, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { manifestPlatformFormStyles } from "./manifest-platform-form.styles";
import type { singleFieldValidation } from '../../models/single-field-validation';
import type { Manifest, ProtocolHandler, RelatedApplication, ShortcutItem } from '../../models/manifest';
import { classMap } from 'lit/directives/class-map.js';
import "./manifest-field-tooltip";
import { errorInTab, insertAfter } from "../../utils/helpers";
import { standardCategories } from "../../../locales/categories";
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
import '@awesome.me/webawesome/dist/components/details/details.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/select/select.js';

const platformOptions: Array<string> = ["windows", "chrome_web_store", "play", "itunes", "webapp", "f-droid", "amazon"]
const platformText: Array<string> = ["Windows Store", "Google Chrome Web Store", "Google Play Store", "Apple App Store", "Web apps", "F-droid", "Amazon App Store"]

const platformFields = ["iarc_rating_id", "prefer_related_applications", "related_applications", "shortcuts", "protocol_handlers", "categories", "edge_side_panel"];
let manifestInitialized: boolean = false;
let fieldsValidated: boolean = false;

@customElement('manifest-platform-form')
export class ManifestPlatformForm extends LitElement {

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

    @state() shortcutHTML: TemplateResult[] = [];
    @state() protocolHTML: TemplateResult[] = [];
    @state() relatedAppsHTML: TemplateResult[] = [];
    @state() errorMap: any = {};

    private shouldValidateAllFields: boolean = true;
    private validationPromise: Promise<void> | undefined;

    static styles = [manifestPlatformFormStyles];

    constructor() {
        super();
    }

    firstUpdated() {

    }

    protected async updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {

        let field = this.shadowRoot!.querySelector('[data-field="' + this.focusOn + '"]');
        if (this.focusOn && field) {
            setTimeout(() => { field!.scrollIntoView({ block: "end", behavior: "smooth" }) }, 500)
        }

        /* The first two checks are to reset the view with the most up to date manifest fields.
         The last check prevents the dropdown selector in related apps from causing everything
         to reset when it changes. It triggers an update event which would cause all of this to
         run again. Its true purpose is to keep the view aligned with the manifest. */

        if (manifestInitialized) {
            manifestInitialized = false;
            if (!fieldsValidated) {
                this.requestValidateAllFields();
                fieldsValidated = true;
            }
            //this.reset();
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
        for (let i = 0; i < platformFields.length; i++) {
            let field = platformFields[i];

            if (this.manifest[field]) {
                const { validateSingleField } = await import('@pwabuilder/manifest-validation');
                const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);
                let passed = validation!.valid;
                let input = this.shadowRoot!.querySelector('[data-field="' + field + '"]');

                if (!passed) {
                    // Remove old errors
                    if (this.shadowRoot!.querySelector(`.${field}-error-div`)) {
                        let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
                        error_div!.parentElement!.removeChild(error_div!);
                    }

                    // update error list with new errors
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

                    // add red outline
                    input!.classList.add("error");
                }
            }
        }

        this.validationPromise = undefined;
        if (Object.keys(this.errorMap).length === 0) {
            this.dispatchEvent(errorInTab(false, "platform"));
        } else {
            this.dispatchEvent(errorInTab(true, "platform"));
        }
    }

    reset() {
        this.initCatGrid();
        this.requestUpdate();
        fieldsValidated = false;
    }

    initCatGrid() {
        if (this.manifest.categories) {
            let checks = this.shadowRoot!.querySelectorAll(".cat-check");
            checks.forEach((cat: any) => {
                if (this.manifest.categories!.includes(cat.value)) {
                    cat.checked = true;
                } else {
                    cat.checked = false;
                }
            });
        }
    }

    dispatchUpdateEvent(field: string, change: any, removal: boolean = false) {
        let manifestUpdated = new CustomEvent('manifestUpdated', {
            detail: {
                field: field,
                change: change,
                removal: removal
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(manifestUpdated);

        if (removal) {
            let input = this.shadowRoot!.querySelector(`[data-field=${field}]`);
            if (input!.classList.contains("error")) {
                input!.classList.toggle("error");
                delete this.errorMap[field!];
                // Remove aria-describedby when clearing error
                input!.removeAttribute('aria-describedby');
                let last = input!.parentNode!.lastElementChild
                input!.parentNode!.removeChild(last!)
            }
            if (Object.keys(this.errorMap).length == 0) {
                this.dispatchEvent(errorInTab(false, "platform"));
            }
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

        if (fieldName === "prefer_related_applications") {
            updatedValue = JSON.parse(updatedValue);
        }

        // special situation for edge side panel
        // since its value is an object we have to validate an object not a string
        let objectValue = {};
        let useOV = false;
        if (fieldName === "edge_side_panel") {
            if (updatedValue === "") {
                this.dispatchUpdateEvent(fieldName, 0, true)
                return;
            }
            objectValue = { "preferred_width": parseInt(updatedValue) };
            useOV = true;
        }

        const { validateSingleField } = await import('@pwabuilder/manifest-validation');
        const validation: singleFieldValidation = await validateSingleField(fieldName!, useOV ? objectValue : updatedValue)
        let passed = validation!.valid;

        if (passed) {
            // Since we already validated, we only send valid updates.
            this.dispatchUpdateEvent(fieldName!, useOV ? objectValue : updatedValue, false)

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
                this.errorMap[fieldName!] = 0;
                let div = document.createElement('div');
                div.classList.add(`${fieldName}-error-div`);
                const errorId = `${fieldName}-error-${Date.now()}`;
                div.id = errorId;
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

            // toggle error class to display error.
            input.classList.add("error");
        }

        if (Object.keys(this.errorMap).length == 0) {
            this.dispatchEvent(errorInTab(false, "platform"));
        } else {
            this.dispatchEvent(errorInTab(true, "platform"));
        }
    }

    addFieldToHTML(field: string) {
        if (field === "shortcuts") {
            this.shortcutHTML.push(
                html`
          <form @submit=${(e: any) => this.addShortcutToManifest(e)} class="field-holder">
            <div class="editable">
              <h4 class="shortcut-header">Shortcut #${this.manifest.shortcuts ? this.manifest.shortcuts.length + 1 : 1}</h4>
              <wa-button class="icon-close" appearance="plain" aria-label="close" style="font-size: 1rem;" @click="${() => this.shortcutHTML = []}"><wa-icon name="x-lg"></wa-icon></wa-button>
            </div>
            <wa-input class="field-input" name="name" placeholder="Shortcut name" /></wa-input>
            <wa-input class="field-input" name="url" placeholder="Shortcut url" /></wa-input>
            <wa-input class="field-input" name="desc" placeholder="Shortcut description" /></wa-input>
            <wa-button type="submit">Add to Manifest</wa-button>
          </form>
        `
            );
        } else if (field === "protocol_handlers") {
            this.protocolHTML.push(
                html`
          <form class="field-holder" @submit=${(e: any) => this.addProtocolToManifest(e)}>
            <div class="editable">
              <h4 class="shortcut-header">Protocol Handler #${this.manifest.protocol_handlers ? this.manifest.protocol_handlers.length + 1 : 1}</h4>
              <wa-button class="icon-close" appearance="plain" aria-label="close" style="font-size: 1rem;" @click="${() => this.protocolHTML = []}"><wa-icon name="x-lg"></wa-icon></wa-button>
            </div>
            <wa-input class="field-input" name="protocol" placeholder="Protocol" /></wa-input>
            <wa-input class="field-input" name="url" placeholder="URL" /></wa-input>
            <wa-button type="submit">Add to Manifest</wa-button>
          </form>
        `
            );
        } else {
            this.relatedAppsHTML!.push(
                html`
          <form class="field-holder" @submit=${(e: any) => this.addRelatedAppToManifest(e)}>
            <div class="editable">
              <h4 class="shortcut-header">Related App #${this.manifest.related_applications ? this.manifest.related_applications.length + 1 : 1}</h4>
              <wa-button class="icon-close" appearance="plain" aria-label="close" style="font-size: 1rem;" @click="${() => this.relatedAppsHTML = []}"><wa-icon name="x-lg"></wa-icon></wa-button>
            </div>
            <wa-select placeholder="Select a Platform" ?hoist=${true} placement="bottom">
              ${platformOptions.map((_, i: number) => html`<wa-option value=${platformOptions[i]}>${platformText[i]}</wa-option>`)}
            </wa-select>
            <wa-input class="field-input" name="url" placeholder="App URL" /></wa-input>
            <wa-input class="field-input" name="id" placeholder="App ID" /></wa-input>
            <wa-button type="submit">Add to Manifest</wa-button>
          </form>
        `
            );
        }
        this.requestUpdate();
    }

    addShortcutToManifest(e: any) {
        e.preventDefault();

        let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
            detail: {
                field: "shortcuts",
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(fieldChangeAttempted);

        this.shortcutHTML = [];
        const inputs = [...e.target.querySelectorAll('wa-input')];

        this.updateShortcutsInManifest(inputs, true);
    }

    async updateShortcutsInManifest(inputs: any, push: boolean, removal: boolean = false) {
        if (push) {
            let name = inputs.filter((input: any) => input.name === "name")[0].value;
            let url = inputs.filter((input: any) => input.name === "url")[0].value;
            let desc = inputs.filter((input: any) => input.name === "desc")[0].value;

            let scObject: ShortcutItem;

            scObject = {
                name: name,
                url: url,
                description: desc
            }

            if (!this.manifest.shortcuts) {
                this.manifest.shortcuts = []
            }

            this.manifest.shortcuts?.push(scObject)
            this.validatePlatformList("shortcuts", this.manifest.shortcuts!, removal);
        }
        if (this.manifest.shortcuts!.length == 0 && !push) {
            this.dispatchUpdateEvent("shortcuts", 0, true)
        }
    }


    addProtocolToManifest(e: any) {
        e.preventDefault();

        let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
            detail: {
                field: "protocol_handlers",
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(fieldChangeAttempted);

        this.protocolHTML = [];
        const inputs = [...e.target.querySelectorAll('wa-input')];

        this.updateProtocolsInManifest(inputs, true);
    }

    async updateProtocolsInManifest(inputs: any, push: boolean, removal: boolean = false) {

        if (push) {
            let protocol: string = inputs.filter((input: any) => input.name === "protocol")[0].value;
            let url: string = inputs.filter((input: any) => input.name === "url")[0].value;

            const pObject: ProtocolHandler = {
                protocol: protocol,
                url: url
            }

            if (!this.manifest.protocol_handlers) {
                this.manifest.protocol_handlers = []
            }

            this.manifest.protocol_handlers?.push(pObject);
            this.validatePlatformList("protocol_handlers", this.manifest.protocol_handlers!, removal);
        }

        if (this.manifest.protocol_handlers!.length == 0 && !push) {
            this.dispatchUpdateEvent("protocol_handlers", 0, true)
        }

    }

    addRelatedAppToManifest(e: any) {
        e.preventDefault();
        this.relatedAppsHTML = [];
        const inputs = [...e.target.querySelectorAll('wa-input')];
        const select = e.target.querySelector('wa-select');

        let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
            detail: {
                field: "related_applications",
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(fieldChangeAttempted);

        this.updateRelatedAppsInManifest(inputs, select, true);


    }

    async updateRelatedAppsInManifest(inputs: any, select: any, push: boolean, removal: boolean = false) {

        if (push) {
            let platform: string = select.value;
            let url: string = inputs.filter((input: any) => input.name === "url")[0].value;
            let id: string = inputs.filter((input: any) => input.name === "id")[0].value;

            const appObject: RelatedApplication = {
                platform: platform,
                url: url,
                id: id
            }

            if (!this.manifest.related_applications) {
                this.manifest.related_applications = []
            }

            this.manifest.related_applications?.push(appObject);

            this.validatePlatformList("related_applications", this.manifest.related_applications!, removal);
        }

        if (this.manifest.related_applications!.length == 0 && !push) {
            this.dispatchUpdateEvent("related_applications", 0, true)
        }
    }

    updateCategories() {
        let categories: string[] = [];
        let checks = this.shadowRoot!.querySelectorAll(".cat-check");
        checks.forEach((cat: any) => {
            if (cat.checked) {
                categories.push(cat.value);
            }
        });

        let fieldChangeAttempted = new CustomEvent('fieldChangeAttempted', {
            detail: {
                field: "categories",
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(fieldChangeAttempted);

        this.validatePlatformList("categories", categories, (categories.length == 0));
    }

    async validatePlatformList(field: string, updatedValue: any[], removal: boolean = false) {
        if (this.validationPromise) {
            await this.validationPromise;
        }

        let input = this.shadowRoot!.querySelector(`[data-field=${field}]`);
        const { validateSingleField } = await import('@pwabuilder/manifest-validation');
        const validation: singleFieldValidation = await validateSingleField(field, updatedValue);
        let passed = validation!.valid;

        if (passed || removal) {
            this.dispatchUpdateEvent(field!, [...updatedValue], removal)
        }

        if (passed) {

            if (input!.classList.contains("error")) {
                input!.classList.toggle("error");
                delete this.errorMap[field];
                // Remove aria-describedby when clearing error
                input!.removeAttribute('aria-describedby');
                let last = input!.parentNode!.lastElementChild;
                last!.parentNode!.removeChild(last!);
            }
            this.requestUpdate();

            if (this.errorMap.length === 0) {
                this.dispatchEvent(errorInTab(false, "platform"));
            } else {
                this.dispatchEvent(errorInTab(true, "platform"));
            }

        } else {
            if (this.shadowRoot!.querySelector(`.${field}-error-div`)) {
                let error_div = this.shadowRoot!.querySelector(`.${field}-error-div`);
                error_div!.parentElement!.removeChild(error_div!);
            }

            // update error list
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

            input!.classList.add("error");

        }

        (Object.keys(this.errorMap).length);
        if (Object.keys(this.errorMap).length == 0) {
            this.dispatchEvent(errorInTab(false, "platform"));
        } else {
            this.dispatchEvent(errorInTab(true, "platform"));
        }

        return passed;
    }


    async removeData(tag: string) {
        const split_tag = tag.split(" ");
        const field = split_tag[0]
        const index = parseInt(split_tag[1]);

        if (field === "shortcuts") {
            this.manifest.shortcuts = this.manifest.shortcuts!.filter((_item: any, i: number) => i != index);
            this.updateShortcutsInManifest([], false, true);
        } else if (field === "protocol") {
            this.manifest.protocol_handlers = this.manifest.protocol_handlers!.filter((_item: any, i: number) => i != index);
            this.updateProtocolsInManifest([], false, true);
        } else if (field === "related") {
            this.manifest.related_applications = this.manifest.related_applications!.filter((_item: any, i: number) => i != index);
            this.updateRelatedAppsInManifest([], [], false, true);
        } else {
            return console.error(`${field} not an accepted value for this function`);
        }

        this.requestUpdate();
    }

    updateExistingData(tag: string) {
        const split_tag = tag.split(" ");
        const field = split_tag[0]
        const i = parseInt(split_tag[1]);

        const inputs = [...this.shadowRoot!.querySelectorAll('wa-input[data-tag="' + tag + '"]')];
        const select = this.shadowRoot!.querySelector('wa-select[data-tag="' + tag + '"]');

        if (field === "shortcuts") {

            let name = (inputs.filter((input: any) => input.name === "name")[0] as HTMLInputElement).value;
            let url = (inputs.filter((input: any) => input.name === "url")[0] as HTMLInputElement).value;
            let src = (inputs.filter((input: any) => input.name === "src")[0] as HTMLInputElement).value;
            let desc = (inputs.filter((input: any) => input.name === "desc")[0] as HTMLInputElement).value;

            let scObject: ShortcutItem;

            if (src.length == 0) {
                scObject = {
                    name: name,
                    url: url,
                    description: desc
                }
            } else {
                scObject = {
                    name: name,
                    url: url,
                    icons: [
                        {
                            src: src
                        }
                    ],
                    description: desc
                }
            }

            this.manifest.shortcuts!.splice(i, 1, scObject);

            this.validatePlatformList("shortcuts", this.manifest.shortcuts!);

        } else if (field === "protocol") {
            let protocol: string = (inputs.filter((input: any) => input.name === "protocol")[0] as HTMLInputElement).value;
            let url: string = (inputs.filter((input: any) => input.name === "url")[0] as HTMLInputElement).value;

            const pObject: ProtocolHandler = {
                protocol: protocol,
                url: url
            }

            this.manifest.protocol_handlers!.splice(i, 1, pObject);

            this.validatePlatformList("protocol_handlers", this.manifest.protocol_handlers!);

        } else {
            let platform: string = (select as HTMLSelectElement).value;
            let url: string = (inputs.filter((input: any) => input.name === "url")[0] as HTMLInputElement).value;
            let id: string = (inputs.filter((input: any) => input.name === "id")[0] as HTMLInputElement).value;

            const appObject: RelatedApplication = {
                platform: platform,
                url: url,
                id: id
            }

            this.manifest.related_applications!.splice(i, 1, appObject);

            this.validatePlatformList("related_applications", this.manifest.related_applications!);
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
              <h3 class=${classMap(this.decideFocus("iarc_rating_id"))}>IARC Rating ID</h3>
              <manifest-field-tooltip .field=${"iarc_rating_id"}></manifest-field-tooltip>
            </div>
            <p>Displays the suitable ages for your PWA</p>
            <wa-input placeholder="PWA IARC Rating ID" value=${this.manifest.iarc_rating_id! || ""} data-field="iarc_rating_id" @change=${this.handleInputChange}></wa-input>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3 class=${classMap(this.decideFocus("prefer_related_applications"))}>Prefer Related Applications</h3>
              <manifest-field-tooltip .field=${"prefer_related_applications"}></manifest-field-tooltip>
            </div>
            <p>Should a user prefer a related app to this one</p>
            <wa-select placeholder="Select an option" data-field="prefer_related_applications" ?hoist=${true} @change=${this.handleInputChange} value=${JSON.stringify(this.manifest.prefer_related_applications!) || ""}>
              <wa-option value="true">true</wa-option>
              <wa-option value="false">false</wa-option>
            </wa-select>
          </div>
        </div>
        <div class="long-items">
          <div class="form-field">
            <div class="field-header">
              <h3 class=${classMap(this.decideFocus("related_applications"))}>Related Applications</h3>
              <manifest-field-tooltip .field=${"related_applications"}></manifest-field-tooltip>
            </div>
            <p>Applications that provide similar functionality to your PWA</p>
            <wa-details class="field-details" summary="Click to edit related apps" data-field="related_applications">
              <wa-button @click=${() => this.addFieldToHTML("related_applications")} ?disabled=${this.relatedAppsHTML.length != 0}>Add App</wa-button>
              <div class="items-holder">
                ${this.manifest.related_applications && Array.isArray(this.manifest.related_applications) ? this.manifest.related_applications.map((app: any, i: number) =>
            html`
                    <div class="field-holder">
                      <div class="editable">
                        <h4 class="shortcut-header">Related App #${i + 1}</h4>
                        <wa-button class="icon-close" appearance="plain" aria-label="close" style="font-size: 1rem;" data-tag=${"related " + i.toString()} @click=${() => this.removeData("related " + i.toString())}><wa-icon name="x-lg"></wa-icon></wa-button>
                      </div>
                      <wa-select placeholder="Select a Platform" placement="bottom" ?hoist=${true} value=${app.platform || ""} name="platform" data-tag=${"related " + i.toString()} @change=${() => this.updateExistingData("related " + i.toString())}>
                        ${platformOptions.map((_, i: number) => html`<wa-option value=${platformOptions[i]}>${platformText[i]}</wa-option>`)}
                      </wa-select>
                      <wa-input class="field-input" placeholder="App URL" value=${app.url || ""} name="url" data-tag=${"related " + i.toString()} @change=${() => this.updateExistingData("related " + i.toString())}></wa-input>
                      <wa-input class="field-input" placeholder="App ID" value=${app.id || ""} name="id" data-tag=${"related " + i.toString()} @change=${() => this.updateExistingData("related " + i.toString())}></wa-input>
                    </div>
                  `
        ) : html``}
                ${this.relatedAppsHTML ? this.relatedAppsHTML.map((ele: TemplateResult) => ele) : html``}
              </div>
            </wa-details>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3 class=${classMap(this.decideFocus("shortcuts"))}>Shortcuts</h3>
              <manifest-field-tooltip .field=${"shortcuts"}></manifest-field-tooltip>
            </div>
            <p>Links to key tasks or pages within your PWA</p>
            <wa-details class="field-details" summary="Click to edit shortcuts" data-field="shortcuts">
              <wa-button @click=${() => this.addFieldToHTML("shortcuts")} ?disabled=${this.shortcutHTML.length != 0}>Add Shortcut</wa-button>
              <div class="items-holder">
                ${this.manifest.shortcuts && Array.isArray(this.manifest.shortcuts) ? this.manifest.shortcuts!.map((sc: any, i: number) =>
            html`
                    <div class="field-holder">
                      <div class="editable">
                        <h4 class="shortcut-header">Shortcut #${i + 1}</h4>
                        <wa-button class="icon-close" appearance="plain" aria-label="close" style="font-size: 1rem;" data-tag=${"shortcuts " + i.toString()} @click=${() => this.removeData("shortcuts " + i.toString())}><wa-icon name="x-lg"></wa-icon></wa-button>                      
                      </div>
                      <wa-input class="field-input" name="name" placeholder="Shortcut name" value=${sc.name || ""} data-tag=${"shortcuts " + i.toString()} @change=${() => this.updateExistingData("shortcuts " + i.toString())}></wa-input>
                      <wa-input class="field-input" name="url" placeholder="Shortcut url" value=${sc.url || ""} data-tag=${"shortcuts " + i.toString()} @change=${() => this.updateExistingData("shortcuts " + i.toString())}></wa-input>
                      <wa-input class="field-input" name="desc" placeholder="Shortcut description" value=${sc.description || ""} data-tag=${"shortcuts " + i.toString()} @change=${() => this.updateExistingData("shortcuts " + i.toString())}></wa-input>
                    </div>
                  `
        ) : html``}
                ${this.shortcutHTML.map((ele: TemplateResult) => ele)}
                </div>
            </wa-details>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3 class=${classMap(this.decideFocus("protocol_handlers"))}>Protocol Handlers</h3>
              <manifest-field-tooltip .field=${"protocol_handlers"}></manifest-field-tooltip>
            </div>
            <p>Protocols this web app can register and handle</p>
            <wa-details class="field-details" summary="Click to edit protocol handlers" data-field="protocol_handlers">
              <wa-button @click=${() => this.addFieldToHTML("protocol_handlers")} ?disabled=${this.protocolHTML.length != 0}>Add Protocol</wa-button>
              <div class="items-holder">
                ${this.manifest.protocol_handlers && Array.isArray(this.manifest.protocol_handlers) ? this.manifest.protocol_handlers.map((p: any, i: number) =>
            html`
                    <div class="field-holder">
                      <div class="editable">
                        <h4 class="shortcut-header">Protocol Handler #${i + 1}</h4>
                        <wa-button class="icon-close" appearance="plain" aria-label="close" style="font-size: 1rem;" data-tag=${"protocol " + i.toString()} @click=${() => this.removeData("protocol " + i.toString())}><wa-icon name="x-lg"></wa-icon></wa-button>                      
                      </div>
                      <wa-input class="field-input" name="protocol" placeholder="Protocol" value=${p.protocol || ""} data-tag=${"protocol " + i.toString()} @change=${() => this.updateExistingData("protocol " + i.toString())}></wa-input>
                      <wa-input class="field-input" name="url" placeholder="URL" value=${p.url || ""} data-tag=${"protocol " + i.toString()} @change=${() => this.updateExistingData("protocol " + i.toString())}></wa-input>
                    </div>
                  `
        ) : html``}
                ${this.protocolHTML.map((ele: TemplateResult) => ele)}
                </div>
            </wa-details>
          </div>
          <div class="form-field">
            <div class="field-header">
              <h3 class=${classMap(this.decideFocus("categories"))}>Categories</h3>
              <manifest-field-tooltip .field=${"categories"}></manifest-field-tooltip>
            </div>
            <p>The categories your PWA belongs to</p>
              <div id="cat-field"  data-field="categories">
                ${standardCategories.map((cat: string) =>
            html`<wa-checkbox class="cat-check" size="s" @change=${() => this.updateCategories()} value=${cat} ?checked=${this.manifest.categories?.includes(cat)}>${cat}</wa-checkbox>`
        )}
                    
              </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <div class="field-header">
                <h3 class=${classMap(this.decideFocus("edge_side_panel"))}>Edge Side Panel</h3>
                <manifest-field-tooltip .field=${"edge_side_panel"}></manifest-field-tooltip>
              </div>
              <p>Indicates whether your PWA supports the side panel in Microsoft Edge</p>
              <wa-input 
                type="number"
                placeholder="Preferred Width" 
                value=${this.manifest.edge_side_panel?.preferred_width ?? ""} 
                data-field="edge_side_panel" 
                @change=${this.handleInputChange}></wa-input>
            </div>
          </div>
        </div>
      </div>
    `;
    }
}