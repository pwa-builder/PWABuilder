import { env } from '../utils/environment';
import {
  AppEvents,
  Manifest,
  ManifestContext,
  ManifestDetectionResult,
} from '../utils/interfaces';
import { cleanUrl } from '../utils/url';
import {
  getManifestContext,
  getURL,
  setManifestContext,
  setURL,
  isManifestEdited,
} from './app-info';

export const emitter = new EventTarget();
export let initialManifest: Manifest | undefined;

export let emptyManifest: Manifest = {
  dir: 'auto',
  display: 'fullscreen',
  name: 'placeholder',
  short_name: 'placeholder',
  start_url: undefined,
  scope: '/',
  lang: 'en',
  description: 'placeholder description',
  theme_color: '#000000',
  background_color: '#000000',
  icons: [],
  screenshots: [],
};

export function resetInitialManifest(){
  initialManifest = undefined;
}

// Uses Azure manifest Puppeteer service to fetch the manifest
async function getManifest(
  url: string
): Promise<ManifestDetectionResult | null> {
  const encodedUrl = encodeURIComponent(url);
  //TODO: Replace with prod
  const manifestTestUrl = `https://pwabuilder-tests-dev.azurewebsites.net/api/FetchWebManifest?site=${encodedUrl}`;
  try {
    const response = await fetch(manifestTestUrl, {
      method: 'POST',
    });
    if (!response.ok) {
      console.warn('Fetching manifest failed', response.statusText);

      throw new Error(
        `Unable to fetch response using ${manifestTestUrl}. Response status  ${response}`
      );
    }
    const responseData = await response.json<PuppeteerManifestFinderResult>();
    if (!responseData) {
      console.warn(
        'Fetching manifest failed due to no response data',
        response
      );
      throw new Error(`Unable to get JSON from ${manifestTestUrl}`);
    }

    // OK, the call succeeded.
    // But if we didn't detect the manifest, we want to fail the result here
    // to give the other manifest detector a chance to succeed.
    if (responseData.content && responseData.content.json) {
      return {
        content: responseData.content.json,
        format: 'w3c',
        generatedUrl: responseData.content.url || url,
        siteUrl: url,
        default: {
          short_name: responseData.content.json.short_name || '',
        },
        id: '',
        generated: responseData.content ? false : true,
        errors: [],
        suggestions: [],
        warnings: [],
      };
    }
  } catch (e) {
    console.warn('Manifest not found', e);
    return null;
  }
  return null;
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
async function fetchManifest(url: string, createIfNone = true): Promise<ManifestDetectionResult> {
  // Manifest detection is surprisingly tricky due to redirects, dynamic code generation, SSL problems, and other issues.
  // We have 2 techniques to detect the manifest:
  // 1. An Azure function that uses Chrome Puppeteer to fetch the manifest
  // 2. An Azure function that parses the HTML to find the manifest.
  // This fetch() function runs all manifest detection schemes concurrently and returns the first one that succeeds.
  // We also timebox manifest detection to 10 seconds, as the Puppeteer fetch can take a very long time.

  // eslint-disable-next-line no-async-promise-executor

  let knownGoodUrl: string;
  try {
    knownGoodUrl = cleanUrl(url);
  } catch (err) {
    reject(err);
    return;
  }

  //@ts-ignore:next-line
  const manifestDetectionResult = await getManifest(knownGoodUrl);

  //@ts-ignore:next-line
  if (manifestDetectionResult) {
    const context = getManifestContext();

    if (!context.initialManifest) {
      //@ts-ignore:next-line
      initialManifest = manifestDetectionResult.content;
      context.initialManifest = initialManifest;
      setManifestContext(context);
    }
    return manifestDetectionResult;
  } else {
    console.error('All manifest detectors failed: Timeout expired.');
    if (createIfNone) {
      const createdManifest = await createManifestFromPageOrEmpty(knownGoodUrl);
      const createdManifestResult = wrapManifestInDetectionResult(
        createdManifest,
        knownGoodUrl,
        true
      );
      return createdManifestResult;
    }
  }
}

/**
 * Fetches the manifest for the specified URL and updates the app's current manifest state.
 * If no manifest is found, it will be created from the page.
 * If unable to create a manifest from the page, an empty manifest will be created.
 * @param url The URL to fetch the manifest for. If null or omitted, the current site URL will be used.
 * @returns The manifest context.
 */
export async function fetchOrCreateManifest(
  url?: string | null | undefined
): Promise<ManifestContext> {
  const siteUrl = url || getSiteUrlFromManifestOrQueryString();
  if (!siteUrl) {
    throw new Error('No available site URL');
  }

  setURL(siteUrl);
  const detectionResult = await fetchManifest(siteUrl);
  // Update our global manifest state.
  const context = {
    manifest: detectionResult.content,
    initialManifest: initialManifest,
    manifestUrl: detectionResult.generatedUrl,
    isGenerated: detectionResult.generated,
    siteUrl: detectionResult.siteUrl,
    isEdited: false,
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
    console.error(
      `Manifest creation service failed to create the manifest. Falling back to empty manifest.`,
      err
    );
    return emptyManifest;
  }
}

export function updateManifest(manifestUpdates: Partial<Manifest>): Manifest {
  const context = getManifestContext();

  context.manifest = Object.assign(
    context.manifest,
    manifestUpdates as Partial<Manifest>
  );

  if (context.initialManifest) {
    isManifestEdited(context.initialManifest, context.manifest);
  }

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

async function wrapManifestInDetectionResult(
  manifest: Manifest,
  url: string,
  generated: boolean
): Promise<ManifestDetectionResult> {
  return {
    content: manifest,
    format: 'w3c',
    siteUrl: url,
    generated: generated,
    id: '',
    generatedUrl: '',
    default: {
      short_name: manifest.short_name || 'My PWA',
    },
    errors: [],
    suggestions: [],
    warnings: [],
  };
}

type HtmlParseManifestFinderResult = {
  manifestUrl: string | null;
  manifestContents: Manifest | null;
  error: string | null;
  manifestContainsInvalidJson: boolean;
  manifestScore: { [key in keyof Manifest | 'manifest']: number }; // e.g. { "categories": 2, ... }
  warnings: { [key in keyof Manifest | string]: string }; // e.g. { "categories": "Must be an array" }
};

type PuppeteerManifestFinderResult = {
  content: {
    json: Manifest;
    url: string | null;
  } | null;
  error?: any;
};
