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

export type platform = 'windows' | 'android' | 'samsung';

export async function generatePackage(type: platform, form?: HTMLFormElement, signingFile?: string) {
  switch (type) {
    case 'windows':
      try {
        // First we check for a form
        // and generate based off of that.
        // We will have a form if the user is going to
        // prod
        if (form) {
          const options = await createWindowsPackageOptionsFromForm(form);

          if (options) {
            const blob = await generateWindowsPackage(options);
            return {
              blob: blob || null,
              type: 'store',
            };
          }
        } else {
          // No form, lets generate from the manifest
          try {
            const options = await createWindowsPackageOptionsFromManifest();

            const testBlob = await generateWindowsPackage(options);
            return {
              blob: testBlob || null,
              type: 'test',
            };
          } catch (err) {
            // Oh no, looks like we dont have the manifest in memory
            // Lets try to grab it
            const localManifest = await grabBackupManifest();

            if (localManifest) {
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
        }
      } catch (err) {
        throw new Error(`Error generating Windows package ${err}`);
      }
      break;
    case 'android':
      try {
        if (form) {
          const androidOptions = await createAndroidPackageOptionsFromForm(form, signingFile);

          if (androidOptions) {
            try {
              const blob = await generateAndroidPackage(androidOptions, form);

              return {
                blob: blob || null,
                type: 'store',
              };
            }
            catch (err) {
              console.error('err generating android from form', err);
              return err;
            }
          }
        } else {
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
            if (localManifest) {
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
      } catch (err) {
        return err;
      }
      break;
    case 'samsung':
      console.log('samsung');
      break;
    default:
      console.error(
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