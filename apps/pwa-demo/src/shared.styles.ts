import { css } from 'lit';

// Reusable styles shared across pages. Import alongside a page's own styles.
export const styles = css`
  :host {
    display: block;
  }

  .page-head {
    margin: 4px 0 20px;
  }

  .page-head h1 {
    margin: 0;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .page-head p {
    margin: 6px 0 0;
    color: var(--wa-color-text-quiet);
    max-width: 60ch;
  }

  .grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }

  wa-card {
    width: 100%;
    box-sizing: border-box;
  }

  .row {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .muted {
    color: var(--wa-color-text-quiet);
  }

  .mono {
    font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;
    font-size: 0.85rem;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;
