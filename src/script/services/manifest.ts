// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const deepmerge: any;

import { promiseAnyPolyfill } from '../polyfills/promise-any';
import { uniqueElements } from '../utils/customMerge';
import { env } from '../utils/environment';
import {
  AppEvents,
  Icon,
  Lazy,
  Manifest,
  ManifestDetectionResult,
} from '../utils/interfaces';
import { cleanUrl } from '../utils/url';
import { setURL } from './app-info';

export const emitter = new EventTarget();
let manifest: Lazy<Manifest>;
let maniURL: Lazy<string>;

// Uses Azure manifest Puppeteer service to fetch the manifest, then POSTS it to the API.
async function getManifestViaFilePost(
  url: string
): Promise<ManifestDetectionResult> {
  const manifestTestUrl = `${
    env.testAPIUrl
  }/WebManifest?site=${encodeURIComponent(url)}`;
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
    default: {
      short_name: responseData.manifestContents.shortName || '',
    },
    id: '',
    generated: responseData.manifestContents ? false : true,
    errors: [],
    suggestions: [],
    warnings: [],
  };
}

export async function fetchManifest(
  url: string
): Promise<ManifestDetectionResult> {
  // Manifest detection is surprisingly tricky due to redirects, dynamic code generation, SSL problems, and other issues.
  // We have 3 techniques to detect the manifest:
  // 1. The legacy PWABuilder API
  // 2. An Azure function that uses Chrome Puppeteer to fetch the manifest
  // 3. An Azure function that parses the HTML to find the manifest.
  // This fetch() function runs all 3 manifest detection schemes concurrently and returns the first one that succeeds.

  const knownGoodUrl = await cleanUrl(url);

  setURL(knownGoodUrl);

  const manifestDetectors = [
    getManifestViaFilePost(knownGoodUrl),
    getManifestViaHtmlParse(knownGoodUrl),
  ];

  // We want to use Promise.any(...), but browser support is too low at the time of this writing: https://caniuse.com/mdn-javascript_builtins_promise_any
  // Use our polyfill if needed.
  const promiseAnyOrPolyfill: (
    promises: Promise<ManifestDetectionResult>[]
  ) => Promise<ManifestDetectionResult> = promises =>
    Promise['any'] ? Promise['any'](promises) : promiseAnyPolyfill(promises);

  try {
    const result = await promiseAnyOrPolyfill(manifestDetectors);

    manifest = result.content;
    maniURL = result.generatedUrl;
    return result;
  } catch (manifestDetectionError) {
    console.error('All manifest detectors failed.', manifestDetectionError);

    // Well, we sure tried.
    throw manifestDetectionError;
  }
}

export function getManiURL() {
  return maniURL;
}

export function getManifest() {
  return manifest;
}

export async function updateManifest(manifestUpdates: Partial<Manifest>) {
  manifest = deepmerge(manifest as Manifest, manifestUpdates as Manifest, {
    customMerge: customManifestMerge,
  });

  emitter.dispatchEvent(
    updateManifestEvent({
      ...manifestUpdates,
    })
  );

  // TODO determine if needed.
  // return await syncRedis();
}

export function updateManifestEvent<T extends Partial<Manifest>>(detail: T) {
  return new CustomEvent<T>(AppEvents.manifestUpdate, {
    detail,
    bubbles: true,
    composed: true,
  });
}

function customManifestMerge(key: string) {
  if (key === 'icons') {
    return uniqueElements<Icon>(icon => icon.sizes ?? icon.src);
  } else if (key === 'screenshots') {
    return uniqueElements<Icon>(
      screenshot => screenshot.sizes ?? screenshot.src
    );
  }

  return undefined;
}
