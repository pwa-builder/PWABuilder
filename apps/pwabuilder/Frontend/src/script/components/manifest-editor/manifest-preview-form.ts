// import '@pwabuilder/manifest-previewer';
// import { PreviewStage } from '@pwabuilder/manifest-previewer/dist/models';
import type { Manifest } from "../../models/manifest";
import { LitElement, html } from 'lit';
import { manifestPreviewFormStyles } from "./manifest-preview-form.styles";
import { customElement, property, state } from 'lit/decorators.js';

@customElement('manifest-preview-form')
export class ManifestPreviewForm extends LitElement {

    @property({ type: Object }) manifest: Manifest = {};
    @property({ type: String }) manifestURL: string = "";

    // The current preview screen
    @state() previewStage: string = 'name';

    static styles = [manifestPreviewFormStyles];

    constructor() {
        super();
    }

    render() {
        return html`
      <manifest-previewer
        disabled-platforms="iOS"
        platform="windows"
        .manifest=${new Proxy(this.manifest, {
            get: (target, prop: string) => {
                return target[prop];
            },
            set: () => false,
        })}
        .manifestUrl=${this.manifestURL}
        .stage=${this.previewStage}
        .disabledPlatforms=${'iOS'}
      >
      </manifest-previewer>
    `;
    }
}
