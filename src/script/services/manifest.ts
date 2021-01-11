import { env } from '../utils/environment';

let caughtManifest = null;
let caughtManiUrl = null;
let siteUrl = null;

export async function getManifest(url: string) {
  if (url) {
    siteUrl = url;

    const response = await fetch(`${env.manifestFinder}?url=${siteUrl}`);
    const data = await response.json();

    if (data) {
      caughtManifest = data.manifestContents;
      caughtManiUrl = data.manifestUrl;

      return data;
    }
    else {
        return null;
    }
  }
  else {
      throw new Error("A valid URL to a website must be passed");
  }
}
