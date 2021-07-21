import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { localeStrings, languageCodes, langCodes } from '../../locales';

//@ts-ignore
import ErrorStyles from '../../../styles/error-styles.css';

import {
  emitter as manifestEmitter,
  getManifestGuarded,
  updateManifest,
} from '../services/manifest';
import { arrayHasChanged } from '../utils/hasChanged';
import { resolveUrl } from '../utils/url';
import {
  AppEvents,
  FileInputDetails,
  Icon,
  Lazy,
  Manifest,
  ModalCloseEvent,
  ShadowRootQuery,
} from '../utils/interfaces';
import {
  CodeEditorEvents,
  CodeEditorSyncEvent,
  CodeEditorUpdateEvent,
} from '../utils/interfaces.codemirror';
import { PreviewStage } from '../utils/interfaces.previewer';
import {
  fastTextFieldCss,
  fastButtonCss,
  fastCheckboxCss,
  fastMenuCss,
  fastRadioCss,
} from '../utils/css/fast-elements';

import './loading-button';
import './app-modal';
import './dropdown-menu';
import './app-file-input';
import './app-gallery';
import './code-editor';
import './flipper-button';
import './hover-tooltip';
import './manifest-previewer/manifest-previewer';
import { generateMissingImagesBase64 } from '../services/icon_generator';
import { generateScreenshots } from '../services/screenshots';
import { validateScreenshotUrlsList } from '../utils/manifest-validation';
import {
  mediumBreakPoint,
  smallBreakPoint,
  xLargeBreakPoint,
} from '../utils/css/breakpoints';
import { hidden_sm } from '../utils/css/hidden';
import { generateAndDownloadIconZip } from '../services/download_icons';
import { ifDefined } from 'lit/directives/if-defined.js';
import { dispatchEvent as editorDispatchEvent } from '../utils/codemirror';

import {
  AppModalElement,
  FileInputElement,
} from '../utils/interfaces.components';

type ColorRadioValues = 'none' | 'transparent' | 'custom';

@customElement('manifest-options')
export class AppManifest extends LitElement {
  @property({ type: Array, hasChanged: arrayHasChanged })
  screenshotList: Array<string | undefined> = [undefined];

  @property({ type: Boolean }) uploadModalOpen = false;
  @state() uploadButtonDisabled = true;
  @state() uploadSelectedImageFile: Lazy<File>;
  @state() uploadImageObjectUrl: string = '';

  @state() generateIconButtonDisabled = true;

  @state()
  protected addScreenshotUrlDisabled = true;

  @state()
  protected generateScreenshotButtonDisabled = true;

  @state() screenshotListValid: Array<boolean> = [];

  @state()
  protected backgroundColorRadioValue: ColorRadioValues = 'none';

  @state()
  protected backgroundColor: string | undefined;

  @state()
  protected themeColorRadioValue: ColorRadioValues = 'none';

  @state()
  protected themeColor: string | undefined;

  @state()
  protected awaitRequest = false;

  @state()
  protected searchParams: Lazy<URLSearchParams>;

  @state()
  protected editorOpened = false;

  @state()
  protected manifest: Lazy<Manifest>;

  @state()
  protected iconsList: Array<Icon> | undefined = [];

  /**
   * The current screen in the preview component.
   */
  @state() previewStage: PreviewStage = 'name';

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
      fastButtonCss,
      fastCheckboxCss,
      fastTextFieldCss,
      fastMenuCss,
      fastRadioCss,
      css`
        .custom-color-block {
          display: flex;
          flex-direction: column;
          font-weight: bold;
        }

        app-button,
        loading-button::part(underlying-button) {
          margin-top: 16px;
          margin-bottom: 8px;
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
          padding-top: 4px;
          padding-right: 6px;
          padding-left: 6px;
        }

        #bg-custom-color,
        #theme-custom-color {
          width: 8em;
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

          max-width: 700px;
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

          position: relative;
        }

        .item-top h3 {
          margin: 0;
        }

        .item-top .tooltip {
          margin-left: 4px;
        }

        .color {
          max-width: 618px;
          margin-bottom: 1em;
          margin-top: 1.5em;
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
          max-width: 205px;
          max-height: 135px;
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

        .code-editor-collapse-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

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

        .info {
          display: flex;
        }
      `,
      // screenshots
      css`
        fast-text-field.screenshot-url {
          margin-bottom: 8px;
        }
      `,
      // breakpoints
      xLargeBreakPoint(
        css`
          #report-content {
            width: 79vw;
          }
        `
      ),
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
      hidden_sm
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    try {
      this.manifest = await getManifestGuarded();
      console.log('this.manifest in guarded', this.manifest);

      if (this.manifest.icons) {
        this.iconsList = this.manifest.icons;
      }
    } catch (err) {
      // should not fall here, but if it does...
      console.warn(err);
    }

    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    manifestEmitter.addEventListener(
      AppEvents.manifestUpdate,
      this.handleManifestUpdate
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    manifestEmitter.removeEventListener(
      AppEvents.manifestUpdate,
      this.handleManifestUpdate
    );
  }

