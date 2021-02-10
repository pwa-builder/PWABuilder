import { css, html } from 'lit-element';

export function tooltip(id: string, text: string) {
  return html`
    <fast-button id="${id}" class="tooltip" appearance="stealth">
      <ion-icon name="help-outline"></ion-icon>
    </fast-button>
    <fast-tooltip anchor="${id}">${text}</fast-tooltip>
  `;
}

export const styles = css`
  .tooltip {
    display: inline-block;
    border-radius: var(--button-radius);
  }
`;
