import { env } from '../utils/environment';
import {
  AppEvents,
  Manifest,
  ManifestContext,
  ManifestDetectionResult
} from '../utils/interfaces';
import { cleanUrl } from '../utils/url';
import { getManifestContext, getURL, setManifestContext, setURL, isManifestEdited } from './app-info';

export const emitter = new EventTarget();
export let initialManifest: Manifest;

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

// Uses Azure manifest Puppeteer service to fetch the manifest
async function getManifestViaPuppeteer(
  url: string
): Promise<ManifestDetectionResult> {

  const encodedUrl = encodeURIComponent(url);
  const manifestTestUrl = `${env.api}/WebManifest?site=${encodedUrl}`;
  const response = await fetch(manifestTestUrl, {
    method: 'POST',
  });
  if (!response.ok) {
    console.warn(
      'Fetching manifest via Puppeteer service failed',
      response.statusText
    );
    
    throw new Error(
      `Unable to fetch response using ${manifestTestUrl}. Response status  ${response}`
    );
  }
  const responseData = await response.json<PuppeteerManifestFinderResult>();
  if (!responseData) {
    console.warn(
      'Fetching manifest via Puppeteer failed due to no response data',
      response
    );
    throw new Error(`Unable to get JSON from ${manifestTestUrl}`);
  }

  // OK, the call succeeded.
  // But if we didn't detect the manifest, we want to fail the result here
  // to give the other manifest detector a chance to succeed.
  if (!responseData.content || !responseData.content.json) {
    console.info("Manifest detection via Puppeteer completed, but couldn't detect the manifest.", responseData);
    throw new Error("HTML parse manifest detector couldn't find the manifest. " + responseData.error);
  }
  
  return {
    content: responseData.content.json,
    format: 'w3c',
    generatedUrl: responseData.url || url,
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

// Uses Azure HTML parsing microservice to fetch the manifest, then hands it to the API.
async function getManifestViaHtmlParse(
  url: string
): Promise<ManifestDetectionResult> {
  const manifestTestUrl = `${env.manifestFinderUrl}?url=${encodeURIComponent(
    url
  )}`;
  const response = await fetch(manifestTestUrl);
  if (!response.ok) {
    console.warn('Fetching manifest via HTML parsing service failed', response);
    throw new Error(`Error fetching from ${manifestTestUrl}`);
  }
  const responseData = await response.json<HtmlParseManifestFinderResult>();

  if (responseData.error || !responseData.manifestContents) {
    console.warn(
      'Fetching manifest via HTML parsing service failed due to no response data',
      response
    );
    throw new Error(responseData.error || "Manifest couldn't be fetched");
  }

  // OK, the call succeeded.
  // But if we didn't detect the manifest, we want to fail the result here.
  // This is needed so that sites with JS-injected manifests (e.g. vscode.dev) can 
  // still be detected by our Puppeteer-based manifest detector.
  // See https://github.com/pwa-builder/PWABuilder/issues/2157
  if (!responseData.manifestContents) {
    console.info("Manifest detection via HTML parse completed, but couldn't detect the manifest.", responseData);
    throw new Error("Manifest detection via HTML parsing completed but couldn't find the manifest. " + responseData.error);
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
    errors: responseData.error ? [responseData.error] : [],
    suggestions: [],
    warnings: Object.entries(responseData.warnings)
      .map(keyVal => `${keyVal[0]}: ${keyVal[1]}`), // e.g. "categories: Must be an array"
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

    // Some sites that don't have a manifest take a long time for our Puppeteer-based test to complete.
    // If 10 seconds passes, we ignore the detectors and move to creating a manifest in the interest of time. 
    // rollup is giving warnings about the void type being returned from Promise.any(manifestDetectors),
    // void is returned when the detectors timeout so none of the relevant code gets run with type void.
    // so we can ignore this warning.
    //@ts-ignore:next-line
    const manifestDetectors = [
      getManifestViaPuppeteer(knownGoodUrl),
      getManifestViaHtmlParse(knownGoodUrl),
      timeoutAfter(10000)
    ];

    //@ts-ignore:next-line
    const manifestDetectionResult = await Promise.any(manifestDetectors);

    //@ts-ignore:next-line
    if(manifestDetectionResult){
      const context = getManifestContext();
      if (!context.initialManifest) {
        //@ts-ignore:next-line
        initialManifest = manifestDetectionResult.content;
        context.initialManifest = initialManifest;
        setManifestContext(context);
      }

      //@ts-ignore:next-line
      resolve(manifestDetectionResult);
    } else {
      console.error('All manifest detectors failed: Timeout expired.');
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
    initialManifest: initialManifest,
    manifestUrl: detectionResult.generatedUrl,
    isGenerated: detectionResult.generated,
    siteUrl: detectionResult.siteUrl,
    isEdited: false
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

async function wrapManifestInDetectionResult(manifest: Manifest, url: string, generated: boolean): Promise<ManifestDetectionResult> {
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
    }
}


type HtmlParseManifestFinderResult = {
  manifestUrl: string | null;
  manifestContents: Manifest | null;
  error: string | null;
  manifestContainsInvalidJson: boolean;
  manifestScore: { [key in keyof Manifest | "manifest"]: number }; // e.g. { "categories": 2, ... }
  warnings: { [key in keyof Manifest | string]: string }; // e.g. { "categories": "Must be an array" }
};

type PuppeteerManifestFinderResult = {
  content: {
    json: Manifest
  } | null;
  url: string | null;
  error?: any;
}