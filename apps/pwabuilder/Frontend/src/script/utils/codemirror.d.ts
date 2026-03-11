import { EditorState, Extension, StateField } from '@codemirror/state';
export declare const emitter: EventTarget;
export declare const dispatchEvent: (event: Event) => void;
export declare function getEditorState(text: string, editorType: string, extensions: Array<Extension> | undefined, editable: boolean): EditorState;
export declare const updateStateField: StateField<number>;
