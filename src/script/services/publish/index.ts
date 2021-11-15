import { Manifest } from '../../utils/interfaces';
import { IOSAppPackageOptions } from '../../utils/ios-validation';
import { WindowsPackageOptions } from '../../utils/win-validation';
import { fetchOrCreateManifest } from '../manifest';
import {
  createAndroidPackageOptionsFromForm,
  createAndroidPackageOptionsFromManifest,
  generateAndroidPackage,
} from './android-publish';
import { generateIOSPackage } from './ios-publish';
import {
  generateWindowsPackage,
} from './windows-publish';

export type Platform = 'windows' | 'android' | 'ios';

type PackageInfo = {
  appName: string;
  blob: Blob | null;
  type: string;
};

export async function generatePackage(
  type: Platform,
  form?: HTMLFormElement | IOSAppPackageOptions | WindowsPackageOptions,
  signingFile?: string
): Promise<PackageInfo | null> {
  switch (type) {
    case 'windows':
      return await tryGenerateWindowsPackage(form as WindowsPackageOptions);
    case 'android':
      return await tryGenerateAndroidPackage(form as HTMLFormElement, signingFile);
    case 'ios':
      return await tryGenerateIOSPackage(form as IOSAppPackageOptions);
    default:
      throw new Error(
        `A platform type must be passed, ${type} is not a valid platform.`
      );
  }
}

async function grabBackupManifest() {
  console.error(
    'Error generating package because manifest information is missing, trying fallback'
  );
  const search = new URLSearchParams(location.search);
  let site: string | null = null;
  if (search) {
    site = search.get('site');
  }

  let localManifest: Manifest | null = null;

  if (site) {
    try {
      const context = await fetchOrCreateManifest(site);
      localManifest = context.manifest;
    } catch (error) {

    }
  }

  return localManifest;
}

async function tryGenerateIOSPackage(options: IOSAppPackageOptions): Promise<PackageInfo | null> {
  const result = await generateIOSPackage(options);
  return {
    appName: options.name,
    blob: result,
    type: "store"
  };
}

async function tryGenerateWindowsPackage(packageOptions: WindowsPackageOptions): Promise<PackageInfo | null> {
  const blob = await generateWindowsPackage(packageOptions);
  return {
    appName: packageOptions.name,
    blob: blob || null,
    type: 'store',
  };
}

async function tryGenerateAndroidPackage(
  form?: HTMLFormElement,
  signingFile?: string
): Promise<PackageInfo | null> {
  if (form) {
    const androidOptions = await createAndroidPackageOptionsFromForm(
      form,
      signingFile
    );

    if (!androidOptions) {
      return null;
    }

    const blob = await generateAndroidPackage(androidOptions, form);
    return {
      appName: androidOptions.name,
      blob: blob || null,
      type: 'store',
    };
  } else {
    // No form. Try creating from manifest.
    try {
      const androidOptions = await createAndroidPackageOptionsFromManifest();
      const testBlob = await generateAndroidPackage(androidOptions);

      return {
        appName: androidOptions.name,
        blob: testBlob || null,
        type: 'test',
      };
    } catch (err) {
      // Oh no, looks like we dont have the manifest in memory
      // Lets try to grab it
      const localManifest = await grabBackupManifest();
      if (!localManifest) {
        return null;
      }

      const androidOptions = await createAndroidPackageOptionsFromManifest(
        localManifest
      );

      const testBlob = await generateAndroidPackage(androidOptions);
      return {
        appName: androidOptions.name,
        blob: testBlob || null,
        type: 'test',
      };
    }
  }
}
