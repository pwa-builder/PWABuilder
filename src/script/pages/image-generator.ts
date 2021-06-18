import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { smallBreakPoint } from '../utils/css/breakpoints';
import { localeStrings } from '../../locales';

import '../components/app-header';
import '../components/app-file-input';
import { FileInputDetails, Lazy } from '../utils/interfaces';

interface PlatformInformation {
  label: string;
  value: string;
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

@customElement('image-generator')
export class ImageGenerator extends LitElement {
  @state() platformSelected: Array<boolean> = platformsData.map(
    platform => true
  );

  @state() files: Lazy<FileList> = undefined;

  @state() padding = 0.3;

  @state() colorOption: ColorRadioValues = 'transparent';

  // hex color
  @state() color: string = '#ffffff';

  @state() selectAllState = false;

  @state() downloadEnabled = false;

  static get styles() {
    return [
      css`
        :host {
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
        <label
          ><input
            type="checkbox"
            name="platform"
            value="${platform.value}"
            .checked=${this.platformSelected[i]}
            @click=${this.handleCheckbox}
            data-index=${i}
          />
          ${platform.label}
        </label>
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

  handleInputChange(event: CustomEvent<FileInputDetails>) {
    const input = event.detail.input;
    if (input.files) {
      this.files = input.files;
    }
    this.checkDownloadEnabled();
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
    // this.requestUpdate(); // TODO make sure not needed?
  }

  handleThemeColorInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.color = input.value;
    this.checkDownloadEnabled();
  }

  handleSelectAndClearAll() {
    this.platformSelected.map(platform => this.selectAllState);
    this.selectAllState = !this.selectAllState;
    this.checkDownloadEnabled();
    this.requestUpdate();
  }

  downloadZip() {
    // TODO
    // new FormData();
    // fetch('https://appimagegenerator-prod.azurewebsites.net/api/image', {
    //   method: 'POST',
    //   body: form,
    // });
  }

  checkDownloadEnabled() {
    return (
      this.files !== undefined && this.platformSelected.reduce((a, b) => a && b)
    );
  }
}
