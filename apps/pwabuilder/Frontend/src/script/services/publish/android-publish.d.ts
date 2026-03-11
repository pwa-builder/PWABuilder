import { GooglePlayPackageJob } from "../../models/google-play-package-job";
import { AndroidPackageOptions } from '../../utils/android-validation';
import { ManifestContext } from '../../utils/interfaces';
export declare let hasGeneratedAndroidPackage: boolean;
export declare function enqueueGooglePlayPackageJob(androidOptions: AndroidPackageOptions): Promise<string>;
/**
 * Gets the Google Play package job with the specified ID. Throw an error if the job couldn't be found or if the job fetch otherwise failed.
 */
export declare function getGooglePlayPackageJob(jobId: string): Promise<GooglePlayPackageJob>;
/**
 * Downloads a Google Play package zip file resulting from a completed package job.
 * @param jobId The ID of the completed package job.
 * @returns The zip file as a Blob.
 */
export declare function downloadGooglePlayPackageZip(jobId: string): Promise<Blob>;
export declare function emptyAndroidPackageOptions(): AndroidPackageOptions;
export declare function createAndroidPackageOptionsFromManifest(manifestContext: ManifestContext): AndroidPackageOptions;
