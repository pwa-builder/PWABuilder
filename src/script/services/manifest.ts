import { env } from '../utils/environment';
import {
  AppEvents,
  Manifest,
  ManifestContext,
  ManifestDetectionResult
} from '../utils/interfaces';
import { cleanUrl } from '../utils/url';
import { getManifestContext, getURL, setManifestContext, setURL } from './app-info';

export const emitter = new EventTarget();

export let emptyManifest: Manifest = {
  dir: 'auto',
  display: 'fullscreen',
  name: 'placeholder',
  short_name: 'placeholder',
  start_url: undefined,
  scope: '/',
  lang: 'en',
  description: 'placeholder description',
  theme_color: 'none',
  background_color: 'none',
  icons: [],
  screenshots: [],
};

// Uses Azure manifest Puppeteer service to fetch the manifest, then POSTS it to the API.
async function getManifestViaFilePost(
  url: string
): Promise<ManifestDetectionResult> {
  const encodedUrl = encodeURIComponent(url);
  const manifestTestUrl = `${env.api}/WebManifest?site=${encodedUrl}`;
  const response = await fetch(manifestTestUrl, {
    method: 'POST',
  });
  if (!response.ok) {
    console.warn(
      'Fetching manifest via API v2 file POST failed',
      response.statusText
    );
    throw new Error(
      `Unable to fetch response using ${manifestTestUrl}. Response status  ${response}`
    );
  }
  const responseData = await response.json();
  if (!responseData) {
    console.warn(
      'Fetching manifest via API v2 file POST failed due to no response data',
      response
    );
    throw new Error(`Unable to get JSON from ${manifestTestUrl}`);
  }
  return {
    content: responseData.manifestContents,
    format: 'w3c',
    generatedUrl: responseData.manifestUrl || url,
    siteUrl: url,
    default: {
      short_name: responseData.manifestContents.short_name || '',
    },
    id: '',
    generated: responseData.manifestContents ? false : true,
    errors: [],
    suggestions: [],
    warnings: [],
  };
}

// Uses Azure HTML parsing microservice to fetch the manifest, then hands it to the API.
async function getManifestViaHtmlParse(
  url: string
): Promise<ManifestDetectionResult> {
  type ManifestFinderResult = {
    manifestUrl: string | null;
    manifestContents: Manifest | null;
    error: string | null;
    manifestContainsInvalidJson: boolean;
  };

  const manifestTestUrl = `${env.manifestFinderUrl}?url=${encodeURIComponent(
    url
  )}`;
  const response = await fetch(manifestTestUrl);
  if (!response.ok) {
    console.warn('Fetching manifest via HTML parsing service failed', response);
    throw new Error(`Error fetching from ${manifestTestUrl}`);
  }
  const responseData: ManifestFinderResult = await response.json();

  if (responseData.error || !responseData.manifestContents) {
    console.warn(
      'Fetching manifest via HTML parsing service failed due to no response data',
      response
    );
    throw new Error(responseData.error || "Manifest couldn't be fetched");
  }
  console.info(
    'Manifest detection succeeded via HTML parse service',
    responseData
  );

  return {
    content: responseData.manifestContents,
    format: 'w3c',
    generatedUrl: responseData.manifestUrl || url,
    siteUrl: url,
    default: {
      short_name: responseData.manifestContents.short_name || '',
    },
    id: '',
    generated: responseData.manifestContents ? false : true,
    errors: [],
    suggestions: [],
    warnings: [],
    manifestContainsInvalidJson: responseData.manifestContainsInvalidJson,
  };
}

function timeoutAfter(milliseconds: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds);
  });
}

/**
 * Fetches the manifest from our manifest detection services. If no manifest could be detected, a manifest will be generated from the page.
 * @param url The URL from which to detect the manifest.
 * @returns A manifest detection result.
 */
