import { hasGeneratedAndroidPackage } from './publish/android-publish';
import { hasGeneratedWebPackage } from './publish/web-publish';
import { hasGeneratedWindowsPackage } from './publish/windows-publish';
import { hasGeneratedIOSPackage } from './publish/ios-publish';
import { hasGeneratedOculusPackage } from './publish/oculus-publish';

export interface GeneratedPlatforms {
  windows: boolean;
  android: boolean;
  web: boolean;
  ios: boolean;
  oculus: boolean;
}

export function getPlatformsGenerated(): GeneratedPlatforms {
  return {
    android: hasGeneratedAndroidPackage,
    windows: hasGeneratedWindowsPackage,
    web: hasGeneratedWebPackage,
    ios: hasGeneratedIOSPackage,
    oculus: hasGeneratedOculusPackage
  };
}
