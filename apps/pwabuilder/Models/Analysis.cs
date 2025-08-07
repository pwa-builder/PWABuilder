using Azure;
using Azure.Data.Tables;

namespace PWABuilder.Models;

/// <summary>
/// A web app URL that was analyzed with PWABuilder.
/// </summary>
public class Analysis : ITableEntity
{
    /// <summary>
    /// The ID of the analysis.
    /// </summary>
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// The URL that was analyzed.
    /// </summary>
    public required Uri Url { get; init; }

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

    # region ITableEntity implementation

    public string PartitionKey { get => this.CreatedAt.Year.ToString(); set => throw new NotImplementedException(); }
    public string RowKey { get => this.Id; set => this.Id = value; }
    public DateTimeOffset? Timestamp { get => this.CreatedAt; set => this.CreatedAt = value ?? DateTimeOffset.UtcNow; }
    public ETag ETag { get; set; }
    
    #endregion
}