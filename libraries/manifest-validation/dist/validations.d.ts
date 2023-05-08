import { Manifest, singleFieldValidation, Validation } from "./interfaces.js";
export declare const maniTests: Array<Validation>;
export declare function loopThroughKeys(manifest: Manifest): Promise<Array<Validation>>;
export declare function loopThroughRequiredKeys(manifest: Manifest): Promise<Array<Validation>>;
export declare function findSingleField(field: string, value: any): Promise<singleFieldValidation>;
//# sourceMappingURL=validations.d.ts.map