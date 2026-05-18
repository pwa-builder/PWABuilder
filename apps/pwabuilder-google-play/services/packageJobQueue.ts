import { AndroidPackageOptions } from "../models/androidPackageOptions.js";
import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";
import { createHash } from "../utils/hashCode.js";
import { database } from "./redisService.js";
import { azureQueue } from "./azureQueueService.js";

/**
 * A queue containing Google Play packaging jobs to be processed. Backed by Azure Queue Storage in production, in-memory queue in local dev.
 */
export class PackageJobQueue {
    private readonly oneHourInMs = 60 * 60 * 1000;
    private processedJobTimestamps: number[] = [];
    private readonly startDate = new Date();

    // In-memory queue for local development (when azureQueue is null)
    private readonly inMemoryQueue: GooglePlayPackageJob[] = [];

    /**
     * Enqueues a new Google Play packaging job.
     * @param packageArgs The arguments to use for the packaging job.
     * @return The ID of the newly created job.
     */
    public async enqueue(packageArgs: AndroidPackageOptions): Promise<string> {
        const job = this.createJobFromPackageArgs(packageArgs);
        try {
            // Store the job itself in the database as its own key so we can immediately look up the status.
            await database.save(job.id, job);

            // Put the job into the queue for processing.
            if (azureQueue) {
                const queueLength = await azureQueue.enqueue(job);
                console.info(`Enqueued new Google Play packaging job ${job.id}. ${queueLength} ${queueLength === 1 ? "job" : "jobs"} are now in the queue.`);
            } else {
                this.inMemoryQueue.push(job);
                console.info(`Enqueued new Google Play packaging job ${job.id} (in-memory). ${this.inMemoryQueue.length} jobs in queue.`);
            }

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
            let jobData: GooglePlayPackageJob | null;

            if (azureQueue) {
                jobData = await azureQueue.dequeue<GooglePlayPackageJob>();
            } else {
                jobData = this.inMemoryQueue.shift() ?? null;
            }

            if (!jobData) {
                return null;
            }

            const queueLength = await this.getQueueLength();
            console.info(`Dequeued Google Play packaging job ${jobData.id}. ${queueLength} jobs remaining in the queue.`);

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
            if (azureQueue) {
                await azureQueue.enqueue(job);
            } else {
                this.inMemoryQueue.push(job);
            }
        } catch (enqueueError) {
            console.error("Error enqueueing Google Play packaging job", enqueueError);
            throw enqueueError;
        }
    }

    /**
     * Gets the current length of the package job queue.
     * @returns The number of jobs currently in the queue.
     */
    public async getQueueLength(): Promise<number> {
        try {
            if (azureQueue) {
                return await azureQueue.getQueueLength();
            }
            return this.inMemoryQueue.length;
        } catch (error) {
            console.error("Error getting package job queue length", error);
            throw error;
        }
    }

    /**
     * Records that a package job finished processing.
     * @param jobId The completed job ID.
     */
    public async recordProcessedJob(_jobId: string): Promise<void> {
        const now = Date.now();
        this.processedJobTimestamps.push(now);
        this.pruneProcessedJobTimestamps(now);
    }

    /**
     * Gets the count of package jobs processed in the last hour.
     * @returns The number of package jobs processed in the previous 60 minutes.
     */
    public async getProcessedCountLastHour(): Promise<number> {
        const now = Date.now();
        const oneHourAgo = now - this.oneHourInMs;
        this.pruneProcessedJobTimestamps(now);

        return this.processedJobTimestamps.filter(timestamp => timestamp >= oneHourAgo).length;
    }

    public getStartDate(): Date {
        return this.startDate;
    }

    private pruneProcessedJobTimestamps(currentTimeMs: number): void {
        const oneHourAgo = currentTimeMs - this.oneHourInMs;
        this.processedJobTimestamps = this.processedJobTimestamps.filter(timestamp => timestamp >= oneHourAgo);
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