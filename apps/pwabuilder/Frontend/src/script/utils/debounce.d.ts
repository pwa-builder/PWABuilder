/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds.
 * @param callback
 * @param wait
 * @returns
 */
export declare function debounce<F extends Function>(func: F, wait: number): F;
