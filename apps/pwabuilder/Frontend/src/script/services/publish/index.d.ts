import { PackageOptions } from '../../utils/interfaces';
export type Platform = 'windows' | 'android' | 'other-android' | 'ios' | 'meta';
type PackageInfo = {
    appName: string;
    blob: Blob | null;
    type: string;
};
export declare function generatePackage(type: Platform, packageOptions?: PackageOptions): Promise<PackageInfo | null>;
export {};
