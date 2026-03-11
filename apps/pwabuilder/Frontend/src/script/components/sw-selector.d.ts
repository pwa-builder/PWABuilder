import { LitElement } from 'lit';
import '../components/sw-panel';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
export declare class SWSelector extends LitElement {
    selectedSW: string;
    private swNameList;
    static get styles(): import("lit").CSSResult;
    constructor();
    hideDialog(e: any): Promise<void>;
    setSelectedSW(e: any): void;
    downloadSW(): void;
    render(): import("lit-html").TemplateResult<1>;
}
