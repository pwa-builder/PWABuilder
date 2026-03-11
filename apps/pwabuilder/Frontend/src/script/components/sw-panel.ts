import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../components/lazy-load';

@customElement('sw-panel')
export class SWPanel extends LitElement {

    @property({ type: Object }) sw: any = {};


    static get styles() {
        return css`

      .panel-holder {
        display: flex;
        flex-direction: column;
        gap: 1em;
      }

      .panel-holder h2 {
        margin: 0;
        font-size: 22px;
      }

      .panel-holder p {
        margin: 0;
        font-size: 14px;
        color: #808080;
      }

      .panel-desc .code-block {
        display: flex;
        flex-direction: column;
        gap: .75em;
      }


    `;
    }

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