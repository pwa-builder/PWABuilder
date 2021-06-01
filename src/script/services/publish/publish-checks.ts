import { findSuitableIcon } from '../../utils/icons';
import { getResults, getURL } from '../app-info';
import { getGeneratedManifest, getManifest } from '../manifest';

export interface checkResults {
    validURL: boolean,
    manifest: boolean,
    baseIcon: boolean,
    offline: boolean
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

    const possible_mani = await getManifest();
    const possible_gen_mani = await getGeneratedManifest();

    const possible_icons = possible_mani ? possible_mani.icons : possible_gen_mani?.icons;

    const icon =
      findSuitableIcon(possible_icons, 'any', 512, 512, 'image/png') ||
      findSuitableIcon(possible_icons, 'any', 192, 192, 'image/png') ||
      findSuitableIcon(possible_icons, 'any', 512, 512, 'image/jpeg') ||
      findSuitableIcon(possible_icons, 'any', 192, 192, 'image/jpeg') ||
      findSuitableIcon(possible_icons, 'any', 512, 512, undefined) || // Fallback to a 512x512 with an undefined type.
      findSuitableIcon(possible_icons, 'any', 192, 192, undefined) || // Fallback to a 192x192 with an undefined type.
      findSuitableIcon(possible_icons, 'any', 0, 0, 'image/png') || // No large PNG and no large JPG? See if we have *any* PNG
      findSuitableIcon(possible_icons, 'any', 0, 0, 'image/jpeg') || // No large PNG and no large JPG? See if we have *any* JPG
      findSuitableIcon(possible_icons, 'any', 0, 0, undefined); // Welp, we sure tried. Grab any image available.

    if (results && testURL) {
      const checkResults = {
        validURL: testURL ? true : false,
        manifest: results?.manifest[0].result,
        baseIcon: icon ? true : false,
        offline: results?.service_worker[1].result,
      };
      resolve(checkResults);
    } else {
      reject("Could not grab test results or url to validate");
    }
  });
}
