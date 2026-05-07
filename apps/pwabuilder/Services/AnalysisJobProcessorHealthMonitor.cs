using System.Collections.Concurrent;
using PWABuilder.Models;

namespace PWABuilder.Services;

public class AnalysisJobProcessorHealthMonitor
{
    private static readonly TimeSpan JobWindow = TimeSpan.FromHours(1);

    private readonly ConcurrentQueue<DateTime> completedJobTimestamps = new();
    private readonly ConcurrentQueue<DateTime> startedJobTimestamps = new();
    private readonly DateTimeOffset runningTime = DateTimeOffset.UtcNow;
    private readonly IRedisCache redis;
    private readonly IWebHostEnvironment env;

    public AnalysisJobProcessorHealthMonitor(IWebHostEnvironment env, IRedisCache redis)
    {
        this.redis = redis;
        this.env = env;
    }

    /// <summary>
    /// Whether the job processor has been stopped.
    /// </summary>
    public bool JobProcessorStopped { get; private set; }

    /// <summary>
    /// The length of the analysis queue.
    /// </summary>
    public long AnalysisQueueLength { get; set; }

    /// <summary>
    /// The number of jobs that have been completed total.
    /// </summary>
    public long JobsCompletedCount { get; private set; }

    /// <summary>
    /// The number of jobs that have been completed in the last hour.
    /// </summary>
    public long JobsCompletedInLastHourCount
    {
        get
        {
            PruneCompletedJobs();
            return completedJobTimestamps.Count;
        }
    }

    /// <summary>
    /// The number of jobs that have been started in the last hour.
    /// </summary>
    public long JobsStartedInLastHourCount
    {
        get
        {
            PruneStartedJobs();
            return startedJobTimestamps.Count;
        }
    }

    /// <summary>
    /// How long the app has been running.
    /// </summary>
    public TimeSpan RunningTime => DateTimeOffset.UtcNow - runningTime;

    /// <summary>
    /// Gets the current length of the Google Play package job queue from Redis.
    /// </summary>
    /// <returns></returns>
    public Task<long> GetGooglePlayPackageQueueLength() => redis.GetQueueLength(env.IsProduction() ? "googleplaypackagejobs-prod" : "googleplaypackagejobs-nonprod");

    /// <summary>
    /// Records that an analysis job has been started.
    /// </summary>
    public void MarkAnalysisAsStarted()
    {
        startedJobTimestamps.Enqueue(DateTime.UtcNow);
        PruneStartedJobs();
    }

    /// <summary>
    /// Records that an analysis job has been completed.
    /// </summary>
    public void MarkAnalysisAsCompleted()
    {
        completedJobTimestamps.Enqueue(DateTime.UtcNow);
        PruneCompletedJobs();

        JobsCompletedCount++;
    }

    /// <summary>
    /// Records that job processing has been cancelled. This may indicate a problem with the AnalysisJobProcessor background service, so the JobProcessorStopped property is set to true to indicate this.
    /// </summary>
    public void JobProcessingCancelled()
    {
        this.JobProcessorStopped = true;
    }

    private void PruneCompletedJobs()
    {
        var cutoff = DateTime.UtcNow - JobWindow;
        while (completedJobTimestamps.TryPeek(out var oldest) && oldest < cutoff)
        {
            completedJobTimestamps.TryDequeue(out _);
        }
    }

    private void PruneStartedJobs()
    {
        var cutoff = DateTime.UtcNow - JobWindow;
        while (startedJobTimestamps.TryPeek(out var oldest) && oldest < cutoff)
        {
            startedJobTimestamps.TryDequeue(out _);
        }
    }
}
