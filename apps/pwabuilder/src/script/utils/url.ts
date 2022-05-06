export function isUrl(url: string): boolean {
  try {
    return typeof new URL(url).hostname === 'string';
  } catch (e) {
    if (!(e instanceof TypeError)) {
      console.log(`URL is not valid: ${e}`);
    }
  }

  return false;
}

export function resolveUrl(
  baseUrl: string | undefined | null,
  url: string | undefined | null
): URL | undefined {
  let parsedUrl: URL | undefined = undefined;

  try {
    if (url) {
      parsedUrl = new URL(url);
    }
  } catch (e) {
    if (!(e instanceof TypeError)) {
      console.error(e);
    }
  }

  if (!parsedUrl) {
    try {
      if (baseUrl && url) {
        parsedUrl = new URL(url, baseUrl);
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (!parsedUrl && baseUrl) {
    return new URL(baseUrl);
  }

  return parsedUrl;
}

export function validateUrl(url: string, base?: string): string | null {
  try {
    new URL(url, base);
    return null;
  } catch (urlError) {
    return `${urlError}`;
  }
}

export function cleanUrl(url: string): string {
  let cleanedUrl: string | undefined;

  if (url && !url.startsWith('http') && !url.startsWith('https')) {
    cleanedUrl = 'https://' + url;
  }

  if (cleanedUrl) {
    const test = isValidURL(cleanedUrl);

    if (test === false && !url.toLowerCase().startsWith('http://')) {
      throw new Error(
        'This error means that you may have a bad https cert or the url may not be correct'
      );
    }

    return cleanedUrl;
  }

  // original URL is ok
  return url;
}

export function isValidURL(str: string) {
  // from https://stackoverflow.com/a/14582229 but removed the ip address section
  var pattern = new RegExp(
    '^((https?:)?\\/\\/)?' + // protocol
    '(?:\\S+(?::\\S*)?@)?(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}' + // domain name
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\\\#[-a-z\\\\d_]*)?', // fragment locator
    'i' // case insensitive
  );
  return !!pattern.test(str);
}