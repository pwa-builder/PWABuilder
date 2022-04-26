/**
 * A polyfill for Promise.any(...), which isn't well supported yet at the time of this writing: https://caniuse.com/mdn-javascript_builtins_promise_any
 */
export function promiseAnyPolyfill<T>(promises: Promise<T>[]) {
  if (promises.length === 0) {
    return Promise.reject('No promises supplied');
  }
  let errors: unknown[] = [];

  return new Promise<T>((resolve, reject) => {
    let completedCount = 0;
    let hasSucceeded = false;

    for (let promise of promises) {
      promise.then(result => {
        if (!hasSucceeded) {
          hasSucceeded = true;
          resolve(result);
        }
      });
      promise.catch(error => errors.push(error));
      promise.finally(() => {
        completedCount++;
        if (completedCount === promises.length && !hasSucceeded) {
          reject('All promises failed: ' + errors.join('\n'));
        }
      });
    }
  });
}
