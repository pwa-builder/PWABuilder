import { css } from 'lit';

export const notesStyles = css`
  .layout {
    display: grid;
    gap: 16px;
    grid-template-columns: 1fr;
  }

  @media (min-width: 860px) {
    .layout {
      grid-template-columns: 280px 1fr;
      align-items: start;
    }
  }

  .list wa-card::part(body) {
    padding: 8px;
  }

  .note-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .note-item:hover {
    background: var(--wa-color-surface-lowered);
  }

  .note-item.active {
    background: var(--nimbus-gradient-soft);
    border-color: color-mix(in srgb, var(--wa-color-brand) 40%, transparent);
  }

  .note-item strong {
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .note-item span {
    font-size: 0.78rem;
    color: var(--wa-color-text-quiet);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .empty {
    text-align: center;
    color: var(--wa-color-text-quiet);
    padding: 22px 10px;
    font-size: 0.9rem;
  }

  .editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .title-input {
    width: 100%;
    box-sizing: border-box;
    font-size: 1.3rem;
    font-weight: 700;
    border: none;
    background: transparent;
    color: inherit;
    padding: 4px 2px;
    outline: none;
  }

  .body-input {
    width: 100%;
    box-sizing: border-box;
    min-height: 320px;
    resize: vertical;
    border: 1px solid var(--wa-color-surface-border);
    border-radius: 12px;
    background: var(--wa-color-surface-lowered);
    color: inherit;
    padding: 14px;
    font-size: 1rem;
    line-height: 1.55;
    font-family: inherit;
    outline: none;
  }

  .body-input:focus {
    border-color: var(--wa-color-brand);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 10px;
  }

  .stat {
    background: var(--wa-color-surface-lowered);
    border-radius: 12px;
    padding: 10px 12px;
    text-align: center;
  }

  .stat b {
    display: block;
    font-size: 1.35rem;
    line-height: 1;
  }

  .stat span {
    font-size: 0.72rem;
    color: var(--wa-color-text-quiet);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .toolbar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .toolbar .spacer {
    flex: 1;
  }
`;
