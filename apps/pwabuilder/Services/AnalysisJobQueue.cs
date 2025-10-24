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
    private readonly IPWABuilderDatabase db;
    private readonly ILogger<AnalysisJobQueue> logger;

    /// <summary>
    /// Creates a new AnalysisJobQueue.
    /// </summary>
    /// <param name="database"></param>
    /// <param name="env"></param>
    /// <param name="settings"></param>
    /// <param name="logger"></param>
    public AnalysisJobQueue(IPWABuilderDatabase database, IOptions<AppSettings> settings, ILogger<AnalysisJobQueue> logger)
    {
        this.db = database;
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
            await this.db.EnqueueAsync(this.QueueId, job);
            logger.LogInformation("Enqueued analysis job for {analysisId} from {queue}", job.AnalysisId, QueueId);
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
            var job = await db.DequeueAsync<AnalysisJob>(QueueId);
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