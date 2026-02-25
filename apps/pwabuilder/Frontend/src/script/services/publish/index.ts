import { GooglePlayPackageError } from "../../models/GooglePlayPackageError";
import { GooglePlayPackageJob } from "../../models/GooglePlayPackageJob";
import { AndroidPackageOptions } from '../../utils/android-validation';
import { PackageOptions } from '../../utils/interfaces';
import { IOSAppPackageOptions } from '../../utils/ios-validation';
import { WindowsPackageOptions } from '../../utils/win-validation';
import {
    downloadGooglePlayPackageZip,
    enqueueGooglePlayPackageJob,
    getGooglePlayPackageJob,
} from './android-publish';
import { generateIOSPackage } from './ios-publish';
import {
    generateWindowsPackage,
} from './windows-publish';

export type Platform = 'windows' | 'android' | 'other-android' | 'ios' | 'meta';

type PackageInfo = {
    appName: string;
    blob: Blob | null;
    type: string;
};

export async function generatePackage(
    type: Platform,
    packageOptions?: PackageOptions
): Promise<PackageInfo | null> {
    switch (type) {
        case 'windows':
            return await tryGenerateWindowsPackage(packageOptions as WindowsPackageOptions);
        case 'android':
        case "other-android":
            return await tryGenerateAndroidPackage(packageOptions as AndroidPackageOptions);
        case 'ios':
            return await tryGenerateIOSPackage(packageOptions as IOSAppPackageOptions);
        default:
            throw new Error(
                `A platform type must be passed, ${type} is not a valid platform.`
            );
    }
}

async function tryGenerateIOSPackage(options: IOSAppPackageOptions): Promise<PackageInfo | null> {
    const result = await generateIOSPackage(options);
    return {
        appName: options.name,
        blob: result,
        type: "store"
    };
}

async function tryGenerateWindowsPackage(packageOptions: WindowsPackageOptions): Promise<PackageInfo | null> {
    const blob = await generateWindowsPackage(packageOptions);
    return {
        appName: packageOptions.name,
        blob: blob || null,
        type: 'store',
    };
}

function tryGenerateAndroidPackage(options: AndroidPackageOptions): Promise<PackageInfo | null> {
    return new GooglePlayPackageService(options).createPackage();
}

/**
 * Service for enqueuing a Google Play package job, monitoring its status, and retrieving the resulting package.
 */
class GooglePlayPackageService {
    private readonly pollIntervalMs = 3000; // Poll the job every 3 seconds
    private readonly maxWaitTimeMs = 15 * 60 * 1000; // Max wait time of 15 minutes
    private readonly promiseWithResolvers = Promise.withResolvers<PackageInfo>();
    private job: GooglePlayPackageJob | null = null;
    private jobTimeoutHandle = 0;

    /**
     * Creates a new Google Play package job and monitors its status until completion or failure.
     */
    constructor(private readonly packageOptions: AndroidPackageOptions) {
    }

    /**
     * Enqueues a Google Play package job and returns a promise that resolves with the package job completes.
     * @returns 
     */
    public async createPackage(): Promise<PackageInfo> {
        let jobId: string;
        try {
            jobId = await enqueueGooglePlayPackageJob(this.packageOptions);
        } catch (enqueueError) {
            return Promise.reject(new GooglePlayPackageError(enqueueError, null));
        }

        setTimeout(() => this.pollJob(jobId), this.pollIntervalMs);
        this.jobTimeoutHandle = window.setTimeout(() => this.jobTimedOut(), this.maxWaitTimeMs);
        return this.promiseWithResolvers.promise;
    }

    private async pollJob(jobId: string): Promise<void> {
        try {
            const job = await getGooglePlayPackageJob(jobId);
            this.job = job;
            if (job.status === "Completed") {
                await this.jobCompleted(job);
            } else if (job.status === "Failed") {
                this.promiseWithResolvers.reject(new GooglePlayPackageError("Google Play package job failed.", job));
            } else {
                // Otherwise, it's queued or processing. Poll again after a delay.
                setTimeout(() => this.pollJob(jobId), this.pollIntervalMs);
            }
        } catch (error) {
            console.error("Failed to retrieve Google Play package job", error);
            this.promiseWithResolvers.reject(new GooglePlayPackageError(error, null));
        }
    }

    private async jobCompleted(job: GooglePlayPackageJob): Promise<void> {
        let blob: Blob;
        try {
            blob = await downloadGooglePlayPackageZip(job.id);
            this.promiseWithResolvers.resolve({
                appName: this.packageOptions.name,
                blob: blob,
                type: "store"
            });
            clearTimeout(this.jobTimeoutHandle);
        } catch (downloadError) {
            console.error("Failed to download Google Play package zip file", downloadError);
            this.promiseWithResolvers.reject(new GooglePlayPackageError(downloadError, job));
        }
    }

    private jobTimedOut(): void {
        this.promiseWithResolvers.reject(new GooglePlayPackageError("Timed out waiting for Google Play package job to complete.", this.job));
    }
}
