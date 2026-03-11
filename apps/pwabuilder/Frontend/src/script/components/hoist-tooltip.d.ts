import { LitElement, TemplateResult } from "lit";
/**
 * A tooltip that can receive focus or contain clickable elements.
 * Usage:
 *  <hoist-tooltip text="hello, world" link="https://test.com"></hoist-tooltip>
 */
export declare class InfoCircleTooltip extends LitElement {
    text: string;
    link: string;
    readonly circleId: string;
    static get styles(): import("lit").CSSResult;
    constructor();
    render(): TemplateResult;
    renderLink(): TemplateResult;
}
