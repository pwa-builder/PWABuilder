import { Transaction } from '@codemirror/state';

export enum CodeEditorEvents {
  sync = 'code-editor-sync',
  update = 'code-editor-update',
}

export interface CodeEditorSyncEvent {
  text: string;
}

export interface CodeEditorUpdateEvent {
  transaction: Transaction;
}
