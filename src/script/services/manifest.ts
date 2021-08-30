import { env } from '../utils/environment';
import {
  AppEvents,
  Lazy,
  Manifest,
  ManifestDetectionResult,
  PWABuilderSession,
} from '../utils/interfaces';
import { cleanUrl } from '../utils/url';
import { setURL } from './app-info';

export const emitter = new EventTarget();

export let boilerPlateManifest: Manifest = {
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

// export to use as a flag for generation
// this is needed to decide to go to the
// publish page or base_package
export let generated = false;
let manifest: Manifest = manifestFromSession();
let maniURL: Lazy<string>;
let testResult: ManifestDetectionResult | undefined;

function manifestFromSession(): Manifest {
  try {
    const sessionManifest = sessionStorage.getItem(PWABuilderSession.manifest);
    generated = sessionStorage.getItem(PWABuilderSession.manifestGenerated) === 'true';
    if (sessionManifest) {
      return JSON.parse(sessionManifest) as Manifest;
    }
  } catch (err) {
    console.error('Unable to load manifest from session', err);
  }

  return boilerPlateManifest;
}

export function manifestGenerated() {
  return generated;
}

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

export async function fetchManifest(
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
      knownGoodUrl = await cleanUrl(url);
    } catch (err) {
      reject(err);
      return;
    }

    // At this point testResult could be from a previous url, so compare the URLs
    if (testResult) {
      const prevManifestUrl = testResult.siteUrl;
      if (prevManifestUrl === knownGoodUrl) {
        // We're still analyzing the same site, so use previous result
        resolve(testResult);
      } else {
        // We're looking at a different site, so reset the state
        generated = false;
      }
    } else {
      generated = false;
    }

    setURL(knownGoodUrl);

    const manifestDetectors = [
      getManifestViaFilePost(knownGoodUrl),
      getManifestViaHtmlParse(knownGoodUrl)
    ];
    try {
      // Timeout after 10 seconds.
      // Some sites that don't have a manifest take a long time for our Puppeteer-based test to complete.
      timeoutAfter(10000).then(() => reject("Timeout expired"));
      const manifestDetectionResult = await Promise.any(manifestDetectors);

      manifest = manifestDetectionResult.content;
      maniURL = manifestDetectionResult.generatedUrl;
      resolve(manifestDetectionResult);
    } catch (manifestDetectionError) {
      console.error('All manifest detectors failed.', manifestDetectionError);

      if (!generated) {
        const createdManifestTask = createManifest(knownGoodUrl)
          .then(m => wrapManifestInDetectionResult(m, knownGoodUrl, true));
        resolve(createdManifestTask);
      } else {
        // Well, we sure tried. Use the boilerplate because we couldn't fetch that guy.
        manifest = boilerPlateManifest;
        reject(manifestDetectionError);
      }
    }
  });
}

export function getManiURL() {
  return maniURL;
}

/*
  1. Attempts to fetch manifest
  2. If that fails, generates the manifest, warns console.
  3. If the generation fails, still returns the boiler plate.
*/
export async function getManifestGuarded(): Promise<Manifest> {
  try {
    const newManifest = await getManifest();

    if (newManifest) {
      manifest = newManifest;
    }
  } catch (e) {
    console.warn(e);
  }

  return manifest;
}

async function getManifest(): Promise<Manifest | undefined> {
  // no manifest object yet, so lets try to grab one
  const search = new URLSearchParams(location.search);
  const url: string | null = maniURL || search.get('site');

  try {
    if (url) {
      const response = await fetchManifest(url);

      if (response) {
        return await updateManifest({
          ...response.content,
        });
      }
    }
  } catch (err) {
    // the above will error if the site has no manifest of its own,
    // we will then return our generated manifest
    console.warn(err);
  }

  // if all else fails, lets just return undefined
  return undefined;
}

async function createManifest(url: string): Promise<Manifest> {
  generated = true;
  sessionStorage.setItem(PWABuilderSession.manifestGenerated, 'true');

  try {
    const response = await fetch(`${env.manifestCreatorUrl}?url=${url}`, {
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    const createdManifest = await response.json<Manifest>();
    return createdManifest;
  } catch (err) {
    console.error(`Error generating manifest: ${err}`);
    throw err;
  }
}

export async function updateManifest(
  manifestUpdates: Partial<Manifest>
): Promise<Manifest> {
  manifest = Object.assign(manifest, manifestUpdates as Partial<Manifest>);

  sessionStorage.setItem(PWABuilderSession.manifest, JSON.stringify(manifest)); // would it make sense to make this async?

  emitter.dispatchEvent(
    updateManifestEvent({
      ...manifest,
    })
  );

  return manifest;
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
