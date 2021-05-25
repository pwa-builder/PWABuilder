import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { localeStrings, languageCodes } from '../../locales';

//@ts-ignore
import ErrorStyles from '../../../styles/error-styles.css';

import {
  emitter as manifestEmitter,
  getManifest,
  updateManifest,
} from '../services/manifest';
import { arrayHasChanged, objectHasChanged } from '../utils/hasChanged';
import { resolveUrl } from '../utils/url';
import {
  AppEvents,
  FileInputDetails,
  Icon,
  Lazy,
  Manifest,
  ModalCloseEvent,
} from '../utils/interfaces';
import {
  CodeEditorEvents,
  CodeEditorSyncEvent,
  CodeEditorUpdateEvent,
} from '../utils/interfaces.codemirror';
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
import './app-gallery';
import './code-editor';
import { generateMissingImagesBase64 } from '../services/icon_generator';
import { generateScreenshots } from '../services/screenshots';
import { validateScreenshotUrlsList } from '../utils/manifest-validation';
import { mediumBreakPoint, smallBreakPoint } from '../utils/css/breakpoints';
import { hidden_sm } from '../utils/css/hidden';
import { generateAndDownloadIconZip } from '../services/download_icons';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  dispatchEvent as editorDispatchEvent,
  updateStateField,
} from '../utils/codemirror';

type BackgroundColorRadioValues = 'none' | 'transparent' | 'custom';

@customElement('manifest-options')
export class AppManifest extends LitElement {
  @property({ type: Object, hasChanged: objectHasChanged })
  manifest = getManifest();
  @property({ type: Number }) score = 0;
  @property({ type: Array, hasChanged: arrayHasChanged })
  screenshotList: Array<string | undefined> = [undefined];

  @property({ type: Boolean }) uploadModalOpen = false;
  @state() uploadButtonDisabled = true;
  @state() uploadSelectedImageFile: Lazy<File>;
  @state() uploadImageObjectUrl: string;

  @state() generateIconButtonDisabled = true;

  @state()
  protected generateScreenshotButtonDisabled = true;

  @state() screenshotListValid: Array<boolean> = [];

  @state()
  protected backgroundColorRadioValue: BackgroundColorRadioValues = 'none';

  @state()
  protected awaitRequest = false;

