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
    /// Creates a new TestResult containing the test result for offline support.
    /// </summary>
    /// <returns></returns>
    public TestResult GetOfflineTestResult()
    {
        var supportsOffline = this.OfflineAudit?.Score == 0;
        return new TestResult
        {
            Result = supportsOffline,
            InfoString = supportsOffline
                ? "Has offline support"
                : "Does not have offline support",
            Category = "optional",
            Member = "offline_support",
        };
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