using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using PWABuilder.Services;

namespace PWABuilder.Models;

/// <summary>A bounded backend page. Its internal continuation is never returned without protection.</summary>
/// <param name="Items">The items on this page, not the total retained count.</param>
/// <param name="ContinuationToken">Internal storage continuation, or null when exhausted.</param>
public sealed record SupportPage<T>(IReadOnlyList<T> Items, string? ContinuationToken);

/// <summary>Server-controlled traversal state with a frozen retention window.</summary>
/// <param name="UpperBound">The initial request timestamp.</param>
/// <param name="ContinuationToken">The native storage cursor.</param>
public sealed record SupportPageRequest(DateTimeOffset UpperBound, string? ContinuationToken = null)
{
    /// <summary>The fixed fourteen-day cutoff for this traversal.</summary>
    public DateTimeOffset Cutoff => UpperBound - SupportDiagnosticsService.Retention;
}

/// <summary>Protects cursors against tampering, service confusion, disclosure and unbounded processing.</summary>
/// <param name="provider">The application's Data Protection key ring.</param>
/// <remarks>
/// Uses the existing platform key ring; this feature provisions no additional cloud storage.
/// Replicas serving the same dashboard must share Data Protection keys and application identity.
/// Replacing or losing those keys invalidates cursors (HTTP 400; reload the dashboard).
/// Restarts preserve cursors when the platform persists its key ring; cursors also expire after one hour.
/// </remarks>
public sealed class SupportCursorProtector(IDataProtectionProvider provider)
{
    /// <summary>Maximum URL-safe protected cursor length accepted before decoding.</summary>
    public const int MaximumLength = 3000;

    /// <summary>Validates a cursor before any storage read; initial requests receive a new frozen window.</summary>
    public SupportPageRequest Read(string kind, string? cursor, DateTimeOffset now)
    {
        if (cursor is null)
        {
            return new SupportPageRequest(now);
        }
        if (cursor.Length is 0 or > MaximumLength || cursor.Any(character =>
            !char.IsAsciiLetterOrDigit(character) && character is not '-' and not '_'))
        {
            throw new ArgumentException("Invalid support cursor.");
        }
        try
        {
            var state = JsonSerializer.Deserialize<SupportPageRequest>(Protector(kind).Unprotect(cursor));
            if (state is null || state.UpperBound > now || state.UpperBound < now.AddHours(-1)
                || state.ContinuationToken is "" || state.ContinuationToken?.Length > 1800)
            {
                throw new ArgumentException("Invalid support cursor.");
            }
            return state;
        }
        catch (Exception exception) when (exception is CryptographicException or JsonException or FormatException)
        {
            throw new ArgumentException("Invalid support cursor.");
        }
    }

    /// <summary>Wraps the storage continuation with authenticated encryption and the frozen window.</summary>
    public string? Write(string kind, SupportPageRequest request, string? continuationToken)
    {
        if (continuationToken is null)
        {
            return null;
        }
        return WritePage(kind, request with { ContinuationToken = continuationToken });
    }

    /// <summary>Protects the current page too, allowing Previous to replay page one with its original cutoff.</summary>
    public string WritePage(string kind, SupportPageRequest request)
    {
        var cursor = Protector(kind).Protect(JsonSerializer.Serialize(request));
        if (request.ContinuationToken?.Length > 1800 || cursor.Length > MaximumLength)
        {
            throw new InvalidOperationException("Support continuation exceeds its configured budget.");
        }
        return cursor;
    }

    /// <summary>Separates both service kinds and versions from all other Data Protection uses.</summary>
    private IDataProtector Protector(string kind) => provider.CreateProtector("PWABuilder.SupportPaging.v1", kind);
}

/// <summary>A diagnostics-index member and its millisecond score; contains no raw job key.</summary>
/// <param name="Reference">The opaque support UUID.</param>
/// <param name="Score">The producer's update time in milliseconds.</param>
public sealed record SupportPackageIndexEntry(string Reference, double Score);

/// <summary>Shared stable keyset selection for the bounded Redis index and its in-memory equivalent.</summary>
public static class SupportPackagePaging
{
    /// <summary>The producer retains at most this many failed references.</summary>
    public const int IndexLimit = 500;

    /// <summary>Uses both score and member so equal timestamps never skip records between pages.</summary>
    public static SupportPage<SupportPackageIndexEntry> Select(IEnumerable<SupportPackageIndexEntry> entries,
        SupportPageRequest request)
    {
        var after = request.ContinuationToken is null ? null :
            JsonSerializer.Deserialize<SupportPackageIndexEntry>(request.ContinuationToken);
        var candidates = entries
            .OrderByDescending(entry => entry.Score).ThenByDescending(entry => entry.Reference, StringComparer.Ordinal)
            .Take(IndexLimit)
            .Where(entry => after is null || entry.Score < after.Score
                || entry.Score == after.Score && string.CompareOrdinal(entry.Reference, after.Reference) < 0)
            .Take(SupportDiagnosticsService.RecentLimit + 1).ToArray();
        var items = candidates.Take(SupportDiagnosticsService.RecentLimit).ToArray();
        return new SupportPage<SupportPackageIndexEntry>(items,
            candidates.Length > items.Length ? JsonSerializer.Serialize(items[^1]) : null);
    }
}
