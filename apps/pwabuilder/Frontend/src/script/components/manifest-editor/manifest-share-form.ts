import type { singleFieldValidation } from '../../models/single-field-validation';
import type { Manifest, FilesParams } from '../../models/manifest';
import { LitElement, html, PropertyValueMap } from 'lit';
import { manifestShareFormStyles } from "./manifest-share-form.styles";
import { customElement, property, state } from 'lit/decorators.js';
//import {classMap} from 'lit/directives/class-map.js';
import "./manifest-field-tooltip";
import "./search-extensions";
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import type WaSelect from '@awesome.me/webawesome/dist/components/select/select.js';
import { errorInTab, insertAfter } from "../../utils/helpers";
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/option/option.js';


let manifestInitialized = false;

@customElement('manifest-share-form')
export class ManifestShareForm extends LitElement {

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
    @property({ type: String }) focusOn: string = "";

    @state() addingTarget: boolean = false;
    @state() removeClicked: boolean = false;
    @state() postSelected: boolean = false;
    @state() files: any = [];
    @state() numOfFiles: number = 0;
    @state() filteredList: string[] = [];
    @state() confirmRemove: boolean = false;

    private shouldValidateAllFields: boolean = true;
    private validationPromise: Promise<void> | undefined;
    private errorCount: number = 0;
    private fileError: number = 0;

    static styles = [manifestShareFormStyles];

    constructor() {
        super();
    }


    protected async updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        if (manifestInitialized) {
            manifestInitialized = false;
            this.errorCount = 0;
            this.requestValidateAllFields();
        }

        // inital validation for action being required
        let input = (this.shadowRoot!.querySelector(`[data-field="share_target.action"]`) as unknown as WaInput);
        if (input && (input.value ?? '').length === 0) {
            input.classList.add("error");
            let container = (this.shadowRoot!.querySelector(`.action-error-message`) as HTMLElement);
            container!.style.display = "block";
            this.errorCount++;
        }

        // initial validation for method = GET or POST
        const validMethods: string[] = ["GET", "POST"]
        let select: WaSelect = this.shadowRoot!.querySelector(`wa-select[data-field="share_target.method"]`) as unknown as WaSelect;
        let container = (this.shadowRoot!.querySelector(`.method-error-message`) as HTMLElement);

        let listedMethod = "";
        (this.manifest.share_target && this.manifest.share_target.method) ? listedMethod = this.manifest.share_target!.method : listedMethod = "";

        if (listedMethod && !validMethods.includes(listedMethod)) {
            select.classList.add("error");
            container.style.display = "block";
            this.errorCount++;
        } else {
            if (select) select.classList.remove("error");
            if (container) container!.style.display = "none";
            if (this.errorCount > 0) this.errorCount--;
        }

        // initial validaiton for params being required
        let param_inputs: NodeList = this.shadowRoot!.querySelectorAll(".params");
        let all_empty = this.areParamsEmpty(param_inputs)

        if (this.addingTarget && param_inputs && all_empty && !this.manifest.share_target?.params?.files) {
            this.parameterErrors(true)
        }

