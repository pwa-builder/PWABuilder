import { LitElement } from 'lit';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
export declare class AppHeader extends LitElement {
    page: string;
    static get styles(): import("lit").CSSResult;
    constructor();
    firstUpdated(): void;
    recordGoingHome(): void;
    showMenu(): void;
    handleClickingLink(linkTag: string, analyticsString: string): void;
    render(): import("lit-html").TemplateResult<1>;
}
