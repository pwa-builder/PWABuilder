export function validateScreenshotUrlsList(urls: Array<string | undefined>) {
  const results: Array<boolean> = [];

  const length = urls.length;
  for (let i = 0; i < length; i++) {
    try {
      new URL(urls[i]);
      results[i] = true;
    } catch (e) {
      results[i] = false;
    }
  }

  return results;
}
