import { LitElement, TemplateResult } from "lit";
import "../components/hoist-tooltip";
/**
 * A component that renders a round circle with a question mark in it.
 * When hovered or focused, a <hoist-tooltip> will be shown.
 */
export declare class InfoCircleTooltip extends LitElement {
    text: string;
    link: string;
    readonly circleId: string;
    static get styles(): import("lit").CSSResult;
    constructor();
    render(): TemplateResult;
}