  render() {
    return html`
      <div class="panel">
        <div class="head">
          <div class="top-section">
            <h1>${localeStrings.text.manifest_options.top_section.h1}</h1>
          </div>
          <h2>${localeStrings.text.manifest_options.summary_body.h1}</h2>
          <div class="summary-body">
            <p>${localeStrings.text.manifest_options.summary_body.p}</p>
            <app-button id="manifest-done-button" @click=${this.done}
              >${localeStrings.button.done}</app-button>
          </div>
        </div>
        <fast-divider></fast-divider>
        <section class="info">
          <div>
            <h1>${localeStrings.text.manifest_options.info.h1}</h1>
            <div class="info-items inputs">${this.renderInfoItems()}</div>
          </div>
          ${(this.manifest && this.siteUrl) ? 
            html`
            <manifest-previewer 
            .manifest=${this.manifest}
            .manifestUrl=${this.siteUrl}
            .siteUrl=${this.siteUrl}
            .stage=${this.previewStage}>
            </manifest-previewer>` : null}
        </section>
        <fast-divider></fast-divider>
        <section class="images">
          <h1>${localeStrings.text.manifest_options.images.h1}</h1>
          <div class="icons">
            <div class="images-header">
              <div class="item-top">
                <h3>${localeStrings.text.manifest_options.images.icons.h3}</h3>
                <hover-tooltip
                  .text="${localeStrings.tooltip.manifest_options.upload}"
                  link="https://developer.mozilla.org/en-US/docs/Web/Manifest/icons"
                ></hover-tooltip>
              </div>
              <app-button appearance="outline" @click=${this.openUploadModal}
                >${localeStrings.button.upload}</app-button
              >
              <app-modal
                id="uploadModal"
                modalId="uploadModal"
                title="Upload information"
                body="Choose an Icon to upload. For the best results, we recommend choosing a 512x512 size icon."
                ?open=${this.uploadModalOpen}
                @app-modal-close=${this.uploadModalClose}
              >
                <form class="modal-action-form" slot="modal-form">
                  ${this.renderModalInput()}
                </form>
                <div slot="modal-actions">
                  ${this.uploadImageObjectUrl
                    ? html`<loading-button
                        class="loading-button-upload"
                        @click=${this.handleIconFileUpload}
                        ?disabled=${this.generateIconButtonDisabled}
                        ?loading=${this.awaitRequest}
                        >${localeStrings.button.upload}</loading-button
                      >`
                    : null}
                </div>
              </app-modal>
            </div>
            <div class="collection image-items hidden-sm">
              ${this.iconsList?.map(icon => {
                const url = this.handleImageUrl(icon);

                if (url) {
                  return html`<div class="image-item image">
                    <img
                      src="${url}"
                      alt="image text"
                      decoding="async"
                      loading="lazy"
                    />
                    <p>${icon.sizes}</p>
                  </div>`;
                }

                return undefined;
              })}
            </div>
            <app-gallery
              class="show-sm"
              .images=${this.iconSrcListParse()}
            ></app-gallery>

            ${this.manifest &&
            this.manifest.icons &&
            this.manifest.icons.length > 0
              ? html`<loading-button
                  class="hidden-sm"
                  appearance="outline"
                  ?loading=${this.awaitRequest}
                  @click=${this.downloadIcons}
                  >${localeStrings.button.download}</loading-button
                >`
              : null}
          </div>
          <div class="screenshots">
            <div class="screenshots-header">
              <div class="item-top">
                <h3>
                  ${localeStrings.text.manifest_options.images.screenshots.h3}
                </h3>

                <hover-tooltip
                  .text="${localeStrings.tooltip.manifest_options.generate}"
                  link="https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots"
                ></hover-tooltip>
              </div>
              <p>${localeStrings.text.manifest_options.images.screenshots.p}</p>

              <!-- url text field -->
              ${this.renderScreenshotInputUrlList()}
              <!-- Add url button -->
              <fast-button
                class="link"
                appearance="lightweight"
                @click=${this.addNewScreenshot}
                ?disabled=${this.addScreenshotUrlDisabled}
                >${localeStrings.button.add_url}</fast-button
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
              >${localeStrings.button.generate}</loading-button
            >
          </div>
        </section>
        <fast-divider></fast-divider>
        <section class="settings">
          <h1>${localeStrings.text.manifest_options.settings.h1}</h1>
          <div class="setting-items inputs">${this.renderSettingsItems()}</div>
          ${this.renderBackgroundColorSettings()}
        </section>
        <section class="view-code">
          <fast-accordion>
            <fast-accordion-item @click=${this.handleEditorOpened}>
              <div class="code-editor-collapse-header" slot="heading">
                <h1>${localeStrings.text.manifest_options.view_code.h1}</h1>
                <flipper-button
                  class="large end"
                  .opened=${this.editorOpened}
                ></flipper-button>
              </div>
              <code-editor
                .startText=${JSON.stringify(this.manifest, null, 2)}
                @code-editor-update=${this.handleEditorUpdate}
              ></code-editor>
            </fast-accordion-item>
          </fast-accordion>
        </section>
        <section class="bottom-section">
          <app-button @click=${this.done}
            >${localeStrings.button.done}</app-button
          >
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

            <hover-tooltip
              .text="${item.tooltipText}"
              link="https://developer.mozilla.org/en-US/docs/Web/Manifest"
            ></hover-tooltip>
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
          (item.menuItems as Array<langCodes>).find((value, index) => {
            value.code?.startsWith(value.code);

            index = index;
          });
        }

        field = html`
          <app-dropdown
            .menuItems=${item.menuItems}
            selectedIndex=${index}
            data-field=${item.entry}
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

            <hover-tooltip
              .text="${item.tooltipText}"
              link="https://developer.mozilla.org/en-US/docs/Web/Manifest"
            ></hover-tooltip>
          </div>
          <p>${item.description}</p>
          ${field}
        </div>
      `;
    });
  }

  renderBackgroundColorSettings() {
    this.backgroundColor = this.manifest?.background_color || undefined;
    this.themeColor = this.manifest?.theme_color || undefined;

    return html`
      <div class="setting-items inputs color">
        <div id="background-color-block">
          <div class="item-top">
            <h3>
              ${localeStrings.text.manifest_options.settings.background_color
                .h3}
            </h3>

            <hover-tooltip
              .text="${localeStrings.tooltip.manifest_options.background_color}"
              link="https://developer.mozilla.org/en-US/docs/Web/Manifest/background_color"
            ></hover-tooltip>
          </div>
          <fast-radio-group
            value=${this.setBackgroundColorRadio()}
            orientation="vertical"
            @change=${this.handleBackgroundRadioChange}
          >
            <fast-radio value="none">${localeStrings.values.none}</fast-radio>
            <fast-radio value="transparent"
              >${localeStrings.values.transparent}</fast-radio
            >
            <fast-radio value="custom"
              >${localeStrings.values.custom}</fast-radio
            >
          </fast-radio-group>

          ${this.backgroundColorRadioValue === 'custom'
            ? html`
                <div class="custom-color-block">
                  <label for="bg-custom-color"
                    >${localeStrings.values.custom}</label
                  >
                  <input
                    type="color"
                    id="bg-custom-color"
                    .value=${this.backgroundColor}
                    @change=${this.handleBackgroundColorInputChange}
                  />
                </div>
              `
            : undefined}
        </div>

        <div id="theme-color-block">
          <div class="item-top">
            <h3>
              ${localeStrings.text.manifest_options.settings.theme_color.h3}
            </h3>

            <hover-tooltip
              .text="${localeStrings.tooltip.manifest_options.theme_color}"
              link="https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color"
            ></hover-tooltip>
          </div>
          <fast-radio-group
            value=${this.setThemeColorRadio()}
            orientation="vertical"
            @change=${this.handleThemeRadioChange}
          >
            <fast-radio value="none">${localeStrings.values.none}</fast-radio>
            <fast-radio value="transparent"
              >${localeStrings.values.transparent}</fast-radio
            >
            <fast-radio value="custom"
              >${localeStrings.values.custom}</fast-radio
            >
          </fast-radio-group>

          ${this.themeColorRadioValue === 'custom'
            ? html`
                <div class="custom-color-block">
                  <label for="theme-custom-color"
                    >${localeStrings.values.custom}</label
                  >
                  <input
                    type="color"
                    id="theme-custom-color"
                    .value=${this.themeColor}
                    @change=${this.handleThemeColorInputChange}
                  />
                </div>
              `
            : undefined}
        </div>
      </div>
    `;
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

  renderModalInput() {
    return html`
      <app-file-input
        id="modal-file-input"
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
    updateManifest(changes).then(manifest => {
      console.log('manifest updated return', this.manifest, manifest);

      editorDispatchEvent(
        new CustomEvent<CodeEditorSyncEvent>(CodeEditorEvents.sync, {
          detail: {
            text: JSON.stringify(manifest, undefined, 2),
          },
        })
      );
    });
  }

