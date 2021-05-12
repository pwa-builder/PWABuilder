import throttle from 'lodash-es/throttle';

export const domEventEmitter = new EventTarget();

window.addEventListener(
  'resize',
  throttle((e: Event) => {
    domEventEmitter.dispatchEvent(e);
  }, 500)
);
