import { Redis } from "ioredis";
import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";

/**
 * Inspects Redis to see if there are any pending Google Play packaging jobs. If so, it dequeues the job and begins processing it.
 */
export class PackageJobProcessor {

    private readonly jobCheckIntervalMs = 2000;
    private readonly redis: Redis;
    private readonly jobQueueKey = "googleplaypackagejobs";
    private readonly redisReady: Promise<void>;

    constructor() {
        const connectionString = process.env.REDIS_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error("REDIS_CONNECTION_STRING environment variable is not set.");
        }

        this.redis = new Redis(connectionString);

        // Add error handling for Redis connection


        this.redisReady = new Promise((resolve, reject) => {
            this.redis.on("ready", () => {
                console.info("Redis ready to accept commands");
                resolve();
            });

            this.redis.on("error", (err: Error) => {
                console.error("Redis connection error:", err);
                reject(err);
            });

            this.redis.on("connect", () => {
                console.info("Redis connected successfully");
            });
        });
    }

    /**
     * Begins the background job processor that periodically checks for Google Play packaging jobs and processes them.
     */
    start(): void {
        this.redisReady.then(() => setTimeout(() => this.runJobs(), this.jobCheckIntervalMs));
    }

    private async runJobs(): Promise<void> {
        let job: GooglePlayPackageJob | null = null;
        try {
            job = await this.dequeueJob();

            // No jobs available? Check again in a few seconds.
            if (job) {
                await this.processJob(job);
            }
        } catch (jobError) {
            console.error("Error processing Google Play packaging job", jobError);
            if (job) {
                this.retryJobOrMarkAsFailed(job, jobError);
            }
        } finally {
            // Whether success or failure, queue up another job run.
            setTimeout(() => this.runJobs(), this.jobCheckIntervalMs);
        }
    }

    private async dequeueJob(): Promise<GooglePlayPackageJob | null> {
        const jobJson = await this.redis.lpop(this.jobQueueKey);
        if (!jobJson) {
            return null;
        }
        try {
            return JSON.parse(jobJson) as GooglePlayPackageJob;
        } catch (err) {
            console.error("Failed to parse Google Play packaging job from Redis", err, jobJson);
            return null;
        }
    }

    private async processJob(job: GooglePlayPackageJob): Promise<void> {

    }

    private async retryJobOrMarkAsFailed(job: GooglePlayPackageJob, jobError: any): Promise<void> {
    }
}