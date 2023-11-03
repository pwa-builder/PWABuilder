import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, state, property } from 'lit/decorators.js';
import { smallBreakPoint } from "../utils/css/breakpoints";

/**
 * A tooltip that can receive focus or contain clickable elements.
 * Usage: 
 *  <hover-tooltip anchor="my-button-id" text="hello, world" link="https://test.com"></hover-tooltip>
 */
@customElement('hover-tooltip')
export class HoverTooltip extends LitElement {
  // The selector of the element for which to show the focusable tooltip.
  @property() anchor: string = '';
  @property({ type: String }) text = '';
  @property({ type: String }) link = '';
  @state() tooltipVisible = false;
  @state() tooltipLocation: [number, number] = [0, 0];
  
  anchorElement: HTMLElement | null | undefined = null;
  tooltipContainsFocus = false;
  tooltipContainsHover = false;
  anchorContainsFocus = false;
  anchorContainsHover = false;  
  hideTooltipTimeoutHandle = 0;
  mouseEnterListener = () => this.anchorMouseEntered();
  focusInListner = () => this.anchorFocused();
  mouseLeaveListener = () => this.anchorMouseLeave();
  focusOutListener = () => this.anchorBlurred();
  
  static get styles() {
    return css`
      .tooltip-dialog {
        position: absolute;
        margin: 0px;
        box-shadow: 0 0 5px gray;
        background-color: #000;
        opacity: 0;
        transform: translate(10px, 5px); /* shift it down and to the right a bit */
        transition: opacity 0.2s ease-in-out;
        visibility: collapse;
        border-radius: 0.25rem;
        z-index: 1000;
        width: max-content;
        max-width: 250px;
      }

      .tooltip-dialog.show {
        opacity: 1;
        pointer-events: auto;
        visibility: visible;
      }

      .tooltip-inner {
        position: relative;
        color: #fff;
        font-size: 14px;
        font-weight: normal;
        padding: 0px 15px 0px 15px;
        line-height: 21px;
      }

      ${smallBreakPoint(
        css`
          .tooltip-inner {
            max-width: 200px;
          }
        `
      )}

      a, a:hover, a:active {
        color: white;
        display: block;
        margin-bottom: 15px;
      }
    `;
  }

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (!this.anchor) {
      console.error("Attempted to use a <hover-tooltip>, but didn't set the anchor. It should be set to the ID of the element the tooltip is for.");
      return;
    }

    this.anchorElement = this.parentNode?.querySelector(`#${this.anchor}`);
    if (this.anchorElement) {
      this.anchorElement.addEventListener("mouseenter", this.mouseEnterListener, { passive: true });
      this.anchorElement.addEventListener("mouseleave", this.mouseLeaveListener, { passive: true });
      this.anchorElement.addEventListener("focusin", this.focusInListner, { passive: true });
      this.anchorElement.addEventListener("focusout", this.focusOutListener, { passive: true });
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.anchorElement) {
      this.anchorElement.removeEventListener("mouseenter", this.mouseEnterListener);
      this.anchorElement.removeEventListener("mouseleave", this.focusInListner);
      this.anchorElement.removeEventListener("focusin", this.mouseEnterListener);
      this.anchorElement.removeEventListener("focusout", this.focusOutListener);
    }

