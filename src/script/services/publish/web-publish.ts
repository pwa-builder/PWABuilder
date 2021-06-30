import { getGeneratedManifest, getManifest } from '../manifest';
import { env } from '../../utils/environment';
import { getURL } from '../app-info';
import { getChosenServiceWorker } from '../service_worker';
import { Manifest } from '../../utils/interfaces';

export let web_generated = false;

export async function generateWebPackage() {
  try {
    const manifest = await getManifest();
    const genManifest = getGeneratedManifest();
    const url = getURL();
    const chosenSW = getChosenServiceWorker();

    // The web package generator dies when screenshots is null. If detected, set screenshots to empty array.
    const manifestWithScreenshots = manifest
      ? { ...manifest }
      : { ...genManifest };

    if (!manifestWithScreenshots.screenshots) {
      manifestWithScreenshots.screenshots = [];
    }

    let baseUrl: string;
    let urlToUse: string;
    let headers: Headers | undefined;
    let body: FormData | string;

    if (manifest.icons.length > 10) {
      baseUrl = env.webPackageGeneratorUrlForm;
      body = createNewFormDataWithManifest(manifest);
    } else {
      baseUrl = env.webPackageGeneratorUrl;
      headers = new Headers({
        'content-type': 'application/json',
      });
      body = JSON.stringify(manifestWithScreenshots);
    }

    if (chosenSW) {
      urlToUse = `${baseUrl}?siteUrl=${url}&swId=${chosenSW}&hasServiceWorker=${false}`;
    } else {
      urlToUse = `${baseUrl}?siteUrl=${url}&hasServiceWorker=${true}`;
    }

    const response = await fetch(urlToUse, {
      method: 'POST',
      body,
      headers,
    });
    if (response.status === 200) {
      const data = await response.blob();

      // set generated flag
      web_generated = true;

      return data;
    } else {
      const responseText = await response.text();
      throw new Error(
        `Failed. Status code ${response.status}, Error: ${response.statusText}, Details: ${responseText}`
      );
    }
  } catch (error) {
    throw new Error('Failed. Error: ' + error);
  }
}

function createNewFormDataWithManifest(manifest: Manifest): FormData {
  const form = new FormData();

  const keys = Object.keys(manifest);
  const length = keys.length;

  for (let i = 0; i < length; i++) {
    const key = keys[i];
    let val = manifest[key];

    if (Array.isArray(val)) {
      const arrLength = val.length;
      for (let j = 0; j < arrLength; j++) {
        let arrVal = val[j];

        // want to stringify both objects and nested arrays, this is to prevent form nesting which is a deprecated but functional use. maps and sets shouldn't be in the manifest object.
        if (typeof arrVal === 'object') {
          arrVal = JSON.stringify(arrVal);
        }

        form.append(key, arrVal);
      }
    } else if (typeof val === 'object') {
      val = JSON.stringify(val);
    }

    form.append(key, val);
  }

  return form;
}
