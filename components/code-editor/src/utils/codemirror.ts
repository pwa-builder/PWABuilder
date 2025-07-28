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
import { indentOnInput, foldGutter, foldKeymap, bracketMatching, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { json } from '@codemirror/lang-json';
import { javascript } from '@codemirror/lang-javascript';
import {tags} from "@lezer/highlight"
import {
  CodeEditorEvents,
  CodeEditorUpdateEvent,
} from './helpers';
import { debounce } from './debounce';
import { once } from './once';

export const emitter = new EventTarget();

export const dispatchEvent = debounce((event: Event) => {
  emitter.dispatchEvent(event);
}, 1500);

// Define the highlight style with accessibility improvements.
const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#708' },
  { tag: tags.name, color: '#292c3a' },
  { tag: tags.string, color: '#aa1111' },
  { tag: tags.comment, color: '#292c3a' },
  { tag: tags.bool, color: '#221199'},
  // Accessibility fix: Use WCAG AA compliant color for builtin tokens like "console"
  // Original problematic color #669900 had 3.43:1 contrast ratio
  // New color #4d7300 provides 5.57:1 contrast ratio, exceeding 4.5:1 requirement
  { tag: tags.variableName, color: '#4d7300' }
]);

export function getEditorState(
  text: string,
  editorType: string,
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
      syntaxHighlighting(myHighlightStyle),
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

function fromEditorType(editorType: string) {
  if(editorType === "javascript") return javascript();
  if(editorType === "json") return json();
  
  console.log(`Unknown editor type: ${editorType}. Using JSON syntax highlighter.`);
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
