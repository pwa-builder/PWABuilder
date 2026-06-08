import { MetaHorizonPackageOptions } from "../models/metaHorizonPackageOptions.js";
import { MetaHorizonPackageJob } from "../models/metaHorizonPackageJob.js";
import { createHash } from "../utils/hashCode.js";
import { database } from "./redisService.js";

/**
 * A queue containing Meta Horizon packaging jobs to be processed. Implemented as a Redis list.
 */
export class PackageJobQueue {
    private readonly oneHourInMs = 60 * 60 * 1000;
    private processedJobTimestamps: number[] = [];
    private readonly startDate = new Date();

    private get jobQueueKey(): string {
        // Use a different queue key in production vs non-production so that staging and dev doesn't process production jobs.
        return process.env.NODE_ENV === "production" ? "metahorizonpackagejobs-prod" : "metahorizonpackagejobs-nonprod";
    }

    /**
     * Enqueues a new Meta Horizon packaging job.
     */
    public async enqueue(packageArgs: MetaHorizonPackageOptions): Promise<string> {
        const job = this.createJobFromPackageArgs(packageArgs);
        try {
            await database.save(job.id, job);

            const queueLength = await database.enqueue(this.jobQueueKey, job);
            console.info(`Enqueued new Meta Horizon packaging job ${job.id} to ${this.jobQueueKey}. ${queueLength} ${queueLength === 1 ? "job" : "jobs"} are now in the queue.`);

            return job.id;
        } catch (enqueueError) {
            console.error("Error enqueueing Meta Horizon packaging job", enqueueError);
            throw enqueueError;
        }
    }

    /**
     * Dequeues the next Meta Horizon packaging job from the queue.
     */
    public async dequeue(): Promise<MetaHorizonPackageJob | null> {
        try {
            const jobData = await database.dequeue<MetaHorizonPackageJob>(this.jobQueueKey);
            if (!jobData) {
                return null;
            }

            const queueLength = await database.queueLength(this.jobQueueKey);
            console.info(`Dequeued Meta Horizon packaging job ${jobData.id} from ${this.jobQueueKey}. ${queueLength} jobs remaining in the queue.`);

            return jobData;
        } catch (dequeueError) {
            console.error("Error dequeuing Meta Horizon packaging job", dequeueError);
            throw dequeueError;
        }
    }

    /**
     * Re-enqueues an existing job to be processed later.
     */
    public async requeue(job: MetaHorizonPackageJob): Promise<void> {
        try {
            await database.enqueue(this.jobQueueKey, job);
        } catch (enqueueError) {
            console.error("Error enqueueing Meta Horizon packaging job", enqueueError);
            throw enqueueError;
        }
    }

    /**
     * Gets the current length of the package job queue.
     */
    public async getQueueLength(): Promise<number> {
        try {
            return await database.queueLength(this.jobQueueKey);
        } catch (error) {
            console.error("Error getting package job queue length", error);
            throw error;
        }
    }

    /**
     * Records that a package job finished processing.
     */
    public async recordProcessedJob(_jobId: string): Promise<void> {
        const now = Date.now();
        this.processedJobTimestamps.push(now);
        this.pruneProcessedJobTimestamps(now);
    }

    /**
     * Gets the count of package jobs processed in the last hour.
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

    private createJobFromPackageArgs(packageArgs: MetaHorizonPackageOptions): MetaHorizonPackageJob {
        const hash = createHash(packageArgs).toString() + createHash(Date.now());
        const pwaUri = new URL(packageArgs.pwaUrl);
        const id = `metahorizonpackagejob:${pwaUri.host}:${hash.slice(-6)}`;
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
