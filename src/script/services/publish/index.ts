import { Manifest } from '../../utils/interfaces';
import { fetchManifest } from '../manifest';
import {
  createAndroidPackageOptionsFromForm,
  createAndroidPackageOptionsFromManifest,
  generateAndroidPackage,
} from './android-publish';
import {
  createWindowsPackageOptionsFromForm,
  createWindowsPackageOptionsFromManifest,
  generateWindowsPackage,
} from './windows-publish';

export type Platform = 'windows' | 'android' | 'samsung';

export type PackageInfo = {
  blob: Blob | null;
  type: string;
}

export async function generatePackage(
  type: Platform,
  form?: HTMLFormElement,
  signingFile?: string
): Promise<PackageInfo | null> {
  switch (type) {
    case 'windows':
      return await tryGenerateWindowsPackage(form);
    case 'android':
      return await tryGenerateAndroidPackage(form, signingFile);
    case 'samsung':
      return null;
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
    const maniResults = await fetchManifest(site);

    if (maniResults && maniResults.content) {
      localManifest = maniResults.content;
    }
  }

  return localManifest;
}

async function tryGenerateWindowsPackage(form?: HTMLFormElement): Promise<PackageInfo | null> {
  try {
    // First we check for a form
    // and generate based off of that.
    // We will have a form if the user is going to
    // prod
    if (form) {
      const options = await createWindowsPackageOptionsFromForm(form);
      if (!options) {
        return null;
      }

      const blob = await generateWindowsPackage(options);
      return {
        blob: blob || null,
        type: 'store',
      };
    } else {
      // No form, lets generate from the manifest
      try {
        const options = await createWindowsPackageOptionsFromManifest();
        const testBlob = await generateWindowsPackage(options);
        return {
          blob: testBlob || null,
          type: 'test'
        };
      } catch (err) {
        // Oh no, looks like we dont have the manifest in memory
        // Lets try to grab it
        const localManifest = await grabBackupManifest();
        if (!localManifest) {
          return null;
        }

        const options = await createWindowsPackageOptionsFromManifest(
          localManifest
        );
        const testBlob = await generateWindowsPackage(options);
        return {
          blob: testBlob || null,
          type: 'test',
        };
      }
    }
  } catch (err) {
    throw new Error(`Error generating Windows package ${err}`);
  }
}

async function tryGenerateAndroidPackage(form?: HTMLFormElement, signingFile?: string): Promise<PackageInfo | null> {
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
      blob: blob || null,
      type: 'store',
    };
  } else {
    // No form. Try creating from manifest.
    try {
      const androidOptions = await createAndroidPackageOptionsFromManifest();
      const testBlob = await generateAndroidPackage(androidOptions);

      return {
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
        blob: testBlob || null,
        type: 'test',
      };
    }
  }
}