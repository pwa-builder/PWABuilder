import { LitElement } from 'lit';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
export declare class ManifestFieldTooltip extends LitElement {
    field: string;
    currentlyHovering: boolean;
    static styles: import("lit").CSSResult[];
    trackTooltipOpened(): void;
    trackLearnMoreAnalytics(): void;
    handleHover(entering: boolean): void;
    closeTooltip(e: CustomEvent): void;
    render(): import("lit-html").TemplateResult<1>;
}
