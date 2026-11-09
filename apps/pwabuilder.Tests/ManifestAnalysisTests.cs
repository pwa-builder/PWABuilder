using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using PwaBuilder.Common;
using PWABuilder.Models;
using PWABuilder.Services;
using PWABuilder.Validations.Services;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Verifies malformed manifests produce repair actions instead of failing analysis storage.</summary>
public sealed class ManifestAnalysisTests
{
    /// <summary>Invalid image structures fail the field check and skip dependent image checks.</summary>
    [Theory]
    [InlineData("[[{\"src\":\"icon.png\"}]]")]
    [InlineData("[null]")]
    [InlineData("[true]")]
    [InlineData("[42]")]
    [InlineData("[\"icon.png\"]")]
    [InlineData("{}")]
    [InlineData("null")]
    [InlineData("[{\"src\":\"icon.png\"}, []]")]
    [InlineData("[{\"src\":42}]")]
    [InlineData("[{\"src\":\"icon.png\",\"sizes\":[]}]")]
    [InlineData("[{\"src\":\"icon.png\",\"type\":false}]")]
    [InlineData("[{\"src\":\"icon.png\",\"purpose\":{}}]")]
    public async Task Malformed_images_produce_a_repair_action(string images)
    {
        foreach (var field in new[] { "icons", "screenshots" })
        {
            var detection = CreateDetection($"{{\"name\":\"Test app\",\"{field}\":{images}}}");
            var capabilities = await AnalyzeAsync(detection);
            var fieldCheck = Assert.Single(capabilities, c => c.Field == field && c.IsFieldExistenceCheck);

            Assert.Equal(PwaCapabilityCheckStatus.Failed, fieldCheck.Status);
            Assert.Equal("Fix your malformed web manifest.", fieldCheck.TodoAction);
            Assert.Contains(field, fieldCheck.ErrorMessage);
            Assert.All(capabilities.Where(c => c.Field == field && c != fieldCheck),
                c => Assert.Equal(PwaCapabilityCheckStatus.Skipped, c.Status));
            Assert.Equal(PwaCapabilityCheckStatus.Passed, capabilities.Single(c => c.Id == PwaCapabilityId.Name).Status);
            AssertAnalysisCanBeSerialized(detection, capabilities);
        }
    }

    /// <summary>Non-object roots also produce a repair action without throwing.</summary>
    [Theory]
    [InlineData("[]")]
    [InlineData("null")]
    [InlineData("\"manifest\"")]
    public async Task Malformed_root_produces_a_repair_action(string manifest)
    {
        var detection = CreateDetection(manifest);
        var capabilities = await AnalyzeAsync(detection);
        var action = capabilities.Single(c => c.Id == PwaCapabilityId.HasManifest);

        Assert.Equal(PwaCapabilityCheckStatus.Failed, action.Status);
        Assert.Equal("Fix your malformed web manifest.", action.TodoAction);
        Assert.Contains("root", action.ErrorMessage);
        Assert.Null(detection.AppIcon);
        AssertAnalysisCanBeSerialized(detection, capabilities);
    }

    /// <summary>Valid icons retain their checks, app-icon selection, and relative URL resolution.</summary>
    [Fact]
    public async Task Valid_icons_are_analyzed_normally()
    {
        var detection = CreateDetection("""
            {"icons":[{"src":"icon.png","sizes":"512x512","type":"image/png","purpose":"any"}]}
            """);
        var capabilities = await AnalyzeAsync(detection);

        Assert.All(capabilities.Where(c => c.Field == "icons"),
            c => Assert.Equal(PwaCapabilityCheckStatus.Passed, c.Status));
        Assert.Equal(new Uri("https://example.com/icon.png"), detection.AppIcon);
        Assert.Single(detection.Manifest.GetIcons());
        Assert.NotEmpty(JsonSerializer.Serialize(detection));
    }

    /// <summary>Malformed entries do not hide valid icons or crash serialization.</summary>
    [Fact]
    public void App_icon_selection_ignores_non_object_entries()
    {
        var detection = CreateDetection("""
            {"icons":[[],null,42,"bad",{"src":"icon.png","sizes":"512x512","type":"image/png"}]}
            """);

        Assert.Single(detection.Manifest.GetIcons());
        Assert.Equal(new Uri("https://example.com/icon.png"), detection.AppIcon);
        Assert.NotEmpty(JsonSerializer.Serialize(detection));
    }

    /// <summary>Missing or empty icons keep the existing add-icons action rather than a malformed-manifest error.</summary>
    [Theory]
    [InlineData("{}")]
    [InlineData("{\"icons\":[]}")]
    public async Task Missing_icons_keep_the_existing_action(string manifest)
    {
        var capabilities = await AnalyzeAsync(CreateDetection(manifest));
        var action = capabilities.Single(c => c.Id == PwaCapabilityId.Icons);

        Assert.Equal(PwaCapabilityCheckStatus.Failed, action.Status);
        Assert.Equal("Add icons to your manifest.", action.TodoAction);
        Assert.Null(action.ErrorMessage);
    }

    /// <summary>Creates a manifest without browser or network dependencies.</summary>
    private static ManifestDetection CreateDetection(string manifest) => new()
    {
        Url = new Uri("https://example.com/manifest.json"),
        Manifest = JsonSerializer.Deserialize<JsonElement>(manifest),
        ManifestRaw = manifest
    };

    /// <summary>Runs the production manifest checks with successful image validation.</summary>
    private static Task<List<PwaCapability>> AnalyzeAsync(ManifestDetection detection) =>
        new ManifestAnalyzer(new ValidImageService()).TryAnalyzeManifestAsync(detection, NullLogger.Instance, CancellationToken.None);

    /// <summary>Exercises the analysis serialization path that previously threw for nested icon arrays.</summary>
    private static void AssertAnalysisCanBeSerialized(ManifestDetection detection, List<PwaCapability> capabilities)
    {
        var analysis = new Analysis
        {
            Id = "test",
            Url = new Uri("https://example.com"),
            WebManifest = detection,
            Status = AnalysisStatus.Completed
        };
        analysis.ProcessCapabilities(capabilities);

        Assert.False(analysis.CanPackage);
        Assert.NotEmpty(JsonSerializer.Serialize(analysis));
    }

    /// <summary>Avoids network requests while exercising manifest checks.</summary>
    private sealed class ValidImageService : IImageValidationService
    {
        /// <inheritdoc/>
        public Task<Result<bool>> TryImageExistsAsync(Uri imageUri, CancellationToken cancelToken) => Task.FromResult(Result.From(true));

        /// <inheritdoc/>
        public Task<Result<bool>> TryValidateImageTypeAsync(Uri imageUri, string? declaredType, CancellationToken cancelToken) => Task.FromResult(Result.From(true));

        /// <inheritdoc/>
        public Task<Result<string?>> TryDetectImageTypeAsync(Uri imageUri, CancellationToken cancelToken) => Task.FromResult(Result.From<string?>("image/png"));

        /// <inheritdoc/>
        public Task<Result<bool>> TryValidateImageSizeAsync(Uri imageUri, string? declaredSizes, CancellationToken cancelToken) => Task.FromResult(Result.From(true));

        /// <inheritdoc/>
        public Task<Result<bool>> IsValidImageAsync(Stream imageStream, CancellationToken cancellationToken) => Task.FromResult(Result.From(true));
    }
}
