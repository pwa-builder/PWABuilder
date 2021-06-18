import { env } from '../../utils/environment';
import { findSuitableIcon } from '../../utils/icons';
import { Manifest } from '../../utils/interfaces';
import { iosOptions } from '../../utils/ios-validation';
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

export async function createIOSPackageOptionsFromForm(form: HTMLFormElement) {
  let manifest: Manifest | undefined;
  manifest = await getManifest();

  if (manifest) {
    const maniURL = getManiURL();
    const pwaURL = getURL();

    if (!pwaURL) {
      throw new Error("Can't find the current URL");
    }

    if (!maniURL) {
      throw new Error('Cant find the manifest URL');
    }

    const name = form.appName.value || manifest.short_name || manifest.name;

    const manifestIcons = manifest.icons || [];
    const icon =
      findSuitableIcon(manifestIcons, 'any', 512, 512, 'image/png') ||
      findSuitableIcon(manifestIcons, 'any', 512, 512, 'image/jpeg') ||
      findSuitableIcon(manifestIcons, 'any', 512, 512, undefined) || // Fallback to a 512x512 with an undefined type.
      findSuitableIcon(manifestIcons, 'any', 0, 0, undefined); // Welp, we sure tried. Grab any image available.

    const options: iosOptions = {
      name: name as string,
      url: pwaURL,
      imageUrl: icon ? icon.src : "",
      splashColor:
        form.splashScreen?.value || manifest.background_color || '#FFFFFF',
      progressBarColor:
        form.progressBarColor?.value || manifest.theme_color || '#FFFFFF',
      statusBarColor:
        form.statusBarColor?.value || manifest.background_color || '#FFFFFF',
      permittedUrls: [
        'login.microsoftonline.com',
        'google.com',
        'facebook.com',
        'apple.com',
      ],
      manifest: manifest,
      manifestUrl: maniURL,
    };

    return options;
  }
}

export async function createIOSPackageOptionsFromManifest(
  localManifest?: Manifest
) {

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

    const options: iosOptions = {
      name: name as string,
      url: pwaURL,
      imageUrl: icon ? icon.src : "",
      splashColor: manifest.background_color || '#FFFFFF',
      progressBarColor: manifest.theme_color || '#FFFFFF',
      statusBarColor: manifest.background_color || '#FFFFFF',
      permittedUrls: [
        'login.microsoftonline.com',
        'google.com',
        'facebook.com',
        'apple.com',
      ],
      manifest: manifest,
      manifestUrl: maniURL,
    };

    return options;
  }
}
