import { AndroidApkOptions, AndroidSigningOptions } from "~/store/modules/publish";

type AndroidPackageValidationError = {
  field: keyof AndroidApkOptions | keyof AndroidSigningOptions | null;
  error: string;
}

const DISALLOWED_ANDROID_PACKAGE_CHARS_REGEX = /[^a-zA-Z0-9_]/g;
export function generatePackageId(host: string): string {
  const parts = host
    .split(".")
    .reverse()
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length > 0)
    .map(p => p.replace(DISALLOWED_ANDROID_PACKAGE_CHARS_REGEX, "_"))
  parts.push("twa");
  return parts.join(".");
}

export function validateAndroidOptions(options: Partial<AndroidApkOptions | null>): AndroidPackageValidationError[] {
  const validationErrors: AndroidPackageValidationError[] = [];
  if (!options) {
    validationErrors.push({ field: null, error: "No options specified " });
    return validationErrors;
  }

  if (!options.packageId) {
    validationErrors.push({ field: "packageId", error: "No package ID" });
  }

  if (options.packageId && options.packageId.search(/[^a-zA-Z0-9_\.]/) !== -1) {
    validationErrors.push({ field: "packageId", error: "Package ID must not contain any character other than alphanumeric and period." });
  }

  if (!options.name || options.name.trim().length === 0) {
    validationErrors.push({ field: "name", error: "Must have a valid app name" });
  }

  if (!options.appVersion || options.appVersion.trim().length === 0) {
    validationErrors.push({ field: "appVersion", error: "Must have a valid app version" });
  }

  if (!options.appVersionCode || options.appVersionCode > 2100000000) {
    validationErrors.push({ field: "appVersionCode", error: "App version code must be between 1 and 2100000000" });
  }

  if (!options.backgroundColor) {
    validationErrors.push({ field: "backgroundColor", error: "Must have a background color" });
  }

  if ((options.display as string) !== "standalone" && (options.display as string) !== "fullscreen") {
    validationErrors.push({ field: "display", error: "Display must be 'standalone' or 'fullscreen'" })
  }

  if ((options.fallbackType as string) !== "customtabs" && (options.fallbackType as string) !== "webview") {
    validationErrors.push({ field: "fallbackType", error: "Fallback type must be 'customtabs' or 'webview'" });
  }

  if (!options.host) {
    validationErrors.push({ field: "host", error: "Host must be specified" });
  } else {
    const hostUrlError = validateUrl(options.host);
    if (hostUrlError) {
      validationErrors.push({ field: "host", error: "Host URL must be a valid absolute URL" });
    }
  }

  if (!options.iconUrl) {
    validationErrors.push({ field: "iconUrl", error: "Must have a icon URL" });
  } else {
    const iconUrlError = validateUrl(options.iconUrl, options.host);
    if (iconUrlError) {
      validationErrors.push({ field: "iconUrl", error: "Icon URL is invalid" });
    }
  }

  if (!options.launcherName || options.launcherName.trim().length === 0) {
    validationErrors.push({ field: "launcherName", error: "Must have an app launcher name" });
  }

  if (!options.webManifestUrl) {
    validationErrors.push({ field: "webManifestUrl", error: "Must have a manifest URL" });
  } else {
    const manifestUrlError = validateUrl(options.webManifestUrl);
    if (manifestUrlError) {
      validationErrors.push({ field: "webManifestUrl", error: "Manifest URL is invalid" });
    }
  }

  // Maskable icon is optional. But if it's specified, it must be a valid URL.
  if (options.maskableIconUrl) {
    const maskableIconError = validateUrl(options.maskableIconUrl, options.host);
    if (maskableIconError) {
      validationErrors.push({ field: "maskableIconUrl", error: "Maskable icon URL was invalid. If you specify a maskable icon URL, it must be a valid URL." });
    }
  }

  // monochrome icon is also optional.
  if (options.monochromeIconUrl) {
    const monochromeIconError = validateUrl(options.monochromeIconUrl, options.host);
    if (monochromeIconError) {
      validationErrors.push({ field: "monochromeIconUrl", error: "Monochrome icon URL was invalid. If you specify a monochrome icon URL, it must be a valid URL." });
    }
  }

  if (!options.navigationColor) {
    validationErrors.push({ "field": "navigationColor", error: "Navigation color is required" });
  }

  // Validating signing options when we have a signing mode 
  if (options.signingMode === "mine" || options.signingMode === "new") {
    if (!options.signing) {
      validationErrors.push({ field: "signing", error: "Signing information must be supplied." });
    } else {
      // Full name, organization, organizational unit, and country are required if signingMode !== mine
      // File is required only signingMode === "mine"
      // Store password and key password are required only if signingMode === "mine"; otherwise, they're optional and CloudAPK will generate a new password for you.
      const requiredSigningFields: Array<keyof AndroidSigningOptions> = [
        "alias"
      ];
      if (options.signingMode === "mine") {
        requiredSigningFields.push("file", "keyPassword", "storePassword");
      } else if (options.signingMode === "new") {
        // New key? We require these details to create the key.
        requiredSigningFields.push("fullName", "organization", "organizationalUnit", "countryCode");
      }

      requiredSigningFields
        .filter(prop => !options.signing![prop])
        .forEach(prop => validationErrors.push({ field: prop, error: `${prop} must be specified` }));
        
      // If key password and store password are specified, they must be >= 6 chars in length.
      if (options.signing.keyPassword && options.signing.keyPassword.length < 6) {
        validationErrors.push({ field: "keyPassword" , error: "Key password must be at least 6 characters" });
      }
      if (options.signing.storePassword && options.signing.storePassword.length < 6) {
        validationErrors.push({ field: "storePassword" , error: "Key store password must be at least 6 characters" });
      }

      // Ensure country code is 2 chars
      if (options.signingMode === "new" && options.signing.countryCode && options.signing.countryCode.length !== 2) {
        validationErrors.push({ field: "countryCode", error: "Signing key country code must be 2 letters" });
      }
    }
  }

  if (options.splashScreenFadeOutDuration === null || options.splashScreenFadeOutDuration === undefined || options.splashScreenFadeOutDuration < 0) {
    validationErrors.push({ field: "splashScreenFadeOutDuration", error: "Splash screen fade duration must be 0 or greater" })
  }

  if (!options.startUrl) {
    validationErrors.push({ field: "startUrl", error: "Start URL must be specified. If your start URL is the same as Host, you can use '/' as the start URL." });
  } else {
    const startUrlError = validateUrl(options.startUrl, options.host);
    if (startUrlError) {
      validationErrors.push({ field: "startUrl", error: "Start URL is invalid" });
    }
  }

  if (!options.themeColor) {
    validationErrors.push({ field: "themeColor", error: "Theme color must be specified" });
  }

  return validationErrors;
}

export function validateUrl(url: string, base?: string): string | null {
  try {
    new URL(url, base);
    return null;
  } catch (urlError) {
    return urlError;
  }
}