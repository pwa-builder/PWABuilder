using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>Reads and sanitizes the separate support diagnostics contract.</summary>
public sealed class SupportDiagnosticsService
{
    /// <summary>Maximum results per recent-failures list.</summary>
    public const int RecentLimit = 50;
    /// <summary>Maximum age of diagnostics visible through support.</summary>
    public static readonly TimeSpan Retention = TimeSpan.FromDays(14);

    private readonly IRedisCache cache;

    /// <summary>Uses the shared Redis cache; AzureRedisHost must point at CloudAPK's database.</summary>
    public SupportDiagnosticsService(IRedisCache cache)
    {
        this.cache = cache;
    }

    /// <summary>Reads only a prefixed diagnostics key, never a raw job or artifact key.</summary>
    public async Task<SupportPackage?> GetPackageAsync(Guid supportReference, bool includeDetails = true)
    {
        if (supportReference == Guid.Empty)
        {
            return null;
        }
        var data = await cache.GetPackageDiagnosticsAsync(supportReference);
        return ProjectPackage(data, supportReference, DateTimeOffset.UtcNow, includeDetails);
    }

    /// <summary>Reads at most fifty failures from the bounded time-window index; no Redis key scanning.</summary>
    public async Task<IReadOnlyList<SupportPackage>> GetRecentPackagesAsync()
    {
        return (await GetPackagesPageAsync(new SupportPageRequest(DateTimeOffset.UtcNow))).Items;
    }

    /// <summary>Reads a bounded index page and only its separate diagnostics keys, never raw jobs.</summary>
    public async Task<SupportPage<SupportPackage>> GetPackagesPageAsync(SupportPageRequest request)
    {
        var references = await cache.GetFailedPackageReferencesPageAsync(request);
        var packages = new List<SupportPackage>();
        foreach (var entry in references.Items)
        {
            if (Guid.TryParseExact(entry.Reference, "D", out var id))
            {
                var data = await cache.GetPackageDiagnosticsAsync(id);
                var package = ProjectPackage(data, id, request.UpperBound, includeDetails: false);
                if (package?.Status is "Failed" && package.UpdatedAt <= request.UpperBound)
                {
                    packages.Add(package);
                }
            }
        }
        return new SupportPage<SupportPackage>(packages, references.ContinuationToken);
    }

