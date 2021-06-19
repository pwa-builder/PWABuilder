import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { smallBreakPoint } from '../utils/css/breakpoints';
import { localeStrings } from '../../locales';

import '../components/app-header';
import '../components/app-file-input';
import { FileInputDetails, Lazy } from '../utils/interfaces';
import { download } from '../utils/download';

interface PlatformInformation {
  label: string;
  value: string;
}

interface ImageGeneratorServicePostResponse {
  Message: string;
  Uri: string;
}

interface ImageGenerateServiceGetResponse {
  Message: string;
}

type ColorRadioValues = 'transparent' | 'choose';
const loc = localeStrings.imageGenerator;
const platformsData: Array<PlatformInformation> = [
  { label: loc.windows10, value: 'windows10' },
  { label: loc.msteams, value: 'msteams' },
  { label: loc.android, value: 'android' },
  { label: loc.chrome, value: 'chrome' },
  { label: loc.firefox, value: 'firefox' },
];
const baseUrl = 'https://appimagegenerator-prod.azurewebsites.net';

function boolListHasChanged<T>(value: T, unknownValue: T): boolean {
  if (!value || !unknownValue) {
    return false;
  }

  return value.toString() === unknownValue.toString();
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

  @state() downloadEnabled = false;

  @state() error: Lazy<string>;

  static get styles() {
    return [
      css`
        :host {
        }

        fast-button#downloadButton {
          --neutral-foreground-rest: #ffffff;
        }
      `,
      smallBreakPoint(css``),
    ];
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div>
        <app-header></app-header>
        <main id="main" role="presentation" class="main">
          <div>
            <h1>${loc.image_generator}</h1>
            <p>${loc.image_generator_text}</p>
            <form
              id="imageFileInputForm"
              enctype="multipart/form-data"
              role="form"
              class="form"
            >
              <section class="form-left">
                <h2>${loc.image_details}</h2>
                <p>${loc.image_generator_text}</p>
                <div class="image-section">
                  <h3>${loc.input_image}</h3>
                  <app-file-input
                    @input-change=${this.handleInputChange}
                  ></app-file-input>
                </div>
                <div class="padding-section">
                  <h3>${loc.padding}</h3>
                  <fast-number-field
                    name="padding"
                    max="1"
                    min="0"
                    step="0.1"
                    .value=${this.padding}
                    @change=${this.handlePaddingChange}
                    required
                  ></fast-number-field>
                  <small>${loc.padding_text}</small>
                </div>
                <div class="color-section">
                  <h3>${loc.background_color}</h3>
                  <div class="color-radio">
                    <fast-radio-group
                      orientation="vertical"
                      .value=${this.colorOption}
                      @change=${this.handleBackgroundRadioChange}
                    >
                      <fast-radio name="colorOption" value="transparent">
                        ${loc.transparent}
                      </fast-radio>
                      <fast-radio name="colorOption" value="choose"
                        >${loc.custom_color}</fast-radio
                      >
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
                <fast-button
                  id="selectPlatforms"
                  class="secondary"
                  appearance="accent"
                  @click=${this.handleSelectAndClearAll}
                >
                  ${loc.select_button}
                </fast-button>
              </section>
              <section id="submit" class="form-bottom">
                <fast-button
                  id="downloadButton"
                  class="primary"
                  ?disabled=${!this.downloadEnabled}
                  @click=${this.downloadZip}
                >
                  ${localeStrings.button.download}
                </fast-button>

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
        <fast-checkbox
          type="checkbox"
          name="platform"
          value="${platform.value}"
          ?checked=${this.platformSelected[i]}
          @change=${this.handleCheckbox}
          data-index=${i}
        >
          ${platform.label}
        </fast-checkbox>
      `
    );
  }

  renderColorPicker() {
    if (this.colorOption === 'choose') {
      return html`<div class="custom-color-block">
        <label for="theme-custom-color">${localeStrings.values.custom}</label>
        <input
          type="color"
          id="theme-custom-color"
          name="color"
          .value=${this.color}
          @change=${this.handleThemeColorInputChange}
        />
      </div>`;
    }

    return undefined;
  }

  renderError() {
    if (this.error) {
      return html`
        <p style="font-size: 16px; font-color: red;">${this.error}</p>
      `;
    }
  }

  handleInputChange(event: CustomEvent<FileInputDetails>) {
    const input = event.detail.input;
    if (input.files) {
      this.files = input.files;
    }
    this.checkDownloadEnabled();
  }

  handlePaddingChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.padding = Number(input.value);
  }

  handleCheckbox(event: Event) {
    const input = event.target as HTMLInputElement;
    const index = input.dataset['index'];
    this.platformSelected[index] = input.checked;

    this.checkDownloadEnabled();
  }

  handleBackgroundRadioChange(event: CustomEvent) {
    const value: ColorRadioValues = (<HTMLInputElement>event.target)
      .value as ColorRadioValues;
    this.colorOption = value;
    this.checkDownloadEnabled();
  }

  handleThemeColorInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.color = input.value;
    this.checkDownloadEnabled();
  }

  handleSelectAndClearAll() {
    this.platformSelected = this.platformSelected.map(
      () => this.selectAllState
    );
    this.selectAllState = !this.selectAllState;
    this.checkDownloadEnabled();
  }

  async downloadZip() {
    try {
      this.downloadEnabled = false;

      const form = new FormData();
      form.append('fileName', this.files[0]);
      form.append('padding', String(this.padding));
      form.append('colorOption', String(this.colorOption));
      form.append('colorOption', String(this.colorOption));

      for (let i = 0; i < platformsData.length; i++) {
        if (this.platformSelected[i]) {
          form.append('platform', platformsData[i].value);
        }
      }

      const res = fetch(`${baseUrl}/api/image`, {
        method: 'POST',
        body: form,
      });

      const postRes = (
        await res
      ).json() as unknown as ImageGeneratorServicePostResponse;

      if (postRes.Message) {
        throw new Error('Error from service: ' + postRes.Message);
      }

      const getRes = await fetch(`${baseUrl}${postRes.Uri}`, {
        method: 'GET',
      });

      if (!getRes.ok) {
        const getJson =
          (await getRes.json()) as ImageGenerateServiceGetResponse;
        throw new Error('Error from service: ' + getJson.Message);
      }

      await download({
        fileName: 'PWABuilder Icons',
        blob: await getRes.blob(),
      });

      this.downloadEnabled = true;
    } catch (e) {
      console.error(e);
      this.error = (e as Error).message;
    }
  }

  checkDownloadEnabled() {
    this.downloadEnabled =
      this.files !== undefined &&
      this.platformSelected.reduce((a, b) => a || b);
    return this.downloadEnabled;
  }
}
