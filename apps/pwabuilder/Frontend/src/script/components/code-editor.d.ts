import { LitElement } from 'lit';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { Lazy } from '../utils/helpers';
export declare class CodeEditor extends LitElement {
    startText: Lazy<string>;
    copyText: string;
    editorStateType: string;
    readOnly: boolean;
    editorState: Lazy<EditorState>;
    editorView: Lazy<EditorView>;
    editorId: string;
    editorEmitter: EventTarget;
    copied: boolean;
    protected static editorIdGenerator: Generator<number, void, unknown>;
    static get styles(): import("lit").CSSResult[];
    constructor();
    connectedCallback(): void;
    updated(changedProperties: Map<string, any>): void;
    copyCode(): Promise<void>;
    render(): import("lit-html").TemplateResult<1>;
    updateEditor: () => void;
}
