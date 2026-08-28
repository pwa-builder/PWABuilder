import { css } from 'lit';

export const powersStyles = css`
  .filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .power-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
  }

  .power-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .power-head .ic {
    width: 42px;
    height: 42px;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 11px;
    font-size: 1.2rem;
    color: #fff;
    background: var(--nimbus-gradient);
  }

  .power-head h3 {
    margin: 0;
    font-size: 1.02rem;
  }

  .power-card p.blurb {
    margin: 0;
    color: var(--wa-color-text-quiet);
    font-size: 0.88rem;
    flex: 1;
  }

  .result {
    font-size: 0.85rem;
    border-radius: 10px;
    padding: 9px 11px;
    background: var(--wa-color-surface-lowered);
    min-height: 1.2em;
    word-break: break-word;
  }

  .result.ok {
    background: color-mix(in srgb, var(--wa-color-success, #16a34a) 16%, transparent);
  }

  .result.err {
    background: color-mix(in srgb, var(--wa-color-danger, #dc2626) 14%, transparent);
  }

  .result .mono {
    font-family: ui-monospace, monospace;
  }

  .power-foot {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
  }
`;
