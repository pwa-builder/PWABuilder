import { Manifest, singleFieldValidation, Validation } from "./interfaces.js";
export { Manifest, Validation, singleFieldValidation } from "./interfaces.js";
export { required_fields, recommended_fields, optional_fields, validateSingleRelatedApp } from "./utils/validation-utils.js";
export declare let currentManifest: Manifest | undefined;
export declare function validateManifest(manifest: Manifest): Promise<Validation[]>;
export declare function validateSingleField(field: string, value: any): Promise<singleFieldValidation>;
export declare function reportMissing(manifest: Manifest): Promise<Array<string>>;
export declare function validateRequiredFields(manifest: Manifest): Promise<Validation[]>;
export declare function validateImprovements(manifest: Manifest): Promise<Validation[]>;
export declare function isInstallReady(manifest: Manifest): Promise<boolean>;
export declare function validateSingleProtocol(proto: any): "url" | "protocol" | "valid";
export * from './interfaces.js';
//# sourceMappingURL=index.d.ts.map