  handleManifestUpdate(maniUpdates: any) {
    console.log('maniUpdates', this, maniUpdates);
    if (maniUpdates) {
      this.manifest = maniUpdates.detail;
    }
  }

  /**
   * Syncs the form state with the preview component.
   * 
   * @param fieldName - The input name that's currently being modified
   */
  handlePreviewerSync(fieldName: string) {
    switch (fieldName) {
      case 'name': 
        this.previewStage = 'name';
        break;
      case 'short_name':
        this.previewStage = 'shortName';
        break;
      case 'display':
        this.previewStage = 'display';
        break;
      case 'theme_color':
        this.previewStage = 'themeColor';
        break;
    }
  }

  handleInputChange(event: InputEvent) {
    const input = <HTMLInputElement | HTMLSelectElement>event.target;
    const fieldName = input.dataset['field'];
    
    if (this.manifest && fieldName && this.manifest[fieldName]) {
      this.handlePreviewerSync(fieldName);

      // to-do Justin: Figure out why typescript is casting input.value to a string
      // automatically and how to cast to a better type that will actually compile
      this.updateManifest({
        [fieldName]: (input.value as any).code || input.value,
      });
    }
  }

  handleScreenshotUrlChange(event: CustomEvent) {
    const input = <HTMLInputElement>event.target;
    const index = Number(input.dataset['index']);

    this.screenshotList[index] = input.value;
    this.screenshotListValid = validateScreenshotUrlsList(this.screenshotList);
    this.addScreenshotUrlDisabled = !this.disableAddUrlButton();
    this.generateScreenshotButtonDisabled = !this.hasScreenshotsToGenerate();
  }

