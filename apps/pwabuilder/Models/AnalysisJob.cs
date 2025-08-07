namespace PWABuilder.Models;

/// <summary>
/// An asynchronous job to analyze a web app URL for progressive web app capabilities.
/// </summary>
public class AnalysisJob
{
    /// <summary>
    /// The ID of the analysis job.
    /// </summary>
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// The ID of the Analysis object that this job is associated with.
    /// </summary>
    public required string AnalysisId { get; init; }

    /// <summary>
    /// The date the analysis job was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// The URL that will be analyzed by this job.
    /// </summary>
    public required Uri Url { get; init; }

    /// <summary>
    /// The number of times this job has been retried.
    /// </summary>
    public int RetryCount { get; set; }
}