import type { Manifest } from "../models/manifest";
import { PackageOptions } from "./interfaces";


/**
 * Package options for PWABuilder's iOS platform. Should match https://github.com/pwa-builder/pwabuilder-ios/blob/main/Microsoft.PWABuilder.IOS.Web/Models/IOSAppPackageOptions.cs
 */
export interface IOSAppPackageOptions extends PackageOptions {
  name: string;
  bundleId: string;
  url: string;
  imageUrl: string;
  splashColor: string;
  progressBarColor: string;
  statusBarColor: string;
  permittedUrls: string[];
  /** The name under the icon on the home screen. Defaults to name. */
  displayName?: string;
  /** standalone keeps the iOS status bar, fullscreen hides it. Defaults to the manifest display value. */
  displayMode?: 'standalone' | 'fullscreen';
  /** The foreground of the status bar text: auto follows the system, light for dark apps, dark for light apps. */
  statusBarStyle?: 'auto' | 'light' | 'dark';
  /** auto follows the system and the web view background, light or dark locks the app appearance. */
  appearance?: 'auto' | 'light' | 'dark';
  /** The size in points of the icon on the splash screen, 32 to 512. Defaults to 64. */
  splashIconSize?: number;
  manifestUrl: string;
  manifest: Manifest;
}

export function generateBundleId(host: string): string {
  const parts = host
    .split('.')
    .reverse()
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length > 0);
  return parts.join('.');
}

/**
 * Validates the iOS app package options and returns errors as an array of strings. 
 * The array will be empty if there are no errors.
 * @param options The options to validate.
 */
export function validateIOSOptions(options: IOSAppPackageOptions): string[] {
  const errors: string[] = [];

  if (!options.bundleId) {
    errors.push("Bundle ID required");
  }
  if (options.bundleId.length < 3) {
    errors.push("Bundle ID must be at least 3 characters in length");
  }
  if (options.bundleId.includes("*")) {
    errors.push("Bundle ID cannot contain asterisk");
  }

  if (!options.imageUrl) {
    errors.push("Image URL required");
  }

  if (!options.manifest) {
    errors.push("Manifest required");
  }

  if (!options.manifestUrl) {
    errors.push("Manifest URL required");
  }

  if (options.splashIconSize !== undefined && (options.splashIconSize < 32 || options.splashIconSize > 512)) {
    errors.push("Splash icon size must be between 32 and 512");
  }

  if (!options.name) {
    errors.push("Name required");
  }
  if (options.name.length < 3) {
    errors.push("Name must be at least 3 characters in length");
  }

  if (!options.progressBarColor) {
    errors.push("Progress bar color required");
  }

  if (!options.splashColor) {
    errors.push("Splash color required");
  }

  if (!options.statusBarColor) {
    errors.push("Status bar color required");
  }

  if (!options.url) {
    errors.push("URL required");
  }
  try {
    new URL(options.url);
  } catch (urlError) {
    errors.push("URL must be a valid, absolute URL");
  }

  return errors;
}