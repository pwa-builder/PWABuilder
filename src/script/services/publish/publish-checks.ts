import { getResults, getURL } from '../app-info';

export interface checkResults {
    validURL: boolean,
    manifest: boolean,
    baseIcon: boolean,
    offline: boolean
}

export async function finalCheckForPublish(): Promise<checkResults> {
  return new Promise((resolve, reject) => {
    // Final check before a user starts trying to publish
    // We check for the following:
    /**
     * Valid URL
     * Manifest
     * 512x512 icon in manifest
     * Offline for Android
     */

    const results = getResults();
    const testURL = getURL();

    if (results && testURL) {
      const checkResults = {
        validURL: testURL ? true : false,
        manifest: results?.manifest[0].result,
        baseIcon: results?.manifest[10].result,
        offline: results?.service_worker[1].result,
      };
      resolve(checkResults);
    } else {
      reject("Could not grab test results or url to validate");
    }
  });
}
