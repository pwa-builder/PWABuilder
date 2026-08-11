import { LitElement, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { imageGeneratorStyles } from "./image-generator.styles";
import { localeStrings } from "../../locales";

import "../components/app-header";
import "../components/app-file-input";
import { FileInputDetails, Lazy } from "../utils/interfaces";
import type WaColorPicker from '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';

import { recordProcessStep, AnalyticsBehavior } from "../utils/analytics";
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
import '@awesome.me/webawesome/dist/components/radio-group/radio-group.js';
import '@awesome.me/webawesome/dist/components/radio/radio.js';
import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
import '@awesome.me/webawesome/dist/components/number-input/number-input.js';


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

    static styles = [imageGeneratorStyles];

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
        <div id="main" class="main background">
          <div id="image-generator-card">
            <header class="page-intro">
              <h1>${loc.image_generator}</h1>
              <p>${loc.image_generator_text}</p>
            </header>
            <form id="imageFileInputForm" enctype="multipart/form-data" class="form">
              <div class="form-grid">
                <div class="form-left">
                  <div class="form-group image-section" role="group" aria-labelledby="base-image-label">
                    <div id="base-image-label" class="form-label">${loc.input_image}</div>
                    <p class="form-help">${loc.input_image_help}</p>
                    <app-file-input accept="image/png, image/svg+xml, image/jpeg, image/webp, image/gif, image/tiff, image/bmp" @input-change="${this.handleInputChange}"></app-file-input>
                  </div>
                  <div class="form-group padding-section">
                    <wa-number-input
                      id="padding"
                      name="padding"
                      label="${loc.padding}"
                      size="s"
                      max="1"
                      min="0"
                      step="0.1"
                      value=${this.padding}
                      hint="${loc.padding_text}"
                      @change=${this.handlePaddingChange} required></wa-number-input>
                  </div>
                  <div class="form-group color-section">
                    <wa-radio-group
                      id="colorOption"
                      name="colorOption"
                      label="${loc.background_color}"
                      .value=${this.colorOption}
                      @change=${this.handleBackgroundRadioChange}>
                      <wa-radio value="best guess">${loc.best_guess}</wa-radio>
                      <wa-radio value="transparent">${loc.transparent}</wa-radio>
                      <wa-radio value="custom">${loc.custom_color}</wa-radio>
                    </wa-radio-group>
                    ${this.renderColorPicker()}
                  </div>
                </div>
                <div class="form-right">
                  <div class="form-group platforms-section" role="group" aria-labelledby="platforms-label">
                    <div id="platforms-label" class="form-label">${loc.platforms}</div>
                    <p class="form-help">${loc.platforms_text}</p>
                    <div class="platform-list">
                      ${this.renderPlatformList()}
                    </div>
                  </div>
                </div>
              </div>
              <section id="submit" class="form-bottom">
                <wa-button id="generateButton" variant="brand" ?disabled=${!this.generateEnabled || this.generating}
                  @click=${this.generateZip}
                  ?loading=${this.generating}>
                  ${localeStrings.button.generate}

                </wa-button>

                ${this.renderError()}
              </section>
            </form>
          </div>
        </div>
      </div>
    `;
    }

    renderPlatformList() {
        return platformsData.map(
            (platform, i) => html`
            <wa-checkbox
                name="platform"
                id="${`${platform.value}-checkbox`}"
                value="${platform.value}"
                ?checked=${this.platformSelected[i]}
                @change=${this.handleCheckbox}
                data-index=${i}>${platform.label}</wa-checkbox>
            `
        );
    }

    renderColorPicker() {
        if (this.colorOption === "custom") {
            return html`<div class="custom-color-block">
  <wa-color-picker
    id="theme-custom-color"
    name="color"
    label="${localeStrings.values.custom}"
    format="hex"
    size="s"
    without-format-toggle
    .value=${this.color}
    @change=${this.handleThemeColorInputChange}>
  </wa-color-picker>
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
        const input = event.target as WaColorPicker;
        this.color = input.value ?? this.color;
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
