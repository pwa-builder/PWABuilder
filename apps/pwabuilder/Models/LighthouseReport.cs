using PWABuilder.Validations.Models;
using System.Text.Json.Serialization;

namespace PWABuilder.Models;

/// <summary>
/// Represents a Lighthouse report result. This is the type returned by the Lighthouse API. We've omitted some unused fields from the raw JSON report.
/// </summary>
public sealed class LighthouseReport
{
    public string? LighthouseVersion { get; set; }
    public string? RequestedUrl { get; set; }
    public string? MainDocumentUrl { get; set; }
    public string? FinalDisplayedUrl { get; set; }
    public string? FinalUrl { get; set; }
    public DateTime FetchTime { get; set; }
    public string? GatherMode { get; set; }
    public List<string>? RunWarnings { get; set; }
    public string? UserAgent { get; set; }
    public Dictionary<string, LighthouseAudit>? Audits { get; set; }

    /// <summary>
    /// Helper that gets the "is-on-https" audit.
    /// </summary>
    [JsonIgnore]
    public LighthouseAudit? IsOnHttpsAudit => GetAuditByName("is-on-https");

    /// <summary>
    /// Helper that gets the "https-audit" audit.
    /// </summary>
    [JsonIgnore]
    public LighthouseAudit? HttpsAudit => GetAuditByName("https-audit");

    /// <summary>
    /// Helper that gets the "installable-manifest" audit.
    /// </summary>
    [JsonIgnore]
    public LighthouseAudit? InstallableManifestAudit => GetAuditByName("installable-manifest");

    /// <summary>
    /// Helper that gets the "service-worker-audit" audit.
    /// </summary>
    [JsonIgnore]
    public LighthouseAudit? ServiceWorkerAudit => GetAuditByName("service-worker-audit");

    /// <summary>
    /// Helper that gets the "web-app-manifest-raw-audit" audit.
    /// </summary>
    [JsonIgnore]
    public LighthouseAudit? WebAppManifestAudit => GetAuditByName("web-app-manifest-raw-audit");

    /// <summary>
    /// Helper that gets the "offline-audit" audit.
    /// </summary>
    [JsonIgnore]
    public LighthouseAudit? OfflineAudit => GetAuditByName("offline-audit");

    /// <summary>
    /// Gets whether the Lighthouse report's determination of the PWA's offline capability.
    /// </summary>
    /// <returns><see cref="PwaCapabilityCheckStatus.Skipped"/> if the Ligthouse report failed to test for offline capability, otherwise Passed or Failed.</returns>
    public PwaCapabilityCheckStatus GetOfflineCapability()
    {
        if (this.OfflineAudit == null || this.ServiceWorkerAudit == null || this.ServiceWorkerAudit.Score != 1)
        {
            return PwaCapabilityCheckStatus.Skipped;
        }

        return this.OfflineAudit.Score == 1 ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    /// <summary>
    /// Gets a status indicating whether the Lighthouse report has indicated whether the analyzed PWA is served over HTTPS.
    /// </summary>
    /// <returns></returns>
    public PwaCapabilityCheckStatus GetHttpsCapability()
    {
        if (this.HttpsAudit == null)
        {
            return PwaCapabilityCheckStatus.Skipped;
        }

        return this.HttpsAudit.Score == 1 ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    /// <summary>
    /// Gets a status indicating whether the Lighthouse report has indicated whether the analyzed PWA is served over HTTPS.
    /// </summary>
    /// <returns></returns>
    public PwaCapabilityCheckStatus GetNoMixedContentCapability()
    {
        // Skip this if there is not HTTPS audit in the report, or if the web app wasn't served over HTTPS at all.
        if (this.IsOnHttpsAudit == null || this.GetHttpsCapability() == PwaCapabilityCheckStatus.Failed)
        {
            return PwaCapabilityCheckStatus.Skipped;
        }

        return this.IsOnHttpsAudit.Score == 1 ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
    }

    /// <summary>
    /// Gets a status indicating whether the Lighthouse report has detected a valid web app manifest.
    /// </summary>
    /// <returns></returns>
    public PwaCapabilityCheckStatus GetHasManifestCapability()
    {
        var manifestUrl = this.WebAppManifestAudit?.Details?.ManifestUrl;
        var manifestRaw = this.WebAppManifestAudit?.Details?.ManifestRaw;
        if (manifestUrl != null && manifestRaw != null)
        {
            return PwaCapabilityCheckStatus.Passed;
        }

        return PwaCapabilityCheckStatus.Failed;
    }

    private LighthouseAudit? GetAuditByName(string name)
    {
        if (this.Audits?.TryGetValue(name, out var audit) == true)
        {
            return audit;
        }
        return null;
    }
}

/// <summary>
/// Represents a Lighthouse audit.
/// </summary>
public sealed class LighthouseAudit
{
    public string? Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public double? Score { get; set; }
    public string? ScoreDisplayMode { get; set; }
    public List<string>? Warnings { get; set; }
    public LighthouseAuditDetails? Details { get; set; }
    public string? Error { get; set; }
}

/// <summary>
/// Represents details for a Lighthouse audit.
/// </summary>
public sealed class LighthouseAuditDetails
{
    public string? Type { get; set; }
    public List<object>? Headings { get; set; }
    public List<object>? Items { get; set; }
    public string? ManifestUrl { get; set; }
    public string? ManifestRaw { get; set; }
    public string? ScriptUrl { get; set; }
    public string? ScopeUrl { get; set; }
    public string? Error { get; set; }
}