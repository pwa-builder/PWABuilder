export function increment(step = 1, start = 0, end?: number) {
  let i = start;

  return (function* incrementGen() {
    while (i < end || !end) {
      yield i;
      i += step;
    }
  })();
}
