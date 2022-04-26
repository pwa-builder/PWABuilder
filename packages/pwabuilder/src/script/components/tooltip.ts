import { css, html } from 'lit';

let tooltipCounter = 0;

function createTooltipId() {
  const current = tooltipCounter;
  tooltipCounter++;
  return 'tooltip-num-' + current;
}

function onMouseOverTooltip(ev: MouseEvent) {
  if (ev.currentTarget) {
    const target = ev.currentTarget as HTMLElement;
    const toolTipTextEl = target.querySelector('.tooltip-text') as HTMLElement;
    if (toolTipTextEl) {
      openTooltip(ev, toolTipTextEl);
    }
  }
}

function openTooltip(ev: MouseEvent, tooltipEl: HTMLElement) {
  // the style length check looks non-ideal at first
  // but the DOM api is just not great here in the fact that
  // if an element does not have the style.top property
  // initialized yet, its an empty string instead of undefined.
  // This code is here to throttle style application as multiple hover events
  // can fire within seconds of each other causing "jumping" in the UI.

  if (tooltipEl && ev && tooltipEl.style.top.length === 0) {
    // re-visit this tooltip logic entirely - Justin Willis
    // tooltipEl.style.top = `${(ev.clientY - 300).toString()}px`;
  }
}

export function tooltip(buttonId: string, text: string, url?: string) {
  const tooltipId = createTooltipId();

  return html`
    <fast-button id="${buttonId}" class="tooltip" appearance="stealth" aria-labelledby="${tooltipId}"
      @mouseover="${($event: MouseEvent) => onMouseOverTooltip($event)}">
      <img src="assets/images/help-outline.svg" alt="help outline" aria-hidden="true" />
    
      ${url && url.length > 0
    ? html`<a href="${url}" id="${tooltipId}" target="_blank" class="tooltip-text">${text}</a>`
    : html`<span id="${tooltipId}" class="tooltip-text"> ${text} </span>`}
    </fast-button>
  `;
}

export const styles = css`
  fast-button.tooltip {
    --tooltip-square: 16px;
    --tooltip-image-square: 12px;

    --tooltip-text-color: #fff;
    --tooltip-background-color: var(--font-color);

    --base-height-multiplier: 4;

    box-shadow: none;
  }

  .tooltip {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 2px;
    border-radius: var(--button-radius);
    min-width: 16px;
    max-width: 4em;
  }

  .tooltip::part(control) {
    padding: 0;
  }

  .tooltip::part(content) {
    width: 12px;
  }

  .tooltip-text {
    display: none;
    color: var(--tooltip-text-color);
    background-color: var(--tooltip-background-color);
    padding: 8px;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
    text-align: center;

    white-space: break-spaces;
    width: 14em;
  }

  .tooltip:focus > .tooltip-text,
  .tooltip:focus-visible > .tooltip-text,
  .tooltip:focus-within > .tooltip-text,
  .tooltip:hover > .tooltip-text {
    display: inline-block;
  }

  fast-button:hover {
    background: var(--neutral-fill-stealth-rest);
  }

  .tooltip img {
    vertical-align: middle;
    height: var(--tooltip-image-square);
    width: var(--tooltip-image-square);
  }

  .tooltip-badge {
    height: var(--tooltip-square);
    width: var(--tooltip-square);
  }
`;