        // validation for enctype being required if you specify post
        let enc_input = (this.shadowRoot!.querySelector(`[data-field="share_target.enctype"]`) as unknown as WaInput);
        if (this.postSelected && enc_input && (enc_input.value ?? '').length === 0) {

            // place error border 
            enc_input.classList.add("error")

            // place error message
            let error_div = (this.shadowRoot!.querySelector(`.enctype-error-message`) as HTMLElement);
            if (error_div) {
                error_div.style.display = "block";
            }
            this.errorCount++;
        }
        this.handleErrorCount()
    }

    handleErrorCount() {
        if (this.errorCount == 0 && this.fileError == 0) {
            this.dispatchEvent(errorInTab(false, "share"));
        } else {
            this.dispatchEvent(errorInTab(true, "share"));
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
        let field = "share_target";

        if (this.manifest[field]) {
            const { validateSingleField } = await import('@pwabuilder/manifest-validation');
            const validation: singleFieldValidation = await validateSingleField(field, this.manifest[field]);

            let passed = validation!.valid;

            if (!passed) {
                if (this.shadowRoot!.querySelectorAll('.error-message')) {
                    let error_divs = this.shadowRoot!.querySelectorAll('.error-message');
                    error_divs.forEach((error: any) => error!.parentElement!.removeChild(error!));
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
                        insertAfter(p, title!.parentNode!.parentNode);
                        this.errorCount++;
                    });
                }
            }
        }
        this.validationPromise = undefined;
        this.handleErrorCount();
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (this.manifest.share_target?.method === "POST") {
            this.postSelected = true;
        }
        if (this.manifest.share_target?.params?.files) {
            this.composeFiles(this.manifest!.share_target!.params!.files!);
        }
    }

    decideFocus(field: string) {
        let decision = this.focusOn === field;
        return { focus: decision }
    }

    toggleForm(adding: boolean) {
        this.confirmRemove = false;
        if (adding) {
            this.addingTarget = true;
            this.removeClicked = false;
            let manifestUpdated = new CustomEvent('manifestUpdated', {
                detail: {
                    field: "share_target",
                    change: { method: "GET" }
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(manifestUpdated);

        } else {
            this.confirmRemove = true;
        }

    }

    handleMethodChange() {
        let select = (this.shadowRoot!.querySelector(".method") as unknown as WaSelect);
        this.postSelected = select.value === "POST";
        this.handleTopLevelInputChange("method");
    }

    composeFiles(data: FilesParams[]) {
        if (data) {
            this.files = [];
            for (let i = 0; i < data.length; i++) {
                let file: FilesParams = data[i];

                this.files.push({
                    index: i,
                    html: html`
          <search-extensions 
            .index=${i} 
            .empty=${false} 
            .file=${file} 
            .share_target=${this.manifest.share_target} 
            @fileChanged=${(e: CustomEvent) => this.handleFileChange(e)}
            @deleteFilte=${(e: CustomEvent) => this.removeFile(e)}
            @errorTracker=${(e: CustomEvent) => this.handleFileError(e)}>
          </search-extensions>
        `})
                this.numOfFiles++;
            }
        }
    }

    handleFileError(e: CustomEvent) {
        this.fileError = e.detail.count;
        this.handleErrorCount();
    }

    parameterErrors(addingErrors: boolean) {

        let param_inputs = this.shadowRoot!.querySelectorAll(".params");
        if (addingErrors) {
            for (let i = 0; i < param_inputs.length; i++) {
                let param = (param_inputs[i] as WaInput);
                param.classList.add("error");
            }
            let error_div = (this.shadowRoot!.querySelector(`.params-error-message`) as HTMLElement);
            if (error_div) {
                error_div.style.display = "block";
            }
            this.errorCount++;

        } else {
            // remove error fields
            if (param_inputs) {
                for (let i = 0; i < param_inputs.length; i++) {
                    let param = (param_inputs[i] as WaInput);
                    param.classList.remove("error");
                }
                let error_div = (this.shadowRoot!.querySelector(`.params-error-message`) as HTMLElement);
                if (error_div) {
                    error_div.style.display = "none";
                }
                this.errorCount--;
            }
        }
    }

    areParamsEmpty(param_inputs: NodeList): boolean {

        for (let i = 0; i < param_inputs.length; i++) {
            let param = (param_inputs[i] as WaInput);
            if ((param.value ?? '').length !== 0) {
                return false;
            }
        }
        return true;
    }

    pushEmptyFile() {

        this.parameterErrors(false)

        if (!this.manifest.share_target?.params) {
            this.manifest.share_target!["params"] = {};
        }
        if (!this.manifest.share_target?.params.files) {
            this.manifest.share_target!.params!["files"] = [];
        }
        let temp = this.manifest.share_target!


        let index = this.manifest.share_target!.params!.files?.length;
        this.files.push({
            index: index,
            html: html`
      <search-extensions 
        .index=${index} .empty=${true} 
        .share_target=${this.manifest.share_target}  
        @fileChanged=${(e: CustomEvent) => this.handleFileChange(e)}
        @deleteFilte=${(e: CustomEvent) => this.removeFile(e)}
        @errorTracker=${(e: CustomEvent) => this.handleFileError(e)}>
      </search-extensions>   
    `})

        temp.params!.files!.push({
            "name": "",
            "accept": []
        })

        // update manifest
        let manifestUpdated = new CustomEvent('manifestUpdated', {
            detail: {
                field: "share_target",
                change: temp
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(manifestUpdated);
        this.handleErrorCount();
        this.requestUpdate();
    }

    removeFile(e: CustomEvent) {
        let files = this.manifest.share_target?.params?.files;
        let temp_files: FilesParams[] = [];

        // remove matching file
        let i = 0;
        while (files![i].name !== e.detail.file.name) {
            temp_files.push(files![i]);
            i++;
        }

        // the break ensures that we only delete the first of 
        // files with the same name. files shouldn't have the same name
        // so this shouldn't be an issue but just in case
        temp_files.push(...files!.slice(i + 1));

        if (temp_files.length == 0) {
            let param_inputs: NodeList = this.shadowRoot!.querySelectorAll(".params");
            let all_empty = this.areParamsEmpty(param_inputs);
            if (all_empty) {
                this.parameterErrors(true);
            }
        }

        // update changedValue with updated list
        let temp = this.manifest.share_target;
        temp!.params!.files = temp_files;

        // update manifest
        let manifestUpdated = new CustomEvent('manifestUpdated', {
            detail: {
                field: "share_target",
                change: temp
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(manifestUpdated);

        this.composeFiles(temp_files);

    }

    renderFiles() {
        return this.files;
    }

    async handleTopLevelInputChange(field: string) {
        const form = (this.shadowRoot!.querySelector('form') as HTMLFormElement);
        const formData = new FormData(form);
        const change = (formData.get(field) as string);

        if (field === "method") {
            // validation for method = GET or POST
            const validMethods: string[] = ["GET", "POST"]
            let select: WaSelect = this.shadowRoot!.querySelector(`wa-select[data-field="share_target.method"]`) as unknown as WaSelect;
            let container = (this.shadowRoot!.querySelector(`.method-error-message`) as HTMLElement);

            if (!validMethods.includes(change)) {
                select.classList.add("error");
                container!.style.display = "block";
                this.errorCount++;
            } else {
                select.classList.remove("error");
                container!.style.display = "none";
                this.errorCount--;
            }
        }

        if (field === "enctype" && change.trim() === "") {
            let enc_input = (this.shadowRoot!.querySelector(`[data-field="share_target.enctype"]`) as unknown as WaInput);

            // place error border 
            enc_input.classList.add("error")
            // place error message
            let error_div = (this.shadowRoot!.querySelector(`.enctype-error-message`) as HTMLElement);
            if (error_div) {
                error_div.style.display = "block";
            }
            this.errorCount++;
            this.requestUpdate();
            return;
        } else if (field === "enctype") {
            let enc_input = (this.shadowRoot!.querySelector(`[data-field="share_target.enctype"]`) as unknown as WaInput);
            // place error border 
            enc_input.classList.remove("error")

            // place error message
            let error_div = (this.shadowRoot!.querySelector(`.enctype-error-message`) as HTMLElement);
            if (error_div) {
                error_div.style.display = "none";
            }
            this.errorCount--;
        }

        let temp: any = this.manifest.share_target;
        if (temp) {
            temp[field] = change;
        }

        const { validateSingleField } = await import('@pwabuilder/manifest-validation');
        const validation: singleFieldValidation = await validateSingleField("share_target", temp);
        let passed = validation!.valid;

        if (passed) {
            // remove error border 
            let input = (this.shadowRoot!.querySelector(`[data-field="share_target.${field}"]`) as unknown as WaInput);
            input.classList.remove("error")

            // remove error message
            let error_div = (this.shadowRoot!.querySelector(`.${field}-error-message`) as HTMLElement);
            if (error_div) {
                error_div.style.display = "none";
            }

            // update manifest
            let manifestUpdated = new CustomEvent('manifestUpdated', {
                detail: {
                    field: "share_target",
                    change: temp
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(manifestUpdated);
            this.errorCount--;
        } else {
            // place error border 
            let input = (this.shadowRoot!.querySelector(`[data-field="share_target.action"]`) as unknown as WaInput);
            input.classList.add("error")

            // place error message
            let error_div = (this.shadowRoot!.querySelector(`.${field}-error-message`) as HTMLElement);
            if (error_div) {
                error_div.style.display = "block";
            }
            this.errorCount++;
        }
        this.handleErrorCount();
    }

    async handleParameterInputChange(field: string) {
        const form = (this.shadowRoot!.querySelector('form') as HTMLFormElement);
        const formData = new FormData(form);
        const change = (formData.get(`${field}`) as string);

        if (change.trim() == "") {
            let param_inputs: NodeList = this.shadowRoot!.querySelectorAll(".params");
            let all_empty = this.areParamsEmpty(param_inputs);
            if (all_empty) {
                this.parameterErrors(true);
            }
        }

        let temp: any = this.manifest.share_target;
        if (!temp["params"]) {
            temp["params"] = {}
        }
        if (temp) {
            temp["params"][field] = change;
        }

        const { validateSingleField } = await import('@pwabuilder/manifest-validation');
        const validation: singleFieldValidation = await validateSingleField("share_target", temp);
        let passed = validation!.valid;

        if (passed) {
            this.parameterErrors(false)

            // update manifest
            let manifestUpdated = new CustomEvent('manifestUpdated', {
                detail: {
                    field: "share_target",
                    change: temp
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(manifestUpdated);

        } else {
            // initial validaiton for params being required
            let param_inputs: NodeList = this.shadowRoot!.querySelectorAll(".params");
            let all_empty = this.areParamsEmpty(param_inputs)

            if (param_inputs && all_empty) {
                this.parameterErrors(true)
            }
        }
        this.handleErrorCount();
    }

    async handleFileChange(e: CustomEvent) {
        let file = e.detail.file;

        let temp = this.manifest.share_target!
        temp.params!.files![e.detail.index] = file;

        // update manifest
        let manifestUpdated = new CustomEvent('manifestUpdated', {
            detail: {
                field: "share_target",
                change: temp
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(manifestUpdated);


    }

    renderAddorRemove() {
        if ((this.manifest.share_target && !this.removeClicked) || this.addingTarget) {
            if (!this.confirmRemove) {
                return html`
          <wa-button class="toggle-button" @click=${() => this.toggleForm(false)}><img src="../assets/minus.svg" alt="minus symbol" /> Remove Share Target</wa-button>
        `
            } else {
                return html`
          <div class="confirm">
            <p>Are you sure you want to remove the share target?</p>
            <div id="class-actions">
              <wa-button @click=${() => this.removeShareTarget()}>Yes</wa-button>
              <wa-button @click=${() => this.goBackToAdding()}>No</wa-button>
            </div>
          </div>`
            }
        } else {
            return html`
        <wa-button class="toggle-button" @click=${() => this.toggleForm(true)}><img src="assets/plus.svg" alt="plus symbol" />Add Share Target</wa-button>
      `
        }
    }

    goBackToAdding() {
        this.addingTarget = true;
        this.confirmRemove = false;
    }

    removeShareTarget() {
        this.addingTarget = false;
        this.removeClicked = true;
        this.postSelected = false;
        this.files = [];

        let manifestUpdated = new CustomEvent('manifestUpdated', {
            detail: {
                field: "share_target",
                removal: true
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(manifestUpdated);
    }

    render() {
        return html`
      <div id="form-holder">
        <div id="action-holder">
          ${this.renderAddorRemove()}
        </div>
        

        ${((this.manifest.share_target && !this.removeClicked) || this.addingTarget) ?
                html`
            <div id="extra-step">
              <manifest-field-tooltip .field=${"share_target.extra-step"}></manifest-field-tooltip>
              <a
                class="arrow_anchor"
                href="https://docs.pwabuilder.com/#/home/native-features?id=how-to-share-to-your-pwa"
                rel="noopener"
                target="_blank"
              >
                <p class="arrow_link">Handle receiving share data in your code</p>
                <img
                  src="/assets/new/arrow.svg"
                  alt="arrow"
                />
              </a>
            </div>
            <form id="share-target-form">
              <div class="form-row">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h3>Action</h3>
                      <manifest-field-tooltip .field=${"share_target.action"}></manifest-field-tooltip>
                    </div>

                    <p class="field-desc">(required)</p>
                  </div>
                  <p class="field-desc">The URL for the web share target </p>
                  <wa-input name="action" placeholder="Add action (ex: /share-receiver)" value=${this.manifest.share_target?.action! || ""} @change=${() => this.handleTopLevelInputChange("action")} data-field="share_target.action" required></wa-input>
                  <p class="action-error-message error-message">Action is a required field and must be in the scope of your PWA</p>
                </div>
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h3>Method</h3>
                      <manifest-field-tooltip .field=${"share_target.method"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <p class="field-desc">The HTTP request method to use</p>
                  <wa-select name="method" placeholder="Select a method" class="method" value=${this.manifest.share_target?.method! || "GET"} data-field="share_target.method" @change=${() => this.handleMethodChange()}>
                    <wa-option value=${"GET"}>GET</wa-option>
                    <wa-option value=${"POST"}>POST</wa-option>
                  </wa-select>
                  <p class="method-error-message error-message">Method must be set to GET or POST only.</p>

                </div>
              </div>
              ${this.postSelected ?
                        html`
                <div class="form-row long">
                  <div class="form-field">
                    <div class="field-header">
                      <div class="header-left">
                        <h3>Enctype</h3>
                        <manifest-field-tooltip .field=${"share_target.enctype"}></manifest-field-tooltip>
                      </div>
                    </div>
                    <p class="field-desc">The encoding of the share data when a POST request is used</p>
                    <wa-input name="enctype" placeholder="Add enctype" value=${this.manifest.share_target?.enctype! || ""} @change=${() => this.handleTopLevelInputChange("enctype")} data-field="share_target.enctype"></wa-input>
                    <p class="enctype-error-message error-message">If you have specified POST as your method, specify the encoding of your share data.</p>
                  </div>
                </div>
                ` :
                        html``
                    }
              <div class="form-row long">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h3>Parameters</h3>
                      <!-- <manifest-field-tooltip .field=${"share_target.params"}></manifest-field-tooltip> -->
                    </div>
                    <p class="field-desc">(required)</p>
                  </div>
                  <p class="field-desc">An object to configure the share parameters. The object keys correspond to the data object in navigator.share(). The object values can be specified and will be used as query parameters:</p>
                  <p class="params-error-message error-message">Specifying at least one parameter is required.</p>
                </div>
              </div>
              <div class="form-row multi">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">Title</h4>
                      <manifest-field-tooltip .field=${"share_target.params.title"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <wa-input name="title" class="params" placeholder="Add title" value=${this.manifest.share_target?.params?.title! || ""} @change=${() => this.handleParameterInputChange("title")} data-field="share_target.params.title" required></wa-input>
                </div>
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">Text</h4>
                      <manifest-field-tooltip .field=${"share_target.params.text"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <wa-input name="text" class="params" placeholder="Add text" value=${this.manifest.share_target?.params?.text! || ""} @change=${() => this.handleParameterInputChange("text")} data-field="share_target.params.text" required></wa-input>
                </div>
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">URL</h4>
                      <manifest-field-tooltip .field=${"share_target.params.url"}></manifest-field-tooltip>
                    </div>
                  </div>
                  <wa-input name="url" class="params" placeholder="Add url" value=${this.manifest.share_target?.params?.url! || ""} @change=${() => this.handleParameterInputChange("url")} data-field="share_target.params.url" required></wa-input>
                </div>
              </div>
              <div class="form-row long">
                <div class="form-field">
                  <div class="field-header">
                    <div class="header-left">
                      <h4 class="sub">Files</h4>
                      <!-- <manifest-field-tooltip .field=${"share_target.params.files"}></manifest-field-tooltip> -->
                    </div>
                  </div>
                  <p class="field-desc">An object (or an array of objects) defining which files are accepted by the share target</p>
                  ${this.files.map((file: any) => file.html)}
                  <wa-button id="add-new-file" class="params" @click=${() => this.pushEmptyFile()}>Add File</wa-button>
                </div>
              </div>
              
            </form>
          ` :
                html``
            }
      </div>
    `;
    }
}