export interface GooglePlayPackageJob {
    id: string;
    supportReference: string;
    name: string;
    pwaUrl: string;
    analysisId: string | null;
    status: "Queued" | "InProgress" | "Completed" | "Failed";
    createdAt: string;
    retryCount: number;
    errors: string[];
    logs: string[];
    downloadAvailable: boolean;
}