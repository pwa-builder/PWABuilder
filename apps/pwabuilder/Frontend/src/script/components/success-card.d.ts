import { LitElement } from 'lit';
export declare class SuccessCard extends LitElement {
    imageUrl: string;
    cardStat: string;
    description: string;
    cardValue: string;
    company: string;
    source: string;
    static get styles(): import("lit").CSSResult[];
    constructor();
    render(): import("lit-html").TemplateResult<1>;
}