    /// <summary>Reduces a URL to its HTTP(S) origin, stripping credentials and all user-controlled path data.</summary>
    public static string SanitizeOrigin(string? value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme is "https" or "http"
            ? new UriBuilder(uri.Scheme, uri.Host, uri.IsDefaultPort ? -1 : uri.Port).Uri.GetLeftPart(UriPartial.Authority)
            : "(unavailable)";

    /// <summary>Converts an analysis to a strictly allowlisted support view.</summary>
    public static SupportAnalysis ProjectAnalysis(Analysis analysis, bool includeDetails = true) => ProjectAnalysis(new SupportAnalysisData
    {
        Id = analysis.Id,
        Url = analysis.Url.AbsoluteUri,
        Status = analysis.Status,
        CreatedAt = analysis.CreatedAt,
        UpdatedAt = analysis.LastModifiedAt,
        Error = analysis.Error,
        Logs = includeDetails ? analysis.Logs.TakeLast(SupportDiagnosticSanitizer.MaximumLogs).ToList() : [],
        Checks = analysis.Capabilities.Select(check => new SupportAnalysisCheckData { Id = check.Id, Status = check.Status }).ToList()
    }, includeDetails);

    /// <summary>Sanitizes the narrow Cosmos query projection before it leaves the backend.</summary>
    public static SupportAnalysis ProjectAnalysis(SupportAnalysisData data, bool includeDetails = true) => new(
        new string(data.Id.Where(character => !char.IsControl(character)).Take(256).ToArray()),
        SanitizeOrigin(data.Url), data.Status, data.CreatedAt, data.UpdatedAt,
        data.Status is AnalysisStatus.Failed ? FailureSummary([data.Error ?? ""], "Analysis failed.") : "No analysis execution failure.",
        data.Checks.Where(check => Enum.IsDefined(check.Id) && Enum.IsDefined(check.Status))
            .Take(100).Select(check => new SupportCheck(check.Id, check.Status)).ToArray(),
        includeDetails ? SupportDiagnosticSanitizer.Sanitize(data.Error) : "",
        includeDetails ? SupportDiagnosticSanitizer.SanitizeEntries(data.Logs, SupportDiagnosticSanitizer.MaximumLogs) : []);

    /// <summary>Validates retention and identity and discards raw strings that may contain secrets.</summary>
    public static SupportPackage? ProjectPackage(PackageDiagnosticsData? data, Guid reference, DateTimeOffset now,
        bool includeDetails = true)
    {
        if (data is null || reference == Guid.Empty
            || !Guid.TryParseExact(data.SupportReference, "D", out var actual) || actual != reference
            || data.UpdatedAt < now - Retention || data.UpdatedAt > now.AddMinutes(5)
            || data.CreatedAt == default || data.CreatedAt > data.UpdatedAt
            || data.Status is not ("Queued" or "InProgress" or "Completed" or "Failed"))
        {
            return null;
        }
        var config = data.Configuration;
        var safeConfig = new PackageSupportConfiguration
        {
            Name = SafeText(config?.Name),
            PackageId = SafeText(config?.PackageId),
            AppVersion = SafeText(config?.AppVersion),
            AppVersionCode = config?.AppVersionCode,
            MinSdkVersion = config?.MinSdkVersion,
            SigningMode = config?.SigningMode is "none" or "new" or "mine" ? config.SigningMode : "unknown",
            HasUploadedKey = config?.HasUploadedKey is true,
            HasKeyPassword = config?.HasKeyPassword is true,
            HasStorePassword = config?.HasStorePassword is true
        };
        return new SupportPackage(reference, data.Status, data.CreatedAt, data.UpdatedAt,
            Math.Clamp(data.RetryCount, 0, 1000), SanitizeOrigin(data.SiteOrigin), safeConfig,
            includeDetails ? (data.Logs ?? []).Take(200).Select(ClassifyStage).Distinct().Take(10).ToArray() : [],
            data.Status is "Failed" ? FailureSummary(data.Errors ?? [], "Packaging failed.") : "No packaging failure.",
            includeDetails ? SupportDiagnosticSanitizer.SanitizeEntries(data.Logs, SupportDiagnosticSanitizer.MaximumLogs) : [],
            includeDetails ? SupportDiagnosticSanitizer.SanitizeEntries(data.Errors, SupportDiagnosticSanitizer.MaximumErrors) : []);
    }

    /// <summary>Bounds sanitized display metadata and removes control characters; the UI renders it as escaped text.</summary>
    private static string SafeText(string? value) =>
        new(SupportDiagnosticSanitizer.Sanitize(value).Where(character => !char.IsControl(character)).Take(256).ToArray());

    /// <summary>Returns only fixed labels, even if a producer accidentally persists an unredacted log.</summary>
    private static string ClassifyStage(string? log)
    {
        var text = (log ?? "").AsSpan(0, Math.Min(log?.Length ?? 0, 2048));
        if (text.Contains("gradle", StringComparison.OrdinalIgnoreCase)) return "Android build";
        if (text.Contains("sign", StringComparison.OrdinalIgnoreCase)) return "Package signing";
        if (text.Contains("upload", StringComparison.OrdinalIgnoreCase)) return "Artifact upload";
        if (text.Contains("bubblewrap", StringComparison.OrdinalIgnoreCase)) return "Project generation";
        if (text.Contains("download", StringComparison.OrdinalIgnoreCase)) return "Resource retrieval";
        if (text.Contains("retry", StringComparison.OrdinalIgnoreCase)) return "Retry";
        if (text.Contains("queue", StringComparison.OrdinalIgnoreCase)) return "Queue";
        return "Processing";
    }

    /// <summary>Redacts complete error entries before taking two nonempty lines and the 400-character budget.</summary>
    private static string FailureSummary(IEnumerable<string> errors, string fallback)
    {
        var lines = errors.Take(SupportDiagnosticSanitizer.MaximumErrors)
            .Select(SupportDiagnosticSanitizer.Sanitize)
            .SelectMany(error => error.Split(['\r', '\n'], StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
            .Take(2);
        var summary = string.Join("\n", lines);
        return summary.Length is 0 ? fallback + " No error message available."
            : summary.Length <= 400 ? summary : summary[..399] + "…";
    }
}
