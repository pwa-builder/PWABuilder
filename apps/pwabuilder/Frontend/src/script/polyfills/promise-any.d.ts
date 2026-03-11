/**
 * A polyfill for Promise.any(...), which isn't well supported yet at the time of this writing: https://caniuse.com/mdn-javascript_builtins_promise_any
 */
export declare function promiseAnyPolyfill<T>(promises: Promise<T>[]): Promise<T>;
