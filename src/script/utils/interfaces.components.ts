export interface AppButtonElement {
  type: string;
  colorMode: string;
  appearance: string;
  disabled: boolean;
}

export interface AppModalElement {
  close(): Promise<void>
}