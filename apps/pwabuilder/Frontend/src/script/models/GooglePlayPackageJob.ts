import { AndroidPackageOptions } from "../utils/android-validation";

export interface GooglePlayPackageJob {
    id: string;
    pwaUrl: string;
    analysisId: string | null;
    status: "Queued" | "InProgress" | "Completed" | "Failed";
    createdAt: string;
    retryCount: number;
    errors: string[];
    logs: string[];
    packageOptions: AndroidPackageOptions;
    uploadedBlobFileName: string | null;
}