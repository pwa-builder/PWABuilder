import {
  LitElement,
  customElement,
  css,
  html,
  property,
  internalProperty,
} from 'lit-element';
// import { classMap } from 'lit-html/directives/class-map';
// import { styleMap } from 'lit-html/directives/style-map';
import { getManifest } from '../services/manifest';
import { arrayHasChanged, objectHasChanged } from '../utils/hasChanged';
import { resolveUrl } from '../utils/url';
import { FileInputDetails, Lazy, ModalCloseEvent } from '../utils/interfaces';
import {
  fastTextFieldCss,
  fastButtonCss,
  fastCheckboxCss,
  fastMenuCss,
  fastRadioCss,
} from '../utils/css/fast-elements';

import { tooltip, styles as ToolTipStyles } from './tooltip';

import './loading-button';
import './app-modal';
import './dropdown-menu';
import './app-file-input';
import { generateMissingImagesBase64 } from '../services/icon_generator';

@customElement('manifest-options')
export class AppManifest extends LitElement {
  @property({ type: Object, hasChanged: objectHasChanged })
  manifest = getManifest();
  @property({ type: Number }) score = 0;
  @property({ type: Array, hasChanged: arrayHasChanged })
  screenshotList: Array<string | undefined> = [];

  @property({ type: Boolean }) uploadModalOpen = false;
  @internalProperty() uploadButtonDisabled = true;
  @internalProperty() uploadSelectedImageFile: Lazy<File>;
  @internalProperty() uploadImageObjectUrl: Lazy<string>;

  @internalProperty()
  protected backgroundColorRadioValue: 'none' | 'transparent' | 'custom' =
    'none';

  @internalProperty()
  protected searchParams: Lazy<URLSearchParams>;

  protected get siteUrl(): string {
    if (!this.searchParams) {
      this.searchParams = new URLSearchParams(location.search);
    }

    const siteParam = this.searchParams.get('site');
    return siteParam ? siteParam : '';
  }

