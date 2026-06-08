import { MetaHorizonPackageOptions } from "./metaHorizonPackageOptions.js";

export interface MetaHorizonPackageJob {
    id: string;
    pwaUrl: string;
    analysisId: string | null;
    status: "Queued" | "InProgress" | "Completed" | "Failed";
    createdAt: string;
    retryCount: number;
    errors: string[];
    logs: string[];
    packageOptions: MetaHorizonPackageOptions;
    uploadedBlobFileName: string | null;
}
