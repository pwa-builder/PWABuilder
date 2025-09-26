import { AndroidPackageOptions } from "./androidPackageOptions.js";

export interface GooglePlayPackagingJob {
    id: string;
    analysisId: string;
    createdAt: string;
    retryCount: number;
    errors: string[];
    packageOptions: AndroidPackageOptions;
}