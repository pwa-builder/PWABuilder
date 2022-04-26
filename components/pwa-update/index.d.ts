/// <reference lib="dom" />

declare global {
  interface HTMLElementTagNameMap {
    "pwa-update": PWAUpdateComponent;
  }

  interface PWAUpdateComponent extends HTMLElement {
    swpath: string;
    updateevent: string;
    updatemessage: string;
    readyToAsk: boolean;
    showStorageEstimate: boolean;
    offlineToastDuration: number;
  }
}

export {};
