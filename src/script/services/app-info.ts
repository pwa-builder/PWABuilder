import {
  ListHeader,
  Manifest,
  ManifestContext,
  ProgressList,
  PWABuilderSession,
  RawTestResult,
  Status,
} from '../utils/interfaces';
import { getChosenServiceWorker } from './service_worker';

let site_url: string | undefined;
let results: RawTestResult | undefined;
let manifestContext: ManifestContext | undefined;

let progress: ProgressList = {
  progress: [
    {
      header: ListHeader.TEST,
      location: '/',
      done: Status.ACTIVE,
      items: [
        {
          name: 'Submit URL',
          done: Status.PENDING,
        },
        {
          name: 'Run Tests',
          done: Status.PENDING,
        },
      ],
    },
    {
      header: ListHeader.REVIEW,
      location: '/reportcard',
      done: Status.PENDING,
      items: [
        {
          name: 'Manifest',
          done: Status.PENDING,
        },
        {
          name: 'Service Worker',
          done: Status.PENDING,
        },
        {
          name: 'Security',
          done: Status.PENDING,
        },
      ],
    },
    {
      header: ListHeader.PUBLISH,
      location: '/publish',
      done: Status.PENDING,
      items: [
        {
          name: 'Package',
          done: Status.PENDING,
        },
        {
          name: 'Publish',
          done: Status.PENDING,
        },
      ],
    },
    {
      header: ListHeader.COMPLETE,
      location: '/complete',
      done: Status.PENDING,
      items: [
        {
          name: 'Resources',
          done: Status.PENDING,
        },
      ],
    },
  ],
};

export function getProgress(): ProgressList {
  const current_progress = sessionStorage.getItem('current_progress');

  if (current_progress) {
    return <ProgressList>JSON.parse(current_progress);
  } else {
    return progress;
  }
}

export function setProgress(newProgress: ProgressList) {
  progress = newProgress;
  sessionStorage.setItem('current_progress', JSON.stringify(progress));
}

export function setURL(url: string) {
  if (url) {
    site_url = url;
    sessionStorage.setItem(PWABuilderSession.currentUrl, site_url);
  }
}

export function getURL(): string {
  const url = sessionStorage.getItem(PWABuilderSession.currentUrl);

  if (site_url) {
    return site_url;
  }

  if (url) {
    return url;
  }

  throw new Error('No Good URL found for the current site');
}

export function setResults(testResults: RawTestResult) {
  results = testResults;

  sessionStorage.removeItem('current_results');
  sessionStorage.setItem('current_results', JSON.stringify(testResults));
}

export function getResults(): RawTestResult | undefined {
  if (results) {
    return results;
  } else {
    const testResults = sessionStorage.getItem('current_results');

    if (testResults) {
      const parsedResults = <RawTestResult>JSON.parse(testResults);
      return parsedResults;
    } else {
      return undefined;
    }
  }
}

export async function baseOrPublish(): Promise<'base' | 'publish'> {
  const choseSW = getChosenServiceWorker();

  // is the manifest one we generated
  // or is it from the developer?
  const generatedFlag = getManifestContext().isGenerated;

  if (generatedFlag === true || choseSW !== undefined) {
    // User has chosen a custom service worker
    // or we have generated a manifest for them
    // send to basepackage to download.
    // to-do: Users who edit their manifest will be sent here too
    return 'base';
  }

  if (generatedFlag === false) {
    // User already has a manifest
    // send to publish page
    return 'publish';
  }

  // user does not have a manifest and has not chosen an SW
  // They will go to the base package page and will need to download
  // The generated manifest and default SW
  return 'base';
}

/**
 * Gets contextual information about the current manifest.
 * If no manifest has been detected, an empty manifest will be returned.
 * @returns 
 */
export function getManifestContext(): ManifestContext {
  if (!manifestContext) {
    manifestContext = getManifestFromSessionOrEmpty();
  }

  return manifestContext;
}

/**
 * Sets the current manifest context.
 * @param val The manifest.
 */
export function setManifestContext(val: ManifestContext) {
  manifestContext = val;
  sessionStorage.setItem(PWABuilderSession.manifest, JSON.stringify(val));
  setURL(val.siteUrl);
}

export function getManifestUrl(): string {
  return getManifestContext().manifestUrl;
}

function getManifestFromSessionOrEmpty(): ManifestContext {
  try {
    const sessionManifest = sessionStorage.getItem(PWABuilderSession.manifest);
    if (sessionManifest) {
      return JSON.parse(sessionManifest) as ManifestContext;
    }
  } catch (err) {
    console.error('Unable to load manifest from session', err);
  }

  const emptyManifest: Manifest = {
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
  return {
    manifest: emptyManifest,
    siteUrl: sessionStorage.getItem(PWABuilderSession.currentUrl) || '',
    manifestUrl: '',
    isGenerated: true
  }
}