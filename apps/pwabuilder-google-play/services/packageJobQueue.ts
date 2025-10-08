import { AndroidPackageOptions } from "../models/androidPackageOptions.js";
import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";
import { createHash } from "../utils/hashCode.js";
import { database } from "./databaseService.js";

/**
 * A queue containing Google Play packaging jobs to be processed. Implemented as a Redis list.
 */
export class PackageJobQueue {
    private readonly jobQueueKey = "googleplaypackagejobs";

    /**
     * Enqueues a new Google Play packaging job.
     * @param packageArgs The arguments to use for the packaging job.
     * @return The ID of the newly created job.
     */
    public async enqueue(packageArgs: AndroidPackageOptions): Promise<string> {
        const job = this.createJobFromPackageArgs(packageArgs);
        try {
            // Put the job into the queue for processing.
            await database.enqueue(this.jobQueueKey, job);

            // Also, store the job itself in the database as its own key so we can immediately look up the status.
            await database.save(job.id, job);

            return job.id;
        } catch (enqueueError) {
            console.error("Error enqueueing Google Play packaging job", enqueueError);
            throw enqueueError;
        }
    }

    /**
     * Dequeues the next Google Play packaging job from the queue.
     * @returns The next packaging job, or null if the queue is empty.
     */
    public async dequeue(): Promise<GooglePlayPackageJob | null> {
        try {
            const jobData = await database.dequeue<GooglePlayPackageJob>(this.jobQueueKey);
            if (!jobData) {
                return null;
            }
            return jobData;
        } catch (dequeueError) {
            console.error("Error dequeuing Google Play packaging job", dequeueError);
            throw dequeueError;
        }
    }

    /**
     * Re-enqueues an existing job to be processed later.
     * @param job The job to re-enqueue.
     */
    public async requeue(job: GooglePlayPackageJob): Promise<void> {
        try {
            await database.enqueue(this.jobQueueKey, job);
        } catch (enqueueError) {
            console.error("Error enqueueing Google Play packaging job", enqueueError);
            throw enqueueError;
        }
    }

    private createJobFromPackageArgs(packageArgs: AndroidPackageOptions): GooglePlayPackageJob {
        const hash = createHash(packageArgs).toString() + createHash(Date.now());
        const pwaUri = new URL(packageArgs.pwaUrl);
        const id = `googleplaypackagejob:${pwaUri.host}:${hash.slice(-6)}`;
        return {
            id: id,
            pwaUrl: packageArgs.pwaUrl,
            analysisId: null,
            errors: [],
            logs: [],
            status: "Queued",
            retryCount: 0,
            packageOptions: packageArgs,
            uploadedBlobFileName: null,
            createdAt: new Date().toISOString()
        };
    }
}

export const packageJobQueue = new PackageJobQueue();