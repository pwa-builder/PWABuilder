import { LitElement, customElement, css, html, property } from 'lit-element';

@customElement('manifest-options')
export class AppManifest extends LitElement {
  @property({ type: Object }) manifest = {};

  static get styles() {
    return css``;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div>
        <div class="head">
          <!-- TODO borrow the manifest header from the report card -->
          <div>
            <h1>Manifest</h1>
            <h1>Score 00/40</h1>
          </div>

          <h2>Summary</h2>
          <div>
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
              <h3>Upload App Icons</h3>
              ${this.renderToolTip('TODO')}
              <app-button @click=${this.openUploadModal}>Upload</app-button>
            </div>
            <div class="collection image-item">${this.renderIcons()}</div>

            <div class="images-actions">
              <app-button @click=${this.downloadImages}>Download</app-button>
            </div>
          </div>
          <div class="screenshots">
            <div class="screenshots-header">
              <h3>Generate Screenshots</h3>
              ${this.renderToolTip('TODO')}
              <p>
                Specify the URLs to generate desktop and mobile screenshots
                from. You may add up to 8 screenshots or Store Listings.
              </p>
              <!-- url text field -->
              <fast-text-field></fast-text-field>
              <!-- Add url button -->
              <fast-button>+ Add URL</fast-button>
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
          ${this.renderBakcgroundColorSettings()}
        </section>
        <fast-divider></fast-divider>
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
          <h3>${item.title}</h3>
          ${this.renderToolTip(item.tooltipText)}
          <p>${item.description}</p>
          <fast-text-field
            @change=${this.handleInputChange}
            data-field="${item.entry}"
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
          <dropdown-menu .menuItem=${item.menuItems}></dropdown-menu>
        `;
      } else {
        field = html`<fast-text-field
          @change=${this.handleInputChange}
          data-field="${item.entry}"
        ></fast-text-field>`;
      }

      return html`
        <div class="setting-item">
          <h3>${item.title}</h3>
          ${this.renderToolTip(item.tooltipText)}
          <p>${item.description}</p>
          ${field}
        </div>
      `;
    });
  }

  renderBakcgroundColorSettings() {
    return html`
      <div class="settings-items inputs color">
        <h3>Background Color</h3>
        ${this.renderToolTip('TODO')}
        <fast-radio-group>
          <fast-radio>None</fast-radio>
          <fast-radio>Transparent</fast-radio>
          <fast-radio>Custom Color</fast-radio>
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

  renderScreenshots() {
    return html`
      <div class="screenshot">
        <img />
      </div>
    `;
  }

  renderToolTip(text: string) {
    return html`
      <div class="tooltip">
        <ion-icon name="help-outline"></ion-icon>
        <fast-tooltip>${text}</fast-tooltip>
      </div>
    `;
  }

  handleInputChange(event: InputEvent) {
    console.log(event);
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
    title: 'Scope',
    description: 'Enter app scope',
    tooltipText: 'TODO',
    entry: 'scope',
    type: 'select',
    menuItems: [],
  },
  {
    title: 'Scope',
    description: 'Enter app scope',
    tooltipText: 'TODO',
    entry: 'scope',
    type: 'select',
    menuItems: [],
  },
];
