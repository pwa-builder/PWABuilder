export async function loadPaintPolyfillIfNeeded() {
  if (CSS['paintWorklet'] === undefined) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    await import('https://unpkg.com/css-paint-polyfill');
  }
}
