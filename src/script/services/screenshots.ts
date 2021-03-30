import { Icon } from '../utils/interfaces';
import { getManifest, updateManifest } from './manifest';

const screenshotServiceBaseUrl = 'https://pwa-screenshots.azurewebsites.net';

enum EndPoints {
  colorScheme = 'getColorScheme',
  base64 = 'screenshotsAsBase64Strings',
  zip = 'downloadScreenshotsZipFile',
}

export async function generateScreenshots(screenshotsList: Array<string>) {
  try {
    let screenshots: Array<Icon> = getManifest().screenshots ?? [];

    console.log('generateScreenshots', screenshots);

    const res = await fetch(`${screenshotServiceBaseUrl}/${EndPoints.base64}`, {
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        url: screenshotsList,
      }),
    });

    if (res.ok) {
      screenshots = screenshots.concat(await res.json());

      updateManifest({
        screenshots,
      });
    }
  } catch (e) {
    console.error(e);
  }
}

export async function downloadScreenshotZip() {
  try {
    console.log('TODO getScreenshots');
  } catch (e) {
    console.error(e);
  }
}

export async function getColorScheme() {
  try {
    console.log('TODO getColorScheme');
  } catch (e) {
    console.error(e);
  }
}
