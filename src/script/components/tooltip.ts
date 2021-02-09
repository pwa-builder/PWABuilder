import { css, html } from 'lit-element';

export function tooltip(id: string, text: string) {
  return html`
    <span id="${id}" class="tooltip">
      <ion-icon name="help-outline"></ion-icon>
      <fast-tooltip anchor="${id}">${text}</fast-tooltip>
    </span>
  `;
}

export const styles = css`
  .tooltip {
    display: inline-block;
    border-radius: var(--button-radius);
  }
`;
