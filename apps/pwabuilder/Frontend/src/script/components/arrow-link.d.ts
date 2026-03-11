import { LitElement } from 'lit';
export declare class ArrowLink extends LitElement {
    link: string;
    text: string;
    static get styles(): import("lit").CSSResult[];
    constructor();
    trackLinkClick(linkDescription: string): void;
    render(): import("lit-html").TemplateResult<1>;
}
