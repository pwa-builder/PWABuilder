import { fileSave } from 'browser-fs-access';
import { env } from '../utils/environment';
import { findSuitableIcon } from '../utils/icons';
import {
  generateWindowsPackageId,
  validateWindowsOptions,
  WindowsPackageOptions,
} from '../utils/win-validation';
import { getManifest, getManiURL } from './manifest';

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

      await fileSave(data, {
        fileName: 'your_windows_pwa.zip',
        extensions: ['.zip'],
      });

      return;
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
    const pwaUrl = getManiURL();

    if (!pwaUrl) {
      throw new Error("Can't find the current URL");
    }
    const name = manifest.short_name || manifest.name || 'My PWA';
    const packageID = generateWindowsPackageId(new URL(pwaUrl).hostname);
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
      url: pwaUrl,
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
        url: pwaUrl,
      },
      edgeHtmlPackage: {
        generate: windowsConfiguration === 'spartan',
      },
      manifestUrl: pwaUrl,
      manifest: manifest,
      images: {
        baseImage: icon && icon.src ? icon.src : '',
        backgroundColor: 'transparent',
        padding: 0.3,
      },
    };

    return options;
  }
  else {
      throw new Error("Could not generate options from the current apps manifest");
  }
}
