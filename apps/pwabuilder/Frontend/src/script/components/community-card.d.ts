import { LitElement } from 'lit';
import { link } from './community-hub-cards';
export declare class CommunityCard extends LitElement {
    imageUrl: string;
    cardTitle: string;
    description: string;
    company: string;
    links: link[];
    static get styles(): import("lit").CSSResult[];
    constructor();
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
