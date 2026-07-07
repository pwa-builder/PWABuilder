import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";
import { PackageCreator } from "./packageCreator.js";
import { PackageCreationProgress } from "../models/packageCreationProgress.js";
import { PackageJobLogger } from "../models/packageJobLogger.js";
import { blobStorage } from "./azureStorageBlobService.js";
import { redisService } from "./redisService.js";
import { azureQueue, AzureQueueService } from "./azureQueueService.js";
import { packageJobQueue } from "./packageJobQueue.js";

/**
 * Processes Google Play packaging jobs one at a time. Multiple instances of this processor
 * can safely run in parallel — Azure Queue's visibility timeout ensures each message is
 * delivered to exactly one consumer.
 */
export class PackageJobProcessor {

    private readonly jobCheckIntervalMs = 2000;
    private readonly maxRetryCount = 2;
    private readonly maxJobAgeMs = 60000 * 30; // 30 minutes

    /**
     * Begins the background job processor that periodically checks for Google Play packaging jobs and processes them.
     */
    start(): void {
        // Wait for database and queue to be ready, then start processing
        const readyPromises: Promise<void>[] = [redisService.ready];
        if (azureQueue) {
            readyPromises.push(azureQueue.ready);
        }

        Promise.all(readyPromises).then(() => {
            console.info('Database and queue ready, starting job processor in 5 seconds...');
            setTimeout(() => this.runJobs(), 5000);
        }).catch((error) => {
            console.error('Failed to start job processor due to initialization error:', error);
        });
    }

    private async runJobs(): Promise<void> {
        let job: GooglePlayPackageJob | null = null;
        let jobLogger: PackageJobLogger | null = null;
        let hadError = false;

        try {
            job = await packageJobQueue.dequeue();
            if (job) {
                // Skip stale jobs — users won't be waiting for results after 15 minutes.
                // Discarding these prevents the queue from staying backed up with dead work.
                if (this.isJobStale(job)) {
                    console.info(`Discarding stale job ${job.id} (created ${job.createdAt}). Job exceeded max age of ${this.maxJobAgeMs / 60000} minutes.`);
                    job.errors.push(`Discarding job due to exceeding max age of ${this.maxJobAgeMs / 60000} minutes.`);
                    job.status = "Failed";
                    await redisService.save(job.id, job);
                } else {
                    jobLogger = new PackageJobLogger(job);
                    await this.processJob(job, jobLogger);
                }
            }
        } catch (jobError) {
            hadError = true;
            console.error("Error processing Google Play packaging job", jobError);
            if (job) {
                await this.retryJobOrMarkAsFailed(job, jobError, jobLogger || new PackageJobLogger(job));
            }
        } finally {
            // Whether success or failure, queue up another job run.
            // Use longer delay if we had an error to avoid rapid failure loops
            const delay = hadError ? 15000 : this.jobCheckIntervalMs;
            setTimeout(() => this.runJobs(), delay);
        }
    }

    private async processJob(job: GooglePlayPackageJob, logger: PackageJobLogger): Promise<void> {
        const packageCreator = new PackageCreator();
        const progressHandler = (e: PackageCreationProgress) => this.jobProgressed(e, job, logger);
        packageCreator.addEventListener("progress", progressHandler);
        try {
            // Mark it as in progress.
            job.status = "InProgress";
            await redisService.save(job.id, job);

            const zipFilePath = await packageCreator.createZip(job.packageOptions);
            this.jobProgressed({ level: "info", message: "Successfully generated Google Play package. Saving zip file..." }, job, logger);
            await this.jobCompleted(job, zipFilePath, logger);

        } catch (err) {
            logger.error("Error during package creation", err);
            throw err;
        } finally {
            packageCreator.removeEventListener("progress", progressHandler);
        }
    }

    private async retryJobOrMarkAsFailed(job: GooglePlayPackageJob, jobError: any, logger: PackageJobLogger): Promise<void> {
        // Don't retry stale jobs — the user has already moved on
        if (this.isJobStale(job)) {
            logger.error(`Job expired after ${this.maxJobAgeMs / 60000} minutes. Marking as failed without retry.`, jobError);
            job.status = "Failed";
            await redisService.save(job.id, job);
            return;
        }

        if (job.retryCount < this.maxRetryCount) {
            job.retryCount++;
            logger.info("Retrying job", { attempt: job.retryCount + 1, maxAttempts: this.maxRetryCount + 1 });
            await redisService.save(job.id, job);
            await packageJobQueue.requeue(job);
        } else {
            // We've already attempted processing this max times. Mark the job as failed.
            logger.error(`Job failed after ${this.maxRetryCount + 1} attempts.`, jobError);
            job.status = "Failed";
            await redisService.save(job.id, job);
        }
    }

    /**
     * Checks if a job has exceeded the maximum allowed age.
     * Stale jobs are discarded because the user is no longer waiting for results.
     */
    private isJobStale(job: GooglePlayPackageJob): boolean {
        const createdAt = new Date(job.createdAt).getTime();
        return Date.now() - createdAt > this.maxJobAgeMs;
    }

    async jobProgressed(e: PackageCreationProgress, job: GooglePlayPackageJob, logger: PackageJobLogger) {
        logger.logProgress(e);

        // Save the job state back to Redis so we have a record of progress.
        try {
            await redisService.save(job.id, job);
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
            blobFileName = await blobStorage.uploadFile(zipFilePath, `${fileName}.zip`);
        } catch (uploadError) {
            jobLogger.error("Error uploading package zip file to Azure Blob Storage.", uploadError);
            throw uploadError;
        }

        // Mark the job as completed in Redis.
        try {
            job.status = "Completed";
            job.uploadedBlobFileName = blobFileName;
            jobLogger.info("Successfully uploaded package zip file", blobFileName);
            await redisService.save(job.id, job);
            await packageJobQueue.recordProcessedJob(job.id);
        } catch (completionError) {
            jobLogger.error("Error marking job as completed.", completionError);
            throw completionError;
        }
    }
}