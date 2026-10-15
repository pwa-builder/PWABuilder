import { css } from 'lit';

// Layout shell styles applied by <app-index>.
export const appIndexStyles = css`
  :host {
    display: block;
    min-height: 100vh;
  }

  main {
    max-width: var(--nimbus-max-width);
    margin: 0 auto;
    padding: calc(var(--nimbus-header-height) + 20px) 16px 96px;
    box-sizing: border-box;
  }

  @media (min-width: 900px) {
    main {
      padding-left: 24px;
      padding-right: 24px;
    }
  }
`;
