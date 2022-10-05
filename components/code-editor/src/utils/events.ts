// import debounce from 'lodash-es/debounce';
import { LitElement } from 'lit';

export const resizeObserver = new ResizeObserver(ResizeObserverHandler);

function ResizeObserverHandler(entries: Array<ResizeObserverEntry>) {
  for (let entry of entries) {
    // Can use this to replace media queries and content box resizing. Greater perf, before paint takes place :)
    if (entry.target instanceof LitElement) {
      entry.target.requestUpdate();
    }
  }
}
