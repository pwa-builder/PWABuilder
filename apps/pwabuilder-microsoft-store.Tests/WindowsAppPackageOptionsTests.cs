using PWABuilder.MicrosoftStore.Models;
using System.Text.Json;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

public sealed class WindowsAppPackageOptionsTests
{
    /// <summary>
    /// Verifies the API contract no longer advertises the deprecated Windows Actions option.
    /// </summary>
    [Fact]
    public void Serialize_DoesNotExposeWindowsActions()
    {
        var options = new WindowsAppPackageOptions
        {
            Url = new Uri("https://example.com"),
            EnableWebAppWidgets = true
        };

        using var json = JsonSerializer.SerializeToDocument(options, new JsonSerializerOptions(JsonSerializerDefaults.Web));

        Assert.False(json.RootElement.TryGetProperty("windowsActions", out _));
        Assert.True(json.RootElement.GetProperty("enableWebAppWidgets").GetBoolean());
        Assert.Null(typeof(WindowsAppPackageOptions).GetProperty("WindowsActions"));
    }

    /// <summary>
    /// Verifies stale client Actions fields are ignored without affecting ordinary packaging or widgets.
    /// </summary>
    [Fact]
    public void Deserialize_IgnoresLegacyWindowsActions()
    {
        const string payload = """
            {
                "url": "https://example.com",
                "packageId": "Example.App",
                "version": "1.0.0",
                "enableWebAppWidgets": true,
                "windowsActions": {
                    "manifest": "retired",
                    "customEntities": "retired",
                    "customEntitiesLocalizations": "retired"
                }
            }
            """;

        var options = JsonSerializer.Deserialize<WindowsAppPackageOptions>(payload, new JsonSerializerOptions(JsonSerializerDefaults.Web));

        Assert.NotNull(options);
        Assert.Equal("Example.App", options.PackageId);
        Assert.True(options.EnableWebAppWidgets);
        Assert.Empty(options.GetValidationErrors(new AppSettings { ImageGeneratorApiUrl = new Uri("https://example.com/images") }));
    }

    /// <summary>
    /// Verifies retired Actions models and processing services are removed from the packaging assembly.
    /// </summary>
    [Theory]
    [InlineData("PWABuilder.MicrosoftStore.Models.WindowsActionsOptions")]
    [InlineData("PWABuilder.MicrosoftStore.Models.WindowsActionsFiles")]
    [InlineData("PWABuilder.MicrosoftStore.Models.WindowsActionsCustomEntityLocalization")]
    [InlineData("PWABuilder.MicrosoftStore.Services.WindowsActionsService")]
    public void PackagingAssembly_DoesNotExposeWindowsActionsTypes(string typeName)
    {
        Assert.Null(typeof(WindowsAppPackageOptions).Assembly.GetType(typeName));
    }
}
