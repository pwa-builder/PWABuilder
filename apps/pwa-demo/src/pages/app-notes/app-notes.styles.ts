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
    width: 100%;
    text-align: left;
    background: transparent;
    color: inherit;
    font: inherit;
    box-sizing: border-box;
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
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 700;
    border: none;
    background: transparent;
    color: inherit;
    padding: 18px 2px 8px;
    outline: none;
  }

  .body-input {
    width: 100%;
    box-sizing: border-box;
    min-height: 260px;
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

  .markdown-editor {
    border: 1px solid var(--wa-color-surface-border);
    border-radius: 12px;
    --indicator-color: transparent;
    --track-width: 0;
  }
  .markdown-editor::part(nav) {
    background: var(--wa-color-surface-lowered);
    border-bottom: 1px solid var(--wa-color-surface-border);
    border-radius: 12px 12px 0 0;
    padding: 0 8px;
  }
  .markdown-editor wa-tab::part(tab) {
    padding: 12px 20px;
    border: 1px solid transparent;
    border-radius: 8px 8px 0 0;
    color: var(--wa-color-text-quiet);
    margin-bottom: -1px;
  }
  .markdown-editor wa-tab[active]::part(tab) {
    background: var(--wa-color-surface-raised);
    border-color: var(--wa-color-surface-border);
    border-bottom-color: var(--wa-color-surface-raised);
    color: var(--wa-color-text-normal);
  }
  .markdown-editor wa-tab-panel { --padding: 12px; min-width: 0; }
  .markdown-editor .body-input { display: block; background: var(--wa-color-surface-raised); border-radius: 8px; }

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

  :host { display: block; }
  .list, .editor { min-width: 0; }
  .notebook-heading { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: center; }
  .local-label, .storage-hint, .save-state, .note-meta, .note-footer, .list-count {
    font-size: .82rem; color: var(--wa-color-text-quiet); line-height: 1.5;
  }
  .local-label { display: flex; align-items: center; gap: 8px; }
  .list-actions { display: flex; gap: 8px; padding: 8px; flex-wrap: wrap; }
  .search-input {
    width: calc(100% - 16px); margin: 8px; box-sizing: border-box; padding: 12px;
    border: 1px solid var(--wa-color-surface-border); border-radius: 10px;
    font: inherit; color: inherit; background: var(--wa-color-surface-lowered);
  }
  .list-count { margin: 8px 12px; }
  .note-list { max-height: 60vh; overflow-y: auto; }
  .storage-hint { padding: 0 10px; }
  .note-meta, .note-footer { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; justify-content: space-between; }
  .note-meta { margin-bottom: 14px; }
  .note-meta label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
  .insert-toolbar { padding: 14px 0; }
  .note-footer { margin-top: 18px; border-top: 1px solid var(--wa-color-surface-border); padding-top: 12px; }
  .attachments { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 16px; margin-top: 18px; }
  figure { margin: 0; min-width: 0; border: 1px solid var(--wa-color-surface-border); border-radius: 14px; overflow: hidden; }
  figure img { display: block; width: 100%; max-height: 360px; object-fit: contain; background: #fff; }
  figcaption { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px; font-size: .85rem; }
  figcaption span { flex: 1; }
  .note-location { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: .85rem; }
  .feedback { margin-bottom: 16px; padding: 12px 16px; border: 1px solid var(--wa-color-surface-border); border-radius: 10px; background: var(--wa-color-surface-raised); overflow-wrap: anywhere; }
  .error { color: var(--wa-color-danger-on-quiet, #b42318); }
  dialog {
    width: min(860px, calc(100vw - 32px)); max-height: calc(100dvh - 40px); box-sizing: border-box;
    padding: 20px; border: 1px solid var(--wa-color-surface-border); border-radius: 18px;
    background: var(--wa-color-surface-raised, #fff); color: var(--wa-color-text-normal); overflow: auto;
  }
  dialog::backdrop { background: rgba(10, 20, 40, .6); }
  .dialog-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .dialog-heading h2 { font-size: 1.2rem; margin: 0; }
  .focused { grid-template-columns: 1fr; }
  .focused .list { display: none; }
  :is(input, textarea, button):focus-visible { outline: 2px solid var(--wa-color-brand); outline-offset: 3px; }
  @media (max-width: 859px) {
    .note-list { max-height: 180px; }
    .storage-hint { display: none; }
    .local-label { display: none; }
    dialog { padding: 14px; }
  }
`;
