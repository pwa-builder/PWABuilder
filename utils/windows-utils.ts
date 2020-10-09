import { WindowsPublisherOptions, WindowsPackageOptions } from '~/store/modules/publish';
import { validateUrl } from '~/utils/android-utils';

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

export function validateWindowsOptions(options) {
  const validationErrors: { field: keyof WindowsPackageOptions | null, error: string }[] = [];
  if (!options) {
    validationErrors.push({ field: null, error: "No options specified " });
    return validationErrors;
  }

  if (!options.packageId) {
    validationErrors.push({ field: "packageId", error: "No package ID" });
  }

  if (!options.name || options.name.trim().length === 0) {
    validationErrors.push({ field: "name", error: "Must have an app name" });
  }
  else if (options.name.trim().length > 256) {
    validationErrors.push({ field: "name", error: "App name must be less than 256 characters" });
  }

  if (!options.version || options.version.trim().length === 0 && !options.classicPackage.version || options.classicPackage.version.trim().length === 0) {
    validationErrors.push({ field: "version", error: "Must have an app version and a Classic Package version" });
  }
  else {
    validateWindowsPackageVersion(options.version, options.classicPackage.version, validationErrors);
  }

  // Validating publisher options when we have publisher data
  if (!options.publisher) {
    validationErrors.push({ field: "publisher", error: "Publisher information must be supplied." });
  } else {
    // commonName and displayName are required, all other publisher fields are optional
    const requiredPublisherFields: Array<keyof WindowsPublisherOptions> = [
      "displayName",
      "commonName"
    ];

    requiredPublisherFields
      .filter(prop => !options.publisher![prop])
      .forEach(() => validationErrors.push({ field: "publisher", error: `Publisher info must be specified` }));

    // Ensure country code is 2 chars
    if (options.publisher.country && options.publisher.country.length !== 2) {
      validationErrors.push({ field: "publisher", error: "Publisher country code must be 2 letters" });
    }
  }

  if (!options.url) {
    validationErrors.push({ field: "url", error: "Start URL must be specified. If your start URL is the same as Host, you can use '/' as the start URL." });
  } else {
    const startUrlError = validateUrl(options.url, options.host);
    if (startUrlError) {
      validationErrors.push({ field: "url", error: "URL is invalid" });
    }
  }

  return validationErrors;
}

function validateWindowsPackageVersion(version: string, classicVersion: string, validationErrors: { field: keyof WindowsPackageOptions | null, error: string }[]) {
  console.log(version.trim(), version.trim().length);

  /**
   * Version must be in this form: "1.0.0"; a 3 segment version. 
   * 4 segment versions (e.g. 1.0.0.0) are invalid due to Store restrictions; 
   * the Store reserves the 4th segment for internal use.
   * 
   */
  if (version.trim().split(".").length > 3 || version.trim().split(".").length < 3) {
    validationErrors.push({ field: "version", error: "Version must be in this form: 1.0.0; a 3 segment version." });
  }

  /**
   * Version must be 1.0.0 or greater; Store doesn't support versions starting with zero.
   */
  const firstChar = version.trim().substr(0, 1);

  if (firstChar && parseInt(firstChar) < 1) {
    validationErrors.push({ field: "version", error: "Version must be 1.0.0 or greater; Store doesn't support versions starting with zero." });
  }

  /**
   * classic package version should always be lower than app version
   */

  if (version.trim() < classicVersion.trim()) {
    validationErrors.push({ field: "version", error: "Classic package version must always be lower than the App version" });
  }
}