  static get styles() {
    return [
      css`
        :host {
        }
      `,
      ToolTipStyles,
      fastButtonCss,
      fastCheckboxCss,
      fastTextFieldCss,
      fastMenuCss,
      fastRadioCss,
      css`
        fast-divider {
          margin: 16px 0;
        }

        app-button {
          max-width: 160px;
        }

        fast-text-field,
        app-dropdown::part(layout) {
          width: 300px;
        }

        #bg-custom-color {
          margin-left: 32px;
        }

        .panel {
          padding: 32px;
          max-width: 1009px;
        }

        .tooltip {
          height: 16px;
          width: 16px;
        }

        .icons,
        .screenshots {
          margin-top: 16px;
        }

        .images-header {
          display: flex;
          justify-content: space-between;
          vertical-align: middle;
        }

        images-header,
        .head .top-section {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }

        .head .summary-body {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
        }

        .screenshots-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .info-items,
        .setting-items {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;

          max-width: 800px;
        }

        .info-item,
        .setting-item {
          margin: 16px 0;
        }

        .collection {
          display: flex;
          flex-wrap: wrap;
          vertical-align: middle;
        }

        .modal-action-form {
          display: flex;
          flex-direction: column;
        }

        .item-top {
          display: flex;
          flex-direction: row;
          align-items: top;
        }

        .item-top h3 {
          margin: 0;
        }

        .item-top .tooltip {
          margin-left: 4px;
        }

        .image-item {
          background-color: transparent;
          margin: 8px;
        }

        .image,
        .image img {
          width: 100px;
        }

        .image p {
          text-align: center;
        }

        .screenshot,
        .screenshot img {
          width: 205px;
          height: 135px;
        }

        fast-accordion-item::part(icon) {
          display: none;
        }
      `,
      // modal
      css`
        .modal-action-form {
          display: flex;
          flex-direction: column;
        }

        .modal-action-form fast-checkbox {
          margin: 16px 0;
        }

        .modal-img {
          max-width: 400px;
        }
      `,
    ];
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="panel">
        <div class="head">
          <div class="top-section">
            <h1>Manifest</h1>
            <h1>Score ${this.score} / 40</h1>
          </div>

          <h2>Summary</h2>
          <div class="summary-body">
            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
              aut fugit, sed quia consequuntur magni dolores eos qui ratione
              voluptatem sequi nesciunt. ven further!
            </p>
            <app-button @click=${this.done}>Done</app-button>
          </div>
        </div>
        <fast-divider></fast-divider>
        <section class="info">
          <h1>Info</h1>
          <div class="info-items inputs">${this.renderInfoItems()}</div>
        </section>
        <fast-divider></fast-divider>
        <section class="images">
          <h1>Images</h1>
          <div class="icons">
            <div class="images-header">
              <div class="item-top">
                <h3>Upload App Icons</h3>
                ${this.renderToolTip('upload-icons-tooltip', 'TODO')}
              </div>
              <app-button appearance="outline" @click=${this.openUploadModal}
                >Upload</app-button
              >
              <app-modal
                modalId="uploadModal"
                title="Upload information"
                body="This is or uploading icons"
                ?open=${this.uploadModalOpen}
                @app-modal-close=${this.uploadModalClose}
              >
                <div slot="modal-actions">
                  <form class="modal-action-form">
                    ${this.renderModalInput()}
                  </form>
                </div>
              </app-modal>
            </div>
            <div class="collection image-items">${this.renderIcons()}</div>

            <div class="images-actions">
              <app-button appearance="outline" @click=${this.downloadImages}
                >Download</app-button
              >
            </div>
          </div>
          <div class="screenshots">
            <div class="screenshots-header">
              <div class="item-top">
                <h3>Generate Screenshots</h3>
                ${this.renderToolTip('generate-screenshot-tooltip', 'TODO')}
              </div>
              <p>
                Specify the URLs to generate desktop and mobile screenshots
                from. You may add up to 8 screenshots or Store Listings.
              </p>
              <!-- url text field -->
              ${this.renderScreenshotInputUrlList()}
              <!-- Add url button -->
              <fast-button
                @click=${this.addNewScreenshot}
                appearance="lightweight"
                >+ Add URL</fast-button
              >
            </div>
          </div>
          <div class="collection screenshot-items">
            ${this.renderScreenshots()}
          </div>

          <div class="screenshots-actions">
            <loading-button
              appearance="outline"
              type="submit"
              @click=${this.generateScreenshots}
              >Generate</loading-button
            >
          </div>
        </section>
        <fast-divider></fast-divider>
        <section class="settings">
          <h1>Settings</h1>
          <div class="setting-items inputs">${this.renderSettingsItems()}</div>
          ${this.renderBackgroundColorSettings()}
        </section>
        <section class="view-code">
          <fast-accordion>
            <fast-accordion-item>
              <h1 slot="heading">View Code</h1>
              <p>${JSON.stringify(getManifest())}</p>
            </fast-accordion-item>
          </fast-accordion>
        </section>
      </div>
    `;
  }

  renderInfoItems() {
    return infoItems.map(item => {
      const value = this.manifest
        ? (this.manifest[item.entry] as string)
        : undefined;

      return html`
        <div class="info-item">
          <div class="item-top">
            <h3>${item.title}</h3>
            ${this.renderToolTip(item.entry + '-tooltip', item.tooltipText)}
          </div>
          <p>${item.description}</p>
          <fast-text-field
            data-field="${item.entry}"
            placeholder="${item.title}"
            .value=${value}
            @change=${this.handleInputChange}
          ></fast-text-field>
        </div>
      `;
    });
  }

  renderSettingsItems() {
    return settingsItems.map(item => {
      let field;
      const value = this.manifest ? (this.manifest[item.entry] as string) : '';

      if (item.type === 'select' && item.menuItems) {
        const index = item.menuItems.indexOf(value);
        field = html`
          <app-dropdown
            .menuItems=${item.menuItems}
            selectedIndex=${index}
            @change=${this.handleInputChange}
          >
          </app-dropdown>
        `;
      } else {
        field = html`<fast-text-field
          data-field="${item.entry}"
          placeholder="${item.title}"
          .value=${value}
          @change=${this.handleInputChange}
        ></fast-text-field>`;
      }

      return html`
        <div class="setting-item">
          <div class="item-top">
            <h3>${item.title}</h3>
            ${this.renderToolTip(item.entry + '-tooltip', item.tooltipText)}
          </div>
          <p>${item.description}</p>
          ${field}
        </div>
      `;
    });
  }

  renderBackgroundColorSettings() {
    const value = this.manifest ? this.manifest?.theme_color : undefined;

    return html`
      <div class="setting-item inputs color">
        <div class="item-top">
          <h3>Background Color</h3>
          ${this.renderToolTip('bg-color-tooltip', 'TODO')}
        </div>
        <fast-radio-group
          value=${this.setBackgroundColorRadio()}
          orientation="vertical"
          @change=${this.handleBackgroundRadioChange}
        >
          <fast-radio value="none">None</fast-radio>
          <fast-radio value="transparent">Transparent</fast-radio>
          <fast-radio value="custom">Custom Color</fast-radio>
        </fast-radio-group>

        ${this.backgroundColorRadioValue === 'custom'
          ? html`<fast-text-field
              id="bg-custom-color"
              placeholder="#XXXXXX"
              .value=${value}
              @change=${this.handleBackgroundColorInputChange}
            ></fast-text-field>`
          : undefined}
      </div>
    `;
  }

  renderIcons() {
    const baseUrl = this.siteUrl || this.manifest?.startUrl;

    return this.manifest?.icons?.map(icon => {
      const url = resolveUrl(baseUrl, icon.src);

      if (url) {
        return html`<div class="image-item image">
          <img src="${url.href}" alt="image text" />
          <p>${icon.sizes}</p>
        </div>`;
      } else {
        // TODO failure state.
        return undefined;
      }
    });
  }

  renderScreenshotInputUrlList() {
    const renderFn = (url: string | undefined, index: number) => {
      return html` <fast-text-field
        class="screenshot-url"
        placeholder="www.example.com/screenshot"
        value="${url || ''}"
        @change=${this.handleScreenshotUrlChange}
        data-index=${index}
      ></fast-text-field>`;
    };

    if (this.screenshotList.length == 0) {
      return renderFn('', 0);
    }

    return this.screenshotList.map(renderFn);
  }

  renderScreenshots() {
    return this.manifest?.screenshots?.map(screenshot => {
      let url = resolveUrl(this.siteUrl, this.manifest?.startUrl);
      url = resolveUrl(url?.href, screenshot.src);

      if (url) {
        return html`<div class="image-item screenshot">
          <img src="${url.href}" alt="image text" />
        </div>`;
      } else {
        // TODO failure path
        return undefined;
      }
    });
  }

  renderToolTip = tooltip;

  renderModalInput() {
    return html`
      <app-file-input
        inputId="modal-file-input"
        @input-change=${this.handleModalInputFileChange}
      ></app-file-input>
      ${this.uploadSelectedImageFile
        ? html`<img class="modal-img" src=${this.uploadImageObjectUrl} />`
        : undefined}

      <app-button
        @click=${this.handleIconFileUpload}
        .disabled=${this.uploadButtonDisabled}
        >Upload</app-button
      >
    `;
  }

  handleInputChange(event: InputEvent) {
    const input = <HTMLInputElement | HTMLSelectElement>event.target;
    const fieldName = input.dataset['field'];

    // TODO use the update mechanism in my other branch
    if (this.manifest && fieldName && this.manifest[fieldName]) {
      this.manifest[fieldName] = input.value;
    }
  }

  handleScreenshotUrlChange(event: CustomEvent) {
    console.log(event);
  }

  handleBackgroundRadioChange(event: CustomEvent) {
    const value = (<any>event.target).value;
    this.backgroundColorRadioValue = value;

    if (value !== 'custom' && this.manifest) {
      this.manifest.theme_color = value;
    }
  }

  handleBackgroundColorInputChange(event: CustomEvent) {
    if (this.manifest) {
      this.manifest.theme_color = (<HTMLInputElement>event.target).value;
    }
  }

  async handleModalInputFileChange(evt: CustomEvent<FileInputDetails>) {
    console.log('handleModalInputFileChange', evt);
    const files = evt.detail.input.files ?? undefined;

    // const file = files.item(0);
    // console.log(URL.createObjectURL(file), URL.createObjectURL(file));

    this.uploadSelectedImageFile = files?.item(0) ?? undefined;
    this.uploadButtonDisabled = !this.validIconInput();

    if (!this.uploadButtonDisabled) {
      this.uploadImageObjectUrl = URL.createObjectURL(
        this.uploadSelectedImageFile
      );
    } else {
      console.log('error state');
    }
  }

  async handleIconFileUpload() {
    try {
      if (this.uploadSelectedImageFile) {
        await generateMissingImagesBase64({
          file: this.uploadSelectedImageFile,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  validIconInput() {
    const supportedFileTypes = ['.png', '.jpg', '.svg'];

    return supportedFileTypes.find(
      fileType =>
        this &&
        this.uploadSelectedImageFile &&
        this.uploadSelectedImageFile.name.endsWith(fileType)
    );
  }

  addNewScreenshot() {
    this.screenshotList = [...(this.screenshotList || []), undefined];
  }

  done() {
    console.log('done');
  }

  openUploadModal() {
    this.uploadModalOpen = true;
  }

  uploadModalClose(event: CustomEvent<ModalCloseEvent>) {
    if (event.detail.modalId === 'uploadModal') {
      this.uploadModalOpen = false;
    }
  }

  downloadImages() {
    console.log('download images', event);
  }

  generateScreenshots() {
    console.log('generate screenshots', event);
  }

  setBackgroundColorRadio() {
    if (!this.manifest?.theme_color || this.manifest?.theme_color === 'none') {
      return 'none';
    } else if (this.manifest?.theme_color === 'transparent') {
      return 'transparent';
    }

    return 'custom';
  }
}

interface InputItem {
  title: string;
  description: string;
  tooltipText: string;
  entry: string;
  type: 'input' | 'select' | 'radios';
  menuItems?: Array<string>;
}

const infoItems: Array<InputItem> = [
  {
    title: 'Name',
    description: 'Used for App Lists or Store Listings',
    tooltipText: 'TODO',
    entry: 'name',
    type: 'input',
  },
  {
    title: 'Short Name',
    description: 'Use for title or home screens',
    tooltipText: 'TODO',
    entry: 'short_name',
    type: 'input',
  },
  {
    title: 'Description',
    description: 'Used for app listings',
    tooltipText: 'TODO',
    entry: 'description',
    type: 'input',
  },
  {
    title: 'Start URL',
    description: 'Used for app listings',
    tooltipText: 'TODO',
    entry: 'start_url',
    type: 'input',
  },
];

const settingsItems: Array<InputItem> = [
  {
    title: 'Scope',
    description: 'Enter app scope',
    tooltipText: 'TODO',
    entry: 'scope',
    type: 'input',
  },
  {
    title: 'Display',
    description: 'Enter app display',
    tooltipText: 'TODO',
    entry: 'display',
    type: 'select',
    menuItems: ['fullscreen', 'standalone', 'minimal-ui', 'browser'],
  },
  {
    title: 'Orientation',
    description: 'Enter app orientation',
    tooltipText: 'TODO',
    entry: 'orientation',
    type: 'select',
    menuItems: [
      'any',
      'natural',
      'landscape',
      'portrait',
      'portrait-primary',
      'portrait-secondary',
      'landscape-primary',
      'landscape-secondary',
    ],
  },
];
