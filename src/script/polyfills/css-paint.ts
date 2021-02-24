export async function loadPaintPolyfillIfNeeded() {
  if ('paintWorklet' in CSS) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await import('https://unpkg.com/css-paint-polyfill');
  }
}
