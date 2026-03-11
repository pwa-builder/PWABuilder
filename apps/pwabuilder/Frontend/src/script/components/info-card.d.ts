import { LitElement } from 'lit';
export declare class Infocard extends LitElement {
    imageUrl: string;
    cardTitle: string;
    description: string;
    linkRoute: string;
    static get styles(): import("lit").CSSResult[];
    constructor();
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
