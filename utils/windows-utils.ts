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
  return parts.join("-");
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
    validationErrors.push({ field: "name", error: "Must have a valid app name" });
  }

  if (!options.version || options.version.trim().length === 0 || options.version.trim().length < 2) {
    validationErrors.push({ field: "version", error: "Must have a valid app version" });
  }

  // Validating publisher options when we have publisher data
  if (!options.publisher) {
    validationErrors.push({ field: "publisher", error: "Publisher information must be supplied." });
  } else {
    // All the publisher properties are required.
    const requiredSigningFields: Array<keyof WindowsPublisherOptions> = [
      "displayName",
      "commonName",
      "organization",
      "organizationalUnit",
      "country",
      "stateOrProvince",
      "streetAddress"
    ];

    requiredSigningFields
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