using PWABuilder.Validations.Models;
using System.Collections.Concurrent;
using System.Text.Json.Serialization;

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
    /// Gets the date and time the analysis was last modified.
    /// </summary>
    public DateTimeOffset LastModifiedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// How long the analysis took to complete.
    /// </summary>
    public TimeSpan? Duration { get; set; }

    /// <summary>
    /// The status of the analysis.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public AnalysisStatus Status { get; set; } = AnalysisStatus.Queued;

    /// <summary>
    /// An error that occurred while running the analysis, if any. This should be set only when we failed to analyze a URL.
    /// </summary>
    public string? Error { get; set; }

    /// <summary>
    /// Information about the detected web manifest.
    /// </summary>
    public ManifestDetection? WebManifest { get; set; }

    /// <summary>
    /// Information about the detected service worker.
    /// </summary>
    public ServiceWorkerDetection? ServiceWorker { get; set; }

    /// <summary>
    /// The Lighthouse report containing detailed metrics about the web app's manifest, service worker, and HTTPS conformance.
    /// </summary>
    public LighthouseReport? LighthouseReport { get; set; }

    /// <summary>
    /// Logs generated during the analysis. This is intended for debugging purposes and may be shown to the user if their analysis fails.
    /// </summary>
    public List<string> Logs { get; init; } = [];

    /// <summary>
    /// Indicates whether the app can be packaged for app stores.
    /// </summary>
    public bool? CanPackage => this.MeetsRequirementsForStorePackaging();

    /// <summary>
    /// Generates an ID for an Analysis using the URI and the current time. This ID is intended for Redis cache.
    /// </summary>
    /// <param name="uri">The URI of the analysis to generate an ID for.</param>
    /// <returns>A Redis-cache compatible ID to be used as the key for the object in Redis.</returns>
    public static string GetId(Uri uri)
    {
        var hash = uri.GetHashCode() + DateTime.UtcNow.GetHashCode();
        var hashStr = Math.Abs(hash).ToString();

        // Grab the last 6 characters of this hash code and use that to generate a unique ID.
        var lastSixChars = hashStr[^Math.Min(6, hashStr.Length)..];
        return $"analysis:{uri.Host}:{lastSixChars}";
    }

    public bool MeetsRequirementsForStorePackaging()
    {
        // We must have a manifest.
        if (this.WebManifest == null)
        {
            return false;
        }

        // All required fields must be valid.
        var allRequiredFieldsValid = this.WebManifest.Validations
            .Where(v => v.Category == "required")
            .All(v => v.Valid == true);

        return allRequiredFieldsValid;
    }
}