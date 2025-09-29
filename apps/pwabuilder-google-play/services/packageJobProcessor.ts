import { Redis } from "ioredis";
import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";
import { PackageCreator } from "./packageCreator.js";
import { PackageCreationProgress } from "../models/packageCreationProgress.js";
import { PackageJobLogger } from "../models/packageJobLogger.js";
import { AzureStorageBlobService } from "./azureStorageBlobService.js";

/**
 * Inspects Redis to see if there are any pending Google Play packaging jobs. If so, it dequeues the job and begins processing it.
 */
export class PackageJobProcessor {

    private readonly jobCheckIntervalMs = 2000;
    private readonly redis: Redis;
    private readonly jobQueueKey = "googleplaypackagejobs";
    private readonly redisReady: Promise<void>;
    private readonly uploadService = new AzureStorageBlobService();
    private readonly maxRetryCount = 2;

    constructor() {
        const connectionString = process.env.REDIS_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error("REDIS_CONNECTION_STRING environment variable is not set.");
        }

        this.redis = new Redis(connectionString);
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
        let jobLogger: PackageJobLogger | null = null;
        try {
            job = await this.dequeueJob();
            if (job) {
                jobLogger = new PackageJobLogger(job);
                await this.processJob(job, jobLogger);
            }
        } catch (jobError) {
            console.error("Error processing Google Play packaging job", jobError);
            if (job) {
                this.retryJobOrMarkAsFailed(job, jobError, jobLogger || new PackageJobLogger(job));
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

    private async enqueueJob(job: GooglePlayPackageJob): Promise<void> {
        try {
            await this.redis.rpush(this.jobQueueKey, JSON.stringify(job));
        } catch (enqueueError) {
            console.error("Error enqueueing Google Play packaging job", enqueueError);
            throw enqueueError;
        }
    }

    private async processJob(job: GooglePlayPackageJob, logger: PackageJobLogger): Promise<void> {
        const packageCreator = new PackageCreator();
        const progressHandler = (e: PackageCreationProgress) => this.jobProgressed(e, job, logger);
        packageCreator.addEventListener("progress", progressHandler);

        try {
            const zipFilePath = await packageCreator.createZip(job.packageOptions);
            this.jobProgressed({ level: "info", message: "Successfully generated Google Play package. Saving zip file..." }, job, logger);
            await this.jobCompleted(job, zipFilePath, logger);

        } catch (err) {
            logger.error("Error during package creation", err);
        }
        finally {
            packageCreator.removeEventListener("progress", progressHandler);
        }
    }

    private async retryJobOrMarkAsFailed(job: GooglePlayPackageJob, jobError: any, logger: PackageJobLogger): Promise<void> {
        if (job.retryCount < this.maxRetryCount) {
            job.retryCount++;
            logger.info("Retrying job", { attempt: job.retryCount + 1, maxAttempts: this.maxRetryCount + 1 });
            await this.saveJob(job);
            await this.enqueueJob(job);
        } else {
            // We've already attempted processing this max times. Mark the job as failed.
            logger.error(`Job failed after ${this.maxRetryCount + 1} attempts.`, jobError);
            job.status = "Failed";
            await this.saveJob(job);
        }
    }

    async jobProgressed(e: PackageCreationProgress, job: GooglePlayPackageJob, logger: PackageJobLogger) {
        logger.logProgress(e);

        // Save the job state back to Redis so we have a record of progress.
        try {
            await this.saveJob(job);
        } catch (statusSaveError) {
            // Don't throw the error, we don't want to fail the job just because we couldn't save progress.
            logger.error("Failed to save job progress to Redis", statusSaveError);
        }
    }

    async jobCompleted(job: GooglePlayPackageJob, zipFilePath: string, jobLogger: PackageJobLogger) {
        // Upload the zip file to Azure Blob Storage.
        const fileName = job.id.replaceAll("googleplaypackagejob", "");
        let blobFileName: string;
        try {
            blobFileName = await this.uploadService.uploadFile(zipFilePath, `${fileName}.zip`);
        } catch (uploadError) {
            jobLogger.error("Error uploading package zip file to Azure Blob Storage.", uploadError);
            throw uploadError;
        }

        // Mark the job as completed in Redis.
        try {
            job.status = "Completed";
            job.uploadedBlobFileName = blobFileName;
            jobLogger.info(`Successfully uploaded package zip file ${blobFileName}.`);
            await this.saveJob(job);
        } catch (completionError) {
            jobLogger.error("Error marking job as completed.", completionError);
            throw completionError;
        }
    }

    private async saveJob(job: GooglePlayPackageJob): Promise<void> {
        try {
            await this.redis.set(job.id, JSON.stringify(job));
        } catch (saveError) {
            console.error("Error saving job to Redis", saveError);
            throw saveError;
        }
    }
}