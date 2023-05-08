import { Manifest, RelatedApplication } from "../interfaces.js";
export declare function isStandardOrientation(orientation: string): boolean;
export declare function isValidJSON(json: Manifest): boolean;
export declare function findMissingKeys(manifest: Manifest): Promise<Array<string>>;
export declare function containsStandardCategory(categories: string[]): boolean;
export declare function isValidLanguageCode(code: string): boolean;
export declare function isAtLeast(sizes: string, width: number, height: number): boolean;
export declare function validateSingleRelatedApp(ra: RelatedApplication): boolean;
export declare function isValidURL(str: string): boolean;
export declare function checkRelativeUrlBasedOnScope(url: string, scope: string): boolean;
export declare const validProtocols: Array<String>;
export declare const required_fields: string[];
export declare const recommended_fields: string[];
export declare const optional_fields: string[];
//# sourceMappingURL=validation-utils.d.ts.map