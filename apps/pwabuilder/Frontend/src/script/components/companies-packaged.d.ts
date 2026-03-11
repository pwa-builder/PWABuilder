import { LitElement } from 'lit';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
export declare class ComapniesPackaged extends LitElement {
    companies: string[];
    paused: boolean;
    static get styles(): import("lit").CSSResult[];
    constructor();
    connectedCallback(): void;
    shuffle(array: any): any;
    toggleAnimation(): void;
    render(): import("lit-html").TemplateResult<1>;
}
