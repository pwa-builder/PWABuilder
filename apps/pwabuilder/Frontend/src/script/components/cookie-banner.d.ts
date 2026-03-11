import { LitElement } from 'lit';
export declare class CookieBanner extends LitElement {
    show: boolean;
    static get styles(): import("lit").CSSResult;
    constructor();
    firstUpdated(): void;
    close(accepted: boolean): void;
    render(): import("lit-html").TemplateResult<1>;
}
