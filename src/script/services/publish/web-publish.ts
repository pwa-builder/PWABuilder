import { getGeneratedManifest, getManifest } from "../manifest";
import { env } from '../../utils/environment';
import { getURL } from "../app-info";
import { getChosenServiceWorker } from "../service_worker";

export let web_generated = false;

export async function generateWebPackage() {
  try {
    const manifest = await getManifest();
    const genManifest = getGeneratedManifest();
    const url = getURL();
    const chosenSW = getChosenServiceWorker();

    // The web package generator dies when screenshots is null. If detected, set screenshots to empty array.
    const manifestWithScreenshots = manifest ? { ...manifest } : { ...genManifest };

    if (!manifestWithScreenshots.screenshots) {
      manifestWithScreenshots.screenshots = [];
    }

    let urlToUse;

    if (chosenSW) {
      urlToUse = `${env.webPackageGeneratorUrl}?siteUrl=${url
      }&swId=${chosenSW}&hasServiceWorker=${false}`
    }
    else {
      urlToUse = `${env.webPackageGeneratorUrl}?siteUrl=${url
      }&hasServiceWorker=${true}`
    }

    const response = await fetch(
      urlToUse,
      {
        method: "POST",
        body: JSON.stringify(manifestWithScreenshots),
        headers: new Headers({
          "content-type": "application/json",
        }),
      }
    );
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
    throw new Error("Failed. Error: " + error);
  }
}