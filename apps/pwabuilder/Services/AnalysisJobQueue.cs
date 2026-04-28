using Azure.Identity;
using Azure.Storage.Queues;
using Microsoft.Extensions.Options;
using PWABuilder.Models;
using System.Collections.Concurrent;

namespace PWABuilder.Services;

/// <summary>
/// Manages the queue of AnalysisJobs to process. In development env, it uses <see cref="InMemoryAnalysisJobQueue"/>. Otherwise, it uses Redis atomic lists.
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
/// The queue for managing AnalysisJobs. The backing store is a Redis list.
/// </summary>
public class AnalysisJobQueue : IAnalysisJobQueue
{
    private readonly IRedisCache redis;
    private readonly AnalysisJobProcessorHealthMonitor healthMonitor;
    private readonly ILogger<AnalysisJobQueue> logger;

    /// <summary>
    /// Creates a new AnalysisJobQueue.
    /// </summary>
    /// <param name="redis"></param>
    /// <param name="env"></param>
    /// <param name="logger"></param>
    public AnalysisJobQueue(IRedisCache redis, AnalysisJobProcessorHealthMonitor healthMonitor, ILogger<AnalysisJobQueue> logger)
    {
        this.redis = redis;
        this.healthMonitor = healthMonitor;
        this.logger = logger;
    }

    /// <summary>
    /// Enqueues an AnalysisJob to the Redis list for processing.
    /// </summary>
    /// <param name="job"></param>
    /// <returns></returns>
    public async Task EnqueueAsync(AnalysisJob job)
    {
        try
        {
            var queueLength = await this.redis.EnqueueAsync(this.QueueId, job);
            logger.LogInformation("Enqueued analysis job for {analysisId} from {queue}. Queue length: {queueLength}", job.AnalysisId, QueueId, queueLength);
            healthMonitor.AnalysisQueueLength = queueLength;
            if (queueLength > 500)
            {
                var oldestJobInQueue = await this.DequeueAsync(CancellationToken.None);
                logger.LogError("More than 500 analysis jobs are in the queue. This may indicate a problem with the AnalysisJobProcessor. Oldest job in queue: {oldestJobInQueue}", oldestJobInQueue?.AnalysisId ?? "[null]");
            }
            else if (queueLength > 100)
            {
                logger.LogWarning("More than 100 analysis jobs are in the queue. Monitor the queue length to ensure it's not growing too large.");
            }
        }
        catch (Exception error)
        {
            logger.LogError(error, "Error enqueuing AnalysisJob.");
            throw;
        }
    }

    /// <summary>
    /// Dequeues an AnalysisJob from the queue.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    public async Task<AnalysisJob?> DequeueAsync(CancellationToken cancellationToken)
    {
        try
        {
            var job = await redis.DequeueAsync<AnalysisJob>(QueueId);
            if (job != null)
            {
                logger.LogInformation("Dequeued analysis job for {analysisId} from {queue}", job.AnalysisId, QueueId);
            }

            return job;
        }
        catch (Exception error)
        {
            logger.LogError(error, "Error dequeuing AnalysisJob");
            throw;
        }
    }

    /// <summary>
    /// Gets the ID of the analysis list item in Redis. This must be a prop: if we swap staging and production in Azure, it needs to use the correct env.
    /// </summary>
    private string QueueId => $"analysis-jobs-{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "unknown-env"}";
}