  handleBackgroundRadioChange(event: CustomEvent) {
    const value: ColorRadioValues = (<HTMLInputElement>event.target)
      .value as ColorRadioValues;
    this.backgroundColorRadioValue = value;

    if (value !== 'custom' && this.manifest) {
      this.updateManifest({
        background_color: value,
      });
    }
  }

  handleThemeRadioChange(event: CustomEvent) {
    const value: ColorRadioValues = (<HTMLInputElement>event.target)
      .value as ColorRadioValues;
    this.themeColorRadioValue = value;

    if (value !== 'custom' && this.manifest) {
      this.updateManifest({
        theme_color: value,
      });
    }
  }

  handleBackgroundColorInputChange(event: CustomEvent) {
    if (this.manifest) {
      const value = (<HTMLInputElement>event.target).value;

      this.backgroundColor = value;
      this.updateManifest({
        background_color: value,
      });
    }
  }

  handleThemeColorInputChange(event: CustomEvent) {
    if (this.manifest) {
      const value = (<HTMLInputElement>event.target).value;

      this.themeColor = value;
      this.handlePreviewerSync('theme_color');
      this.updateManifest({
        theme_color: value,
      });
    }
  }

  setBackgroundColorRadio() {
    if (
      !this.manifest?.background_color ||
      this.manifest?.background_color === 'none'
    ) {
      return 'none';
    } else if (this.manifest?.background_color === 'transparent') {
      return 'transparent';
    }

    return 'custom';
  }

