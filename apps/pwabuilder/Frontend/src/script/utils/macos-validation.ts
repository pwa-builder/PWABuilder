import type { Manifest } from "../models/manifest";
import { PackageOptions } from "./interfaces";

/**
 * Package options for PWABuilder's macOS platform.
 * Should match MacOSAppPackageOptions.cs in the C# backend.
 */
export interface MacOSAppPackageOptions extends PackageOptions {
  name: string;
  bundleId: string;
  url: string;
  imageUrl: string;
  themeColor: string;
  backgroundColor: string;
  permittedUrls: string[];
  manifestUrl: string;
  manifest: Manifest;
}

/** Generates a reverse-domain bundle ID from a hostname (e.g. "example.com" → "com.example"). */
export function generateMacOSBundleId(host: string): string {
  const parts = host
    .split('.')
    .reverse()
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length > 0);
  return parts.join('.');
}

/**
 * Validates the macOS app package options.
 * @returns An array of validation error messages; empty if valid.
 */
export function validateMacOSOptions(options: MacOSAppPackageOptions): string[] {
  const errors: string[] = [];

  if (!options.name || options.name.trim().length < 1) {
    errors.push('App name is required.');
  }

  if (!options.bundleId || options.bundleId.trim().length < 3) {
    errors.push('Bundle ID must be at least 3 characters.');
  }

  if (options.bundleId?.includes('*')) {
    errors.push('Bundle ID cannot contain an asterisk (*).');
  }

  if (!options.url) {
    errors.push('URL is required.');
  }

  if (!options.imageUrl) {
    errors.push('Image URL is required.');
  }

  return errors;
}
