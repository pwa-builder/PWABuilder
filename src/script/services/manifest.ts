// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const deepmerge: any;

import { promiseAnyPolyfill } from '../polyfills/promise-any';
import { env } from '../utils/environment';
import {
  AppEvents,
  Lazy,
  Manifest,
  ManifestDetectionResult,
} from '../utils/interfaces';
import { cleanUrl } from '../utils/url';
import { setCanonicalURL, setURL } from './app-info';

export const emitter = new EventTarget();
let manifest: Lazy<Manifest>;
let maniURL: Lazy<string>;

let generatedManifest: Lazy<Manifest>;

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

  console.log('responseData', responseData);

  setCanonicalURL(responseData.content.url);

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

  setCanonicalURL(responseData.manifestUrl);

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
      short_name: responseData.manifestContents.short_name || '',
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
  // 1. An Azure function that uses Chrome Puppeteer to fetch the manifest
  // 2. An Azure function that parses the HTML to find the manifest.
  // This fetch() function runs all 3 manifest detection schemes concurrently and returns the first one that succeeds.

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    let knownGoodUrl;

    try {
      knownGoodUrl = await cleanUrl(url);
    } catch (err) {
      reject(err);
    }

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
      resolve(result);
    } catch (manifestDetectionError) {
      console.error('All manifest detectors failed.', manifestDetectionError);

      generatedManifest = await (await generateManifest(url)).content;

      // Well, we sure tried.
      reject(manifestDetectionError);
    }
  });
}

export function getManiURL() {
  return maniURL;
}

export function getManifest(): Manifest | undefined {
  if (manifest) {
    return manifest;
  }
  const search = new URLSearchParams(location.search);

  try {
    const url: string | null = maniURL || search.get('site');

    if (url) {
      fetchManifest(url)
      .then(response => {
        updateManifest(response.content);
      })
      .catch(reason => {
        console.error(reason);

        generateManifest(url)
          .then(response => {
            updateManifest(response.content);
          })
          .catch(console.error);
      });
    }
   
  } catch (e) {
    console.error(e);
  }

  return undefined;
}

export function getGeneratedManifest() {
  return generatedManifest;
}

async function generateManifest(url: string): Promise<ManifestDetectionResult> {
  try {
    const response = await fetch(`${env.api}/manifests`, {
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }),
      body: JSON.stringify({
        siteUrl: url,
      }),
    });

    const data = await response.json();

    return data?.content;
  } catch (err) {
    console.error(`Error generating manifest: ${err}`);
    return err;
  }
}

export async function updateManifest(manifestUpdates: Partial<Manifest>) {
  // @ts-ignore
  // using a dynamic import here as this is a large library
  // so we should only load it once its actually needed
  await import('https://unpkg.com/deepmerge@4.2.2/dist/umd.js');

  manifest = deepmerge(manifest as Manifest, manifestUpdates as Manifest, {
    // customMerge: customManifestMerge, // NOTE: need to manually concat with editor changes.
  });

  emitter.dispatchEvent(
    updateManifestEvent({
      ...manifestUpdates,
    })
  );
}

export function updateManifestEvent<T extends Partial<Manifest>>(detail: T) {
  return new CustomEvent<T>(AppEvents.manifestUpdate, {
    detail,
    bubbles: true,
    composed: true,
  });
}
