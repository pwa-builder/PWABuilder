import { once } from 'lodash-es';
import { EditorState, Extension, Facet, StateField } from '@codemirror/state';
import {
  keymap,
  drawSelection,
  highlightSpecialChars,
  highlightActiveLine,
  EditorView,
} from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { history, historyKeymap } from '@codemirror/history';
import { foldGutter, foldKeymap } from '@codemirror/fold';
import { indentOnInput } from '@codemirror/language';
import { lineNumbers } from '@codemirror/gutter';
import { bracketMatching } from '@codemirror/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { commentKeymap } from '@codemirror/comment';
import { rectangularSelection } from '@codemirror/rectangular-selection';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { lintKeymap } from '@codemirror/lint';
import { json } from '@codemirror/lang-json';

type EditorStateType = 'json';

export const emitter = new EventTarget();

export function getEditorState(
  text: string,
  editorType: EditorStateType,
  extensions: Array<Extension> = []
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
      defaultHighlightStyle.fallback,
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      indentOnInput(),
      history(),
      fromEditorType(editorType),
      keymap.of([
        ...defaultKeymap,
        ...foldKeymap,
        ...historyKeymap,
        ...commentKeymap,
        ...searchKeymap,
        ...lintKeymap,
        ...closeBracketsKeymap,
        ...completionKeymap,
      ]),
      ...extensions,
      stateField,
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

const stat = Facet.define({
  combine: (value: readonly unknown[]) => {
    console.log(value);
    return value;
  },
  compare: (a, b) => {
    console.log(a, b);
    return false;
  },
  static: false,
  enables: [],
});

function genFacet(config = {}): Extension {
  return [stat.of(config)];
}

// TODO start building out the event
const stateField = StateField.define<number>({
  create() {
    return 0;
  },
  update(val: number, tr) {
    return tr.docChanged ? val + 1 : val;
  },
});
