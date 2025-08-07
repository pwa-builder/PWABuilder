using Azure.Storage.Queues;
using Microsoft.Extensions.Options;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// The Azure Queue that stores AnalysisJob objects for processing.
/// </summary>
public class AnalysisJobQueue
{
    private readonly QueueClient queue;
    private readonly ILogger<AnalysisJobQueue> logger;

    public AnalysisJobQueue(IOptions<AppSettings> settings, ILogger<AnalysisJobQueue> logger)
    {
        this.logger = logger;
        var credential = new Azure.Storage.StorageSharedKeyCredential(settings.Value.AzureStorageAccountName, settings.Value.AzureStorageAccessKey);
        var queueUri = new Uri($"https://{settings.Value.AzureStorageAccountName}.queue.core.windows.net/{settings.Value.AzureAnalysesQueueName}");
        this.queue = new QueueClient(queueUri, credential);
    }

    /// <summary>
    /// Enqueues an AnalysisJob to the Azure Queue for processing.
    /// </summary>
    /// <param name="job"></param>
    /// <returns></returns>
    public async Task EnqueueAsync(AnalysisJob job)
    {
        // Add the job to the Azure Queue
        await this.EnsureQueueExistsAsync();

        try
        {
            var jobJson = System.Text.Json.JsonSerializer.Serialize(job);
            await this.queue.SendMessageAsync(jobJson);
        }
        catch (Exception error)
        {
            logger.LogError(error, "Error enqueuing AnalysisJob to the Azure Queue.");
            throw;
        }
    }

    /// <summary>
    /// Dequeues an AnalysisJob from the Azure Queue.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    public async Task<AnalysisJob?> DequeueAsync(CancellationToken cancellationToken)
    {
        try
        {
            var response = await this.DequeueCore(cancellationToken);
            return response;
        }
        catch (Exception error)
        {
            logger.LogError(error, "Error dequeuing AnalysisJob from the Azure Queue.");
            throw;
        }
    }

    private async Task<AnalysisJob?> DequeueCore(CancellationToken cancelToken)
    {
        // ReceiveMessageAsync will hide this message temporarily from other consumers.
        // We still need to call DeleteMessageAsync to remove it from the queue.
        var response = await this.queue.ReceiveMessageAsync(cancellationToken: cancelToken);
        try
        {
            var analysisJobJson = response?.Value?.MessageText;
            if (analysisJobJson == null)
            {
                return null;
            }

            var job = System.Text.Json.JsonSerializer.Deserialize<AnalysisJob>(analysisJobJson);
            return job;
        }
        catch (Exception serializationError)
        {
            logger.LogError(serializationError, "Error deserializing AnalysisJob from the Azure Queue. Queue message is set to expire on {expire}. Message JSON: {queueMessage}", response?.Value?.ExpiresOn, response?.Value?.MessageText);
            throw;
        }
        finally
        {
            // We've read the message. Delete it.
            if (response?.Value?.MessageId != null)
            {
                await this.queue.DeleteMessageAsync(response.Value.MessageId, response.Value.PopReceipt, cancelToken);
            }
        }
    }

    private async Task EnsureQueueExistsAsync()
    {
        try
        {
            // Ensure the queue exists
            await this.queue.CreateIfNotExistsAsync();
        }
        catch (Exception error)
        {
            logger.LogError(error, "Failed to ensure the AnalysisJob queue exists in Azure. Please make sure the Azure Storage access key is valid.");
            throw;
        }
    }
}