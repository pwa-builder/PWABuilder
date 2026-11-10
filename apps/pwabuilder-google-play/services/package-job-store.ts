import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";
import { packageAccessLifetimeSeconds } from "../utils/package-job-access.js";
import { getPackageJobDiagnostics, getPackageJobStatus, StoredPackageJob } from "../utils/package-job-diagnostics.js";
import { redisService } from "./redisService.js";

const diagnosticLifetimeSeconds = 14 * 24 * 60 * 60;

export async function savePackageJob(job: GooglePlayPackageJob): Promise<void> {
    // Only the bounded-lifetime worker queue carries signing inputs, never status/diagnostic records.
    const stored: StoredPackageJob = { ...getPackageJobStatus(job), uploadedBlobFileName: job.uploadedBlobFileName };
    const remainingSeconds = Math.ceil((Date.parse(job.createdAt) + packageAccessLifetimeSeconds * 1000 - Date.now()) / 1000);
    if (remainingSeconds > 0) {
        await redisService.save(job.id, stored, remainingSeconds);
    }
    if (job.supportReference) {
        const diagnostic = getPackageJobDiagnostics(job);
        await redisService.save(`package-diagnostics:${job.supportReference}`, diagnostic, diagnosticLifetimeSeconds);
        if (job.status === "Failed") {
            await redisService.indexDiagnosticFailure(job.supportReference, Date.now(), diagnosticLifetimeSeconds);
        }
    }
}
