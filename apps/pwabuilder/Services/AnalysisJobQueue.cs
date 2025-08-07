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
            var response = await this.queue.ReceiveMessageAsync(cancellationToken: cancellationToken);
            if (response.Value != null)
            {
                var jobJson = response.Value.MessageText;
                var job = System.Text.Json.JsonSerializer.Deserialize<AnalysisJob>(jobJson);
                return job;
            }

            return null;
        }
        catch (Exception error)
        {
            logger.LogError(error, "Error dequeuing AnalysisJob from the Azure Queue.");
            throw;
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