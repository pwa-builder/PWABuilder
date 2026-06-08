import { MetaHorizonPackageJob } from "./meta-horizon-package-job";

export class MetaHorizonPackageError extends Error {
    constructor(innerErrorOrMessage: unknown, public readonly packageJob: MetaHorizonPackageJob | null) {
        const innerError = innerErrorOrMessage instanceof Error ? innerErrorOrMessage
            : typeof innerErrorOrMessage === "string" ? new Error(innerErrorOrMessage) : new Error(`An unknown error occurred. ${innerErrorOrMessage || ""}`);
        super(innerError.message, { ...innerError });
    }
}