  @state()
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
      ErrorStyles,
      ToolTipStyles,
      fastButtonCss,
      fastCheckboxCss,
      fastTextFieldCss,
      fastMenuCss,
      fastRadioCss,
      css`
        app-button,
        loading-button::part(underlying-button) {
          margin-top: 8px;
        }

        fast-divider {
          margin: 16px 0;
          border-color: rgb(229, 229, 229);
        }

        fast-text-field,
        app-dropdown::part(layout) {
          width: 300px;
        }

        fast-accordion-item {
          --base-height-multiplier: 20;
        }

        fast-button.link {
          box-shadow: none;
        }

        #bg-custom-color {
          margin-left: 32px;
        }

        .panel {
          padding: 32px;
        }

        .tooltip {
          height: 16px;
          width: 16px;
        }

        .icons,
        .screenshots {
          margin-top: 16px;
        }

        .view-code {
          margin-bottom: 8px;
        }

        .view-code fast-accordion {
          border-color: rgb(229, 229, 229);
        }

        .view-code fast-accordion-item {
          border-bottom: none;
        }

        .images-header {
          display: flex;
          flex-direction: column;
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
          flex-direction: column;
        }

        #manifest-done-button {
          margin-top: 23px;
          margin-bottom: 23px;
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

        .show-sm {
          display: none;
          visibility: hidden;
        }

        .head h2 {
          margin-bottom: 0px;
          margin-top: 28px;
        }

        .bottom-section {
          display: flex;
          justify-content: flex-end;
        }

        fast-accordion-item::part(button) {
          color: var(--font-color);
        }
      `,
      // modal
      css`
        .modal-action-form {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .modal-action-form app-file-input::part(control) {
          width: 100%;
        }

        .modal-action-form loading-button {
          margin-top: 8px;
        }

        .modal-img {
          max-width: 400px;
        }
      `,
      // screenshots
      css`
        fast-text-field.screenshot-url {
          margin-bottom: 8px;
        }
      `,
      // breakpoints
      mediumBreakPoint(
        css`
          .head .top-section,
          .head .summary-body,
          .images-header,
          .info-items,
          .setting-items {
            flex-flow: column;
            justify-content: center;
            align-items: baseline;
          }

          .info-item,
          .setting-item {
            width: 100%;
          }

          fast-text-field,
          app-dropdown::part(layout) {
            width: 100%;
          }
        `,
        'no-lower'
      ),
      smallBreakPoint(css`
        #bg-custom-color {
          width: calc(100% - 32px);
        }

        .collection.image-items {
          height: 170px;
          overflow-x: scroll;
          scroll-snap-type: x proximity;
          white-space: nowrap;
          align-items: center;
        }

        .image-item {
          display: inline-block;
          width: 100px;
          white-space: initial;
          scroll-snap-align: start;
        }

        .show-sm {
          display: block;
          visibility: visible;
        }
      `),
      hidden_sm,
    ];
  }

  constructor() {
    super();

    manifestEmitter.addEventListener(AppEvents.manifestUpdate, () => {
      this.manifest = getManifest();
    });
  }

  render() {
    return html`
      <div class="panel">
        <div class="head">
          <div class="top-section">
            <h1>Manifest</h1>
          </div>

          <h2>Summary</h2>
          <div class="summary-body">
            <p>
              Easily update and upgrade your Web Manifest with our built-in Web
              Manifest editor
            </p>
            <app-button id="manifest-done-button" @click=${this.done}
              >Done</app-button
            >
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
                <form class="modal-action-form" slot="modal-form">
                  ${this.renderModalInput()}
                </form>
                <div slot="modal-actions">
                  <loading-button
                    @click=${this.handleIconFileUpload}
                    ?disabled=${this.generateIconButtonDisabled}
                    ?loading=${this.awaitRequest}
                    >Upload</loading-button
                  >
                </div>
              </app-modal>
            </div>
            <div class="collection image-items hidden-sm">
              ${this.renderIcons()}
            </div>
            <app-gallery
              class="show-sm"
              .images=${this.iconSrcListParse()}
            ></app-gallery>
            <loading-button
              class="hidden-sm"
              appearance="outline"
              ?loading=${this.awaitRequest}
              ?disabled=${this.manifest && this.manifest.icons
                ? this.manifest.icons.length > 0
                : false}
              @click=${this.downloadIcons}
              >Download</loading-button
            >
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
                class="link"
                appearance="lightweight"
                @click=${this.addNewScreenshot}
                ?disabled=${this.screenshotList?.length >= 8 || true}
                >+ Add URL</fast-button
              >
            </div>
          </div>
          <div class="collection screenshot-items hidde-sm">
            ${this.renderScreenshots()}
          </div>
          <app-gallery class="show-sm" .images=${this.screenshotSrcListParse()}>
          </app-gallery>

          <div class="screenshots-actions">
            <loading-button
              appearance="outline"
              type="submit"
              ?loading=${this.awaitRequest}
              ?disabled=${this.generateScreenshotButtonDisabled}
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
              <code-editor
                .startText=${JSON.stringify(this.manifest, null, 2)}
                @code-editor-update=${this.handleEditorUpdate}
              ></code-editor>
            </fast-accordion-item>
          </fast-accordion>
        </section>
        <section class="bottom-section">
          <app-button @click=${this.done}>Done</app-button>
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
      const value =
        this.manifest && this.manifest[item.entry]
          ? this.manifest[item.entry].toLocaleLowerCase()
          : '';

      if (item.type === 'select' && item.menuItems) {
        let index = item.menuItems.indexOf(value);

        if (index === -1) {
          const find = item.menuItems.filter(i => i.startsWith(value))[0];
          index = item.menuItems.indexOf(find);
        }

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
    return this.manifest?.icons?.map(icon => {
      const url = this.handleImageUrl(icon);

      if (url) {
        return html`<div class="image-item image">
          <img src="${url}" alt="image text" decoding="async" loading="lazy" />
          <p>${icon.sizes}</p>
        </div>`;
      }

      return undefined;
    });
  }

  renderScreenshotInputUrlList() {
    const renderFn = (url: string | undefined, index: number) => {
      const isValid = this.screenshotListValid[index];
      const showError = !isValid && url !== undefined;

      return html`<fast-text-field
          class="${classMap({
            'error': showError,
            'screenshot-url': true,
          })}"
          placeholder="https://www.example.com/screenshot"
          value="${url || ''}"
          @change=${this.handleScreenshotUrlChange}
          data-index=${index}
        ></fast-text-field>
        ${showError
          ? html`<span class="error-message"
              >${localeStrings.input.manifest.screenshot.error}</span
            >`
          : undefined} `;
    };

    return this.screenshotList.map(renderFn);
  }

  renderScreenshots() {
    return this.manifest?.screenshots?.map(screenshot => {
      const url = this.handleImageUrl(screenshot);

      if (url) {
        return html`<div class="image-item screenshot">
          <img src="${url}" alt="image text" />
        </div>`;
      } else {
        return undefined;
      }
    });
  }

  iconSrcListParse() {
    if (!this.manifest && !this.siteUrl) {
      return [];
    }

    return (
      this.manifest?.icons
        ?.map(icon => {
          return this.handleImageUrl(icon);
        })
        .filter(str => str) || []
    );
  }

  screenshotSrcListParse() {
    if (!this.manifest && !this.siteUrl) {
      return [];
    }

    return (
      this.manifest?.screenshots
        ?.map(screenshot => {
          return this.handleImageUrl(screenshot);
        })
        .filter(str => str) || []
    );
  }

  renderToolTip = tooltip;

  renderModalInput() {
    return html`
      <app-file-input
        inputId="modal-file-input"
        @input-change=${this.handleModalInputFileChange}
      ></app-file-input>
      ${this.uploadSelectedImageFile
        ? html`<img
            class="modal-img"
            src=${ifDefined(this.uploadImageObjectUrl)}
            alt="the image to upload"
          />`
        : undefined}
    `;
  }

  updateManifest(changes: Partial<Manifest>) {
    updateManifest(changes).then(() => {
      console.log('update manifest, dispatch', this.manifest);

      editorDispatchEvent(
        new CustomEvent<CodeEditorSyncEvent>(CodeEditorEvents.sync, {
          detail: {
            text: JSON.stringify(this.manifest, undefined, 2),
          },
        })
      );
    });
  }

  handleInputChange(event: InputEvent) {
    const input = <HTMLInputElement | HTMLSelectElement>event.target;
    const fieldName = input.dataset['field'];

    if (this.manifest && fieldName && this.manifest[fieldName]) {
      this.updateManifest({ [fieldName]: input.value });
    }
  }

  handleScreenshotUrlChange(event: CustomEvent) {
    const input = <HTMLInputElement>event.target;
    const index = Number(input.dataset['index']);

    this.screenshotList[index] = input.value;
    this.screenshotListValid = validateScreenshotUrlsList(this.screenshotList);
    this.generateScreenshotButtonDisabled = !this.hasScreenshotsToGenerate();
  }

  handleBackgroundRadioChange(event: CustomEvent) {
    const value: BackgroundColorRadioValues = (<HTMLInputElement>event.target)
      .value as BackgroundColorRadioValues;
    this.backgroundColorRadioValue = value;

    if (value !== 'custom' && this.manifest) {
      this.updateManifest({
        themeColor: value,
      });
    }
  }

  handleBackgroundColorInputChange(event: CustomEvent) {
    if (this.manifest) {
      const value = (<HTMLInputElement>event.target).value;

      this.updateManifest({
        themeColor: value,
      });
    }
  }

  async handleModalInputFileChange(evt: CustomEvent<FileInputDetails>) {
    const files = evt.detail.input.files ?? undefined;

    this.uploadSelectedImageFile = files?.item(0) ?? undefined;
    this.generateIconButtonDisabled = !this.validIconInput();

    if (!this.generateIconButtonDisabled) {
      this.uploadImageObjectUrl = URL.createObjectURL(
        this.uploadSelectedImageFile
      );
    } else {
      console.log('error state');
    }
  }

  async handleIconFileUpload() {
    this.awaitRequest = true;

    try {
      if (this.uploadSelectedImageFile) {
        await generateMissingImagesBase64({
          file: this.uploadSelectedImageFile,
        });
      }
    } catch (e) {
      console.error(e);
    }

    this.awaitRequest = false;
  }

  async handleDeleteImage(event: Event) {
    try {
      const input = <HTMLInputElement>event.target;
      const list = Number(input.dataset['list']);
      const index = Number(input.dataset['index']);
      const imageList: Array<Icon> = this.manifest ? this.manifest[list] : null;

      this.updateManifest({
        [list]: imageList.slice(0, index).concat(imageList.slice(index + 1)),
      });
    } catch (e) {
      console.error(e);
    }
  }

  handleEditorUpdate(event: Event) {
    const e = event as CustomEvent<CodeEditorUpdateEvent>;

    try {
      console.log(
        'handle editor update',
        e.detail.transaction.state.field(updateStateField)
      );

      const newManifest = JSON.parse(e.detail.transaction.state.doc.toString());

      updateManifest(newManifest); // explicitly not using the this.updateManifest method to prevent a infinite loop.
    } catch (ex) {
      console.error('failed to parse the manifest successfully', e, ex);
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
    this.generateScreenshotButtonDisabled = !this.hasScreenshotsToGenerate();
  }

  done() {
    const event = new CustomEvent('back-to-overview', {
      detail: {
        open: true,
      },
    });
    this.dispatchEvent(event);
  }

  openUploadModal() {
    this.uploadModalOpen = true;
  }

  uploadModalClose(event: CustomEvent<ModalCloseEvent>) {
    if (event.detail.modalId === 'uploadModal') {
      this.uploadModalOpen = false;
    }
  }

  async downloadIcons() {
    this.awaitRequest = true;

    try {
      if (this.manifest && this.manifest.icons) {
        await generateAndDownloadIconZip(this.manifest.icons);
      }
    } catch (e) {
      console.error(e);
    }

    this.awaitRequest = false;
  }

  async generateScreenshots() {
    try {
      this.awaitRequest = true;

      if (this.screenshotList && this.screenshotList.length) {
        // to-do: take another type look at this
        // @ts-ignore
        await generateScreenshots(this.screenshotList);
      }
    } catch (e) {
      console.error(e);
    }

    this.awaitRequest = false;
  }

  hasScreenshotsToGenerate() {
    return (
      this.screenshotList.length &&
      !this.screenshotListValid.includes(false) &&
      !this.screenshotList.includes(undefined)
    );
  }

  setBackgroundColorRadio() {
    if (!this.manifest?.theme_color || this.manifest?.theme_color === 'none') {
      return 'none';
    } else if (this.manifest?.theme_color === 'transparent') {
      return 'transparent';
    }

    return 'custom';
  }

  handleImageUrl(icon: Icon) {
    if (icon.src.indexOf('data:') === 0 && icon.src.indexOf('base64') !== -1) {
      return icon.src;
    }

    let url = resolveUrl(this.siteUrl, this.manifest?.startUrl);
    url = resolveUrl(url?.href, icon.src);

    if (url) {
      return url.href;
    }

    return undefined;
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
  {
    title: 'Language',
    description: 'Enter the apps primary language',
    tooltipText: 'TODO',
    entry: 'lang',
    type: 'select',
    menuItems: languageCodes,
  },
];
