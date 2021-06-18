import { env } from '../../utils/environment';
import { findSuitableIcon } from '../../utils/icons';
import { Manifest } from '../../utils/interfaces';
import { getURL } from '../app-info';
import { getManifest, getManiURL } from '../manifest';

export let ios_generated = false;

const generateAppUrl = env.iosPackageGeneratorUrl;

export async function generateIOSPackage(iosOptions: any) {
  try {
    const response = await fetch(generateAppUrl, {
      method: 'POST',
      body: JSON.stringify(iosOptions),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    if (response.status === 200) {
      //set generated flag
      ios_generated = true;

      return await response.blob();
    } else {
    }
  } catch (err) {}
}

export async function createIOSPackageOptionsFromForm(form: HTMLFormElement) {}

export async function createIOSPackageOptionsFromManifest(
  localManifest?: Manifest
) {
  /**
 * 
  App name - required (defaults to manifest name)
  App URL - required (defaults to absolute URL of manifest's URL being base URL part and start_url being the relative URL part)
  App image URL - required (defaults to 512x512 or larger PNG image from manifest)
  Splash color - optional (defaults to manifest background_color)
  Progress bar color - optional (defaults to manifest theme_color)
  Status bar color - optional (defaults to manifest background_color)
  Permitted URLs - optional. Allow user to specify one or more URLs (e.g. for 3rd party authentication, etc.) which the app can navigate to outside of the PWA scope. This is needed for things like "Sign in with Google". Defaults to empty string.

 */

  let manifest: Manifest | undefined;

  if (localManifest) {
    manifest = localManifest;
  } else {
    manifest = await getManifest();
  }

  if (manifest) {
    const maniURL = getManiURL();
    const pwaURL = getURL();

    if (!pwaURL) {
      throw new Error("Can't find the current URL");
    }

    if (!maniURL) {
      throw new Error('Cant find the manifest URL');
    }

    const name = manifest.short_name || manifest.name || 'My PWA';
    const manifestIcons = manifest.icons || [];

    const icon =
      findSuitableIcon(manifestIcons, 'any', 512, 512, 'image/png') ||
      findSuitableIcon(manifestIcons, 'any', 512, 512, 'image/jpeg') ||
      findSuitableIcon(manifestIcons, 'any', 512, 512, undefined) || // Fallback to a 512x512 with an undefined type.
      findSuitableIcon(manifestIcons, 'any', 0, 0, undefined); // Welp, we sure tried. Grab any image available.

    const options: any = {
      name: name as string,
      url: pwaURL,
      imageUrl: icon,
      splashColor: manifest.background_color || "#FFFFFF",
      progressBarColor: manifest.theme_color || "#FFFFFF",
      statusBarColor: manifest.background_color || "#FFFFFF",
      permittedUrls: [
         "login.microsoftonline.com",
         "google.com",
         "facebook.com",
         "apple.com"
      ],
      manifest: manifest,
      manifestUrl: maniURL
    };

    return options;
  }
}
