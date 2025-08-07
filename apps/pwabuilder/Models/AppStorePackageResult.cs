namespace PWABuilder.Models;

/// <summary>
/// Info about a PWA that was analyzed with PWABuilder and packaged for an app store.
/// </summary>
public class AppStorePackageResult
{
    /// <summary>
    /// The app store the PWA was packaged for.
    /// </summary>
    public AppStore AppStore { get; set; }

    /// <summary>
    /// The date the PWA packaging was started.
    /// </summary>
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// How long the packaging took to complete.
    /// </summary>
    public TimeSpan? Duration { get; set; }

    /// <summary>
    /// The error that occurred while packaging 
    /// </summary>
    public string? Error { get; set; }

    /// <summary>
    /// The status of the packaging process.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// The details sent to the packaging service.
    /// </summary>
    public Dictionary<string, object> PackagingDetails { get; set; } = new Dictionary<string, object>();
}