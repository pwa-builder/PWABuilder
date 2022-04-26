import { Screenshot } from '../utils/interfaces';
import { fetchOrCreateManifest, updateManifest } from './manifest';

const screenshotServiceBaseUrl = 'https://pwa-screenshots.azurewebsites.net';

enum EndPoints {
  colorScheme = 'getColorScheme',
  base64 = 'screenshotsAsBase64Strings',
  zip = 'downloadScreenshotsZipFile',
}

interface ScreenshotServiceResponse {
  images: Array<Screenshot>;
}

export async function generateScreenshots(
  screenshotsList: Array<string>
): Promise<Array<Screenshot> | undefined> {
  try {
    const res = await fetch(`${screenshotServiceBaseUrl}/${EndPoints.base64}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      referrerPolicy: 'origin',
      credentials: 'omit',
      body: JSON.stringify({
        url: screenshotsList,
      }),
    });

    if (res.ok) {
      const response = (await res.json()) as ScreenshotServiceResponse;

      let screenshots: Array<Screenshot>;
      try {
        const manifestContext = await fetchOrCreateManifest();
        screenshots = manifestContext.manifest.screenshots || [];
      } catch (error) {
        screenshots = [];
      }
      screenshots = screenshots.concat(
        response.images.map(image => {
          image.src = 'data:image/png;base64,' + image.src;
          return image;
        })
      );

      await updateManifest({
        screenshots,
      });

      return screenshots;
    } else {
      throw new Error(await res.text());
    }
  } catch (e) {
    console.error(e);
  }

  return undefined;
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
