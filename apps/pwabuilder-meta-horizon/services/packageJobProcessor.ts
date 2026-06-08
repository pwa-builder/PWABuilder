import { MetaHorizonPackageJob } from "../models/metaHorizonPackageJob.js";
import { PackageCreator } from "./packageCreator.js";
import { PackageCreationProgress } from "../models/packageCreationProgress.js";
import { PackageJobLogger } from "../models/packageJobLogger.js";
import { blobStorage } from "./azureStorageBlobService.js";
import { database } from "./redisService.js";
import { packageJobQueue } from "./packageJobQueue.js";

/**
 * Inspects Redis to see if there are any pending Meta Horizon packaging jobs. If so, it dequeues the job and begins processing it.
 */
export class PackageJobProcessor {

    private readonly jobCheckIntervalMs = 2000;
    private readonly maxRetryCount = 2;

    /**
     * Begins the background job processor that periodically checks for Meta Horizon packaging jobs and processes them.
     */
    start(): void {
        database.ready.then(() => {
            console.info('Database ready, starting job processor in 5 seconds to allow for complete initialization...');
            setTimeout(() => this.runJobs(), 5000);
        }).catch((error) => {
            console.error('Failed to start job processor due to database initialization error:', error);
        });
    }

    private async runJobs(): Promise<void> {
        let job: MetaHorizonPackageJob | null = null;
        let jobLogger: PackageJobLogger | null = null;
        let hadTimeout = false;

        try {
            const isHealthy = await database.healthCheck();
            if (!isHealthy) {
                console.warn("Redis health check failed, skipping job dequeue cycle");
                hadTimeout = true;
                return;
            }

            job = await packageJobQueue.dequeue();
            if (job) {
                jobLogger = new PackageJobLogger(job);
                await this.processJob(job, jobLogger);
            }
        } catch (jobError) {
            const error = jobError as Error;
            const isRedisError = error.message && (
                error.message.includes('Command timed out') ||
                error.message.includes('Connection is closed') ||
                error.message.includes('Redis not ready') ||
                error.message.includes('already connecting/connected')
            );

            if (isRedisError) {
                hadTimeout = true;
                console.warn("Redis error during job dequeue - will retry on next cycle", error.message);
            } else {
                console.error("Error processing Meta Horizon packaging job", jobError);
                if (job) {
                    this.retryJobOrMarkAsFailed(job, jobError, jobLogger || new PackageJobLogger(job));
                }
            }
        } finally {
            const delay = hadTimeout ? 15000 : this.jobCheckIntervalMs;
            setTimeout(() => this.runJobs(), delay);
        }
    }

    private async processJob(job: MetaHorizonPackageJob, logger: PackageJobLogger): Promise<void> {
        const packageCreator = new PackageCreator();
        const progressHandler = (e: PackageCreationProgress) => this.jobProgressed(e, job, logger);
        packageCreator.addEventListener("progress", progressHandler);
        try {
            job.status = "InProgress";
            await database.save(job.id, job);

            const zipFilePath = await packageCreator.createZip(job.packageOptions);
            this.jobProgressed({ level: "info", message: "Successfully generated Meta Horizon package. Saving zip file..." }, job, logger);
            await this.jobCompleted(job, zipFilePath, logger);

        } catch (err) {
            logger.error("Error during package creation", err);
            throw err;
        } finally {
            packageCreator.removeEventListener("progress", progressHandler);
        }
    }

    private async retryJobOrMarkAsFailed(job: MetaHorizonPackageJob, jobError: any, logger: PackageJobLogger): Promise<void> {
        if (job.retryCount < this.maxRetryCount) {
            job.retryCount++;
            logger.info("Retrying job", { attempt: job.retryCount + 1, maxAttempts: this.maxRetryCount + 1 });
            await database.save(job.id, job);
            await packageJobQueue.requeue(job);
        } else {
            logger.error(`Job failed after ${this.maxRetryCount + 1} attempts.`, jobError);
            job.status = "Failed";
            await database.save(job.id, job);
        }
    }

    async jobProgressed(e: PackageCreationProgress, job: MetaHorizonPackageJob, logger: PackageJobLogger) {
        logger.logProgress(e);

        try {
            await database.save(job.id, job);
        } catch (statusSaveError) {
            logger.error("Failed to save job progress to Redis", statusSaveError);
        }
    }

    async jobCompleted(job: MetaHorizonPackageJob, zipFilePath: string, jobLogger: PackageJobLogger) {
        const fileName = job.id.replaceAll("metahorizonpackagejob", "");
        let blobFileName: string;
        try {
            blobFileName = await blobStorage.uploadFile(zipFilePath, `${fileName}.zip`);
        } catch (uploadError) {
            jobLogger.error("Error uploading package zip file to Azure Blob Storage.", uploadError);
            throw uploadError;
        }

        try {
            job.status = "Completed";
            job.uploadedBlobFileName = blobFileName;
            jobLogger.info("Successfully uploaded package zip file", blobFileName);
            await database.save(job.id, job);
            await packageJobQueue.recordProcessedJob(job.id);
        } catch (completionError) {
            jobLogger.error("Error marking job as completed.", completionError);
            throw completionError;
        }
    }
}
