import { Manifest } from '@pwabuilder/manifest-validation';
import { PackageOptions } from './interfaces';
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
    backgroundColor?: string | null;
    padding?: number;
}
export interface WindowsPackageOptions extends PackageOptions {
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
    resourceLanguage?: string | string[];
    targetDeviceFamilies?: string[];
    enableWebAppWidgets?: boolean;
    /**
     * Optional Windows Actions declaration. Windows Actions are ways for apps to naturally integrate into Windows and Copilot.
     * For example, a user could right-click an image in Windows and your app would show up as "Remove background with My PWA".
     * For more info, see https://blogs.windows.com/msedgedev/2025/05/30/bring-your-pwa-closer-to-users-with-app-actions-on-windows/
     */
    windowsActions?: WindowsActionsOptions | null;
}
type WindowsActionsOptions = {
    /**
     * The contents of the ActionsManifest.json file that describes the app's actions.
     */
    manifest: object;
    /**
     * The contents of the  optional customEntities.json file.
     */
    customEntities?: object | null;
    /**
     * An array containing localizations for the custom entities file.
     */
    customEntitiesLocalizations?: WindowsActionsCustomEntityLocalization[] | null;
};
type WindowsActionsCustomEntityLocalization = {
    /**
     * The name of the file. File name is needed as it includes language tag information consistent with resource management system. See https://learn.microsoft.com/en-us/windows/uwp/app-resources/how-rms-matches-lang-tags
     * Example fileNames: "ExampleLocalizedCustomEntity.json", "ExampleLocalizedCustomEntity.language-en.json"
     */
    fileName: string;
    /**
     * The contents of the file.
     * @example { "english phrase one": { "welcome": "howdy, friends" } }
     */
    contents: object;
};
type WindowsPackageValidationError = {
    field: keyof WindowsPackageOptions | keyof WindowsPublisherOptions | null;
    error: string;
};
export declare function validatePackageID(id: string): string;
export declare function generateWindowsPackageId(host: string): string;
export declare function validateWindowsOptions(options: WindowsPackageOptions): WindowsPackageValidationError[];
export {};
