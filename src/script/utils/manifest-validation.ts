export function validateScreenshotUrlsList(urls: Array<string | undefined>) {
  const results: Array<boolean> = [];

  const length = urls.length;
  for (let i = 0; i < length; i++) {
    try {
      const urlToHandle = urls[i];

      if (urlToHandle) {
        new URL(urlToHandle);
      }
      results[i] = true;
    } catch (e) {
      results[i] = false;
    }
  }

  return results;
}
