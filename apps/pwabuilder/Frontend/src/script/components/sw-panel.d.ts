import { LitElement, TemplateResult } from 'lit';
import '../components/lazy-load';
export declare class SWPanel extends LitElement {
    sw: any;
    static get styles(): import("lit").CSSResult;
    constructor();
    handleEditorUpdate(): void;
    importCodeEditor(): Promise<unknown>;
    renderCodeEditor(): TemplateResult;
    render(): TemplateResult<1>;
}
