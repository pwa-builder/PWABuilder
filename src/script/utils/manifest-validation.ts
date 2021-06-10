import { testWebsiteUrl } from '../services/regex';

export function validateScreenshotUrlsList(urls: Array<string | undefined>) {
  const results: Array<boolean> = [];

  const length = urls.length;
  for (let i = 0; i < length; i++) {
    const urlToHandle = urls[i];

    results[i] = testWebsiteUrl(urlToHandle);
  }

  return results;
}
