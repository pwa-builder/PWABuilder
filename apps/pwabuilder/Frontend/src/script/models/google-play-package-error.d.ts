import { GooglePlayPackageJob } from "./google-play-package-job";
export declare class GooglePlayPackageError extends Error {
    readonly packageJob: GooglePlayPackageJob | null;
    constructor(innerErrorOrMessage: unknown, packageJob: GooglePlayPackageJob | null);
}
