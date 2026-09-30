using System.Text.Json.Serialization;

namespace PWABuilder.Models;

/// <summary>A safe analysis check containing only enum values.</summary>
/// <param name="Id">The known check identifier.</param>
/// <param name="Status">The known check status.</param>
public sealed record SupportCheck(PwaCapabilityId Id, PwaCapabilityCheckStatus Status);

/// <summary>An admin-only projection; never includes manifests, unsanitized text, or packaging objects.</summary>
/// <param name="Id">The analysis identifier.</param>
/// <param name="SiteOrigin">The site origin without credentials, path, query, or fragment.</param>
/// <param name="Status">The analysis status.</param>
/// <param name="CreatedAt">Creation time.</param>
/// <param name="UpdatedAt">Last update time.</param>
/// <param name="FailureSummary">A fixed, non-sensitive failure summary.</param>
/// <param name="Checks">Structured check outcomes without free-text messages.</param>
/// <param name="Error">Bounded, sanitized failure detail.</param>
/// <param name="Logs">Bounded, sanitized processing logs.</param>
public sealed record SupportAnalysis(string Id, string SiteOrigin, AnalysisStatus Status,
    DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt, string FailureSummary, IReadOnlyList<SupportCheck> Checks,
    string Error, IReadOnlyList<string> Logs);

/// <summary>Selected Cosmos fields used only inside the backend before sanitization.</summary>
public sealed class SupportAnalysisData
{
    /// <summary>The analysis identifier.</summary>
    public string Id { get; init; } = "";
    /// <summary>The input URL, removed before returning a support projection.</summary>
    public string Url { get; init; } = "";
    /// <summary>The stored analysis state.</summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public AnalysisStatus Status { get; init; }
    /// <summary>Creation time.</summary>
    public DateTimeOffset CreatedAt { get; init; }
    /// <summary>Last update time.</summary>
    public DateTimeOffset UpdatedAt { get; init; }
    /// <summary>Only known capability identifiers and outcomes.</summary>
    public List<SupportAnalysisCheckData> Checks { get; init; } = [];
    /// <summary>The stored error; sanitized before leaving the support service.</summary>
    public string? Error { get; init; }
    /// <summary>Stored logs selected only for a detail read and sanitized before rendering.</summary>
    public List<string> Logs { get; init; } = [];
}

/// <summary>A narrow Cosmos projection of a capability.</summary>
public sealed class SupportAnalysisCheckData
{
    /// <summary>The capability identifier.</summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PwaCapabilityId Id { get; init; }
    /// <summary>The capability status.</summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PwaCapabilityCheckStatus Status { get; init; }
}

/// <summary>Input contract for the separate, redacted CloudAPK diagnostics key, not a raw package job.</summary>
public sealed class PackageDiagnosticsData
{
    /// <summary>The opaque support reference.</summary>
    public string SupportReference { get; init; } = "";
    /// <summary>The job status.</summary>
    public string Status { get; init; } = "";
    /// <summary>Creation time.</summary>
    public DateTimeOffset CreatedAt { get; init; }
    /// <summary>Last update time.</summary>
    public DateTimeOffset UpdatedAt { get; init; }
    /// <summary>Number of retries.</summary>
    public int RetryCount { get; init; }
    /// <summary>The supplied site origin, sanitized again before rendering.</summary>
    public string SiteOrigin { get; init; } = "";
    /// <summary>Only display metadata and signing-presence indicators are deserialized.</summary>
    public PackageSupportConfiguration? Configuration { get; init; }
    /// <summary>Redacted producer logs, sanitized again before private display.</summary>
    public List<string> Logs { get; init; } = [];
    /// <summary>Redacted producer errors, sanitized again before private display.</summary>
    public List<string> Errors { get; init; } = [];
}

/// <summary>Excludes signing material and artifacts; only mode and boolean presence indicators are permitted.</summary>
public sealed class PackageSupportConfiguration
{
    /// <summary>The app name.</summary>
    public string Name { get; init; } = "";
    /// <summary>The Android package identifier.</summary>
    public string PackageId { get; init; } = "";
    /// <summary>The app version.</summary>
    public string AppVersion { get; init; } = "";
    /// <summary>The numeric version code.</summary>
    public int? AppVersionCode { get; init; }
    /// <summary>The minimum Android SDK version.</summary>
    public int? MinSdkVersion { get; init; }
    /// <summary>The allowlisted mode: new, mine, none, or unknown.</summary>
    public string SigningMode { get; init; } = "unknown";
    /// <summary>Whether an uploaded signing key was supplied, never the key itself.</summary>
    public bool HasUploadedKey { get; init; }
    /// <summary>Whether a key password was supplied, never its value.</summary>
    public bool HasKeyPassword { get; init; }
    /// <summary>Whether a store password was supplied, never its value.</summary>
    public bool HasStorePassword { get; init; }
}

/// <summary>A safe package support view without raw job objects or signing material.</summary>
/// <param name="SupportReference">Opaque support reference.</param>
/// <param name="Status">Allowlisted status.</param>
/// <param name="CreatedAt">Creation time.</param>
/// <param name="UpdatedAt">Last update time.</param>
/// <param name="RetryCount">Bounded retry count.</param>
/// <param name="SiteOrigin">Sanitized origin.</param>
/// <param name="Configuration">Package metadata and signing-presence indicators, never signing material.</param>
/// <param name="Stages">Fixed stage labels, never raw logs.</param>
/// <param name="FailureSummary">Fixed failure summary, never raw errors.</param>
/// <param name="Logs">Bounded, sanitized producer logs.</param>
/// <param name="Errors">Bounded, sanitized producer errors.</param>
public sealed record SupportPackage(Guid SupportReference, string Status, DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt, int RetryCount, string SiteOrigin, PackageSupportConfiguration Configuration,
    IReadOnlyList<string> Stages, string FailureSummary, IReadOnlyList<string> Logs, IReadOnlyList<string> Errors);

/// <summary>The bounded, recent failure lists shown on the dashboard.</summary>
/// <param name="Analyses">Recent analysis failures.</param>
/// <param name="Packages">Recent package failures.</param>
public sealed record SupportDashboard(IReadOnlyList<SupportAnalysis> Analyses, IReadOnlyList<SupportPackage> Packages);
