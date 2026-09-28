using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Models;
using PWABuilder.MicrosoftStore.Services;
using System.Text.Json;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

public sealed class PwaBuilderWrapperTests
{
    /// <summary>
    /// Verifies ordinary CLI options are retained without any deprecated Actions arguments.
    /// </summary>
    [Fact]
    public void CreateCommandLineArgs_PreservesOrdinaryPackagingOptions()
    {
        using var host = CreateHost();
        var wrapper = host.Services.GetRequiredService<TestPwaBuilderWrapper>();
        var options = CreateOptions();
        options.Name = "Example App";
        options.Publisher = new Publisher { CommonName = "CN=Example", DisplayName = "Example Publisher" };
        options.EdgeChannel = "stable";
        options.AppUserModelId = "Example.App!App";
        options.Extensions = "sharetarget";
        options.ResourceLanguage = "en-us, es-es";
        options.StartUrl = "/launch";
        options.TargetDeviceFamilies = ["Desktop", "Holographic", "Team"];
        options.AllowSigning = true;

        var args = wrapper.GetArguments(options);

        foreach (var expected in new[]
        {
            "--url=\"https://example.com/\"",
            "--target=\"output\"",
            "--app-version=\"1.2.3.0\"",
            "--publisher=\"CN=Example\"",
            "--publisher-display-name=\"Example Publisher\"",
            "--channel=\"stable\"",
            "--aumid=\"Example.App!App\"",
            "--package-id-name=\"Example.App\"",
            "--launch-args=\"--windows-store-app\"",
            "--exts=\"sharetarget\"",
            "--display-name=\"Example App\"",
            "--icons=\"images\"",
            $"--pri=\"{Path.Combine(Directory.GetCurrentDirectory(), "resources.pri")}\"",
            "--resource-language=\"EN-US;ES-ES\"",
            "--start-url=\"https://example.com/launch\"",
            "--display-mode=\"standalone\"",
            "--application-id=\"App\"",
            "--manifest-file=\"manifest.json\"",
            "--target-device-family=\"Windows.Desktop;Windows.Holographic;Windows.Team\"",
            "--signed-app"
        })
        {
            Assert.Contains(expected, args);
        }

        Assert.DoesNotContain("--web-action-", args);
        Assert.DoesNotContain("--enable-features", args);
        Assert.DoesNotContain("--processor-architecture", args);
    }

    /// <summary>
    /// Verifies widget packages use a live manifest and retain optional architecture selection.
    /// </summary>
    [Theory]
    [InlineData("", false)]
    [InlineData("x64", true)]
    [InlineData("arm64", true)]
    public void CreateCommandLineArgs_PreservesWidgets(string processor, bool includesArchitecture)
    {
        using var host = CreateHost();
        using var manifest = JsonDocument.Parse("""{"widgets": []}""");
        var wrapper = host.Services.GetRequiredService<TestPwaBuilderWrapper>();
        var options = CreateOptions();
        options.Manifest = manifest;
        options.EnableWebAppWidgets = true;

        var args = wrapper.GetArguments(options, processor);

        Assert.Contains("--enable-features=\"msWebAppWidgets\"", args);
        Assert.Equal(includesArchitecture, args.Contains("--processor-architecture="));
        if (includesArchitecture)
        {
            Assert.Contains($"--processor-architecture=\"{processor}\"", args);
        }
        Assert.DoesNotContain("--manifest-file", args);
        Assert.DoesNotContain("--web-action-", args);
    }

    /// <summary>
    /// Creates valid package options without accessing the filesystem or network.
    /// </summary>
    private static WindowsAppPackageOptions CreateOptions()
    {
        return new WindowsAppPackageOptions
        {
            Url = new Uri("https://example.com"),
            PackageId = "Example.App",
            Version = "1.2.3",
            ManifestFilePath = "manifest.json"
        };
    }

    /// <summary>
    /// Builds an unstarted host for resolving wrapper dependencies without requiring the CLI or Windows SDK.
    /// </summary>
    private static IHost CreateHost()
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { ContentRootPath = Directory.GetCurrentDirectory() });
        builder.Services.AddHttpClient();
        builder.Services.Configure<AppSettings>(settings => settings.PriPath = "resources.pri");
        builder.Services.AddSingleton<ZombieProcessKiller>();
        builder.Services.AddTransient<ProcessRunner>();
        builder.Services.AddTransient<TempDirectory>();
        builder.Services.AddTransient<TestPwaBuilderWrapper>();
        return builder.Build();
    }

    private sealed class TestPwaBuilderWrapper : PwaBuilderWrapper
    {
        /// <summary>
        /// Creates a wrapper exposing argument generation without invoking the external packaging executable.
        /// </summary>
        public TestPwaBuilderWrapper(
            IOptions<AppSettings> settings,
            ProcessRunner procRunner,
            IWebHostEnvironment host,
            ILogger<PwaBuilderWrapper> logger,
            IHttpClientFactory httpClientFactory,
            TempDirectory tempDirectory)
            : base(settings, procRunner, host, logger, httpClientFactory, tempDirectory)
        {
        }

        /// <summary>
        /// Creates CLI arguments for an in-memory manifest and an example image path.
        /// </summary>
        public string GetArguments(WindowsAppPackageOptions options, string processor = "")
        {
            return CreateCommandLineArgs(
                options,
                new ImageGeneratorResult([Path.Combine("images", "icon.png")]),
                new WebAppManifestContext { ManifestUri = new Uri("https://example.com/manifest.json") },
                "output",
                processor);
        }
    }
}
