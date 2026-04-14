import { GooglePlayPackageJob } from "./google-play-package-job";

export class GooglePlayPackageError extends Error {
    constructor(innerErrorOrMessage: unknown, public readonly packageJob: GooglePlayPackageJob | null) {
        const innerError = innerErrorOrMessage instanceof Error ? innerErrorOrMessage
            : typeof innerErrorOrMessage === "string" ? new Error(innerErrorOrMessage) : new Error(`An unknown error occurred. ${innerErrorOrMessage || ""}`);
        super(innerError.message, { ...innerError });
    }
}