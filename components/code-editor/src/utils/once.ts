export function once<T extends (...args: any[]) => any>(fn: T): T {
  let hasRun = false;
  let result: ReturnType<T>;

  return function (...args: Parameters<T>) {
    if (!hasRun) {
      hasRun = true;
      // @ts-ignore
      result = fn.apply(this, args);
    }
    return result;
  } as T;
}