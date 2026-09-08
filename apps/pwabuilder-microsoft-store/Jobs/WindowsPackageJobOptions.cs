using System.ComponentModel.DataAnnotations;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>Opt-in configuration for durable Windows packaging.</summary>
public sealed class WindowsPackageJobOptions
{
    /// <summary>Enables the asynchronous API and its storage dependencies.</summary>
    public bool Enabled { get; set; }

    /// <summary>Runs workers in this instance; disable on API-only instances.</summary>
    public bool RunWorkers { get; set; } = true;

    /// <summary>Azure Queue Storage service URI, without a queue name.</summary>
    public string QueueServiceUri { get; set; } = string.Empty;

    /// <summary>Environment-specific queue name. The poison queue adds "-poison".</summary>
    public string QueueName { get; set; } = string.Empty;

    /// <summary>Azure Blob Storage service URI.</summary>
    public string BlobServiceUri { get; set; } = string.Empty;

    /// <summary>Private container for inputs and outputs.</summary>
    public string BlobContainerName { get; set; } = string.Empty;

    /// <summary>Dedicated Cosmos container, partitioned on /id, in AppSettings' database.</summary>
    public string CosmosContainerName { get; set; } = string.Empty;

    /// <summary>Maximum queued builds running on this instance.</summary>
    [Range(1, 16)]
    public int WorkerCount { get; set; } = 1;

    /// <summary>Maximum attempts, including recovery after a worker crash.</summary>
    [Range(1, 10)]
    public int MaxAttempts { get; set; } = 3;

    /// <summary>Time to process and download a job before it expires.</summary>
    [Range(1, 720)]
    public int JobLifetimeHours { get; set; } = 168;

    /// <summary>Maximum duration of one build attempt, independent of HTTP connections.</summary>
    [Range(1, 120)]
    public int AttemptTimeoutMinutes { get; set; } = 30;

    /// <summary>Queue visibility and exclusive job ownership duration.</summary>
    [Range(30, 600)]
    public int VisibilitySeconds { get; set; } = 120;

    /// <summary>Renewal interval, at most one third of the visibility duration.</summary>
    [Range(1, 120)]
    public int RenewalSeconds { get; set; } = 30;

    /// <summary>Idle polling interval for workers and pending dispatch records.</summary>
    [Range(1, 60)]
    public int PollSeconds { get; set; } = 2;

    /// <summary>Initial retry delay, exponentially increased up to ten minutes.</summary>
    [Range(1, 300)]
    public int RetryDelaySeconds { get; set; } = 30;
}
