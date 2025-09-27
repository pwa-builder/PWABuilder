import { AndroidPackageOptions } from "./androidPackageOptions.js";

export interface GooglePlayPackageJob {
    id: string;
    analysisId: string;
    status: "Queued" | "InProgress" | "Completed" | "Failed";
    createdAt: string;
    retryCount: number;
    errors: string[];
    logs: string[];
    packageOptions: AndroidPackageOptions;
}