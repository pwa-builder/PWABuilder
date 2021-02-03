import { LitElement, customElement, css, html, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { styleMap } from 'lit-html/directives/style-map';
import { getManifest } from '../services/manifest';

import './dropdown-menu';
import { tooltip } from './tooltip';
@customElement('manifest-options')
export class AppManifest extends LitElement {
  @property({ type: Object }) manifest;
  @property({ type: Number }) manifestScore = 0;
  @property({ type: Array }) screenshotList = [];

  static get styles() {
    return [
      css`
        app-button {
          max-width: 160px;
        }

        .panel {
          padding: 32px;
          max-width: 1009px;
        }

        .tooltip {
          height: 16px;
          width: 16px;
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

        /* .head */

        .info {
        }

        .images {
        }

        .settings {
        }

        .view-code {
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
            <h1>Score ${this.manifestScore}/40</h1>
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
                ${this.renderToolTip('TODO')}
              </div>
              <app-button @click=${this.openUploadModal}>Upload</app-button>
            </div>
            <div class="collection image-item">${this.renderIcons()}</div>

            <div class="images-actions">
              <app-button @click=${this.downloadImages}>Download</app-button>
            </div>
          </div>
          <div class="screenshots">
            <div class="screenshots-header">
              <div class="item-top">
                <h3>Generate Screenshots</h3>
                ${this.renderToolTip('TODO')}
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
            <app-button @click=${this.generateScreenshots}>Generate</app-button>
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
              <!-- TODO -->
            </fast-accordion-item>
          </fast-accordion>
        </section>
      </div>
    `;
  }

  renderInfoItems() {
    return infoItems.map(
      item => html`
        <div class="info-item">
          <div class="item-top">
            <h3>${item.title}</h3>
            ${this.renderToolTip(item.tooltipText)}
          </div>
          <p>${item.description}</p>
          <fast-text-field
            @change=${this.handleInputChange}
            data-field="${item.entry}"
            placeholder="${item.title}"
          ></fast-text-field>
        </div>
      `
    );
  }

  renderSettingsItems() {
    return settingsItems.map(item => {
      let field;

      if (item.type === 'select') {
        field = html`
          <app-dropdown .menuItems=${item.menuItems}> </dapp-dropdown>
        `;
      } else {
        field = html`<fast-text-field
          @change=${this.handleInputChange}
          data-field="${item.entry}"
        ></fast-text-field>`;
      }

      return html`
        <div class="setting-item">
          <div class="item-top">
            <h3>${item.title}</h3>
            ${this.renderToolTip(item.tooltipText)}
          </div>
          <p>${item.description}</p>
          ${field}
        </div>
      `;
    });
  }

  renderBackgroundColorSettings() {
    return html`
      <div class="settings-item inputs color">
        <label>Background Color</label>
        ${this.renderToolTip('TODO')}
        <fast-radio-group
          value="none"
          orientation="vertical"
          @change=${this.handleBackgroundRadioChange}
        >
          <fast-radio value="none">None</fast-radio>
          <fast-radio value="transparent">Transparent</fast-radio>
          <fast-radio value="custom">Custom Color</fast-radio>
        </fast-radio-group>

        <!-- TODO color input? make a separate component? -->
        <fast-text-field></fast-text-field>
      </div>
    `;
  }

  renderIcons() {
    return html`
      <div class="image">
        <img />
      </div>
    `;
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
    return html`
      <div class="screenshot">
        <img />
      </div>
    `;
  }

  renderToolTip(text: string) {
    return html`
      <span class="tooltip">
        <ion-icon name="help-outline"></ion-icon>
        <fast-tooltip>${text}</fast-tooltip>
      </span>
    `;
  }

  handleInputChange(event: InputEvent) {
    console.log(event);
  }

  handleScreenshotUrlChange(event: Event) {
    console.log(event);
  }

  handleBackgroundRadioChange(event: Event) {
    console.log(event);
    console.log((<HTMLInputElement>event.target).value);
  }

  addNewScreenshot() {
    console.log('addScreenshotsFromUrl');

    this.screenshotList.push(undefined);
    console.log(this.screenshotList);
    this.requestUpdate();
  }

  done() {
    console.log('done');
  }

  openUploadModal() {
    console.log('open upload modal', event);
  }

  downloadImages() {
    console.log('download images', event);
  }

  generateScreenshots() {
    console.log('generate screenshots', event);
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
