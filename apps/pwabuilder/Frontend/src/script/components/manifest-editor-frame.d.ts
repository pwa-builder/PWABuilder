import { LitElement } from 'lit';
import { Manifest } from '@pwabuilder/manifest-validation';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import { ManifestContext } from '../utils/interfaces';
import '../components/manifest-editor/pwa-manifest-editor.js';
export declare class ManifestEditorFrame extends LitElement {
    isGenerated: boolean;
    startingTab: string;
    focusOn: string;
    analysisId: string;
    manifest: Manifest;
    manifestURL: string;
    baseURL: string;
    tooltipOpen: boolean;
    static get styles(): import("lit").CSSResult[];
    constructor();
    connectedCallback(): void;
    launch(appUrl: string, manifest: ManifestContext): void;
    downloadManifest(): void;
    hideDialog(e: any): Promise<void>;
    openDialog(): Promise<void>;
    handleTabSwitch(e: CustomEvent): void;
    handleManifestDownloaded(): void;
    handleFieldChange(e: CustomEvent): void;
    handleManifestCopied(): void;
    handleImageGeneration(e: CustomEvent, field: string): void;
    handleUploadIcon(): void;
    render(): import("lit-html").TemplateResult<1>;
}
