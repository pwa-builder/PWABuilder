import { LitElement } from 'lit';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
export declare class DiscordBox extends LitElement {
    show: boolean;
    static get styles(): import("lit").CSSResult;
    constructor();
    firstUpdated(): void;
    close(): void;
    render(): import("lit-html").TemplateResult<1>;
}
