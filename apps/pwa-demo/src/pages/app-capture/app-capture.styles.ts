import { css } from 'lit';

export const captureStyles = css`
  .stage {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    background: #0b1220;
    aspect-ratio: 4 / 3;
    display: grid;
    place-items: center;
  }

  video,
  .preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .placeholder {
    color: #94a3b8;
    text-align: center;
    padding: 24px;
  }

  .placeholder wa-icon {
    font-size: 2.4rem;
    margin-bottom: 8px;
  }

  .filters {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    margin-top: 12px;
  }

  .filter-btn {
    flex: none;
    border: 1px solid var(--wa-color-surface-border);
    background: var(--wa-color-surface-lowered);
    color: inherit;
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .filter-btn[aria-pressed='true'] {
    background: var(--nimbus-gradient);
    color: #fff;
    border-color: transparent;
  }

  .toolbar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
    align-items: center;
  }

  .toolbar .spacer {
    flex: 1;
  }

  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
    margin-top: 16px;
  }

  .thumb {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 1;
    border: 1px solid var(--wa-color-surface-border);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb .del {
    position: absolute;
    top: 6px;
    right: 6px;
    background: rgba(15, 23, 42, 0.72);
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    cursor: pointer;
    display: grid;
    place-items: center;
  }

  .thumb .geo {
    position: absolute;
    bottom: 6px;
    left: 6px;
    background: rgba(15, 23, 42, 0.72);
    color: #fff;
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 0.68rem;
  }

  .badge-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
`;
