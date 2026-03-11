import { LitElement } from 'lit';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
export declare class ServiceWorkerInfoCard extends LitElement {
    field: string;
    capabilityId: string;
    description: string;
    docsUrl: string;
    placement: "" | "top" | "top-start" | "top-end" | "right" | "right-start" | "right-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end";
    currentlyHovering: boolean;
    hoverTimer: any;
    static get styles(): import("lit").CSSResult[];
    constructor();
    firstUpdated(): void;
    trackLearnMoreAnalytics(): void;
    handleHover(entering: boolean): void;
    closeTooltip(e: CustomEvent): void;
    handleClickingLink(linkTag: string): void;
    render(): import("lit-html").TemplateResult<1>;
}
