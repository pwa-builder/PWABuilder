using System.Text.Json;

namespace PWABuilder.Models;

/// <summary>
/// An asynchronous job to package a PWA for the Google Play Store.
/// </summary>
public class GooglePlayPackageJob
{
    /// <summary>
    /// The ID of the store package job.
    /// </summary>
    public string? Id { get; set; }

    /// <summary>
    /// The ID of the <see cref="Analysis"/> object whose PWA will be packaged into a Google Play Store app.
    /// </summary>
    public required string AnalysisId { get; init; }

    /// <summary>
    /// The date the store package job was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// The number of times this job has been retried.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// A list of errors that occurred while processing this job, if any.
    /// </summary>
    public List<string> Errors { get; set; } = [];

    /// <summary>
    /// The options used to create the Google Play package.
    /// </summary>
    public required JsonElement PackageOptions { get; set; }

    /// <summary>
    /// Generates an ID for the job using the URI and the current time. This ID is intended for use in Redis cache.
    /// </summary>
    /// <param name="uri">The URI of the analysis to generate an ID for.</param>
    /// <returns>A Redis cache-compatible ID to be used as the key for the object in Redis.</returns>
    public static string GetId(Uri uri)
    {
        var hash = uri.GetHashCode() + DateTime.UtcNow.GetHashCode();
        var hashStr = Math.Abs(hash).ToString();

        // Grab the last 6 characters of this hash code and use that to generate a unique ID.
        var lastSixChars = hashStr[^Math.Min(6, hashStr.Length)..];
        return $"googleplaypackagejob:{uri.Host}:{lastSixChars}";
    }

    /// <summary>
    /// Logs generated during processing of this job, if any. This may be displayed to the user.
    /// </summary>
    public List<string> Logs { get; set; } = [];
}