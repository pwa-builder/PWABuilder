using System.Text.Json;
using Azure.Identity;
using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using Microsoft.Extensions.Options;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Analysis job queue backed by Azure Queue Storage. Uses managed identity for authentication.
/// </summary>
public sealed class AzureStorageAnalysisJobQueue : IAnalysisJobQueue
{
    private readonly QueueClient queueClient;
    private readonly AnalysisJobProcessorHealthMonitor healthMonitor;
    private readonly ILogger<AzureStorageAnalysisJobQueue> logger;
    private readonly string queueName;
    private readonly bool createQueueIfMissing;
    private bool queueVerified;

    /// <summary>
    /// Creates a new AzureStorageAnalysisJobQueue.
    /// </summary>
    public AzureStorageAnalysisJobQueue(
        IOptions<AppSettings> appSettings,
        AnalysisJobProcessorHealthMonitor healthMonitor,
        ILogger<AzureStorageAnalysisJobQueue> logger)
    {
        this.healthMonitor = healthMonitor;
        this.logger = logger;

        var managedIdentityAppId = appSettings.Value.AzureManagedIdentityApplicationId;
        var credential = new ManagedIdentityCredential(clientId: managedIdentityAppId);

        var queueNameOverride = appSettings.Value.AnalysisJobQueueName;
        queueName = string.IsNullOrWhiteSpace(queueNameOverride) ? GetEnvironmentQueueName() : queueNameOverride.Trim().ToLowerInvariant();
        var queueUri = new Uri($"{appSettings.Value.AzureStorageQueueUri.TrimEnd('/')}/{queueName}");
        this.queueClient = new QueueClient(queueUri, credential);

        // Environment queues are provisioned ahead of time. Overridden queues (e.g. per-PR slots) are created on first use.
        createQueueIfMissing = !string.IsNullOrWhiteSpace(queueNameOverride);
    }

    /// <summary>
    /// Enqueues an analysis job to Azure Queue Storage.
    /// </summary>
    public async Task EnqueueAsync(AnalysisJob job)
    {
        try
        {
            await EnsureQueueExistsAsync(CancellationToken.None);
            var properties = await queueClient.GetPropertiesAsync();
            var queueLength = properties.Value.ApproximateMessagesCount;

            if (queueLength >= 500)
            {
                logger.LogError("Attempted to enqueue analysis job for {AnalysisId}, but there are already {QueueLength} jobs in the queue. Job not enqueued.", job.AnalysisId, queueLength);
                throw new InvalidOperationException("Too many analyses queued. Please wait.");
            }
            else if (queueLength > 100)
            {
                logger.LogWarning("More than 100 analysis jobs are in the queue ({QueueLength}). Monitor queue length.", queueLength);
            }

            var json = JsonSerializer.Serialize(job);
            await queueClient.SendMessageAsync(BinaryData.FromString(json));

            healthMonitor.AnalysisQueueLength = queueLength + 1;
            logger.LogInformation("Enqueued analysis job for {AnalysisId} to {QueueName}. Approximate queue length: {QueueLength}", job.AnalysisId, queueName, queueLength + 1);
        }
        catch (Exception error) when (error is not InvalidOperationException)
        {
            logger.LogError(error, "Error enqueuing analysis job for {AnalysisId}", job.AnalysisId);
            throw;
        }
    }

    /// <summary>
    /// Dequeues an analysis job from Azure Queue Storage. Returns null if the queue is empty.
    /// </summary>
    public async Task<AnalysisJob?> DequeueAsync(CancellationToken cancellationToken)
    {
        try
        {
            cancellationToken.ThrowIfCancellationRequested();
            await EnsureQueueExistsAsync(cancellationToken);

            var response = await queueClient.ReceiveMessageAsync(visibilityTimeout: TimeSpan.FromMinutes(5), cancellationToken: cancellationToken);
            var message = response.Value;

            if (message is null)
            {
                return null;
            }

            var job = JsonSerializer.Deserialize<AnalysisJob>(message.Body.ToString());
            if (job is null)
            {
                logger.LogWarning("Dequeued a message from {QueueName} but failed to deserialize it. Deleting invalid message.", queueName);
                await queueClient.DeleteMessageAsync(message.MessageId, message.PopReceipt, cancellationToken);
                return null;
            }

            // Delete the message after successful deserialization.
            // If processing fails, AnalysisJobProcessor will re-enqueue.
            await queueClient.DeleteMessageAsync(message.MessageId, message.PopReceipt, cancellationToken);

            logger.LogInformation("Dequeued analysis job for {AnalysisId} from {QueueName}", job.AnalysisId, queueName);
            return job;
        }
        catch (Exception error) when (error is not OperationCanceledException)
        {
            logger.LogError(error, "Error dequeuing analysis job from {QueueName}", queueName);
            throw;
        }
    }

    /// <summary>
    /// Creates the queue if this instance uses an overridden queue name and the queue hasn't been verified yet.
    /// </summary>
    private async Task EnsureQueueExistsAsync(CancellationToken cancellationToken)
    {
        if (!createQueueIfMissing || queueVerified)
        {
            return;
        }

        await queueClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);
        queueVerified = true;
    }

    /// <summary>
    /// Gets the queue name based on the current environment.
    /// </summary>
    private static string GetEnvironmentQueueName()
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "unknown-env";
        // Azure Queue names must be lowercase, 3-63 chars, alphanumeric and dashes only
        return $"analysis-jobs-{env}".ToLowerInvariant();
    }
}
