import { css } from 'lit';

export const sketchStyles = css`
  .toolbar {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .toolbar .spacer {
    flex: 1;
  }

  .swatches {
    display: flex;
    gap: 6px;
  }

  .swatch {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    padding: 0;
  }

  .swatch[aria-pressed='true'] {
    outline: 3px solid var(--wa-color-brand);
    outline-offset: 2px;
  }

  .size-control {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: var(--wa-color-text-quiet);
  }

  input[type='range'] {
    accent-color: var(--wa-color-brand);
  }

  .canvas-wrap {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--wa-color-surface-border);
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(2, 32, 71, 0.12);
    touch-action: none;
  }

  canvas {
    display: block;
    width: 100%;
    height: min(62vh, 560px);
    cursor: crosshair;
  }

  .canvas-wrap.fullscreen canvas {
    height: 100vh;
  }

  .hint {
    font-size: 0.8rem;
    color: var(--wa-color-text-quiet);
    margin-top: 10px;
  }

  .pressure-badge {
    position: absolute;
    top: 10px;
    right: 12px;
    background: rgba(15, 23, 42, 0.7);
    color: #fff;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-family: ui-monospace, monospace;
  }
`;
