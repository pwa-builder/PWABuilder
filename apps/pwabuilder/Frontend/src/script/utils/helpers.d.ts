export declare function errorInTab(areThereErrors: boolean, panel: string): CustomEvent<{
    areThereErrors: boolean;
    panel: string;
}>;
export declare function insertAfter(newNode: any, existingNode: any): void;
import { Transaction } from '@codemirror/state';
export declare enum CodeEditorEvents {
    sync = "code-editor-sync",
    update = "code-editor-update"
}
export interface CodeEditorSyncEvent {
    text: string;
}
export interface CodeEditorUpdateEvent {
    transaction: Transaction;
}
export type Lazy<T> = T | undefined;
export declare function increment(step?: number, start?: number, end?: number): Generator<number, void, unknown>;
