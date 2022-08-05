import { Manifest } from './interfaces';
import { validateUrl } from './url';

/**
 * Publisher options for the Windows Package generation.
 */
export interface WindowsPublisherOptions {
  displayName: string;
  commonName: string;
}

/**
 * Images to use for a Windows PWA. Should match server implementation: https://github.com/pwa-builder/pwabuilder-windows-chromium/blob/master/Models/WindowsImages.cs
 */
export interface WindowsImageOptions {
  baseImage: string | null;
  backgroundColor?: string | null; // null or undefined = best guess the background using the base image pixel (0,0)
  padding?: number; // should be between 0 (no padding) and 1 (max padding)
}

export interface WindowsPackageOptions {
  name: string;
  packageId: string;
  url: string;
  version: string;
  allowSigning?: boolean;
  edgeChannel?: 'stable' | 'beta' | 'dev' | 'canary' | 'internal';
  edgeLaunchArgs?: string;
  appUserModelId?: string;
  generateModernPackage?: boolean;
  manifestUrl?: string;
  manifest?: Manifest;
  classicPackage?: {
    generate?: boolean;
    version?: string;
    url?: string;
  };
  edgeHtmlPackage?: {
    generate?: boolean;
    version?: string;
    url?: string;
    urlsWithWindowsRuntimeAccess?: string[];
  };
  images?: WindowsImageOptions;
  publisher: WindowsPublisherOptions;
  resourceLanguage?: string;
  targetDeviceFamilies?: string[];
}

type WindowsPackageValidationError = {
  field: keyof WindowsPackageOptions | keyof WindowsPublisherOptions | null;
  error: string;
};

type WindowsVersionInfo = {
  name: keyof WindowsPackageOptions | keyof WindowsPublisherOptions | null;
  label: string;
  value: string | null;
};

export function validatePackageID(id: string) {
  if (id && id.length >= 2) {
    const newID = id.replace(/\s+/g, '');
    return newID;
  } else {
    throw `Package ID should be atleast 3 characters long: ${id}`;
  }
}

const DISALLOWED_WINDOWS_PACKAGE_CHARS_REGEX = /[^a-zA-Z0-9_]/g;

export function generateWindowsPackageId(host: string): string {
  const parts = host
    .split('.')
    .reverse()
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length > 0)
    .map(p => p.replace(DISALLOWED_WINDOWS_PACKAGE_CHARS_REGEX, '-'));
  parts.push('edge');
  return parts.join('.').slice(0, 50);
}

export function validateWindowsOptions(
  options: WindowsPackageOptions
): WindowsPackageValidationError[] {
  const validationErrors: WindowsPackageValidationError[] = [];
  if (!options) {
    validationErrors.push({ field: null, error: 'No options specified ' });
    return validationErrors;
  }

  if (!options.packageId) {
    validationErrors.push({ field: 'packageId', error: 'No package ID' });
  }

  if (!options.name || options.name.trim().length === 0) {
    validationErrors.push({ field: 'name', error: 'App name required' });
  } else if (options.name.trim().length >= 256) {
    validationErrors.push({
      field: 'name',
      error: 'App name must be less than 256 characters',
    });
  }

  const versionTrimmed = (options.version || '').trim();
  // For Anaheim packages, we need to validate both version and classic version.
  if (!options.classicPackage) {
    validationErrors.push({
      field: 'classicPackage',
      error: 'Must have classic package information',
    });
  } else {
    const classicVersionTrimmed = (options.classicPackage.version || '').trim();
    if (!versionTrimmed || !classicVersionTrimmed) {
      validationErrors.push({
        field: 'version',
        error: 'Must have an app version and a classic package version',
      });
    } else {
      validationErrors.push(
        ...validateWindowsAnaheimPackageVersions(
          versionTrimmed,
          classicVersionTrimmed
        )
      );
    }
  }

  // Validating publisher options
  if (!options.publisher) {
    validationErrors.push({
      field: 'publisher',
      error: 'Publisher information required.',
    });
  } else {
    if (!options.publisher.commonName) {
      validationErrors.push({
        field: 'commonName',
        error: 'Publisher ID required.',
      });
    }

    if (!options.publisher.displayName) {
      validationErrors.push({
        field: 'displayName',
        error: 'Publisher display name required.',
      });
    }
  }

  if (!options.url) {
    validationErrors.push({
      field: 'url',
      error:
        "Start URL must be specified. If your start URL is the same as Host, you can use '/' as the start URL.",
    });
  } else {
    const startUrlError = validateUrl(options.url);
    if (startUrlError) {
      validationErrors.push({ field: 'url', error: 'URL is invalid' });
    }
  }

  return validationErrors;
}

function validateWindowsAnaheimPackageVersions(
  version: string,
  classicVersion: string
): WindowsPackageValidationError[] {
  const versionErrors: WindowsPackageValidationError[] = [];
  const versionArray = version.split('.').map(Number);
  const classicVersionArray = classicVersion.split('.').map(Number);
  let isValidVersion = null;

  // Common validation run on both version and classic version.
  const versionInfos: WindowsVersionInfo[] = [
    { name: 'version', label: 'Version', value: version },
    { name: 'classicPackage', label: 'Classic version', value: classicVersion },
  ];

  for (const versionInfo of versionInfos) {
    versionErrors.push(...validateVersion(versionInfo));
  }

  // Make sure the version is > classic version
  for (var i = 0; i < versionArray.length; i++) {
    if (versionArray[i]! < classicVersionArray[i]!) {
      isValidVersion = false;
      break;
    }
    if (versionArray[i]! > classicVersionArray[i]!) {
      isValidVersion = true;
      break;
    }
  }
  // Check if versions are equal
  if (i == versionArray.length) {
    isValidVersion = false;
  }

  if (!isValidVersion) {
    versionErrors.push({
      field: 'version',
      error: 'App version must be greater than classic package version',
    });
  }

  return versionErrors;
}

function validateVersion(
  versionInfo: WindowsVersionInfo
): WindowsPackageValidationError[] {
  const versionErrors: WindowsPackageValidationError[] = [];

  // Version must be 3 segments ("1.0.0") - the 4th segment is reserved for Store use.
  const segments = versionInfo.value ? versionInfo.value.split('.') : [];
  if (segments.length !== 3) {
    versionErrors.push({
      field: versionInfo.name,
      error: `${versionInfo.label} must have 3 segments: 1.0.0.`,
    });
  }

  // All the segments must be numbers.
  if (segments.some(s => !s.match(/^(0|[1-9][0-9]*)$/))) {
    versionErrors.push({
      field: versionInfo.name,
      error: `${versionInfo.label} must only contain integers separated by periods.`,
    });
  }

  // Version must be 1.0.0 or greater; Store doesn't support versions starting with zero.
  const segmentValues = segments.map(s => parseInt(s));
  if (segmentValues && segmentValues.length > 0 && segmentValues[0]! <= 0) {
    versionErrors.push({
      field: versionInfo.name,
      error: `${versionInfo.label} must start with an integer >= 1.`,
    });
  }

  return versionErrors;
}
