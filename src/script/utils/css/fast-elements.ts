import { css } from 'lit-element';

export const fastButtonCss = css`
  fast-button {
  }

  fast-button[appearance='lightweight'] {
    --accent-foreground-rest: var(--secondary-font-color);
    --accent-foreground-active: var(--font-color);
    --accent-foreground-hover: var(--font-color);
  }
`;

export const fastCheckboxCss = css`
  fast-checkbox {
    --accent-fill-rest: var(--link-color);
    --accent-fill-active: var(--link-color);
    --accent-fill-hover: var(--link-color);
  }
`;
