import { ManifestContext } from "../../utils/interfaces";
import { IOSAppPackageOptions } from "../../utils/ios-validation";
export declare let hasGeneratedIOSPackage: boolean;
export declare function generateIOSPackage(options: IOSAppPackageOptions): Promise<Blob>;
export declare function createIOSPackageOptionsFromManifest(manifestContext: ManifestContext): IOSAppPackageOptions;
export declare function emptyIOSPackageOptions(): IOSAppPackageOptions;
