namespace PWABuilder.Models;

/// <summary>
/// A web app URL that was analyzed with PWABuilder.
/// </summary>
public class Analysis
{
    /// <summary>
    /// The ID of the analysis.
    /// </summary>
    public required string Id { get; set; }

    /// <summary>
    /// The URL that was analyzed.
    /// </summary>
    public required string Url { get; init; }

    /// <summary>
    /// The date the URL was analyzed.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// How long the analysis took to complete.
    /// </summary>
    public TimeSpan? Duration { get; set; }

    /// <summary>
    /// The status of the analysis.
    /// </summary>
    public AnalysisStatus Status { get; set; } = AnalysisStatus.Queued;

    /// <summary>
    /// An error that occurred while running the analysis, if any. This should be set only when we failed to analyze a URL.
    /// </summary>
    public string? Error { get; set; }

    /// <summary>
    /// The report generated when an analysis is completed. This will be null if the analysis has not yet completed or if it failed.
    /// </summary>
    public AnalysisReport? Report { get; set; }

    /// <summary>
    /// The list of app store packages the user generated for his PWA after analysis.
    /// </summary>
    public List<AppStorePackageResult> Packages { get; set; } = [];

    /// <summary>
    /// Generates an ID for an Analysis using the URI and the current time. This ID is intended for Redis cache.
    /// </summary>
    /// <param name="uri">The URI of the analysis to generate an ID for.</param>
    /// <returns>A Redis-cache compatible ID to be used as the key for the object in Redis.</returns>
    public static string GetId(Uri uri)
    {
        return $"analysis:{uri.GetHashCode()}:{DateTime.UtcNow:o}";
    }
}