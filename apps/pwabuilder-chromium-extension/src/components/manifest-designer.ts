import { LitElement, html, css } from "lit";
import {customElement, state} from 'lit/decorators.js';
import { Manifest } from "../interfaces/manifest";
import { classMap } from "lit/directives/class-map.js";
import { getManifestInfo } from "../checks/manifest";

import "@shoelace-style/shoelace/dist/components/color-picker/color-picker";
import '@shoelace-style/shoelace/dist/components/divider/divider';
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/select/select';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/textarea/textarea';

interface InputItem {
  title: string;
  description: string;
  entry: string;
  type: 'input' | 'text-area' | 'select' | 'radios' | 'color-picker';
  menuItems?: Array<string>;
}

const infoItems: Array<InputItem> = [
  {
    title: 'Name',
    description: '',
    entry: 'name',
    type: 'input',
  },
  {
    title: 'Short Name',
    description: '',
    entry: 'short_name',
    type: 'input',
  },
  {
    title: 'Categories',
    description: '',
    entry: 'categories',
    type: 'input',
  },
  {
    title: 'Display',
    description: '',
    entry: 'display',
    type: 'select',
    menuItems: ['fullscreen', 'standalone', 'minimal-ui', 'browser'],
  },
  {
    title: 'Description',
    description: '',
    entry: 'description',
    type: 'text-area',
  },
  {
    title: 'Background color',
    description: '',
    entry: 'background_color',
    type: 'color-picker',
  },
  {
    title: 'Theme color',
    description: '',
    entry: 'theme_color',
    type: 'color-picker',
  }
];

