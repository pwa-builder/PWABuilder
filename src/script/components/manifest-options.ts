import { LitElement, css, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { localeStrings, languageCodes, langCodes } from '../../locales';

//@ts-ignore
import ErrorStyles from '../../../styles/error-styles.css';

import { fetchOrCreateManifest, updateManifest } from '../services/manifest';
import { arrayHasChanged } from '../utils/hasChanged';
import { resolveUrl } from '../utils/url';
import {
  FileInputDetails,
  Icon,
  Screenshot,
  Lazy,
  Manifest,
  ModalCloseEvent,
  ShadowRootQuery
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
import { resizeObserver } from '../utils/events';

import '@pwabuilder/manifest-previewer';
import { PreviewStage } from '@pwabuilder/manifest-previewer/dist/models';
import './loading-button';
import './app-modal';
import './dropdown-menu';
import './app-file-input';
import './app-gallery';
import './code-editor';
import './flipper-button';
import './info-circle-tooltip';
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
import { IconInfo } from '../utils/icons';
import { debounce } from '../utils/debounce';

type ColorRadioValues = 'none' | 'custom';

@customElement('manifest-options')
export class AppManifest extends LitElement {
  @property({ type: Array, hasChanged: arrayHasChanged })
  screenshotUrlList: Array<string | undefined> = [undefined];

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

  @state()
  protected screenshotsList: Array<Screenshot> = [];

  @state() errored: boolean = false;
  @state() errorMessage: string | undefined = undefined;

  /**
   * The current preview screen.
   */
  @state() previewStage: PreviewStage = 'name';

  // Debounced because color pickers UI can rapidly change the value.
  // We do taxing work when updating the manifest: stringify the manifest JSON and update the code editor, update the manifest previewer, etc.
  // Without debouncing, these rapid UI updates would result in a sluggish UI
  private debouncedUpdateThemeColor = debounce((newThemeColor: string) => this.updateThemeColor(newThemeColor), 200);
  private debouncedUpdateBackgroundColor = debounce((newBgColor: string) => this.updateBackgroundColor(newBgColor), 200);

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
          margin: 16px 0;
        }

        fast-divider {
          margin: 16px 0;
          border-color: rgb(229, 229, 229);
        }

        fast-text-field::part(control)::placeholder {
          color: var(--placeholder-color);
          font-style: italic;
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

          max-width: 650px;
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
          max-width: 480px;
          width: 100%;
          margin-bottom: 1em;
          margin-top: 1.5em;
        }

        .image-item {
          background-color: transparent;
          margin: 8px;
        }

        .image,
        .image img {
          max-width: 200px;
        }

        .image .info {
          display: flex;
          flex-flow: row;
          justify-content: center;
          align-items: center;
        }

        .screenshot {
          max-width: 230px;
        }
        .screenshot img {
          max-width: 205px;
          max-height: 135px;
        }

        .delete-button {
          --button-font-color: var(--font-color);
          margin: 0;
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

        .download-icon-button {
          width: 150px;
          height: 40px;
          display: inherit;
        }

        .generate-button {
          width: 150px;
          height: 40px;
          display: inherit;
          margin-bottom: 15px;
          margin-top: 15px;
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
      hidden_sm,

      // Manifest previewer
      css`
        .info {
          display: flex;
        }

        manifest-previewer {
          margin-left: 100px;
          line-height: normal;
          --windows-font-family: 'Segoe';
          --android-font-family: 'Roboto';
        }

        manifest-previewer::part(platform-buttons) {
          justify-content: space-around;
        }

        @media (max-width: 800px) {
          manifest-previewer {
            display: none;
          }
        }
      `,
    ];
  }

  constructor() {
    super();
  }

  async firstUpdated() {    
    try {
      const manifestContext = await fetchOrCreateManifest();
      this.manifest = manifestContext.manifest;

      if (this.manifest.icons) {
        this.iconsList = this.manifest.icons;
        //console.log("ICONS LIST", this.iconsList);
      }

      this.requestUpdate();
    } catch (err) {
      // should not fall here, but if it does...
      console.warn(err);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  renderDownloadButton(): TemplateResult {
    if(this.iconsList) {
     return html`<loading-button
            class="hidden-sm download-icon-button"
            appearance="outline"
            ?loading=${this.awaitRequest}
            ?secondary=${true}
            @click=${this.downloadIcons}
            >${localeStrings.button.download}</loading-button
          >`
    } 
    return html``;
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
              >${localeStrings.button.done}</app-button
            >
          </div>
        </div>
        <fast-divider></fast-divider>
        <section class="info">
          <div>
            <h1>${localeStrings.text.manifest_options.info.h1}</h1>
            <div class="info-items inputs">
              ${this.renderSectionItems(infoItems)}
              ${this.renderBackgroundColorSettings()}
            </div>
          </div>
          ${this.manifest
            ? html`
                <manifest-previewer
                  disabled-platforms="iOS"
                  platform="windows"
                  .manifest=${new Proxy(this.manifest, {
                    get: (target, prop: string) => {
                      return target[prop];
                    },
                    set: () => false,
                  })}
                  .siteUrl=${this.siteUrl}
                  .manifestUrl=${this.siteUrl}
                  .stage=${this.previewStage}
                  .disabledPlatforms=${'iOS'}
                >
                </manifest-previewer>
              `
            : null}
        </section>
        <fast-divider></fast-divider>
        <section class="settings">
          <h1>${localeStrings.text.manifest_options.settings.h1}</h1>
          <div class="setting-items inputs">
            ${this.renderSectionItems(settingsItems)}
          </div>
        </section>
        <fast-divider></fast-divider>
        <section class="images">
          <h1>${localeStrings.text.manifest_options.images.h1}</h1>
          <div class="icons">
            <div class="images-header">
              <div class="item-top">
                <h3>${localeStrings.text.manifest_options.images.icons.h3}</h3>
                <info-circle-tooltip 
                  .text="${localeStrings.tooltip.manifest_options.upload}"
                  link="https://developer.mozilla.org/en-US/docs/Web/Manifest/icons">
                </info-circle-tooltip>
              </div>
              <app-button appearance="outline" @click=${this.openUploadModal}
                >${localeStrings.button.upload}</app-button
              >
              <app-modal
                id="uploadModal"
                modalId="uploadModal"
                heading="${!this.errored ? 'Upload Information' : 'Wait A Minute!'}"
                body="${!this.errored ? 'Choose an Icon to upload. For the best results, we recommend choosing a 512x512 size icon.': this.errorMessage || ''}"
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
              ${this.iconsList?.map((icon, i) => {
                const url = this.handleImageUrl(icon);
                //console.log("EACH ICON:", icon, i);

                if (url) {
                  return html`<div class="image-item image">
                    <img
                      src="${url}"
                      alt="image text"
                      decoding="async"
                      loading="lazy"
                    />
                    <div class="info">
                      <p>${icon.sizes}</p>
                      ${this.renderDeleteImageButton('icons', i)}
                    </div>
                  </div>`;
                }

                return undefined;
              })}
            </div>

            ${this.manifest &&
            this.manifest.icons &&
            this.manifest.icons.length > 0
              ? html`<app-gallery
                  class="show-sm"
                  .images=${this.iconSrcListParse()}
                ></app-gallery>`
              : null}
        ${this.renderDownloadButton()}
          </div>
          <div class="screenshots">
            <div class="screenshots-header">
              <div class="item-top">
                <h3>
                  ${localeStrings.text.manifest_options.images.screenshots.h3}
                </h3>
                <info-circle-tooltip 
                  .text="${localeStrings.tooltip.manifest_options.generate}"
                  link="https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots">
                </info-circle-tooltip>
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
          <div class="collection screenshot-items hidden-sm">
            ${this.renderScreenshots()}
          </div>

          ${(this.screenshotsList && this.screenshotsList.length > 0) ||
          (this.manifest?.screenshots && this.manifest.screenshots.length > 0)
            ? html`<app-gallery
                class="show-sm"
                .images=${this.screenshotSrcListParse()}
              >
              </app-gallery>`
            : null}

          <div class="screenshots-actions">
            <loading-button
              class="generate-button"
              appearance="outline"
              type="submit"
              ?loading=${this.awaitRequest}
              ?disabled=${this.generateScreenshotButtonDisabled}
              ?secondary=${true}
              @click=${this.generateScreenshots}
              >${localeStrings.button.generate}</loading-button
            >
          </div>
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
                .startText=${this.getManifestCodeForEditor()}
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

  renderSectionItems(items: InputItem[]) {
    return items.map(item => {
      let field;
      const value =
        this.manifest && this.manifest[item.entry]
          ? this.manifest[item.entry]
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
            @focus=${() => this.switchManifestPreviewerPage(item.entry)}
          >
          </app-dropdown>
        `;
      } else {
        field = html`<fast-text-field
          data-field="${item.entry}"
          placeholder="${item.title}"
          .value=${value}
          @input=${this.handleInputChange}
          @focus=${() => this.switchManifestPreviewerPage(item.entry)}
        ></fast-text-field>`;
      }

      return html`
        <div class="setting-item">
          <div class="item-top">
            <h3>${item.title}</h3>
            <info-circle-tooltip 
              .text="${item.tooltipText}"
              link="https://developer.mozilla.org/en-US/docs/Web/Manifest">
            </info-circle-tooltip>
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

            <info-circle-tooltip 
              .text="${localeStrings.tooltip.manifest_options.background_color}"
              link="https://developer.mozilla.org/en-US/docs/Web/Manifest/background_color">
            </info-circle-tooltip>
          </div>
          <fast-radio-group
            value=${this.setBackgroundColorRadio()}
            orientation="vertical"
            @change=${this.handleBackgroundRadioChange}
          >
            <fast-radio value="none">${localeStrings.values.none}</fast-radio>
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
                    .value=${this.backgroundColor || ''}
                    @input=${this.backgroundColorInputChanged}
                    @focus=${() => this.switchManifestPreviewerPage('background_color')}
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
            <info-circle-tooltip 
              .text="${localeStrings.tooltip.manifest_options.theme_color}"
              link="https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color">
            </info-circle-tooltip>
          </div>
          <fast-radio-group
            value=${this.setThemeColorRadio()}
            orientation="vertical"
            @change=${this.handleThemeRadioChange}
          >
            <fast-radio value="none">${localeStrings.values.none}</fast-radio>
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
                    .value=${this.themeColor || ''}
                    @input=${this.themeColorInputChanged}
                    @focus=${() => this.switchManifestPreviewerPage('theme_color')}
                  />
                </div>
              `
            : undefined}
        </div>
      </div>
    `;
  }

  handleScreenshotButtonEnabled() {
    if (this.generateScreenshotButtonDisabled === true) {
      this.generateScreenshotButtonDisabled = false;
    }
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
          @input=${this.handleScreenshotButtonEnabled}
          @change=${this.handleScreenshotUrlChange}
          data-index=${index}
        ></fast-text-field>
        ${showError
          ? html`<span class="error-message"
              >${localeStrings.input.manifest.screenshot.error}</span
            >`
          : undefined} `;
    };

    return this.screenshotUrlList.map(renderFn);
  }

  renderScreenshots() {
    return this.screenshotsList.map((screenshot, i) => {
      const url = this.handleImageUrl(screenshot);

      if (url) {
        return html`<div class="image-item screenshot">
          <img src="${url}" alt="image text" />
          ${this.renderDeleteImageButton('screenshots', i)}
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
        ?.map(icon => this.handleImageUrl(icon) || '')
        .filter(str => str) || []
    );
  }

  screenshotSrcListParse(): string[] {
    if (!this.manifest && !this.siteUrl) {
      return [];
    }

    return (
      this.manifest?.screenshots
        ?.map(screenshot => this.handleImageUrl(screenshot) || '')
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

  updatePageManifest(changes: Partial<Manifest>) {
    this.manifest = updateManifest(changes);
    editorDispatchEvent(
      new CustomEvent<CodeEditorSyncEvent>(CodeEditorEvents.sync, {
        detail: {
          text: this.getManifestCodeForEditor(),
        },
      })
    );
  }

  async handleInputChange(event: InputEvent) {
    const input = <HTMLInputElement | HTMLSelectElement>event.target;
    const fieldName = input.dataset['field'];
    if (this.manifest && fieldName && this.manifest[fieldName] !== undefined) {
      this.switchManifestPreviewerPage(fieldName);

      await this.updatePageManifest({
        [fieldName]: (input.value as any).code || input.value,
      }); 

      // While manifest is a reactive property, the manifest's fields aren't.
      // Thus, we have to tell Lit that the manifest has been updated.
      // Without this, the Manifest Previewer won't show the new value until the input loses focus.
      super.requestUpdate();
    }
  }

  private switchManifestPreviewerPage(fieldName: keyof Manifest) {
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
      case 'background_color':
        this.previewStage = 'splashScreen';
        break;
      case 'description':
        this.previewStage = 'description';
    }
  }

  handleScreenshotUrlChange(event: CustomEvent) {
    const input = <HTMLInputElement>event.target;
    const index = Number(input.dataset['index']);

    this.screenshotUrlList[index] = input.value;
    this.screenshotListValid = validateScreenshotUrlsList(
      this.screenshotUrlList
    );
    this.addScreenshotUrlDisabled = !this.disableAddUrlButton();
    this.generateScreenshotButtonDisabled = !this.hasScreenshotsToGenerate();
  }

  handleBackgroundRadioChange(event: CustomEvent) {
    const value: ColorRadioValues = (<HTMLInputElement>event.target)
      .value as ColorRadioValues;
    this.backgroundColorRadioValue = value;

    if (value !== 'custom' && this.manifest) {
      this.updatePageManifest({
        background_color: value,
      });
    }
  }

  handleThemeRadioChange(event: CustomEvent) {
    const value: ColorRadioValues = (<HTMLInputElement>event.target)
      .value as ColorRadioValues;
    this.themeColorRadioValue = value;

    if (value !== 'custom' && this.manifest) {
      this.updatePageManifest({
        theme_color: value,
      });
    }
  }

  backgroundColorInputChanged(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.backgroundColor = value;
    this.debouncedUpdateBackgroundColor(value);
  }

  themeColorInputChanged(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    
    this.debouncedUpdateThemeColor(value);
  }

  updateThemeColor(color: string) {
    this.themeColor = color;
    this.updatePageManifest({
      theme_color: color
    });
  }

  updateBackgroundColor(color: string) {
    this.backgroundColor = color;
    this.updatePageManifest({
      background_color: color
    });
  }

  setBackgroundColorRadio() {
    if (
      !this.manifest?.background_color ||
      this.manifest?.background_color === 'none'
    ) {
      return 'none';
    }

    return 'custom';
  }

  setThemeColorRadio() {
    if (!this.manifest?.theme_color || this.manifest?.theme_color === 'none') {
      return 'none';
    }

    return 'custom';
  }

  async handleModalInputFileChange(evt: CustomEvent<FileInputDetails>) {
    this.errored = false;
    const files = evt.detail.input.files ?? undefined;

    this.uploadSelectedImageFile = files?.item(0) ?? undefined;
    this.generateIconButtonDisabled = !this.validIconInput();

    if (!this.generateIconButtonDisabled && this.uploadSelectedImageFile) {
      this.uploadImageObjectUrl = URL.createObjectURL(
        this.uploadSelectedImageFile
      );
    } else {
      this.errored = true;
      this.errorMessage = "File type is not supported. Please use .PNG, .JPG, .SVG";
    }
  }

  async handleIconFileUpload(): Promise<void> {
    this.awaitRequest = true;

    try {
      if (this.uploadSelectedImageFile) {
        // remove existing icons so we can replace them
        this.updatePageManifest({
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

  renderDeleteImageButton(list: 'icons' | 'screenshots', index: number) {
    return html`
      <app-button
        class="delete-button"
        appearance="lightweight"
        data-list=${list}
        data-index=${index}
        @click=${this.handleDeleteImage}
      >
        <ion-icon
          name="trash-outline"
          data-list=${list}
          data-index=${index}
        ></ion-icon>
      </app-button>
    `;
  }

  handleDeleteImage(event: Event) {
    try {
      const input = <HTMLButtonElement>event.target;
      const list = input.dataset['list'] as 'icons' | 'screenshots';
      const index = Number(input.dataset['index']);
    
      if (list === 'icons') {
        let filteredIconList = this.iconsList?.filter((_icon, i) => index !== i);
        
        this.updatePageManifest({
          [list]: filteredIconList,
        });

        this.iconsList = filteredIconList;
      }

      if (list === 'screenshots') {
        let filteredScreenshotList = this.screenshotsList?.filter((_image, i) => index !== i);

        this.updatePageManifest({
          [list]: filteredScreenshotList,
        });

        this.screenshotsList = filteredScreenshotList;
      }  
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

  getManifestCodeForEditor(): string {
    // Return the JSON of the manifest. 
    // Except, swap out the manifest URL-encoded images with image links. 
    // Otherwise, users open issues asking why they can't create package with manifest we gave them.
    // See https://github.com/pwa-builder/PWABuilder/issues/2038
    const clone = { ...this.manifest };
    if (clone.icons) {
      clone.icons = clone.icons
        .map(i => new IconInfo(i))
        .map((i, index) => i.createIconWithoutUrlEncodedSrc(`/images/icon-${index + 1}.${i.getProbableFileExtension()}`)
      );
    }
    if (clone.screenshots) {
      clone.screenshots = clone.screenshots
        .map(i => new IconInfo(i))
        .map((i, index) => i.createIconWithoutUrlEncodedSrc(`/images/screenshot-${index + 1}.${i.getProbableFileExtension()}`)
      );
    }
       
    return JSON.stringify(clone, null, 2);
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
    this.screenshotUrlList = [...(this.screenshotUrlList || []), undefined];
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
      if (this.manifest && this.iconsList) {
        await generateAndDownloadIconZip(
          this.iconsList.map(icon => {
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

      if (this.screenshotUrlList && this.screenshotUrlList.length) {
        // to-do: take another type look at this
        // @ts-ignore
        const screenshots = await generateScreenshots(this.screenshotUrlList);

        if (screenshots) {
          this.screenshotsList = screenshots;
        }
      }
    } catch (e) {
      console.error(e);
    }

    this.awaitRequest = false;
  }

  disableAddUrlButton() {
    return (
      this.screenshotUrlList?.length < 8 && this.hasScreenshotsToGenerate()
    );
  }

  hasScreenshotsToGenerate() {
    return (
      this.screenshotUrlList.length &&
      !this.screenshotListValid.includes(false) &&
      !this.screenshotUrlList.includes(undefined)
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
    title: localeStrings.text.manifest_options.titles.display,
    description: localeStrings.text.manifest_options.descriptions.display,
    tooltipText: localeStrings.tooltip.manifest_options.display,
    entry: 'display',
    type: 'select',
    menuItems: ['fullscreen', 'standalone', 'minimal-ui', 'browser'],
  },
];

const settingsItems: Array<InputItem> = [
  {
    title: localeStrings.text.manifest_options.titles.start_url,
    description: localeStrings.text.manifest_options.descriptions.start_url,
    tooltipText: localeStrings.tooltip.manifest_options.start_url,
    entry: 'start_url',
    type: 'input',
  },
  {
    title: localeStrings.text.manifest_options.titles.scope,
    description: localeStrings.text.manifest_options.descriptions.scope,
    tooltipText: localeStrings.tooltip.manifest_options.scope,
    entry: 'scope',
    type: 'input',
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