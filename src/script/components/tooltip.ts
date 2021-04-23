import { css, html } from 'lit';

let tooltipCounter = 0;

function createTooltipId() {
  const current = tooltipCounter;
  tooltipCounter++;
  return 'tooltip-num-' + current;
}

export function tooltip(buttonId: string, text: string, url?: string) {
  const tooltipId = createTooltipId();

  return html`
    <fast-button
      id="${buttonId}"
      class="tooltip"
      appearance="stealth"
      aria-labelledby="${tooltipId}"
    >

      <img
        src="assets/images/help-outline.svg"
        alt="help outline"
        aria-hidden="true"
      />

      ${url && url.length > 0
        ? html`<a href="${url}" id="${tooltipId}" class="tooltip-text"
            >${text}</a
          >`
        : html`<span id="${tooltipId}" class="tooltip-text"> ${text} </span>`}
    </fast-button>
  `;
}

export const styles = css`
  fast-button.tooltip {
    --base-height-multiplier: 4;
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
    color: #fff;
    background-color: var(--font-color);
    padding: 8px;
    border-radius: 6px;
    position: relative;
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
    height: 12px;
    width: 12px;
  }

  .tooltip-badge {
    height: 16px;
    width: 16px;
  }
`;
