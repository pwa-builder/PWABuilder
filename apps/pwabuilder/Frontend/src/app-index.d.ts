import { LitElement } from 'lit';
import './script/components/app-footer';
import './script/components/app-button';
import './script/components/discord-box';
export declare class AppIndex extends LitElement {
    pageName: string;
    static get styles(): import("lit").CSSResult;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    handlePageChange: () => void;
    setPageTitle(title: string): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