  setThemeColorRadio() {
    if (!this.manifest?.theme_color || this.manifest?.theme_color === 'none') {
      return 'none';
    } else if (this.manifest?.theme_color === 'transparent') {
      return 'transparent';
    }

    return 'custom';
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

  async handleIconFileUpload(): Promise<void> {
    this.awaitRequest = true;

    try {
      if (this.uploadSelectedImageFile) {
        // remove existing icons so we can replace them
        this.updateManifest({
          icons: undefined,
        });

        // clear our local state variable too
        this.iconsList = undefined;

        // new icons (triggers a render)
        this.iconsList = await generateMissingImagesBase64({
          file: this.uploadSelectedImageFile,
        });
      }
    } catch (e) {
      console.error(e);
    }

    this.awaitRequest = false;

    const uploadModal = this.shadowRoot?.getElementById(
      'uploadModal'
    ) as ShadowRootQuery<AppModalElement>;
    if (uploadModal) {
      uploadModal.close();
    }

    this.clearUploadModal();
  }

  clearUploadModal() {
    const appFileInput = this.shadowRoot?.getElementById(
      'modal-file-input'
    ) as ShadowRootQuery<FileInputElement>;
    appFileInput.clearInput();

    this.uploadSelectedImageFile = undefined;
    this.uploadImageObjectUrl = '';
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

  async handleEditorUpdate(event: Event) {
    const e = event as CustomEvent<CodeEditorUpdateEvent>;

    try {
      const newManifest = JSON.parse(e.detail.transaction.state.doc.toString());

      const updatedManifest = await updateManifest(newManifest); // explicitly not using the this.updateManifest method to prevent a infinite loop.

      if (updatedManifest) {
        this.manifest = updatedManifest;
      }
    } catch (ex) {
      console.error('failed to parse the manifest successfully', e, ex);
    }
  }

  handleEditorOpened() {
    this.editorOpened = !this.editorOpened;
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
    this.addScreenshotUrlDisabled = !this.disableAddUrlButton();
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
      (
        this.shadowRoot?.getElementById(
          'modal-file-input'
        ) as ShadowRootQuery<FileInputElement>
      ).clearInput();
    }
  }

  async downloadIcons() {
    this.awaitRequest = true;

    try {
      if (this.manifest && this.manifest.icons) {
        await generateAndDownloadIconZip(
          this.manifest.icons.map(icon => {
            icon.src = this.handleImageUrl(icon) || '';
            return icon;
          })
        );
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

  disableAddUrlButton() {
    return this.screenshotList?.length < 8 && this.hasScreenshotsToGenerate();
  }

  hasScreenshotsToGenerate() {
    return (
      this.screenshotList.length &&
      !this.screenshotListValid.includes(false) &&
      !this.screenshotList.includes(undefined)
    );
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
  menuItems?: Array<langCodes> | Array<string>;
}

const infoItems: Array<InputItem> = [
  {
    title: localeStrings.text.manifest_options.titles.name,
    description: localeStrings.tooltip.manifest_options.name,
    tooltipText: localeStrings.tooltip.manifest_options.name,
    entry: 'name',
    type: 'input',
  },
  {
    title: localeStrings.text.manifest_options.titles.short_name,
    description: localeStrings.text.manifest_options.descriptions.short_name,
    tooltipText: localeStrings.tooltip.manifest_options.short_name,
    entry: 'short_name',
    type: 'input',
  },
  {
    title: localeStrings.text.manifest_options.titles.description,
    description: localeStrings.text.manifest_options.descriptions.description,
    tooltipText: localeStrings.tooltip.manifest_options.description,
    entry: 'description',
    type: 'input',
  },
  {
    title: localeStrings.text.manifest_options.titles.start_url,
    description: localeStrings.text.manifest_options.descriptions.start_url,
    tooltipText: localeStrings.tooltip.manifest_options.start_url,
    entry: 'start_url',
    type: 'input',
  },
];

const settingsItems: Array<InputItem> = [
  {
    title: localeStrings.text.manifest_options.titles.scope,
    description: localeStrings.text.manifest_options.descriptions.scope,
    tooltipText: localeStrings.tooltip.manifest_options.scope,
    entry: 'scope',
    type: 'input',
  },
  {
    title: localeStrings.text.manifest_options.titles.display,
    description: localeStrings.text.manifest_options.descriptions.display,
    tooltipText: localeStrings.tooltip.manifest_options.display,
    entry: 'display',
    type: 'select',
    menuItems: ['fullscreen', 'standalone', 'minimal-ui', 'browser'],
  },
  {
    title: localeStrings.text.manifest_options.titles.orientation,
    description: localeStrings.text.manifest_options.descriptions.orientation,
    tooltipText: localeStrings.tooltip.manifest_options.orientation,
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
    title: localeStrings.text.manifest_options.titles.language,
    description: localeStrings.text.manifest_options.descriptions.language,
    tooltipText: localeStrings.tooltip.manifest_options.language,
    entry: 'lang',
    type: 'select',
    menuItems: languageCodes,
  },
];
