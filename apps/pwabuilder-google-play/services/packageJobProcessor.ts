import { GooglePlayPackageJob } from "../models/googlePlayPackageJob.js";
import { PackageCreator } from "./packageCreator.js";
import { PackageCreationProgress } from "../models/packageCreationProgress.js";
import { PackageJobLogger } from "../models/packageJobLogger.js";
import { blobStorage } from "./azureStorageBlobService.js";
import { database } from "./databaseService.js";
import { packageJobQueue } from "./packageJobQueue.js";

/**
 * Inspects Redis to see if there are any pending Google Play packaging jobs. If so, it dequeues the job and begins processing it.
 */
export class PackageJobProcessor {

    private readonly jobCheckIntervalMs = 2000;
    private readonly maxRetryCount = 2;

    /**
     * Begins the background job processor that periodically checks for Google Play packaging jobs and processes them.
     */
    start(): void {
        // Wait for database to be ready, then add additional delay for Azure deployment scenarios
        database.ready.then(() => {
            console.info('Database ready, starting job processor in 5 seconds to allow for complete initialization...');
            setTimeout(() => this.runJobs(), 5000); // 5 second delay instead of 2 seconds
        }).catch((error) => {
            console.error('Failed to start job processor due to database initialization error:', error);
        });
    }

    private async runJobs(): Promise<void> {
        let job: GooglePlayPackageJob | null = null;
        let jobLogger: PackageJobLogger | null = null;
        let hadTimeout = false;

        try {
            job = await packageJobQueue.dequeue();
            if (job) {
                jobLogger = new PackageJobLogger(job);
                await this.processJob(job, jobLogger);
            }
        } catch (jobError) {
            const error = jobError as Error;
            // Check if it's a Redis timeout specifically
            const isRedisTimeout = error.message && error.message.includes('Command timed out');
            if (isRedisTimeout) {
                hadTimeout = true;
                console.warn("Redis timeout during job dequeue - will retry on next cycle", error.message);
                // Don't mark job as failed for Redis timeouts, just wait for next cycle
            } else {
                console.error("Error processing Google Play packaging job", jobError);
                if (job) {
                    this.retryJobOrMarkAsFailed(job, jobError, jobLogger || new PackageJobLogger(job));
                }
            }
        } finally {
            // Whether success or failure, queue up another job run.
            // Use longer delay if we had a Redis timeout to give Redis time to recover
            const delay = hadTimeout ? 10000 : this.jobCheckIntervalMs;
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
            await database.save(job.id, job);

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
        if (job.retryCount < this.maxRetryCount) {
            job.retryCount++;
            logger.info("Retrying job", { attempt: job.retryCount + 1, maxAttempts: this.maxRetryCount + 1 });
            await database.save(job.id, job);
            await packageJobQueue.requeue(job);
        } else {
            // We've already attempted processing this max times. Mark the job as failed.
            logger.error(`Job failed after ${this.maxRetryCount + 1} attempts.`, jobError);
            job.status = "Failed";
            await database.save(job.id, job);
        }
    }

    async jobProgressed(e: PackageCreationProgress, job: GooglePlayPackageJob, logger: PackageJobLogger) {
        logger.logProgress(e);

        // Save the job state back to Redis so we have a record of progress.
        try {
            await database.save(job.id, job);
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
            await database.save(job.id, job);
        } catch (completionError) {
            jobLogger.error("Error marking job as completed.", completionError);
            throw completionError;
        }
    }
}