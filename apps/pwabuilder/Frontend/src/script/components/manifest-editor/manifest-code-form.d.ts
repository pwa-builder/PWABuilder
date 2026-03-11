import { LitElement, TemplateResult } from 'lit';
import "./toast";
import { Manifest } from "@pwabuilder/manifest-validation";
export declare class ManifestCodeForm extends LitElement {
    manifest: Manifest;
    showCopyToast: any | null;
    static get styles(): import("lit").CSSResult[];
    render(): TemplateResult<1>;
    importCodeEditor(): Promise<unknown>;
    renderCodeEditor(): TemplateResult;
}
