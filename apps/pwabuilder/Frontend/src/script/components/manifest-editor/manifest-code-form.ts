import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { manifestCodeFormStyles } from "./manifest-code-form.styles";
import "./toast";
import { prettyString } from "../../utils/prettyJson";
import type { Manifest } from "../../models/manifest";
import "../lazy-load";

@customElement('manifest-code-form')
export class ManifestCodeForm extends LitElement {

    @property({ type: Object }) manifest: Manifest = {};
    @state() showCopyToast: any | null = false;


    static styles = [manifestCodeFormStyles];

    render() {
        return html`
            <div id="code-holder">
                <lazy-load when="visible" .renderer=${() => this.renderCodeEditor()} .importer=${() => this.importCodeEditor()}></lazy-load>
            </div>
            ${this.showCopyToast ? html`<app-toast>Manifest Copied to Clipboard</app-toast>` : html``}
        `;
    }

    importCodeEditor(): Promise<unknown> {
        return import('..//code-editor');
    }

    renderCodeEditor(): TemplateResult {
        return html`
            <code-editor 
                .startText=${prettyString(this.manifest)} 
                .readOnly=${true}>
            </code-editor>
        `;
    }
}