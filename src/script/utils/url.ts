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
      console.log('url has a problem', url);
      console.error(e);
    }
  }

  if (!parsedUrl) {
    try {
      if (baseUrl && url) {
        parsedUrl = new URL(url, baseUrl);
      }
    } catch (e) {
      console.log('url has a problem', baseUrl, url);
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
    return urlError;
  }
}

export async function cleanUrl(url: string) {
  let cleanedUrl: string | undefined;

  if (url && !url.startsWith('http') && !url.startsWith('https')) {
    cleanedUrl = 'https://' + url;
  }

  if (cleanedUrl) {
    const test = await isValidUrl(cleanedUrl);

    if (
      test.message !== undefined &&
      !url.toLowerCase().startsWith('http://')
    ) {
      throw `${test.message}: this error means that you may have a bad https cert or the url may not be correct`;
    } else {
      return cleanedUrl;
    }
  } else {
    // original URL is ok
    return url;
  }
}

async function isValidUrl(url: string) {
  try {
    return await fetch(url, {
      mode: 'no-cors',
      credentials: 'include',
    });
  } catch (err) {
    return err;
  }
}
