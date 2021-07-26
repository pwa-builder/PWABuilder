import {
  ListHeader,
  ProgressList,
  RawTestResult,
  Status,
} from '../utils/interfaces';
import { generated } from './manifest';
import { getChosenServiceWorker } from './service_worker';

let site_url: string | undefined;
let results: RawTestResult | undefined;

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
    sessionStorage.setItem('current_url', site_url);
  }
}

export function getURL() {
  const url = sessionStorage.getItem('current_url');

  if (site_url) {
    return site_url;
  } else if (url) {
    return url;
  } else {
    throw new Error('No Good URL found for the current site');
  }
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
  // or the users
  const generatedFlag = generated;

  if (generatedFlag === true || choseSW !== undefined) {
    // User has chosen a custom service worker
    // or we have generated a manifest for them
    // send to basepackage to download.
    // to-do: Users who edit their manifest will be sent here too
    return 'base';
  } else if (generatedFlag === false) {
    // User already has a manifest
    // send to publish page
    return 'publish';
  } else {
    // user does not have a manifest and has not chosen an SW
    // They will go to the base package page and will need to download
    // The generated manifest and default SW
    return 'base';
  }
}
