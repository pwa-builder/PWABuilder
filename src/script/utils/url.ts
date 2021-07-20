export function isUrl(url: string): boolean {
  try {
    return typeof new URL(url) === 'string';
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

export async function cleanUrl(url: string): Promise<string> {
  let cleanedUrl: string | undefined;

  if (url && !url.startsWith('http') && !url.startsWith('https')) {
    cleanedUrl = 'https://' + url;
  }

  if (cleanedUrl) {
    const test = await isValidURL(cleanedUrl);

    if (
      test === false &&
      !url.toLowerCase().startsWith('http://')
    ) {
      throw "This error means that you may have a bad https cert or the url may not be correct";
    } else {
      return cleanedUrl;
    }
  } else {
    // original URL is ok
    return url;
  }
}

export function isValidURL(str: string) {
  // from https://stackoverflow.com/a/5717133
  var pattern = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');
  return !!pattern.test(str);
}
