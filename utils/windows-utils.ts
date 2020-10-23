import { WindowsPublisherOptions, WindowsPackageOptions } from '~/store/modules/publish';
import { validateUrl } from '~/utils/android-utils';

type WindowsPackageValidationError = {
    field: keyof WindowsPackageOptions | keyof WindowsPublisherOptions | null;
    error: string;
};

export function validatePackageID(id: string) {
  if (id && id.length >= 2) {
    try {
      const newID = id.replace(/\s+/g, '');
      return newID;
    }
    catch (err) {
      throw err;
    }
  }
  else {
    throw (`Package ID should be atleast 3 characters long: ${id}`)
  }
}

const DISALLOWED_WINDOWS_PACKAGE_CHARS_REGEX = /[^a-zA-Z0-9_]/g;

export function generateWindowsPackageId(host: string): string {
  const parts = host
    .split(".")
    .reverse()
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length > 0)
    .map(p => p.replace(DISALLOWED_WINDOWS_PACKAGE_CHARS_REGEX, "-"))
  parts.push("edge");
  return parts.join(".");
}

export function validateWindowsOptions(options: WindowsPackageOptions): WindowsPackageValidationError[] {
  const validationErrors: WindowsPackageValidationError[] = [];
  if (!options) {
    validationErrors.push({ field: null, error: "No options specified " });
    return validationErrors;
  }

  if (!options.packageId) {
    validationErrors.push({ field: "packageId", error: "No package ID" });
  }

  if (!options.name || options.name.trim().length === 0) {
    validationErrors.push({ field: "name", error: "App name required" });
  }
  else if (options.name.trim().length >= 256) {
    validationErrors.push({ field: "name", error: "App name must be less than 256 characters" });
  }

  if (!options.version || options.version.trim().length === 0 && !options.classicPackage.version || options.classicPackage.version.trim().length === 0) {
    validationErrors.push({ field: "version", error: "Must have an app version and a Classic Package version" });
  } else {
    validationErrors.push(...validateWindowsPackageVersion(options.version.trim(), options.classicPackage.version.trim()));
  }

  // Validating publisher options
  if (!options.publisher) {
    validationErrors.push({ field: "publisher", error: "Publisher information required." });
  } else {
    if (!options.publisher.commonName) {
      validationErrors.push({ field: "commonName", error: "Publisher ID required." });
    }

    if (!options.publisher.displayName) {
      validationErrors.push({ field: "displayName", error: "Publisher display name required." });
    }
  }

  if (!options.url) {
    validationErrors.push({ field: "url", error: "Start URL must be specified. If your start URL is the same as Host, you can use '/' as the start URL." });
  } else {
    const startUrlError = validateUrl(options.url);
    if (startUrlError) {
      validationErrors.push({ field: "url", error: "URL is invalid" });
    }
  }

  return validationErrors;
}

function validateWindowsPackageVersion(version: string, classicVersion: string): WindowsPackageValidationError[] {
  const versionErrors: WindowsPackageValidationError[] = [];
  
  // Common validation run on both version and classic version.
  const versionInfos = [
    { name: "version" as keyof WindowsPackageOptions, label: "Version", value: version },
    { name: "classicVersion" as keyof WindowsPackageOptions, label: "Classic version", value: classicVersion }
  ];
  for (let versionInfo of versionInfos) {
    // Version must be 3 segments ("1.0.0") - the 4th segment is reserved for Store use.
    const segments = versionInfo.value.split(".");
    if (segments.length !== 3) {
      versionErrors.push({ field: versionInfo.name, error: `${versionInfo.label} must have 3 segments: 1.0.0.` });
    }

    // All the segments must be numbers.
    if (segments.some(s => !s.match(/^(0|[1-9][0-9]*)$/))) {
      versionErrors.push({ field: versionInfo.name, error: `${versionInfo.label} must only contain integers separated by periods.`})
    }

    // Version must be 1.0.0 or greater; Store doesn't support versions starting with zero.
    const segmentValues = segments.map(s => parseInt(s));
    if (segmentValues.length > 0 && segmentValues[0] <= 0) {
      versionErrors.push({ field: versionInfo.name, error: `${versionInfo.label} must start with an integer >= 1.` })
    }
  }

  // Make sure the version is > classic version
  if (version <= classicVersion) {
    versionErrors.push({ field: "version", error: "App version must be greater than classic package version" });
  }

  return versionErrors;
}