const settingsItems: Array<InputItem> = [
  {
    title: "Start URL",
    description: "",
    entry: 'start_url',
    type: 'input',
  },
  {
    title: "Scope",
    description: "",
    entry: 'scope',
    type: 'input',
  },
  {
    title: "Orientation",
    description: "",
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
    title: "Language",
    description: "",
    entry: 'lang',
    type: 'select',
    menuItems: ['en', 'de', 'fr', 'es', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'],
  },
  {
    title: "Dir",
    description: "",
    entry: 'dir',
    type: 'select',
    menuItems: ['auto', 'ltr', 'rtl'],
  }
];

const imageItems: Array<InputItem> = [
  {
    title: "Icons",
    description: "",
    entry: 'icons',
    type: 'input',
  },
  {
    title: "Screenshots",
    description: "",
    entry: 'screenshots',
    type: 'input',
  }
];

const capabilityItems: Array<InputItem> = [
  {
    title:"Display Override",
    description: "",
    entry: 'display_override',
    type: 'select',
    menuItems: ['browser', 'standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'],
  },
  {
    title: "Shortcuts",
    description: "",
    entry: 'shortcuts',
    type: 'text-area',
  },
  {
    title: "Share Target",
    description: "",
    entry: 'share_target',
    type: 'text-area',
  },
  {
    title: "Protocol Handlers",
    description: "",
    entry: 'protocol_handlers',
    type: 'text-area',
  },
];

const otherItems: Array<InputItem> = [
  {
    title: "IARC rating id",
    description: "",
    entry: 'iarc_rating_id',
    type: 'input',
  },
  {
    title: "Related Applications",
    description: "",
    entry: 'related_applications',
    type: 'input',
  },
  {
    title: "Prefer related applications",
    description: "",
    entry: 'prefer_related_applications',
    type: 'radios',
  },
];

@customElement("manifest-designer")
export class ManifestDesigner extends LitElement {
  static styles = [
    css`
      h5 {
        font-size: 1.34rem;
        line-height: 110%;
        margin: 0.82rem 0 0.656rem 0;
        color: gray;
        font-weight: normal;
      }

      p {
        margin: 0;
      }

      .designer {
        display: flex;
        flex-direction: row;
      }

      .row {
        margin: 1em;
        width: 50%;
      }

      .input-field-group {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }

      .input-field {
        width: 100%;
      }

      .input-field sl-textfield,
      .input-field sl-select {
        width: 95%;
        margin-bottom: 0.75em;
        left: auto;
        right: auto;
        margin-right: auto;
      }

      sl-divider {
        margin: 1em 0;
      }

      .output-container {
        position: relative;
      }

      sl-button.button-copy {
        position: absolute;
        top: 28px;
        right: 8px;
        width: 80px;
      }

      code {
        padding: 16px;
        background: #fafafa;
        border-radius: 5px;
        display: block;
        overflow-x: auto;
        line-height: 1em;
      }

      .attribute {
        color: #5c2699;
      }

      .string {
        color: #c41a16;
      }

      @media only screen and (min-width: 993px) {
        .input-field {
          width: 50%;
        }

        .input-field.color-picker {
          width: 25%;
        }

        .color-picker sl-color-picker {
          margin-top: 0.5em;
          margin-left: 1em;
        }
      }
    
    `
  ]

  @state()
  private manifest!: Manifest;

  async firstUpdated() {
    const manifestInfo = await getManifestInfo();
    if (manifestInfo && manifestInfo.manifest) {
        this.manifest = manifestInfo.manifest;
    }
    
  }
  
  render() {
    return html`
      <div class="designer">
        <form id="form" class="row">
          <h5>Application Information</h5>
          <div class="input-field-group">${this.renderInputItems(infoItems)}</div>
          <sl-divider></sl-divider>

          <h5>Application Settings</h5>
          <div class="input-field-group">${this.renderInputItems(settingsItems)}</div>
          <sl-divider></sl-divider>

          <h5>Application Images</h5>
          <sl-divider></sl-divider>

          <h5>Advanced Capabilities</h5>
          <div class="input-field-group">${this.renderInputItems(capabilityItems)}</div>
          <sl-divider></sl-divider>

        </form>
        <!-- TODO: Copy manifest JSON-->
        <!-- TODO: Upload icons-->
        <!-- TODO: Generate .zip-->
        <section class="row">
          <h5>manifest.json</h5>
          <div id="output-container" class="output-container">
            <sl-button id="copy" class="button-copy" appearance="accent">Copy</sl-button>
            ${this.renderOutput(infoItems)}
          </div>
        </section>
      </div>
    `
  }

  renderInputItems(items: InputItem[]) {
    return items.map(item => {
      let classes: any = {'input-field': true};
      let field;      
      const value =
        this.manifest && this.manifest[item.entry]
          ? this.manifest[item.entry]
          : '';
      if (item.type === 'select' && item.menuItems) {
        let index = item.menuItems.indexOf(value);

        if (index === -1) {
          (item.menuItems).find((value, index) => {
            index = index;
          });
        }

        field = html`
          <p>${item.title}</p>
          <sl-select title="Select ${item.title}">
            ${item.menuItems.map(menuItem => {
              return html`
                <sl-menu-item value="${menuItem}">${menuItem}</sl-menu-item>
              `;
            }
          )}
          </sl-select>
        `;
      } else if (item.type === 'color-picker') {
        classes = {'input-field': true, 'color-picker': true};
        field = html `
          <p>${item.title}</p>
          <sl-color-picker value="${value}" label="Select a color"></sl-color-picker>
        `
      } else if (item.type === 'text-area') {
        field = html`
          <p>${item.title}</p>
          <sl-textarea value="${value}" placeholder=""></sl-textarea>
        `;
      } else {
        field = html`
          <sl-textarea appearance="outline" placeholder="${item.title}" value="${value}">${item.title}</sl-textarea>
        `;
      }

      return html`
        <div class=${classMap(classes)}>
          ${field}
        </div>
      `;
    });
  }

  renderOutput(items: InputItem[]) {
    return html`
      <pre>
        <code>
{
  ${items.map(item => {
    if (this.manifest && this.manifest[item.entry]) {
      return html`
        "<span class="attribute">${item.entry}</span>": "<span class="string">${this.manifest[item.entry]}</span>",
      `
    }
  })}
}
        </code>
      </pre>
    `
  }
}
