using System.Text.Json;
using PWABuilder.Models;
using PWABuilder.Services;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Adversarial fixtures for admin-only diagnostic redaction without external services.</summary>
public sealed class SupportDiagnosticSanitizerTests
{
    /// <summary>Summaries redact complete multiline values before selecting the first two nonempty lines.</summary>
    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Failure_summaries_are_useful_redacted_excerpts_even_without_details(bool details)
    {
        const string error = "\nGradle resource linking failed\n\npassword=\"secret-marker\nsecret-marker\"\nThird line not shown";
        var analysis = SupportDiagnosticsService.ProjectAnalysis(new Analysis
        {
            Id = "analysis:example.com:summary", Url = new Uri("https://example.com"),
            Status = AnalysisStatus.Failed, Error = error
        }, details);
        var reference = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;
        var package = SupportDiagnosticsService.ProjectPackage(new PackageDiagnosticsData
        {
            SupportReference = reference.ToString("D"), Status = "Failed",
            CreatedAt = now, UpdatedAt = now, Errors = [error]
        }, reference, now, details)!;
        Assert.Equal("Gradle resource linking failed\npassword=[redacted]", analysis.FailureSummary);
        Assert.Equal(analysis.FailureSummary, package.FailureSummary);
        Assert.DoesNotContain("secret-marker", JsonSerializer.Serialize(new { analysis, package }));
        if (!details)
        {
            Assert.Empty(analysis.Error);
            Assert.Empty(analysis.Logs);
            Assert.Empty(package.Errors);
            Assert.Empty(package.Logs);
        }
    }

    /// <summary>Summary bounds are applied after sanitization and absent errors have a safe fallback.</summary>
    [Theory]
    [InlineData(null, "Analysis failed. No error message available.")]
    [InlineData(" \n\t", "Analysis failed. No error message available.")]
    public void Empty_analysis_failure_has_safe_fallback(string? error, string expected)
    {
        var result = SupportDiagnosticsService.ProjectAnalysis(new SupportAnalysisData { Status = AnalysisStatus.Failed, Error = error });
        Assert.Equal(expected, result.FailureSummary);
    }

    /// <summary>Long error lines stay within the dashboard budget.</summary>
    [Fact]
    public void Failure_summary_is_capped_at_400_characters()
    {
        var result = SupportDiagnosticsService.ProjectAnalysis(new SupportAnalysisData
        {
            Status = AnalysisStatus.Failed,
            Error = string.Concat(Enumerable.Repeat("Build failed. ", 40)) + "password=\"secret-marker\nsecret-marker\""
        });
        Assert.Equal(400, result.FailureSummary.Length);
        Assert.StartsWith("Build failed.", result.FailureSummary);
        Assert.DoesNotContain("secret-marker", result.FailureSummary);
    }

    /// <summary>Useful build context survives while common credential formats and URL-private parts do not.</summary>
    [Theory]
    [InlineData("Gradle task failed: Authorization: Bearer secret-marker")]
    [InlineData("Gradle task failed: Bearer secret-marker")]
    [InlineData("Gradle task failed: authorization=Basic secret-marker")]
    [InlineData("Gradle task failed: --key-pass pass:secret-marker --store-password 'secret-marker'")]
    [InlineData("Gradle task failed: --storePassword=secret-marker,extra-secret-marker")]
    [InlineData("Gradle task failed: {\"keyPassword\":\"secret-marker\",\"storePassword\":\"secret-marker\"}")]
    [InlineData("Gradle task failed: api_key=secret-marker; clientSecret='secret-marker'")]
    [InlineData("Gradle task failed: {\"signing\":{\"file\":\"secret-marker\",\"nested\":{\"secret\":\"secret-marker\"}}}")]
    [InlineData("Gradle task failed: file=data:application/octet-stream;base64,secret-marker")]
    [InlineData("Gradle task failed: data:application/octet-stream;base64,secret-marker")]
    [InlineData("Gradle task failed: https://secret-marker:secret-marker@example.com/secret-marker?token=secret-marker#secret-marker")]
    [InlineData("Gradle task failed: https://example.com/path%20secret-marker?credential=secret-marker")]
    [InlineData("Gradle task failed: https%3A%2F%2Fexample.com%2Fsecret-marker%3Ftoken%3Dsecret-marker")]
    [InlineData("Gradle task failed: https%253A%252F%252Fexample.com%252Fsecret-marker")]
    [InlineData("Gradle task failed: https:\\/\\/example.com/secret-marker")]
    [InlineData("Gradle task failed: password%3D%22secret-marker%22")]
    [InlineData("Gradle task failed: \\u0070assword=secret-marker")]
    [InlineData("Gradle task failed: password=&quot;secret-marker&quot;")]
    [InlineData("Gradle task failed: passphrase=secret-marker")]
    [InlineData("Gradle task failed: -----BEGIN PRIVATE KEY-----\nsecret-marker\n-----END PRIVATE KEY-----")]
    public void Redaction_keeps_failure_context_and_removes_sensitive_values(string input)
    {
        var result = SupportDiagnosticSanitizer.Sanitize(input);
        Assert.Contains("Gradle task failed", result);
        Assert.DoesNotContain("secret-marker", result);
    }

