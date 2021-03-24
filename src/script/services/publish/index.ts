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

type platform = 'windows' | 'android' | 'samsung';

export async function generatePackage(type: platform, form?: HTMLFormElement) {
  switch (type) {
    case 'windows':
      try {
        // First we check for a form
        // and generate based off of that.
        // We will have a form if the user is going to
        // prod
        if (form) {
          const options = createWindowsPackageOptionsFromForm(form);

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
            const options = createWindowsPackageOptionsFromManifest();

            const testBlob = await generateWindowsPackage(options);
            return {
              blob: testBlob || null,
              type: 'test',
            };
          } catch (err) {
            // Oh no, looks like we dont have the manifest in memory
            // Lets try to grab it
            const localManifest = await this.grabBackupManifest();

            if (localManifest) {
              const options = createWindowsPackageOptionsFromManifest(
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
          const androidOptions = createAndroidPackageOptionsFromForm(form);

          if (androidOptions) {
            const blob = await generateAndroidPackage(androidOptions);

            return {
              blob: blob || null,
              type: 'store',
            };
          }
        } else {
          try {
            const androidOptions = createAndroidPackageOptionsFromManifest();
            const testBlob = await generateAndroidPackage(androidOptions);

            return {
              blob: testBlob || null,
              type: 'test',
            };
          } catch (err) {
            // Oh no, looks like we dont have the manifest in memory
            // Lets try to grab it
            const localManifest = await this.grabBackupManifest();
            if (localManifest) {
              const androidOptions = createAndroidPackageOptionsFromManifest(
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
        throw new Error(`Error generating Android package ${err}`);
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