    clearTimeout(this.hideTooltipTimeoutHandle);
  }

  showTooltip() {
    if (this.anchorElement) {
      // Position the tooltip.
      // This is a little tricky:
      //  - If the element is affected by the body's scrollbar,
      //    then we need to account for that in the tooltip position.      

      // If there's not an absolute or fixed position parent (i.e. we're not in a modal)
      // then we need to offset the Y by the window scroll amount.
      let scrollOffset = 0;
      const isInModal = !!this.getAbsoluteOrFixedOffsetParent(this.anchorElement);
      if (!isInModal) {
        scrollOffset = window.scrollY;
      }

      // Grab the cumulative offset of the parents.
      const boundingRect = this.anchorElement.getBoundingClientRect();
      const [parentOffsetLeft, parentOffsetTop] = this.getCumulativeOffset(this.anchorElement);
      const tooltipX = boundingRect.top + scrollOffset - parentOffsetTop;
      const tooltipY = boundingRect.right - parentOffsetLeft;
      this.tooltipLocation = [tooltipX, tooltipY];
      this.tooltipVisible = true;
    }
  }

  getCumulativeOffset(element: HTMLElement): [left: number, top: number] {
    let top = 0;
    let left = 0;
    let parent = element.parentNode as HTMLElement;
    while (parent != null) {
      top += parent.offsetTop;
      left += parent.offsetLeft;
      parent = parent.parentNode as HTMLElement;
    }
    
    return [
      left,
      top
    ];
  }

  getAbsoluteOrFixedOffsetParent(el: HTMLElement): HTMLElement | null {
    if (!el) {
      return null;
    }

    // Walk up the offsetParent tree until we find an absolute or fixed position parent.
    let parent = el.offsetParent as HTMLElement;
    while (parent != null && parent !== document.body) {
      const parentPositionStyle = window.getComputedStyle(parent, null).position;
      if (parent.style && (parentPositionStyle === "absolute" || parentPositionStyle === 'fixed')) {
        return parent;
      }

      parent = parent.offsetParent as HTMLElement;
    }

    return null;
  }

  hideTooltipIfNecessary() {    
    // Don't hide the tooltip if any of these conditions are met:
    //  - the anchor element contain focus
    //  - the tooltip contains focus
    //  - the mouse is over the anchor element
    //  - the mouse is over the tooltip
    const checkIfShouldBeHidden = () => {
      this.tooltipVisible = 
        this.anchorContainsFocus || 
        this.anchorContainsHover ||
        this.tooltipContainsFocus ||
        this.tooltipContainsHover;
    };

    // Set a timer - if, after a brief moment, the mouse isn't on our target and isn't on the tooltip, hide it.
    clearTimeout(this.hideTooltipTimeoutHandle);
    this.hideTooltipTimeoutHandle = window.setTimeout(() => checkIfShouldBeHidden(), 350);
  }

  anchorMouseEntered() {
    this.anchorContainsHover = true;
    this.showTooltip();
  }

  anchorMouseLeave() {
    this.anchorContainsHover = false;
    this.hideTooltipIfNecessary();
  }

  anchorFocused() {
    this.anchorContainsFocus = true;
    this.showTooltip();
  }

  anchorBlurred() {
    this.anchorContainsFocus = false;
    this.hideTooltipIfNecessary();
  }

  tooltipMouseEntered() {
    this.tooltipContainsHover = true;
  }

  tooltipMouseLeave() {
    this.tooltipContainsHover = false;
    this.hideTooltipIfNecessary();
  }

  tooltipFocused() {
    this.tooltipContainsFocus = true;
  }

  tooltipBlurred() {
    this.tooltipContainsFocus = false;
    this.hideTooltipIfNecessary();
  }

  render(): TemplateResult {
    const tooltipClass = this.tooltipVisible ? 'tooltip-dialog show' : 'tooltip-dialog';
    return html`
      <div class="${tooltipClass}" 
        style="top: ${this.tooltipLocation[0]}px; left: ${this.tooltipLocation[1]}px;"
        @mouseover="${this.tooltipMouseEntered}"
        @mouseleave="${this.tooltipMouseLeave}"
        @focusin="${this.tooltipFocused}"
        @focusout="${this.tooltipBlurred}">
        <div class="tooltip-inner">
          <p>${this.text}</p>
          ${this.renderLink()}
        </div>
      </div>
    `;
  }

  renderLink(): TemplateResult {
    if (!this.link) {
      return html``;
    }

    return html`
      <a target="_blank" href="${this.link}">
        Read more...
      </a>
    `;
  }
}