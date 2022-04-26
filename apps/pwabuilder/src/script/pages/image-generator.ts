import { LitElement, css, html, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { localeStrings } from '../../locales';

import '../components/app-header';
import '../components/app-file-input';
import { FileInputDetails, Lazy } from '../utils/interfaces';

import {
  fastButtonCss,
  fastCheckboxCss,
  fastNumberFieldCss,
  fastRadioCss,
} from '../utils/css/fast-elements';
import { recordProcessStep, AnalyticsBehavior } from '../utils/analytics';

interface PlatformInformation {
  label: string;
  value: string;
}

interface ImageGeneratorServicePostResponse {
  Message: string;
  Uri: string;
}

type ColorRadioValues = 'best guess' | 'transparent' | 'custom';
const loc = localeStrings.imageGenerator;
const platformsData: Array<PlatformInformation> = [
  { label: loc.windows11, value: 'windows11' },
  { label: loc.android, value: 'android' },
  { label: loc.ios, value: 'ios' }
];
const baseUrl = 'https://appimagegenerator-prod.azurewebsites.net';

function boolListHasChanged<T>(value: T, unknownValue: T): boolean {
  if (!value || !unknownValue) {
    return false;
  }

  return (value as Object).toString() === (unknownValue as Object).toString();
}

@customElement('image-generator')
export class ImageGenerator extends LitElement {
  @state({ hasChanged: boolListHasChanged })
  platformSelected: Array<boolean> = platformsData.map(() => true);

  @state() files: Lazy<FileList>;

  @state() padding = 0.3;

  @state() colorOption: ColorRadioValues = 'transparent';

  // hex color
  @state() color: string = '#ffffff';

  @state() selectAllState = false;

  @state() generating = false;

  @state() generateEnabled = false;

  @state() error: Lazy<string>;

  static get styles() {
    return [
      fastButtonCss,
      fastCheckboxCss,
      fastRadioCss,
      fastNumberFieldCss,
      css`
        :host {
          --loader-size: 1.8em;
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

        h3 {
          font-size: var(--medium-font-size);
        }

        p {
          font-size: var(--font-size);
        }

        small {
          display: block;
          font-size: 10px;
        }

        fast-card {
          --background-color: var(--secondary-color);
          padding: 16px;
        }

        fast-button {
          height: 24px;
          padding: 8px 0;
        }

        fast-progress-ring {
          height: var(--loader-size);
          width: var(--loader-size);

          --accent-foreground-rest: var(--secondary-color);
          --accent-foreground-rest: var(--primary-color);
          --neutral-fill-rest: white;
          --neutral-fill-active: white;
          --neutral-fill-hover: white;
        }

        fast-button::part(content) {
          margin: 0 16px;
        }

        #image-generator-card {
          background: #ffffff;
        }

        #submit {
          margin-top: 8px;
        }

        fast-button#generateButton,
        fast-button#downloadButton {
          --neutral-foreground-rest: var(--secondary-color);
          --button-font-color: var(--secondary-color);
        }

        .background {
          background-color: var(--primary-color);
          color: var(--primary-color);
        }

        .main {
          padding: 32px;
        }
      `,
    ];
  }

  constructor() {
    super();
  }

  firstUpdated() {
    recordProcessStep('image-generation', `page-loaded`, AnalyticsBehavior.StartProcess);
  }

  render() {
    return html`
      <div>
        <app-header></app-header>
        <main id="main" role="presentation" class="main background">
          <fast-card id="image-generator-card">
            <h1>${loc.image_generator}</h1>
            <p>${loc.image_generator_text}</p>
            <form id="imageFileInputForm" enctype="multipart/form-data" role="form" class="form">
              <section class="form-left">
                <div class="image-section">
                  <h3>${loc.input_image}</h3>
                  <p>${loc.input_image_help}</p>
                  <app-file-input @input-change=${this.handleInputChange}></app-file-input>
                </div>
                <div class="padding-section">
                  <h3>${loc.padding}</h3>
                  <fast-number-field name="padding" max="1" min="0" step="0.1" .value=${this.padding}
                    @change=${this.handlePaddingChange} required></fast-number-field>
                  <small>${loc.padding_text}</small>
                </div>
                <div class="color-section">
                  <h3>${loc.background_color}</h3>
                  <div class="color-radio">
                    <fast-radio-group orientation="vertical" .value=${this.colorOption}
                      @change=${this.handleBackgroundRadioChange}>
                      <fast-radio name="colorOption" value="best guess">
                        ${loc.best_guess}
                      </fast-radio>
                      <fast-radio name="colorOption" value="transparent">
                        ${loc.transparent}
                      </fast-radio>
                      <fast-radio name="colorOption" value="custom">
                        ${loc.custom_color}
                      </fast-radio>
                    </fast-radio-group>
                  </div>
                  ${this.renderColorPicker()}
                </div>
              </section>
              <section class="form-right platforms-section">
                <h4>${loc.platforms}</h4>
                <p>${loc.platforms_text}</p>
                <div role="group" class="platform-list">
                  ${this.renderPlatformList()}
                </div>
              </section>
              <section id="submit" class="form-bottom">
                <fast-button id="generateButton" class="primary" ?disabled=${!this.generateEnabled || this.generating}
                  @click=${this.generateZip}>
                  ${this.generating
                    ? html`<fast-progress-ring></fast-progress-ring>`
                    : localeStrings.button.generate}
                </fast-button>
      
                ${this.renderError()}
              </section>
            </form>
          </fast-card>
        </main>
      </div>
    `;
  }

  renderPlatformList() {
    return platformsData.map(
      (platform, i) => html`
        <fast-checkbox type="checkbox" name="platform" value="${platform.value}" ?checked=${this.platformSelected[i]}
          @change=${this.handleCheckbox} data-index=${i}>
          ${platform.label}
        </fast-checkbox>
      `
    );
  }

  renderColorPicker() {
    if (this.colorOption === 'custom') {
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
    recordProcessStep('image-generation', 'choose-file-clicked', AnalyticsBehavior.ProcessCheckpoint);

    const input = event.detail.input;
    if (input.files) {
      this.files = input.files;
    }
    this.checkGenerateEnabled();
  }

  handlePaddingChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.padding = Number(input.value);
  }

  handleCheckbox(event: Event) {
    const input = event.target as HTMLInputElement;
    const index = input.dataset['index'];
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
    recordProcessStep('image-generation', 'generate-zip-clicked', AnalyticsBehavior.CompleteProcess);
    const file = this.files ? this.files[0] : null;
    if (!file) {
      const errorMessage = 'No file available to generate zip';
      console.error(errorMessage);
      this.error = errorMessage;
      return;
    }

    try {
      this.generateEnabled = false;
      this.generating = true;

      const form = new FormData();
      const colorValue =  
        this.colorOption === 'custom' ? this.color : // custom? Then send in the chosen color
        this.colorOption === 'best guess' ? '' : // best guess? Then send in an empty string, which the API interprets as best guess
          'transparent'; // otherwise, it must be transparent
      
      form.append('fileName', file as Blob);
      form.append('padding', String(this.padding));
      form.append('color', colorValue);

      platformsData
        .filter((_, index) => this.platformSelected[index])
        .forEach(data => form.append('platform', data.value));

      const res = await fetch(`${baseUrl}/api/image`, {
        method: 'POST',
        body: form,
      });

      const postRes =
        (await res.json()) as unknown as ImageGeneratorServicePostResponse;

      if (postRes.Message) {
        throw new Error('Error from service: ' + postRes.Message);
      }

      this.downloadZip(`${baseUrl}${postRes.Uri}`);
    } catch (e) {
      console.error(e);
      this.error = (e as Error).message;
    } finally {
      this.generating = false;
      this.generateEnabled = true;
    }
  }

  downloadZip(zipUrl: string) {
    const hyperlink = document.createElement("a");
    hyperlink.href = zipUrl;
    hyperlink.download = "";
    hyperlink.click();
  }

  checkGenerateEnabled() {
    this.generateEnabled =
      this.files !== undefined &&
      this.platformSelected.reduce((a, b) => a || b);
    return this.generateEnabled;
  }
}
