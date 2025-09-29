import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

export class AzureStorageBlobService {
    private blobServiceClient: BlobServiceClient;
    private containerClient: ContainerClient;
    private readonly containerName = "google-play-packages";

    constructor() {
        const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
        if (!accountName) {
            throw new Error("AZURE_STORAGE_ACCOUNT_NAME environment variable is not set.");
        }

        const managedIdentityClientId = process.env.AZURE_MANAGED_IDENTITY_APPLICATION_ID;
        if (!managedIdentityClientId) {
            throw new Error("AZURE_MANAGED_IDENTITY_APPLICATION_ID environment variable is not set.");
        }

        // Use user-assigned managed identity for authentication
        const credential = new DefaultAzureCredential({
            managedIdentityClientId: managedIdentityClientId
        });
        this.blobServiceClient = new BlobServiceClient(
            `https://${accountName}.blob.core.windows.net`,
            credential
        );

        this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    }

    /**
     * Uploads a file to the google-play-packages container in PWABuilder's Azure Storage account.
     * @param filePath - Local path to the file to upload
     * @param blobName - Name to give the blob in storage
     * @returns Promise with the blob name
     */
    async uploadFile(filePath: string, blobName: string): Promise<string> {
        try {
            const blobSafeFileName = this.getBlobSafeFileName(blobName);
            const blockBlobClient = this.containerClient.getBlockBlobClient(blobSafeFileName);

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

    private getBlobSafeFileName(originalFileName: string): string {
        // Azure Storage blobs support letters, numbers, hyphens, periods, slashes, and underscores.
        // Replace spaces and colons with hyphens and remove any characters that are not alphanumeric, hyphens, or underscores.
        return originalFileName
            .replace(/\s+/g, '-')
            .replace(/:/g, '-')
            .replace(/[^a-zA-Z0-9-_]/g, '');
    }
}