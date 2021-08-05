import { FastButtonAppearance } from './fast-element';

export interface AppButtonElement {
  type: string;
  appearance: FastButtonAppearance;
  disabled: boolean;
}

export interface AppModalElement {
  close(): Promise<void>;
}

export interface FileInputElement {
  input: HTMLInputElement;
  value: string;
  files: FileList;

  clearInput(): void;
}
