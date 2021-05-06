import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import debounce from 'lodash-es/debounce';
import { getEditorState, emitter } from '../utils/codemirror';

import { Lazy } from '../utils/interfaces';
import {
  CodeEditorEvents,
  CodeEditorSyncEvent,
} from '../utils/interfaces.codemirror';
import { increment } from '../utils/id';

@customElement('code-editor')
export class CodeEditor extends LitElement {
  @property({ type: String }) startText: Lazy<string>;

  @state()
  editorState: Lazy<EditorState>;

  @state() editorView: Lazy<EditorView>;

  @state() editorId: Lazy<string>;

  @state() editorEmitter = emitter;

  protected static editorIdGenerator = increment();

  static get styles() {
    return [
      css`
        .editor-container {
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
      (event: Event) => {
        this.dispatchEvent(event);
      }
    );
  }

  firstUpdated() {
    this.updateEditor();
  }

  render() {
    return html`
      <div id=${this.editorId} class="editor-container ${this.className}"></div>
    `;
  }

  updateEditor = debounce(() => {
    this.editorState = getEditorState(this.startText, 'json');

    if (this.editorView) {
      this.editorView.setState(this.editorState);
    } else {
      this.editorView = new EditorView({
        state: this.editorState,
        root: this.shadowRoot,
        parent: this.shadowRoot.getElementById(this.editorId),
      });
    }
  }, 2000);
}
