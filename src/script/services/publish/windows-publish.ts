import { env } from '../../utils/environment';
import { findSuitableIcon } from '../../utils/icons';
import {
  generateWindowsPackageId,
  validateWindowsOptions,
  WindowsPackageOptions,
} from '../../utils/win-validation';
import { getURL } from '../app-info';
import { getManifest, getManiURL } from '../manifest';

export async function generateWindowsPackage(
  configuration: 'anaheim' | 'spartan',
  windowsOptions: WindowsPackageOptions
) {
  if (!windowsOptions) {
    // this.showErrorMessage("Invalid Windows options. No options specified.");
    throw new Error('Invalid Windows options. No options specified.');
  }

  const validationErrors = validateWindowsOptions(
    windowsOptions,
    configuration
  );
  if (validationErrors.length > 0 || !windowsOptions) {
    throw new Error(
      'Invalid Windows options. ' +
        validationErrors.map(a => a.error).join('\n')
    );
  }

  try {
    const response = await fetch(`${env.windowsPackageGeneratorUrl}`, {
      method: 'POST',
      body: JSON.stringify(windowsOptions),
      headers: new Headers({ 'content-type': 'application/json' }),
    });
    if (response.status === 200) {
      const data = await response.blob();

      return data;
    } else {
      const responseText = await response.text();
      throw new Error(
        `Failed. Status code ${response.status}, Error: ${response.statusText}, Details: ${responseText}`
      );
    }
  } catch (err) {
    throw new Error('Failed. Error: ' + err);
  }
}

export function createWindowsPackageOptionsFromManifest(
  windowsConfiguration: 'anaheim' | 'spartan'
): WindowsPackageOptions {
  const manifest = getManifest();
  console.log('current manifest', manifest);

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
    const packageID = generateWindowsPackageId(new URL(pwaURL).hostname);
    const manifestIcons = manifest.icons || [];

    const icon =
      findSuitableIcon(manifestIcons, 'any', 512, 512, 'image/png') ||
      findSuitableIcon(manifestIcons, 'any', 192, 192, 'image/png') ||
      findSuitableIcon(manifestIcons, 'any', 512, 512, 'image/jpeg') ||
      findSuitableIcon(manifestIcons, 'any', 192, 192, 'image/jpeg') ||
      findSuitableIcon(manifestIcons, 'any', 512, 512, undefined) || // Fallback to a 512x512 with an undefined type.
      findSuitableIcon(manifestIcons, 'any', 192, 192, undefined) || // Fallback to a 192x192 with an undefined type.
      findSuitableIcon(manifestIcons, 'any', 0, 0, 'image/png') || // No large PNG and no large JPG? See if we have *any* PNG
      findSuitableIcon(manifestIcons, 'any', 0, 0, 'image/jpeg') || // No large PNG and no large JPG? See if we have *any* JPG
      findSuitableIcon(manifestIcons, 'any', 0, 0, undefined); // Welp, we sure tried. Grab any image available.

    const options: WindowsPackageOptions = {
      name: name,
      packageId: packageID,
      url: pwaURL,
      version: windowsConfiguration === 'spartan' ? '1.0.0' : '1.0.1',
      allowSigning: true,
      publisher: {
        displayName: 'Contoso, Inc.',
        commonName: 'CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca',
      },
      generateModernPackage: windowsConfiguration === 'anaheim',
      classicPackage: {
        generate: windowsConfiguration === 'anaheim',
        version: '1.0.0',
        url: pwaURL,
      },
      edgeHtmlPackage: {
        generate: windowsConfiguration === 'spartan',
      },
      manifestUrl: maniURL,
      manifest: manifest,
      images: {
        baseImage: icon && icon.src ? icon.src : '',
        backgroundColor: 'transparent',
        padding: 0.3,
      },
    };

    return options;
  } else {
    // temporary link until the home page has the logic to handle
    // a query string with the URL or the app so the user could re-run
    // the test here.
    throw new Error(`No manifest found, Double check that you have a manifest`);
  }
}

export function createWindowsPackageOptionsFromForm(
  form: HTMLFormElement,
  windowsConfiguration = 'anaheim'
) {
  const manifest = getManifest();
  console.log('current manifest', manifest);

  if (manifest) {
    const name = form.appName.value || manifest.short_name || manifest.name;
    const packageID = form.packageId.value;

    console.log('name', name);
    console.log('packageID', packageID);
    const manifestIcons = manifest.icons || [];

    const icon =
      findSuitableIcon(manifestIcons, 'any', 512, 512, 'image/png') ||
      findSuitableIcon(manifestIcons, 'any', 192, 192, 'image/png') ||
      findSuitableIcon(manifestIcons, 'any', 512, 512, 'image/jpeg') ||
      findSuitableIcon(manifestIcons, 'any', 192, 192, 'image/jpeg') ||
      findSuitableIcon(manifestIcons, 'any', 512, 512, undefined) || // Fallback to a 512x512 with an undefined type.
      findSuitableIcon(manifestIcons, 'any', 192, 192, undefined) || // Fallback to a 192x192 with an undefined type.
      findSuitableIcon(manifestIcons, 'any', 0, 0, 'image/png') || // No large PNG and no large JPG? See if we have *any* PNG
      findSuitableIcon(manifestIcons, 'any', 0, 0, 'image/jpeg') || // No large PNG and no large JPG? See if we have *any* JPG
      findSuitableIcon(manifestIcons, 'any', 0, 0, undefined); // Welp, we sure tried. Grab any image available.*/

    const options: WindowsPackageOptions = {
      name: name,
      packageId: packageID,
      url: form.url.value || getURL(),
      version: form.appVersion.value || "1.0.1",
      allowSigning: true,
      publisher: {
        displayName: form.publisherDisplayName.value,
        commonName: form.publisherId.value,
      },
      generateModernPackage: windowsConfiguration === 'anaheim',
      classicPackage: {
        generate: windowsConfiguration === 'anaheim',
        version: '1.0.0',
        url: form.url.value || getURL(),
      },
      edgeHtmlPackage: {
        generate: windowsConfiguration === 'spartan',
      },
      manifestUrl: form.manifestUrl.value || getManiURL(),
      manifest: manifest,
      images: {
        baseImage: form.iconUrl.value || icon,
        backgroundColor: 'transparent',
        padding: 0.3,
      },
    };

    return options;
  }
}
