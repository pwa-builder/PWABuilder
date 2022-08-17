import { AndroidPackageOptions } from '../../utils/android-validation';
import { IOSAppPackageOptions } from '../../utils/ios-validation';
import { OculusAppPackageOptions } from '../../utils/oculus-validation';
import { WindowsPackageOptions } from '../../utils/win-validation';
import {
  generateAndroidPackage,
} from './android-publish';
import { generateIOSPackage } from './ios-publish';
import { generateOculusPackage } from './oculus-publish';
import {
  generateWindowsPackage,
} from './windows-publish';

export type Platform = 'windows' | 'android' | 'other-android' | 'ios' | 'oculus';

type PackageInfo = {
  appName: string;
  blob: Blob | null;
  type: string;
};

export async function generatePackage(
  type: Platform,
  packageOptions?: AndroidPackageOptions | IOSAppPackageOptions | WindowsPackageOptions | OculusAppPackageOptions
): Promise<PackageInfo | null> {
  switch (type) {
    case 'windows':
      return await tryGenerateWindowsPackage(packageOptions as WindowsPackageOptions);
    case 'android':
      return await tryGenerateAndroidPackage(packageOptions as AndroidPackageOptions);
    case 'ios':
      return await tryGenerateIOSPackage(packageOptions as IOSAppPackageOptions);
    case 'oculus':
      return await tryGenerateOculusPackage(packageOptions as OculusAppPackageOptions);
    default:
      throw new Error(
        `A platform type must be passed, ${type} is not a valid platform.`
      );
  }
}

async function tryGenerateIOSPackage(options: IOSAppPackageOptions): Promise<PackageInfo | null> {
  const result = await generateIOSPackage(options);
  return {
    appName: options.name,
    blob: result,
    type: "store"
  };
}

async function tryGenerateOculusPackage(options: OculusAppPackageOptions): Promise<PackageInfo | null> {
  const result = await generateOculusPackage(options);
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

async function tryGenerateAndroidPackage(options: AndroidPackageOptions): Promise<PackageInfo | null> {
  const blob = await generateAndroidPackage(options);
  return {
    appName: options.name,
    blob: blob || null,
    type: 'store',
  };
}
