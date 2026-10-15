import { css } from 'lit';

export const aboutStyles = css`
  .about-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    margin-top: 8px;
  }

  .feature-list {
    display: grid;
    gap: 10px;
  }

  .feature-list .item {
    display: flex;
    gap: 11px;
    align-items: flex-start;
  }

  .feature-list .item wa-icon {
    color: var(--wa-color-brand-fill-loud, #2563eb);
    margin-top: 2px;
    flex: none;
  }

  .feature-list .item strong {
    display: block;
    font-size: 0.92rem;
  }

  .feature-list .item span {
    color: var(--wa-color-text-quiet);
    font-size: 0.85rem;
  }

  .links {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 6px;
  }

  .colophon {
    margin-top: 26px;
    color: var(--wa-color-text-quiet);
    font-size: 0.85rem;
  }

  h2 {
    margin: 30px 0 6px;
    font-size: 1.2rem;
  }
`;
