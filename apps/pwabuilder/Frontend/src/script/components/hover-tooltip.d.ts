import { LitElement, TemplateResult } from "lit";
/**
 * A tooltip that can receive focus or contain clickable elements.
 * Usage:
 *  <hover-tooltip anchor="my-button-id" text="hello, world" link="https://test.com"></hover-tooltip>
 */
export declare class HoverTooltip extends LitElement {
    anchor: string;
    text: string;
    link: string;
    tooltipVisible: boolean;
    tooltipLocation: [number, number];
    anchorElement: HTMLElement | null | undefined;
    tooltipContainsFocus: boolean;
    tooltipContainsHover: boolean;
    anchorContainsFocus: boolean;
    anchorContainsHover: boolean;
    hideTooltipTimeoutHandle: number;
    mouseEnterListener: () => void;
    focusInListner: () => void;
    mouseLeaveListener: () => void;
    focusOutListener: () => void;
    static get styles(): import("lit").CSSResult;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    showTooltip(): void;
    getCumulativeOffset(element: HTMLElement): [left: number, top: number];
    getAbsoluteOrFixedOffsetParent(el: HTMLElement): HTMLElement | null;
    hideTooltipIfNecessary(): void;
    anchorMouseEntered(): void;
    anchorMouseLeave(): void;
    anchorFocused(): void;
    anchorBlurred(): void;
    tooltipMouseEntered(): void;
    tooltipMouseLeave(): void;
    tooltipFocused(): void;
    tooltipBlurred(): void;
    render(): TemplateResult;
    renderLink(): TemplateResult;
}
