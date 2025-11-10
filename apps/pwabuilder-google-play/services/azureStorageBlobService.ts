import fs from 'fs-extra';
import type { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

/**
 * A service for uploading and downloading files. In local development, this will be a service that uses the local file system. Otherwise, this will be a service that uses Azure Storage blob containers.
 */
export interface BlobStorage {
    uploadFile(filePath: string, blobName: string): Promise<string>;
    downloadFileStream(blobName: string): Promise<NodeJS.ReadableStream>;
}

/**
 * Blob storage service that connects to PWABuilder's Azure Storage account for uploading and downloading files.
 * NOTE: we lazily initialize the Azure BlobServiceClient and ContainerClient to avoid loading Azure SDK packages too early, which can cause conflicts with OpenTelemetry in our environment. Without this, we'd see errors like, "Module @azure/core-tracing has been loaded before @azure/opentelemetry-instrumentation-azure-sdk so it might not work, please initialize it before requiring @azure/core-tracing'"
 */
export class AzureStorageBlobService implements BlobStorage {
    private blobServiceClientTask: Promise<BlobServiceClient> | null = null;
    private containerClientTask: Promise<ContainerClient> | null = null;
    private readonly containerName = "google-play-packages";
    private readonly azureStorageAccountName: string;
    private readonly azureManagedIdentityAppId: string;

    constructor() {
        this.azureStorageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
        if (!this.azureStorageAccountName) {
            throw new Error("AZURE_STORAGE_ACCOUNT_NAME environment variable is not set.");
        }

        this.azureManagedIdentityAppId = process.env.AZURE_MANAGED_IDENTITY_APPLICATION_ID || "";
        if (!this.azureManagedIdentityAppId) {
            throw new Error("AZURE_MANAGED_IDENTITY_APPLICATION_ID environment variable is not set.");
        }
    }

    /**
     * Uploads a file to the google-play-packages container in PWABuilder's Azure Storage account.
     * @param filePath - Local path to the file to upload
     * @param blobName - Name to give the blob in storage
     * @returns Promise with the blob name
     */
    async uploadFile(filePath: string, blobName: string): Promise<string> {
        try {
            const containerClient = await this.initializeContainerClient();
            const blobSafeFileName = this.getBlobSafeFileName(blobName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobSafeFileName);

            // Note: our Azure Blob Storage account is configured to automatically delete these after several hours.
            console.info(`Uploading file ${filePath} to blob ${blobSafeFileName}...`);
            await blockBlobClient.uploadFile(filePath);

            console.info(`Successfully uploaded ${blobName} to Azure Blob Storage`);
            return blockBlobClient.name;
        } catch (error) {
            console.error(`Error uploading file to Azure Blob Storage:`, error);
            throw error;
        }
    }

    /**
     * Downloads a blob from the google-play-packages container as a stream
     * @param blobName - Name of the blob to download
     * @returns Promise with the blob content as a readable stream
     */
    async downloadFileStream(blobName: string): Promise<NodeJS.ReadableStream> {
        try {
            const containerClient = await this.initializeContainerClient();
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            console.info(`Downloading blob ${blobName} as stream...`);
            const downloadResponse = await blockBlobClient.download();

            if (!downloadResponse.readableStreamBody) {
                throw new Error(`Failed to download blob ${blobName}: no readable stream available`);
            }

            console.info(`Successfully initiated stream download for ${blobName}`);
            return downloadResponse.readableStreamBody;
        } catch (error) {
            console.error(`Error downloading file from Azure Blob Storage:`, error);
            throw error;
        }
    }

    private getBlobSafeFileName(originalFileName: string): string {
        // Azure Storage blobs support letters, numbers, hyphens, periods, slashes, and underscores.
        // Replace spaces and colons with hyphens and remove any characters that are not alphanumeric, hyphens, or underscores.
        return originalFileName
            .replace(/\s+/g, '-')
            .replace(/:/g, '-')
            .replace(/[^a-zA-Z0-9-_]/g, '');
    }

    private initializeBlobServiceClient(): Promise<BlobServiceClient> {
        if (!this.blobServiceClientTask) {
            this.blobServiceClientTask = new Promise<BlobServiceClient>(async (resolve, reject) => {
                try {
                    console.info("Initializing Azure services...");

                    // Import Azure open telemetry in order to avoid race condition around @azure/core-tracing.
                    const azureOpenTelemetry = await import("@azure/opentelemetry-instrumentation-azure-sdk");
                    azureOpenTelemetry.logger.info("Azure Open Telemetry initialized");

                    console.info("Azure services initialized.");

                    // Dynamic imports to prevent early loading of Azure packages
                    const { BlobServiceClient } = await import("@azure/storage-blob");
                    const { DefaultAzureCredential } = await import("@azure/identity");

                    // Use user-assigned managed identity for authentication
                    const credential = new DefaultAzureCredential({
                        managedIdentityClientId: this.azureManagedIdentityAppId
                    });
                    const client = new BlobServiceClient(
                        `https://${this.azureStorageAccountName}.blob.core.windows.net`,
                        credential
                    );
                    resolve(client);
                } catch (error) {
                    reject(error);
                }
            });
        }

        return this.blobServiceClientTask;
    }

    private initializeContainerClient(): Promise<ContainerClient> {
        if (!this.containerClientTask) {
            this.containerClientTask = this.initializeBlobServiceClient()
                .then(blobService => blobService.getContainerClient(this.containerName));
        }

        return this.containerClientTask;
    }
}

/**
 * Blob storage service that uses the local file system for uploading and downloading files. This is only used in local development.
 */
class LocalFileSystemBlobService implements BlobStorage {
    private readonly blobNamesToFilePaths = new Map<string, string>();

    async uploadFile(filePath: string, blobName: string): Promise<string> {
        // In local development, the file already exists in the file system, just return the blob name.
        console.info(`Simulating upload of file ${filePath} as blob ${blobName}`);
        this.blobNamesToFilePaths.set(blobName, filePath);
        return new Promise((resolve) => setTimeout(() => resolve(blobName), 1000)); // simulate some delay
    }

    async downloadFileStream(blobName: string): Promise<NodeJS.ReadableStream> {
        // In local development, just return a readable stream from the file system.
        console.info(`Simulating download of blob ${blobName} as stream...`);
        const filePath = this.blobNamesToFilePaths.get(blobName);
        if (!filePath) {
            throw new Error(`Blob ${blobName} not found in local storage simulation.`);
        }
        return Promise.resolve(fs.createReadStream(filePath));
    }
}

// export our blob storage singleton. For local development, this will be a service that uses the local file system. For other environments, it will be a service that uses Azure Storage blob containers.
const isLocalDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined;
if (isLocalDev) {
    console.info("Local development detected, using LocalFileSystemBlobService for blob storage.");
} else {
    console.info(`${process.env.NODE_ENV} environment detected. Using AzureStorageBlobService for blob storage.`);
}
export const blobStorage = isLocalDev ?
    new LocalFileSystemBlobService() as BlobStorage :
    new AzureStorageBlobService() as BlobStorage;