import { Manifest } from '@pwabuilder/manifest-validation';
import { WindowsPackageOptions } from '../../utils/win-validation';
export declare let hasGeneratedWindowsPackage: boolean;
export declare function generateWindowsPackage(windowsOptions: WindowsPackageOptions): Promise<Blob>;
export declare function emptyWindowsPackageOptions(): WindowsPackageOptions;
export declare function createWindowsPackageOptionsFromManifest(manifest: Manifest): WindowsPackageOptions;
export declare function createWindowsPackageOptionsFromForm(form: HTMLFormElement): Promise<WindowsPackageOptions>;
export declare const windowsLanguages: {
    codes: string[];
    name: string;
}[];
