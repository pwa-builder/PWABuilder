export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timer);
    // @ts-ignore
    timer = setTimeout(() => func.apply(this, args), delay);
  } as T;
}