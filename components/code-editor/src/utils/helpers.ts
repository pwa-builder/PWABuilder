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

export type Lazy<T> = T | undefined;

export function increment(step = 1, start = 0, end?: number) {
  let i = start;

  return (function* incrementGen() {
    while (end === undefined || i < end) {
      yield i;
      i += step;
    }
  })();
}
