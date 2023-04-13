import { once } from 'lodash-es';
import debounce from 'lodash-es/debounce';
import {
  EditorState,
  Extension,
  StateField,
  Transaction,
} from '@codemirror/state';
import {
  keymap,
  drawSelection,
  highlightSpecialChars,
  highlightActiveLine,
  EditorView,
  lineNumbers,
  rectangularSelection
} from '@codemirror/view';
import { 
  defaultKeymap, 
  history, 
  historyKeymap,} from '@codemirror/commands';
import { indentOnInput, foldGutter, foldKeymap, bracketMatching } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { json } from '@codemirror/lang-json';
import {
  CodeEditorEvents,
  CodeEditorUpdateEvent,
} from './helpers';

type EditorStateType = 'json';

export const emitter = new EventTarget();

export const dispatchEvent = debounce((event: Event) => {
  emitter.dispatchEvent(event);
}, 1500);

export function getEditorState(
  text: string,
  editorType: EditorStateType,
  extensions: Array<Extension> = [],
  editable: boolean
) {
  setupEditor();

  return EditorState.create({
    doc: text,
    extensions: [
      lineNumbers(),
      foldGutter(),
      drawSelection(),
      indentOnInput(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      highlightSpecialChars(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      indentOnInput(),
      history(),
      fromEditorType(editorType),
      EditorView.editable.of(editable),
      keymap.of([
        ...defaultKeymap,
        ...foldKeymap,
        ...historyKeymap,
        ...searchKeymap,
        ...lintKeymap,
        ...closeBracketsKeymap,
        ...completionKeymap,
      ]),
      ...extensions,
      updateStateField,
    ],
  });
}

function fromEditorType(editorType: EditorStateType) {
  if (editorType !== 'json') {
    console.log('TODO');
  }

  return json();
}

const setupEditor = once(() => {
  // TODO: consult our designer for styles.
  EditorView.baseTheme({});
});

// just treat like redux for the time being
export const updateStateField = StateField.define<number>({
  create() {
    return 0;
  },
  update(val: number, tr: Transaction) {
    if (tr.docChanged) {
      const event = new CustomEvent<CodeEditorUpdateEvent>(
        CodeEditorEvents.update,
        {
          detail: {
            transaction: tr,
          },
          bubbles: true,
          composed: true,
        }
      );
      dispatchEvent(event);
    }

    return tr.docChanged ? val + 1 : val;
  },
});
