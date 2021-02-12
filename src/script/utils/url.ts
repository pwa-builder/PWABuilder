export function isUrl(url: string): boolean {
  try {
    return typeof new URL(url) === 'string';
  } catch (e) {
    if (!(e instanceof TypeError)) {
      console.log(e);
    }
  }

  return false;
}

export function resolveUrl(baseUrl: string, url: string): URL | undefined {
  let parsedUrl: URL | undefined = undefined;

  try {
    parsedUrl = new URL(url);
  } catch (e) {
    if (!(e instanceof TypeError)) {
      console.log('url has a problem', url);
      console.error(e);
    }
  }

  if (!parsedUrl) {
    try {
      parsedUrl = new URL(baseUrl + url);
    } catch (e) {
      console.log('url has a problem', baseUrl, url);
      console.error(e);
    }
  }

  return parsedUrl;
}

export function validateUrl(url: string, base?: string): string | null {
  try {
    new URL(url, base);
    return null;
  } catch (urlError) {
    return urlError;
  }
}
