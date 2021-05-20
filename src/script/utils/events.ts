import debounce from 'lodash-es/debounce';

export const domEventEmitter = new EventTarget();

window.addEventListener(
  'resize',
  debounce((e: Event) => {
    domEventEmitter.dispatchEvent(e);
  }, 1000)
);
