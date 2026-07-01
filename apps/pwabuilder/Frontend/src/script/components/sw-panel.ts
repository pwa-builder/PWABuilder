import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../components/lazy-load';

import { swPanelStyles } from "./sw-panel.styles";
@customElement('sw-panel')
export class SWPanel extends LitElement {

    @property({ type: Object }) sw: any = {};


    static styles = [swPanelStyles];

    constructor() {
        super();
    }

    handleEditorUpdate() {
        console.log("update");
    }

    importCodeEditor(): Promise<unknown> {
        return import('../components/code-editor');
    }

    renderCodeEditor(): TemplateResult {
        return html`
            <code-editor
                copyText="Copy Service Worker"
                .startText=${this.sw.code}
                .readOnly=${true}
                .editorStateType=${'javascript'}>
            </code-editor>
        `;
    }

    render() {
        return html`
      <div class="panel-holder">
        <div class="panel-desc">
          <h2>${this.sw.type}</h2>
          <p>${this.sw.desc}</p>
        </div>
        <div class="code-block">
          <h2>Code</h2>
          <lazy-load .importer=${() => this.importCodeEditor()} .renderer=${() => this.renderCodeEditor()} when="visible"></lazy-load>
          
        </code-editor>
        </div>
      </div>
    `;
    }
}