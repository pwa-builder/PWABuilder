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