    /// <summary>Safe exception names, build stages, and useful status codes are not reduced to generic labels.</summary>
    [Fact]
    public void Nonsecret_debugging_details_survive()
    {
        const string detail = "Gradle :app:bundleRelease failed: Android resource linking failed. HTTP 403 fetching https://example.com.";
        var result = SupportDiagnosticSanitizer.Sanitize(detail);
        Assert.Contains(":app:bundleRelease", result);
        Assert.Contains("Android resource linking failed", result);
        Assert.Contains("HTTP 403", result);
        Assert.Contains("https://example.com", result);
    }

    /// <summary>Log and error counts and individual text length stay bounded.</summary>
    [Fact]
    public void Detail_projection_bounds_text_and_validates_signing_mode()
    {
        var reference = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;
        var data = new PackageDiagnosticsData
        {
            SupportReference = reference.ToString("D"), Status = "Failed", CreatedAt = now, UpdatedAt = now,
            Logs = Enumerable.Repeat("Useful detail. " + new string('!', 5000), 150).ToList(),
            Errors = Enumerable.Repeat("Build failed: keyPassword=secret-marker", 30).ToList(),
            Configuration = new PackageSupportConfiguration
            {
                SigningMode = "secret-marker", HasUploadedKey = true, HasKeyPassword = true, HasStorePassword = false
            }
        };
        var result = SupportDiagnosticsService.ProjectPackage(data, reference, now);
        Assert.NotNull(result);
        Assert.Equal(100, result.Logs.Count);
        Assert.Equal(20, result.Errors.Count);
        Assert.All(result.Logs, log => Assert.InRange(log.Length, 1, 4000));
        Assert.Equal("unknown", result.Configuration.SigningMode);
        Assert.True(result.Configuration.HasUploadedKey);
        Assert.True(result.Configuration.HasKeyPassword);
        Assert.False(result.Configuration.HasStorePassword);
        Assert.DoesNotContain("secret-marker", JsonSerializer.Serialize(result));
        Assert.Contains("omitted", SupportDiagnosticSanitizer.Sanitize(new string('x', 16 * 1024 + 1)));
    }

    /// <summary>The decoder accepts the producer's full bounded log budget rather than dropping valid records.</summary>
    [Fact]
    public void Decoder_accepts_full_producer_log_budget()
    {
        var data = new PackageDiagnosticsData
        {
            Logs = Enumerable.Repeat(new string('!', 4000), 100).ToList(),
            Errors = Enumerable.Repeat(new string('!', 4000), 20).ToList()
        };
        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        Assert.NotNull(RedisCache.DeserializePackageDiagnostics(json));
    }

    /// <summary>Analysis detail uses the latest bounded logs and redacts existing stored error text.</summary>
    [Fact]
    public void Analysis_detail_preserves_useful_failure_text_without_changing_public_model()
    {
        var analysis = new Analysis
        {
            Id = "analysis:example.com:123",
            Url = new Uri("https://example.com"),
            Status = AnalysisStatus.Failed,
            Error = "Manifest parsing failed at line 7: https://user:secret-marker@example.com/private?token=secret-marker",
            Logs = Enumerable.Range(0, 110).Select(index => $"Stage {index}: HTTP 403; token=secret-marker").ToList()
        };
        var result = SupportDiagnosticsService.ProjectAnalysis(analysis);
        Assert.Equal(100, result.Logs.Count);
        Assert.Contains("Stage 109", result.Logs.Last());
        Assert.Contains("Manifest parsing failed at line 7", result.Error);
        Assert.DoesNotContain("secret-marker", JsonSerializer.Serialize(result));
        Assert.Contains("secret-marker", analysis.Error);
        Assert.Contains("secret-marker", analysis.Logs.Last());
    }
}
