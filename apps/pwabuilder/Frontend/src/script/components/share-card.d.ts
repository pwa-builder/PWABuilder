import { LitElement } from 'lit';
import { Ref } from 'lit/directives/ref.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
export declare class ShareCard extends LitElement {
    preventClosing: boolean;
    manifestData: string;
    swData: string;
    enhancementsData: string;
    siteName: string;
    dataURL: string;
    canShare: boolean;
    shareCanvas: Ref<HTMLCanvasElement>;
    downloadText: Ref<HTMLCanvasElement>;
    copyText: Ref<HTMLCanvasElement>;
    file: File;
    canvas: HTMLCanvasElement;
    static get styles(): import("lit").CSSResult;
    setup(): Promise<void>;
    htmlToImage(shareOption: string): void;
    downloadImage(filename: string): void;
    copyImage(): void;
    dataURLtoFile(dataurl: string, filename: string): File;
    shareFile(file: File, title: string, text: string): void;
    hideDialog(): void;
    handleRequestClose(e: Event): void;
    render(): import("lit-html").TemplateResult<1>;
}
