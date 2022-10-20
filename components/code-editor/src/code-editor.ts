import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import debounce from 'lodash-es/debounce';
import { getEditorState, emitter } from './utils/codemirror';
import { resizeObserver } from './utils/events';
import { Lazy, CodeEditorEvents, CodeEditorSyncEvent, increment } from './utils/helpers';

//import { AnalyticsBehavior, recordPWABuilderProcessStep } from '../../../apps/pwabuilder/src/script/utils/analytics';

@customElement('code-editor')
export class CodeEditor extends LitElement {
  @property({
    type: String,
  })
  startText: Lazy<string>;
  @property({ type: String }) copyText = 'Copy Manifest';
  @property({ type: Boolean }) readOnly = false;

  @state()
  editorState: Lazy<EditorState>;

  @state() editorView: Lazy<EditorView>;

  @state() editorId: string;

  @state() editorEmitter = emitter;

  @state() copied = false;

  protected static editorIdGenerator = increment();

  static get styles() {
    return [
      css`

        :host {
          position: relative;
        }

        sl-button::part(base) {
          --sl-button-font-size-medium: 14px;
        }
        
        #copy-block {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 10px;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .editor-container {
          font-size: 14px;
        }
      `,
    ];
  }

  constructor() {
    super();

    this.editorId = `editor-${CodeEditor.editorIdGenerator.next().value}`;

    this.editorEmitter.addEventListener(
      CodeEditorEvents.sync,
      (event: Event) => {
        const e = event as CustomEvent<CodeEditorSyncEvent>;

        this.startText = e.detail.text;
        this.updateEditor();
      }
    );

    this.editorEmitter.addEventListener(
      CodeEditorEvents.update,
      debounce((event: Event) => {
        this.dispatchEvent(event);
      })
    );

    resizeObserver.observe(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.updateEditor();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('startText')) {
      this.editorState = getEditorState(this.startText || '', 'json', [], !this.readOnly);

      if (this.editorView) {
        this.editorView.setState(this.editorState);
      } else {
        this.editorView = new EditorView({
          state: this.editorState,
          root: this.shadowRoot || undefined,
          parent: this.shadowRoot?.getElementById(this.editorId) || undefined,
        });
      }
    }
  }

  async copyCode() {
    
    let editorCopied = new CustomEvent('editorCopied', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(editorCopied);

    const doc = this.editorState?.doc;

    if (doc) {
      try {
        await navigator.clipboard.writeText(doc.toString());
        this.copyText = 'Copied';
        this.copied = true;
        setTimeout(() => {this.copyText = "Copy Manifest"; this.copied = false;}, 3000);
      } catch (err) {
        // We should never really end up here but just in case
        // lets put the error in the console
        console.warn('Copying failed with the following err', err);
      }
    }
  }

  render() {
    return html`
      <div id="copy-block">
        <slot>
          <sl-button
            ?disabled="${this.copied}"
            @click="${() => this.copyCode()}"
            class="copy-button"
          >
            ${this.copyText}</sl-button
          >
        </slot>
      </div>

      <div id=${this.editorId} class="editor-container ${this.className}" ></div>
    `;
  }

  updateEditor = debounce(() => {
    this.editorState = getEditorState(this.startText || '', 'json', [], !this.readOnly);

    if (this.editorView) {
      this.editorView.setState(this.editorState);
    } else {
      this.editorView = new EditorView({
        state: this.editorState,
        root: this.shadowRoot || undefined,
        parent: this.shadowRoot?.getElementById(this.editorId) || undefined
      });
    }
  }, 2000);
}
