export function increment(step = 1, start = 0, end?: number) {
  let i = start;

  return (function* incrementGen() {
    while (end === undefined || i < end) {
      yield i;
      i += step;
    }
  })();
}
