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
    const res = await fetch(`${screenshotServiceBaseUrl}/${EndPoints.base64}`, {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        url: screenshotsList,
      }),
    });

    if (res.ok) {
      let screenshots: Array<Icon> = (await getManifest())?.screenshots ?? [];
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
