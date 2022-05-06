import {
  ListHeader,
  Manifest,
  ManifestContext,
  ProgressList,
  PWABuilderSession,
  RawTestResult,
  Status,
} from '../utils/interfaces';
import { runManifestChecks } from '../utils/manifest-validation';
import { getSetSWCounter } from './service_worker';


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
  
  // This counter != 0 if the user has selected a custom SW.
  const setSWCounter = getSetSWCounter();

  const maniContext = getManifestContext();

  // is the manifest one we generated
  // or is it from the developer?
  const generatedFlag = maniContext.isGenerated;
  // has the manifest been edited by
  // the user?
  const editedFlag = maniContext.isEdited;

  // choseSW is never undefined now bc we set a default
  if (generatedFlag === true || setSWCounter !== 0 || editedFlag === true) {
    // User has chosen a custom service worker
    // or we have generated a manifest for them
    // send to basepackage to download.
    // to-do: Users who edit their manifest will be sent here too
    return 'base';
  }

  // double check manifest
  const doubleCheckResults = await doubleCheckManifest(maniContext);
  if (
    generatedFlag === false &&
    editedFlag === false &&
    doubleCheckResults.icon &&
    (doubleCheckResults.name || doubleCheckResults.shortName) &&
    doubleCheckResults.startURL
  ) {
    // User already has a manifest
    // and as not edited it
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
    theme_color: '#000000',
    background_color: '#000000',
    icons: [],
    screenshots: [],
  };
  return {
    manifest: emptyManifest,
    initialManifest: emptyManifest,
    siteUrl: sessionStorage.getItem(PWABuilderSession.currentUrl) || '',
    manifestUrl: '',
    isGenerated: true,
    isEdited: false,
  };
}

// a function that compares two objects and returns true if the same, false if different
export function isManifestEdited(
  originalMani: Manifest,
  newMani: Manifest
): void {
  if (originalMani === newMani) {
    getManifestContext().isEdited = false;
  }

  // loop through all the values in the original manifest
  // and see if they are diffrent in the newMani
  Object.keys(originalMani).forEach((key) => {

    if (Array.isArray(originalMani[key]) && Array.isArray(newMani[key])) {
      let flattened_original: Array<any> = originalMani[key].flat(2);
      let flattened_new: Array<any> = newMani[key].flat(2);

      flattened_original.forEach((item: any, index) => {
        if (flattened_new.includes(item) === true && flattened_new[index] !== item) {
          getManifestContext().isEdited = true;
        }
      })
    }
    else if (JSON.stringify(originalMani[key]) !== JSON.stringify(newMani[key])) {
      getManifestContext().isEdited = true;
    }
  });
}

export async function doubleCheckManifest(maniContext: ManifestContext): Promise<{
  startURL: boolean;
  name: boolean;
  shortName: boolean;
  icon: boolean;
}> {
  // manifest double checks
  const test_results = await runManifestChecks(maniContext);

  let startURL = false;
  let name = false;
  let shortName = false;
  let icon = false;

  test_results.forEach(test => {
    if (test.category === 'required') {
      if (test.infoString.includes('start_url')) {
        startURL = test.result;
      }
      if (test.infoString.includes('short_name')) {
        shortName = test.result;
      }
      if (test.infoString.includes('name') && test.infoString.toLowerCase().includes('short_name') === false) {
        name = test.result;
      }
      if (test.infoString.includes('512')) {
        icon = test.result;
      }
    }
  });

  return {
    startURL,
    name,
    shortName,
    icon,
  };
}