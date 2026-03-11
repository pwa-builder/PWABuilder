import { Manifest } from "@pwabuilder/manifest-validation";
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
    manifestUrl: string;
    manifest: Manifest;
}
export declare function generateBundleId(host: string): string;
/**
 * Validates the iOS app package options and returns errors as an array of strings.
 * The array will be empty if there are no errors.
 * @param options The options to validate.
 */
export declare function validateIOSOptions(options: IOSAppPackageOptions): string[];