async function fetchManifest(
  url: string
): Promise<ManifestDetectionResult> {
  // Manifest detection is surprisingly tricky due to redirects, dynamic code generation, SSL problems, and other issues.
  // We have 2 techniques to detect the manifest:
  // 1. An Azure function that uses Chrome Puppeteer to fetch the manifest
  // 2. An Azure function that parses the HTML to find the manifest.
  // This fetch() function runs all manifest detection schemes concurrently and returns the first one that succeeds.
  // We also timebox manifest detection to 10 seconds, as the Puppeteer fetch can take a very long time.

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    let knownGoodUrl: string;
    try {
      knownGoodUrl = cleanUrl(url);
    } catch (err) {
      reject(err);
      return;
    }

    const manifestDetectors = [
      getManifestViaFilePost(knownGoodUrl),
      getManifestViaHtmlParse(knownGoodUrl)
    ];
    try {
      // Timeout after 10 seconds.
      // Some sites that don't have a manifest take a long time for our Puppeteer-based test to complete.
      timeoutAfter(10000).then(() => reject("Timeout expired"));

      const manifestDetectionResult = await Promise.any(manifestDetectors);
      resolve(manifestDetectionResult);
    } catch (manifestDetectionError) {
      console.error('All manifest detectors failed.', manifestDetectionError);
      const createdManifest = await createManifestFromPageOrEmpty(knownGoodUrl);
      const createdManifestResult = wrapManifestInDetectionResult(createdManifest, knownGoodUrl, true);
      resolve(createdManifestResult);
    }
  });
}

/**
 * Fetches the manifest for the specified URL and updates the app's current manifest state.
 * If no manifest is found, it will be created from the page.
 * If unable to create a manifest from the page, an empty manifest will be created.
 * @param url The URL to fetch the manifest for. If null or omitted, the current site URL will be used.
 * @returns The manifest context.
 */
export async function fetchOrCreateManifest(url?: string | null | undefined): Promise<ManifestContext> {
  const siteUrl = url || getSiteUrlFromManifestOrQueryString();
  if (!siteUrl) {
    throw new Error("No available site URL");
  }

  setURL(siteUrl);
  const detectionResult = await fetchManifest(siteUrl);

  // Update our global manifest state.
  const context = {
    manifest: detectionResult.content,
    manifestUrl: detectionResult.generatedUrl,
    isGenerated: detectionResult.generated,
    siteUrl: detectionResult.siteUrl
  };
  setManifestContext(context);

  await updateManifest({
    ...detectionResult.content,
  });

  return context;
}

/**
 * Gets the site URL from the current manifest context. 
 * If no site URL exists, it will get the site URL from the query string.
 * If no query string exists, it will return null.
 * @returns 
 */
function getSiteUrlFromManifestOrQueryString(): string | null {
  const context = getManifestContext();
  if (context.siteUrl) {
    return context.siteUrl;
  }

  const search = new URLSearchParams(location.search);
  const siteQueryParam = search.get('site');
  if (siteQueryParam) {
    return siteQueryParam;
  }

  const sessionStorageUrl = getURL();
  if (sessionStorage) {
    return sessionStorageUrl;
  }

  return null;
}

async function createManifestFromPageOrEmpty(url: string): Promise<Manifest> {
  try {
    const response = await fetch(`${env.manifestCreatorUrl}?url=${url}`, {
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const createdManifest = await response.json<Manifest>();
    return createdManifest;
  } catch (err) {
    console.error(`Manifest creation service failed to create the manifest. Falling back to empty manifest.`, err);
    return emptyManifest;
  }
}

export function updateManifest(
  manifestUpdates: Partial<Manifest>
): Manifest {
  const context = getManifestContext();
  context.manifest = Object.assign(context.manifest, manifestUpdates as Partial<Manifest>);
  setManifestContext(context);

  emitter.dispatchEvent(
    updateManifestEvent({
      ...context.manifest,
    })
  );

  return context.manifest;
}

export function updateManifestEvent<T extends Partial<Manifest>>(detail: T) {
  return new CustomEvent<T>(AppEvents.manifestUpdate, {
    detail,
    bubbles: true,
    composed: true,
  });
}

function wrapManifestInDetectionResult(manifest: Manifest, url: string, generated: boolean): ManifestDetectionResult {
  return {
    content: manifest,
    format: "w3c",
    siteUrl: url,
    generated: generated,
    id: "",
    generatedUrl: "",
    default: {
      short_name: manifest.short_name || "My PWA"
    },
    errors: [],
    suggestions: [],
    warnings: []
  };
}
