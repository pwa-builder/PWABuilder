import { findBestAppIcon } from '../../utils/icons';
import { getResults, getURL } from '../app-info';
import { fetchOrCreateManifest } from '../manifest';

export interface checkResults {
  validURL: boolean;
  manifest: boolean;
  baseIcon: boolean;
  offline: boolean;
}

export async function finalCheckForPublish(): Promise<checkResults> {
  return new Promise(async (resolve, reject) => {
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

    const manifestContext = await fetchOrCreateManifest();
    const manifest = manifestContext.manifest;
    const possible_icons = manifest ? manifest.icons : [];
    const icon = findBestAppIcon(possible_icons);
    if (results && testURL) {
      const firstManifestResult =
        typeof results.manifest === 'boolean'
          ? false
          : results.manifest[0]!.result;
      const checkResults = {
        validURL: testURL ? true : false,
        manifest: firstManifestResult,
        baseIcon: icon ? true : false,
        offline: results.service_worker[1]!.result,
      };
      resolve(checkResults);
    } else {
      reject('Could not grab test results or url to validate');
    }
  });
}
