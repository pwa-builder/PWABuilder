using PWABuilder.MicrosoftStore.Models;

namespace PWABuilder.MicrosoftStore.Jobs;

/// <summary>Private build inputs stored in Blob Storage, never returned by status APIs.</summary>
public sealed record WindowsPackageJobInput
{
    /// <summary>Windows packaging options.</summary>
    public required WindowsAppPackageOptions Options { get; init; }
    /// <summary>Attribution captured at submission, independent of the worker's HTTP context.</summary>
    public required PackageJobAnalytics Analytics { get; init; }
}

/// <summary>Serializable caller metadata associated with a queued request.</summary>
public sealed record PackageJobAnalytics
{
    /// <summary>Calling platform name.</summary>
    public string? PlatformId { get; init; }
    /// <summary>Calling platform version.</summary>
    public string? PlatformVersion { get; init; }
    /// <summary>Trace correlation ID; not used as a job identity or idempotency key.</summary>
    public string? CorrelationId { get; init; }
    /// <summary>Optional marketing referral.</summary>
    public string? Referrer { get; init; }

    /// <summary>Converts persisted attribution to existing packaging analytics.</summary>
    public AnalyticsInfo ToAnalyticsInfo() => new()
    {
        platformId = PlatformId,
        platformIdVersion = PlatformVersion,
        correlationId = CorrelationId,
        referrer = Referrer
    };
}
