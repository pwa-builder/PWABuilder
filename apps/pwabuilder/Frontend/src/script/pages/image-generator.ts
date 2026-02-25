import { LitElement, css, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { localeStrings } from "../../locales";

import "../components/app-header";
import "../components/app-file-input";
import { FileInputDetails, Lazy } from "../utils/interfaces";

import { recordProcessStep, AnalyticsBehavior } from "../utils/analytics";

import "@shoelace-style/shoelace/dist/components/button/button.js";

interface PlatformInformation {
    label: string;
    value: string;
}

type ColorRadioValues = "best guess" | "transparent" | "custom";
const loc = localeStrings.imageGenerator;
const platformsData: Array<PlatformInformation> = [
    { label: loc.windows11, value: "windows11" },
    { label: loc.android, value: "android" },
    { label: loc.ios, value: "ios" }
];

function boolListHasChanged<T>(value: T, unknownValue: T): boolean {
    if (!value || !unknownValue) {
        return false;
    }

    return (value as Object).toString() === (unknownValue as Object).toString();
}

@customElement("image-generator")
export class ImageGenerator extends LitElement {
    @state({ hasChanged: boolListHasChanged })
    platformSelected: Array<boolean> = platformsData.map(() => true);

    @state() files: Lazy<FileList>;

    @state() padding = 0.0;

    @state() colorOption: ColorRadioValues = "transparent";

    // hex color
    @state() color: string = "#ffffff";

    @state() selectAllState = false;

    @state() generating = false;

    @state() generateEnabled = false;

    @state() error: Lazy<string>;

    static get styles() {
        return [
            css`
        :host {
          --loader-size: 1.8em;
          --sl-input-height-medium: 1.5rem;
        }

        h1 {
          font-size: var(--xlarge-font-size);
          line-height: 48px;
          letter-spacing: -0.015em;
          margin: 0;
        }

        h2 {
          font-size: var(--large-font-size);
        }

        p {
          font-size: var(--font-size);
        }

        small {
          display: block;
          font-size: 10px;
        }

        sl-button {
          height: 24px;
          padding: 8px 0;
        }

        sl-button::part(base) {
          margin: 0 16px;
        }

        #image-generator-card {
          background: #ffffff;
          padding: 16px;
        }

        #submit {
          margin-top: 8px;
        }

        #submit sl-button::part(base) {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .background {
          background-color: var(--primary-color);
          color: var(--font-color);
        }

        .main {
          padding: 32px;
        }

        input[type="number"] {
          width: 30%;
          font-size: 22px;
        }
        small {
          margin-top: 10px;
        }
        .color-radio, .platform-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .color-radio >*, .platform-list >* {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        input[type="radio"] {
          border: 0px;
          width: 22px;
          height: 22px;
          margin: 0;
          accent-color: var(--primary-color);
        }

        input[type="radio"]:hover {
          cursor: pointer;
        }

        input[type="checkbox"] {
          border: 0px;
          width: 22px;
          height: 22px;
          margin: 0;
          accent-color: var(--primary-color);
        }

        input[type="checkbox"]:hover {
          cursor: pointer;
        }
      `,
        ];
    }

    constructor() {
        super();
    }

    firstUpdated() {
        recordProcessStep("image-generation", `page-loaded`, AnalyticsBehavior.StartProcess);
    }

    render() {
        return html`
      <div>
        <app-header></app-header>
        <main id="main" class="main background">
          <div id="image-generator-card">
            <h1>${loc.image_generator}</h1>
            <p>${loc.image_generator_text}</p>
            <form id="imageFileInputForm" enctype="multipart/form-data" class="form">
              <section class="form-left">
                <div class="image-section">
                  <h2>${loc.input_image}</h2>
                  <p>${loc.input_image_help}</p>
                  <app-file-input accept="image/png, image/svg+xml, image/jpeg, image/webp, image/gif, image/tiff, image/bmp" @input-change="${this.handleInputChange}"></app-file-input>
                </div>
                <div class="padding-section">
                  <label for="padding"><h2>${loc.padding}</h2></label>
                  <input 
                    id="padding"
                    name="padding" 
                    type="number" 
                    max="1" 
                    min="0" 
                    step="0.1" 
                    value=${this.padding}
                    @change=${this.handlePaddingChange} required></input>
                  <small>${loc.padding_text}</small>
                </div>
                <div class="color-section">
                  <h2>${loc.background_color}</h2>
                  <div class="color-radio">
                    <div class="radio-div">
                      <input type="radio" id="best-guess-radio" name="colorOption" value="best guess" @change=${this.handleBackgroundRadioChange} ?checked=${this.colorOption === "best guess"} />
                      <label for="best-guess-radio">${loc.best_guess}</label>
                    </div>

                    <div class="radio-div">
                      <input type="radio" id="transparent-radio" name="colorOption" value="transparent" @change=${this.handleBackgroundRadioChange} ?checked=${this.colorOption === "transparent"} />
                      <label for="transparent-radio">${loc.transparent}</label>
                    </div>

                    <div class="radio-div">
                      <input type="radio" id="custom-radio" name="colorOption" value="custom" @change=${this.handleBackgroundRadioChange} ?checked=${this.colorOption === "custom"} />
                      <label for="custom-radio">${loc.custom_color}</label>
                    </div>
                  </div>
                  ${this.renderColorPicker()}
                </div>
              </section>
              <section class="form-right platforms-section">
                <h2>${loc.platforms}</h2>
                <p>${loc.platforms_text}</p>
                <div role="group" class="platform-list">
                  ${this.renderPlatformList()}
                </div>
              </section>
              <section id="submit" class="form-bottom">
                <sl-button id="generateButton" variant="primary" ?disabled=${!this.generateEnabled || this.generating}
                  @click=${this.generateZip}
                  ?loading=${this.generating}>
                  ${localeStrings.button.generate}

                </sl-button>

                ${this.renderError()}
              </section>
            </form>
          </div>
        </main>
      </div>
    `;
    }

    renderPlatformList() {
        return platformsData.map(
            (platform, i) => html`
            <div class="checkbox-div">
                <input 
                type="checkbox"
                name="platform" 
                id="${`${platform.value}-checkbox`}"
                value="${platform.value}" 
                ?checked=${this.platformSelected[i]}
                @change=${this.handleCheckbox} 
                data-index=${i} />
                <label for="${platform.value}-checkbox">${platform.label}</label>
            </div>
            `
        );
    }

    renderColorPicker() {
        if (this.colorOption === "custom") {
            return html`<div class="custom-color-block">
  <label for="theme-custom-color">${localeStrings.values.custom}</label>
  <input type="color" id="theme-custom-color" name="color" .value=${this.color}
    @change=${this.handleThemeColorInputChange} />
</div>`;
        }

        return undefined;
    }

    renderError(): TemplateResult {
        if (this.error) {
            return html`<p style="font-size: 16px; color: red;">${this.error}</p>`;
        }

        return html``;
    }

    handleInputChange(event: CustomEvent<FileInputDetails>) {
        recordProcessStep("image-generation", "choose-file-clicked", AnalyticsBehavior.ProcessCheckpoint);

        const input = event.detail.input;
        if (input.files) {
            this.files = input.files;
        }
        this.checkGenerateEnabled();
    }

    handlePaddingChange(event: Event) {
        const input = <HTMLInputElement>event.target;
        let updatedValue = input.value;
        this.padding = parseFloat(updatedValue);
    }

    handleCheckbox(event: Event) {
        const input = event.target as HTMLInputElement;
        const index = input.dataset["index"];
        this.platformSelected[index as any] = input.checked;

        this.checkGenerateEnabled();
    }

    handleBackgroundRadioChange(event: CustomEvent) {
        const value: ColorRadioValues = (<HTMLInputElement>event.target)
            .value as ColorRadioValues;
        this.colorOption = value;
        this.checkGenerateEnabled();
    }

    handleThemeColorInputChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.color = input.value;
        this.checkGenerateEnabled();
    }

    async generateZip() {
        recordProcessStep("image-generation", "generate-zip-clicked", AnalyticsBehavior.CompleteProcess);
        const file = this.files ? this.files[0] : null;
        if (!file) {
            const errorMessage = "No file available to generate zip";
            console.error(errorMessage);
            this.error = errorMessage;
            return;
        }

        try {
            this.generateEnabled = false;
            this.generating = true;

            const form = new FormData();
            const colorValue =
                this.colorOption === "custom" ? this.color : // custom? Then send in the chosen color
                    this.colorOption === "best guess" ? "" : // best guess? Then send in an empty string, which the API interprets as best guess
                        "transparent"; // otherwise, it must be transparent

            form.append("baseImage", file as Blob);
            form.append("padding", String(this.padding));
            form.append("backgroundColor", colorValue);

            platformsData
                .filter((_, index) => this.platformSelected[index])
                .forEach(data => form.append("platforms", data.value));

            const createStoreImagesRequest = await fetch("/api/images/generateStoreImages", {
                method: "POST",
                body: form,
            });

            if (!createStoreImagesRequest.ok) {
                const errorText = await createStoreImagesRequest.text();
                throw new Error(errorText || `Image generation failed with status ${createStoreImagesRequest.status}`);
            }

            const blob = await createStoreImagesRequest.blob();
            const disposition = createStoreImagesRequest.headers.get("Content-Disposition");
            const fileNameMatch = disposition ? /filename="?([^";\n]+)"?/i.exec(disposition) : null;
            const fileName = fileNameMatch?.[1] ?? "appstore-images.zip";
            const url = URL.createObjectURL(blob);
            this.downloadZip(url, fileName);
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error(e);
            this.error = (e as Error).message;
        } finally {
            this.generating = false;
            this.generateEnabled = true;
        }
    }

    downloadZip(zipUrl: string, fileName: string) {
        const hyperlink = document.createElement("a");
        hyperlink.href = zipUrl;
        hyperlink.download = fileName;
        hyperlink.click();
    }

    checkGenerateEnabled() {
        this.generateEnabled =
            this.files !== undefined &&
            this.platformSelected.reduce((a, b) => a || b);
        return this.generateEnabled;
    }
}
