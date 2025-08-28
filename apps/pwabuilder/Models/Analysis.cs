using PWABuilder.Services;
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
    public required Uri Url { get; init; }

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
    public bool CanPackage => this.MeetsRequirementsForStorePackaging();

    /// <summary>
    /// The capability checks of the PWA.
    /// </summary>
    public List<PwaCapability> Capabilities { get; init; } =
        [
            .. PwaCapability.CreateManifestCapabilities(),
            .. PwaCapability.CreateServiceWorkerCapabilities(),
            .. PwaCapability.CreateHttpsCapabilities()
        ];

    /// <summary>
    /// Generates an ID for an Analysis using the URI and the current time. This ID is intended for Redis cache.
    /// </summary>
    /// <param name="uri">The URI of the analysis to generate an ID for.</param>
    /// <returns>A Redis cache-compatible ID to be used as the key for the object in Redis.</returns>
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
        var allRequiredFieldsValid = this.Capabilities.Count > 0
            && this.Capabilities
            .Where(v => v.Level == PwaCapabilityLevel.Required && v.Category != PwaCapabilityCategory.Https) // Skip HTTPS check here because Lighthouse takes too long.
            .All(v => v.Status == PwaCapabilityCheckStatus.Passed);

        return allRequiredFieldsValid;
    }

    /// <summary>
    /// Updates this analysis's capabilities based on the Lighthouse report.
    /// </summary>
    /// <param name="lighthouseReport"></param>
    public void ProcessLighthouseReport(LighthouseReport? lighthouseReport, ILogger logger)
    {
        var offlineCapability = this.Capabilities.First(c => c.Id == PwaCapabilityId.OfflineSupport);
        var httpsCapability = this.Capabilities.First(c => c.Id == PwaCapabilityId.HasHttps);
        var noMixedContentCapability = this.Capabilities.First(c => c.Id == PwaCapabilityId.NoMixedContent);
        var hasManifestCapability = this.Capabilities.First(c => c.Id == PwaCapabilityId.HasManifest);

        // No lighthouse report? Mark these as skipped, and mark the "has manifest" capability as failed if we're still waiting for it.
        if (lighthouseReport == null)
        {
            offlineCapability.Status = PwaCapabilityCheckStatus.Skipped;
            httpsCapability.Status = PwaCapabilityCheckStatus.Skipped;
            noMixedContentCapability.Status = PwaCapabilityCheckStatus.Skipped;
            if (hasManifestCapability.Status == PwaCapabilityCheckStatus.InProgress)
            {
                hasManifestCapability.Status = PwaCapabilityCheckStatus.Failed;
            }
            return;
        }

        offlineCapability.Status = lighthouseReport.GetOfflineCapability();
        httpsCapability.Status = lighthouseReport.GetHttpsCapability();
        noMixedContentCapability.Status = lighthouseReport.GetNoMixedContentCapability();

        // If the "has manifest" capability is still processing, update it based on the Lighthouse report.
        if (hasManifestCapability.Status == PwaCapabilityCheckStatus.InProgress)
        {
            hasManifestCapability.Status = lighthouseReport.GetHasManifestCapability();
        }
    }

    /// <summary>
    /// Update this analysis's capabilities based on the provided list.
    /// </summary>
    /// <param name="capabilities">A list of PwaCapability objects containing <see cref="PwaCapability.Status"/> updates.</param>
    public void ProcessCapabilities(List<PwaCapability> capabilities)
    {
        foreach (var capability in capabilities)
        {
            var existingCapability = this.Capabilities.First(c => c.Id == capability.Id);
            existingCapability.Status = capability.Status;
        }
    }
}