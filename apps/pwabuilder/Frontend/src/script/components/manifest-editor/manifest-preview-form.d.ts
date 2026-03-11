import { Manifest } from "@pwabuilder/manifest-validation";
import { LitElement } from 'lit';
export declare class ManifestPreviewForm extends LitElement {
    manifest: Manifest;
    manifestURL: string;
    previewStage: string;
    static get styles(): import("lit").CSSResult;
    constructor();
    render(): import("lit-html").TemplateResult<1>;
}
