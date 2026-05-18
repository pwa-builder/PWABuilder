import { QueueClient, QueueServiceClient } from "@azure/storage-queue";
import { DefaultAzureCredential } from "@azure/identity";

/**
 * Service for interacting with Azure Queue Storage for job queuing.
 * Uses managed identity (DefaultAzureCredential) for authentication.
 */
export class AzureQueueService {
    private readonly queueClient: QueueClient;
    public readonly ready: Promise<void>;

    constructor() {
        const storageQueueUri = process.env.AZURE_STORAGE_QUEUE_URI;
        if (!storageQueueUri) {
            throw new Error("AZURE_STORAGE_QUEUE_URI environment variable is not set.");
        }

        const queueName = this.getQueueName();
        const credential = new DefaultAzureCredential();
        const serviceClient = new QueueServiceClient(storageQueueUri, credential);
        this.queueClient = serviceClient.getQueueClient(queueName);

        // Ensure the queue exists on startup
        this.ready = this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            await this.queueClient.createIfNotExists();
            console.info(`Azure Queue Storage initialized. Queue: ${this.queueClient.name}`);
        } catch (error) {
            console.error("Failed to initialize Azure Queue Storage:", error);
            throw error;
        }
    }

    /**
     * Sends a message to the queue.
     * @param value The value to enqueue (will be JSON serialized).
     * @returns The approximate queue length after enqueue.
     */
    async enqueue<T>(value: T): Promise<number> {
        const properties = await this.queueClient.getProperties();
        const currentLength = properties.approximateMessagesCount ?? 0;

        if (currentLength >= 50) {
            throw new Error("Cannot enqueue Google Play package because the queue is too long. Current queue length: " + currentLength);
        }

        const json = JSON.stringify(value);
        await this.queueClient.sendMessage(Buffer.from(json).toString("base64"));

        console.info(`Enqueued message to ${this.queueClient.name}. Approximate queue length: ${currentLength + 1}`);
        return currentLength + 1;
    }

    /**
     * Receives and deletes the next message from the queue.
     * @returns The deserialized message, or null if the queue is empty.
     */
    async dequeue<T>(): Promise<T | null> {
        const response = await this.queueClient.receiveMessages({ numberOfMessages: 1, visibilityTimeout: 300 });
        const messages = response.receivedMessageItems;

        if (!messages || messages.length === 0) {
            return null;
        }

        const message = messages[0];
        try {
            const json = Buffer.from(message.messageText, "base64").toString("utf-8");
            const parsed = JSON.parse(json) as T;

            // Delete the message after successful deserialization
            await this.queueClient.deleteMessage(message.messageId, message.popReceipt);
            return parsed;
        } catch (error) {
            console.error("Failed to deserialize queue message, deleting invalid message:", error);
            await this.queueClient.deleteMessage(message.messageId, message.popReceipt);
            return null;
        }
    }

    /**
     * Gets the approximate number of messages in the queue.
     */
    async getQueueLength(): Promise<number> {
        const properties = await this.queueClient.getProperties();
        return properties.approximateMessagesCount ?? 0;
    }

    /**
     * Returns true if the queue service is accessible.
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.queueClient.getProperties();
            return true;
        } catch {
            return false;
        }
    }

    private getQueueName(): string {
        // Use a different queue in production vs non-production
        return process.env.NODE_ENV === "production" ? "googleplay-package-jobs-prod" : "googleplay-package-jobs-nonprod";
    }
}

// Singleton instance - only created in non-local environments
const isLocalDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined;
export const azureQueue: AzureQueueService | null = isLocalDev ? null : new AzureQueueService();
