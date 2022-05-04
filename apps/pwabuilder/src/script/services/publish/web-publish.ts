import { fetchOrCreateManifest } from '../manifest';
import { env } from '../../utils/environment';
import { getURL } from '../app-info';
import { getChosenServiceWorker } from '../../services/service_worker';
import { Manifest } from '../../utils/interfaces';

export let hasGeneratedWebPackage = false;

export async function generateWebPackage() {
  const manifestContext = await fetchOrCreateManifest();
  const manifest = manifestContext.manifest;
  const url = getURL();
  const chosenSW = getChosenServiceWorker();

  // The web package generator dies when screenshots is null. If detected, set screenshots to empty array.
  const baseUrl = env.webPackageGeneratorFormUrl;
  let urlToUse: string;
  const body = createNewFormDataWithManifest(manifest);

  if (chosenSW) {
    urlToUse = `${baseUrl}?siteUrl=${url}&swId=${chosenSW}&hasServiceWorker=${false}`;
  } else {
    urlToUse = `${baseUrl}?siteUrl=${url}&hasServiceWorker=${true}`;
  }

  const response = await fetch(urlToUse, {
    method: 'POST',
    body,
  });
  if (response.status === 200) {
    const data = await response.blob();

    // set generated flag
    hasGeneratedWebPackage = true;

    return data;
  } else {
    const responseText = await response.text();
    throw new Error(
      `Unable to generate base package. Status code ${response.status}, Error: ${response.statusText}, Details: ${responseText}, Form Data: ${body}`
    );
  }
}

function createNewFormDataWithManifest(manifest: Manifest): FormData {
  const form = new FormData();

  const keys = Object.keys(manifest);
  const length = keys.length;

  for (let i = 0; i < length; i++) {
    const key = keys[i] as keyof Manifest;
    let val = manifest[key];

    if (Array.isArray(val)) {
      const arrLength = val.length;
      for (let j = 0; j < arrLength; j++) {
        let arrVal = val[j];

        // want to stringify both objects and nested arrays, this is to prevent form nesting which is a deprecated but functional use. maps and sets shouldn't be in the manifest object.
        if (typeof arrVal === 'object') {
          arrVal = JSON.stringify(arrVal);
        }

        form.append(key as string, arrVal);
      }
    } else {
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }

      if (val === null || val === undefined || val === '') {
        continue;
      }

      form.append(key as string, val);
    }
  }

  return form;
}
