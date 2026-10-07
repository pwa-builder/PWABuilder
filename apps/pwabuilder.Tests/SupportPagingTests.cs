using Microsoft.AspNetCore.DataProtection;
using PWABuilder.Models;
using PWABuilder.Services;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Offline coverage of cursor boundaries and the exact Redis keyset selection used in production.</summary>
public sealed class SupportPagingTests
{
    /// <summary>Both current and next cursors preserve the frozen window without exposing storage state.</summary>
    [Theory]
    [InlineData("analysis")]
    [InlineData("package")]
    public void Protected_cursors_round_trip_and_expire_without_exposing_internal_state(string kind)
    {
        var protector = new SupportCursorProtector(new EphemeralDataProtectionProvider());
        var now = DateTimeOffset.UtcNow;
        var request = protector.Read(kind, null, now);
        var first = protector.WritePage(kind, request);
        var next = protector.Write(kind, request, "private-storage-continuation")!;
        Assert.Equal(request, protector.Read(kind, first, now.AddMinutes(30)));
        var restored = protector.Read(kind, next, now.AddMinutes(30));
        Assert.Equal(now, restored.UpperBound);
        Assert.Equal(now.AddDays(-14), restored.Cutoff);
        Assert.Equal("private-storage-continuation", restored.ContinuationToken);
        Assert.DoesNotContain("private-storage-continuation", next);
        Assert.InRange(next.Length, 1, SupportCursorProtector.MaximumLength);
        Assert.Throws<ArgumentException>(() => protector.Read(kind, next, now.AddHours(1).AddTicks(1)));
        Assert.Throws<ArgumentException>(() => protector.Read(kind, next, now.AddTicks(-1)));
        Assert.Throws<ArgumentException>(() => protector.Read(kind is "analysis" ? "package" : "analysis", next, now));
        Assert.Throws<ArgumentException>(() => protector.Read(kind, next[..^8] + "tampered", now));
        Assert.Throws<ArgumentException>(() => protector.Read(kind, new string('x', SupportCursorProtector.MaximumLength + 1), now));
        var replacementKeys = new SupportCursorProtector(new EphemeralDataProtectionProvider());
        Assert.Throws<ArgumentException>(() => replacementKeys.Read(kind, next, now));
        Assert.Null(protector.Write(kind, request, null));
    }

    /// <summary>Redis traversal stays capped at 500 and handles many tied scores with no duplicates or skips.</summary>
    [Fact]
    public void Redis_index_pages_use_exclusive_score_and_member_and_respect_the_500_cap()
    {
        var now = DateTimeOffset.UtcNow;
        var entries = Enumerable.Range(0, 570).Select(index =>
            new SupportPackageIndexEntry($"00000000-0000-4000-8000-{index:D12}", now.ToUnixTimeMilliseconds() - index / 100)).ToArray();
        var expected = entries.OrderByDescending(entry => entry.Score)
            .ThenByDescending(entry => entry.Reference, StringComparer.Ordinal).Take(500).ToArray();
        var all = new List<SupportPackageIndexEntry>();
        var request = new SupportPageRequest(now);
        do
        {
            var page = SupportPackagePaging.Select(entries.Reverse(), request);
            Assert.Equal(50, page.Items.Count);
            all.AddRange(page.Items);
            request = request with { ContinuationToken = page.ContinuationToken };
            Assert.InRange(all.Count, 50, 500);
        } while (request.ContinuationToken is not null);
        Assert.Equal(expected, all);
        Assert.Equal(500, all.Select(entry => entry.Reference).Distinct().Count());
    }

    /// <summary>Empty and exhausted indexes never advertise a next page.</summary>
    [Fact]
    public void Empty_index_has_no_continuation()
    {
        var page = SupportPackagePaging.Select([], new SupportPageRequest(DateTimeOffset.UtcNow));
        Assert.Empty(page.Items);
        Assert.Null(page.ContinuationToken);
    }

    /// <summary>Package summaries have useful fallbacks and can use the first two nonempty error entries.</summary>
    [Fact]
    public void Package_summary_handles_missing_errors_and_multiple_entries()
    {
        var now = DateTimeOffset.UtcNow;
        var reference = Guid.NewGuid();
        PackageDiagnosticsData Data(List<string> errors) => new()
        {
            SupportReference = reference.ToString("D"), Status = "Failed", CreatedAt = now, UpdatedAt = now, Errors = errors
        };
        Assert.Equal("Packaging failed. No error message available.",
            SupportDiagnosticsService.ProjectPackage(Data([]), reference, now)!.FailureSummary);
        var result = SupportDiagnosticsService.ProjectPackage(Data(["\n", "Gradle failed", "", "HTTP 403", "Not shown"]), reference, now, false)!;
        Assert.Equal("Gradle failed\nHTTP 403", result.FailureSummary);
        Assert.Empty(result.Errors);
        Assert.Empty(result.Logs);
    }
}
