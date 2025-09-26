import { AndroidPackageOptions } from "./androidPackageOptions.js";

/**
 * The data stored inside a request to /generateApk.
 */
export interface AppPackageRequest {
    /**
     * The ApkOptions passed in the request.
     */
    options: AndroidPackageOptions | null;
    /**
     * Validation errors resulting from the request. If populated, this signals the request is malformed.
     */
    validationErrors: string[];
}