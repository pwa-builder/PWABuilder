import { LitElement, TemplateResult } from 'lit';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
export declare class ManifestInfoCard extends LitElement {
    field: string;
    description: string;
    docsUrl: string;
    imageUrl: string;
    placement: "" | "top" | "top-start" | "top-end" | "right" | "right-start" | "right-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end";
    error: string;
    currentlyHovering: boolean;
    currentlyOpen: boolean;
    hoverTimer: any;
    static get styles(): import("lit").CSSResult[];
    constructor();
    openME(): void;
    trackLearnMoreAnalytics(): void;
    handleHover(entering: boolean): void;
    handleClick(): void;
    closeTooltip(e: CustomEvent): void;
    handleClickingLink(linkTag: string): void;
    render(): TemplateResult<1>;
    renderImage(): TemplateResult;
    renderError(): TemplateResult;
}
