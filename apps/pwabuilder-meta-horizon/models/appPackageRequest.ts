import { MetaHorizonPackageOptions } from "./metaHorizonPackageOptions.js";

/**
 * The data stored inside a request to /generateAppPackage.
 */
export interface AppPackageRequest {
    /**
     * The MetaHorizonPackageOptions passed in the request.
     */
    options: MetaHorizonPackageOptions | null;
    /**
     * Validation errors resulting from the request. If populated, this signals the request is malformed.
     */
    validationErrors: string[];
}
