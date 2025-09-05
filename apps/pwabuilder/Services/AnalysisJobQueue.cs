using Azure.Identity;
using Azure.Storage.Queues;
using Microsoft.Extensions.Options;
using PWABuilder.Models;
using System.Collections.Concurrent;

namespace PWABuilder.Services;

/// <summary>
/// Manages the queue of AnalysisJobs to process. In development env, it uses <see cref="InMemoryAnalysisJobQueue"/>. Otherwise, it uses an Azure Queue with Managed Identity auth.
/// </summary>
public interface IAnalysisJobQueue
{
    Task<AnalysisJob?> DequeueAsync(CancellationToken cancellationToken);
    Task EnqueueAsync(AnalysisJob job);
}

/// <summary>
/// AnalysisJob queue that uses an in-memory queue. Useful for local development and testing.
/// </summary>
public class InMemoryAnalysisJobQueue : IAnalysisJobQueue
{
    private readonly ConcurrentQueue<AnalysisJob> queue = new();

    public Task<AnalysisJob?> DequeueAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (queue.TryDequeue(out var job))
        {
            return Task.FromResult<AnalysisJob?>(job);
        }

        return Task.FromResult<AnalysisJob?>(null);
    }

    public Task EnqueueAsync(AnalysisJob job)
    {
        queue.Enqueue(job);
        return Task.CompletedTask;
    }
}

/// <summary>
/// The queue for managing AnalysisJobs. The backing store is an Azure Storage Queue with Managed Identity authentication.
/// </summary>
public class AnalysisJobQueue : IAnalysisJobQueue
{
    private readonly QueueClient queue;
    private readonly ILogger<AnalysisJobQueue> logger;

    public AnalysisJobQueue(IOptions<AppSettings> settings, ILogger<AnalysisJobQueue> logger)
    {
        var queueUri = new Uri($"https://{settings.Value.AzureStorageAccountName}.queue.core.windows.net/{settings.Value.AzureAnalysesQueueName}");
        var credential = new ManagedIdentityCredential(clientId: settings.Value.AzureManagedIdentityApplicationId);
        var queueOptions = new QueueClientOptions
        {
            Retry =
            {
                MaxRetries = 5,
                Delay = TimeSpan.FromSeconds(2),
                Mode = Azure.Core.RetryMode.Exponential
            }
        };
        this.queue = new QueueClient(queueUri, credential, queueOptions);
        this.logger = logger;
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