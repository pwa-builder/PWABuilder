using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Models;
using PWABuilder.MicrosoftStore.Services;
using System.Net;
using System.IO.Compression;
using System.Reflection;
using System.Text.Json;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

/// <summary>
/// Tests package-file lifetime, archive compatibility, telemetry, and pipeline cancellation without native SDK tools.
/// </summary>
public sealed class PackagingPipelineTests
{
    /// <summary>
    /// Verifies manifest download cancellation is neither wrapped nor treated as fallback.
    /// </summary>
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Find_WhenHttpCanceled_PreservesCancellation(bool explicitManifestUrl)
    {
        using var cancellation = new CancellationTokenSource();
        using var handler = new CancelingHandler(cancellation.Token);
        using var http = new HttpClient(handler);
        using var temp = new TempDirectory(Settings(), NullLogger<TempDirectory>.Instance);
        var finder = new WebManifestFinder(new HttpFactory(http), NullLogger<WebManifestFinder>.Instance, temp);
        var options = new WindowsAppPackageOptions
        {
            Url = new Uri("https://example.com"),
            ManifestUrl = explicitManifestUrl ? new Uri("https://example.com/manifest.json") : null
        };
        var error = await Assert.ThrowsAnyAsync<OperationCanceledException>(() => finder.Find(options));
        Assert.Equal(cancellation.Token, error.CancellationToken);
        Assert.Equal(1, handler.RequestCount);
    }

    /// <summary>
    /// Verifies cancelled image downloads do not retry another protocol or fallback source.
    /// </summary>
    [Fact]
    public async Task Generate_WhenHttpCanceled_DoesNotFallback()
    {
        using var cancellation = new CancellationTokenSource();
        using var handler = new CancelingHandler(cancellation.Token);
        using var http = new HttpClient(handler);
        using var manifest = JsonDocument.Parse("""{"icons":[{"src":"icon.png","sizes":"512x512","type":"image/png"}]}""");
        var generator = new ImageGenerator(new HttpFactory(http), Settings(), NullLogger<ImageGenerator>.Instance);
        var error = await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            generator.Generate(new WindowsAppPackageOptions { Url = new Uri("https://example.com") }, WebAppManifestContext.From(manifest, new Uri("https://example.com/manifest.json")), AppContext.BaseDirectory));
        Assert.Equal(cancellation.Token, error.CancellationToken);
        Assert.Equal(1, handler.RequestCount);
    }

    /// <summary>
    /// Verifies queued builds expose the path-based package entry point.
    /// </summary>
    [Fact]
    public void WindowsAppPackageCreator_ExposesFileOutput()
    {
        var method = typeof(WindowsAppPackageCreator).GetMethod("CreateAppPackageFileAsync");
        Assert.NotNull(method);
        Assert.Equal(new[] { typeof(WindowsAppPackageOptions), typeof(AnalyticsInfo), typeof(CancellationToken) }, method.GetParameters().Select(parameter => parameter.ParameterType));
        var resultType = Assert.Single(method.ReturnType.GenericTypeArguments);
        Assert.Equal(typeof(string), resultType.GetProperty("FilePath")?.PropertyType);
        Assert.Equal(typeof(ModernWindowsPackageResult), resultType.GetProperty("ModernAppPackage")?.PropertyType);
        Assert.DoesNotContain(resultType.GetProperties(), property => property.PropertyType == typeof(byte[]));
    }

    /// <summary>
    /// Verifies file output survives until the owning DI scope is disposed, with a single success event.
    /// </summary>
    [Fact]
    public async Task CreateAppPackageFileAsync_RetainsFilesUntilScopeDisposal()
    {
        using var fixture = new PipelineFixture();
        var result = await fixture.Creator.CreateAppPackageFileAsync(fixture.PackageOptions, new AnalyticsInfo(), CancellationToken.None);
        Assert.True(File.Exists(result.FilePath));
        Assert.True(File.Exists(fixture.PackageOptions.ManifestFilePath));
        using (var zip = ZipFile.OpenRead(result.FilePath))
        {
            Assert.Empty(zip.Entries);
        }
        Assert.Null(result.ModernAppPackage);
        Assert.Equal("WindowsTestPackageEvent", Assert.Single(fixture.Channel.Events).Name);

        fixture.Scope.Dispose();
        Assert.False(File.Exists(result.FilePath));
        Assert.Empty(Directory.EnumerateFileSystemEntries(fixture.Root));
    }

    /// <summary>
    /// Verifies the legacy endpoint still returns ZIP bytes and cleans them up immediately.
    /// </summary>
    [Fact]
    public async Task CreateAppPackageAsync_ReturnsBytesAndCleansFiles()
    {
        using var fixture = new PipelineFixture();
        var result = await fixture.Creator.CreateAppPackageAsync(fixture.PackageOptions, new AnalyticsInfo(), CancellationToken.None);
        using var zip = new ZipArchive(new MemoryStream(result.PackageBytes), ZipArchiveMode.Read);
        Assert.Empty(zip.Entries);
        Assert.Empty(Directory.EnumerateFileSystemEntries(fixture.Root));
        Assert.Equal("WindowsTestPackageEvent", Assert.Single(fixture.Channel.Events).Name);
    }

    /// <summary>
    /// Verifies failed builds retain diagnostics until disposal and record exactly one failure.
    /// </summary>
    [Fact]
    public async Task CreateAppPackageFileAsync_WhenBuildFails_CleansAtScopeDisposal()
    {
        using var fixture = new PipelineFixture();
        fixture.PackageOptions.GenerateModernPackage = true;
        await Assert.ThrowsAsync<ProcessException>(() =>
            fixture.Creator.CreateAppPackageFileAsync(fixture.PackageOptions, new AnalyticsInfo(), CancellationToken.None));
        Assert.True(File.Exists(fixture.PackageOptions.ManifestFilePath));
        Assert.Equal("WindowsPackageFailureEvent", Assert.Single(fixture.Channel.Events).Name);

        fixture.Scope.Dispose();
        Assert.Empty(Directory.EnumerateFileSystemEntries(fixture.Root));
    }

    /// <summary>
    /// Verifies scoped cancellation reaches an in-flight HTTP request without recording a build failure.
    /// </summary>
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task CreateAppPackageFileAsync_WhenCanceled_StopsHttpAndSkipsFailureTelemetry(bool generatingImages)
    {
        using var handler = new BlockingHandler(generatingImages);
        using var fixture = new PipelineFixture(handler);
        using var cancellation = new CancellationTokenSource();
        var run = fixture.Creator.CreateAppPackageFileAsync(fixture.PackageOptions, new AnalyticsInfo(), cancellation.Token);
        await handler.Started.Task.WaitAsync(TimeSpan.FromSeconds(5));
        cancellation.Cancel();
        var error = await Assert.ThrowsAnyAsync<OperationCanceledException>(() => run.WaitAsync(TimeSpan.FromSeconds(5)));
        Assert.Equal(cancellation.Token, error.CancellationToken);
        Assert.Empty(fixture.Channel.Events);
        Assert.Equal(generatingImages ? 2 : 1, handler.RequestCount);
        Assert.True(File.Exists(fixture.PackageOptions.ManifestFilePath));

        fixture.Scope.Dispose();
        Assert.Empty(Directory.EnumerateFileSystemEntries(fixture.Root));
    }

    /// <summary>
    /// Verifies cancellation stops manifest discovery's in-flight request and preserves its token.
    /// </summary>
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Find_WhenTokenCanceled_StopsInFlightRequest(bool explicitManifestUrl)
    {
        using var handler = new BlockingHandler();
        using var fixture = new PipelineFixture(handler);
        using var cancellation = new CancellationTokenSource();
        fixture.PackageOptions.Manifest?.Dispose();
        fixture.PackageOptions.Manifest = null;
        fixture.PackageOptions.ManifestUrl = explicitManifestUrl ? new Uri("https://example.com/manifest.json") : null;
        var run = fixture.Creator.CreateAppPackageFileAsync(fixture.PackageOptions, new AnalyticsInfo(), cancellation.Token);
        await handler.Started.Task.WaitAsync(TimeSpan.FromSeconds(5));
        cancellation.Cancel();
        var error = await Assert.ThrowsAnyAsync<OperationCanceledException>(() => run.WaitAsync(TimeSpan.FromSeconds(5)));
        Assert.Equal(cancellation.Token, error.CancellationToken);
        Assert.Equal(1, handler.RequestCount);
        Assert.Empty(fixture.Channel.Events);
    }

    /// <summary>
    /// Verifies all native pipeline entry points reject an already-cancelled build before file access.
    /// </summary>
    [Fact]
    public async Task NativePipeline_WhenAlreadyCanceled_DoesNotTouchFiles()
    {
        using var fixture = new PipelineFixture();
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        var manifest = WebAppManifestContext.From(fixture.PackageOptions.Manifest!, fixture.PackageOptions.Url);
        var images = new ImageGeneratorResult([]);
        var token = cancellation.Token;
        var calls = new Func<Task>[]
        {
            () => fixture.MakeAppx.Execute("missing", "missing", token),
            () => fixture.MakeAppx.Bundle("missing", new Version(1, 0), token),
            () => fixture.MakeAppx.BundlePlatforms([], "missing", new Version(1, 0), token),
            () => fixture.MakePri.Execute("missing", "missing", token),
            () => fixture.Classic.Create(fixture.PackageOptions, manifest, images, "missing", null, token),
            () => fixture.Spartan.Create(fixture.PackageOptions, manifest, images, "missing", token),
            () => fixture.Modern.Create(fixture.PackageOptions, images, manifest, "missing", token),
            () => fixture.PwaBuilder.Run(fixture.PackageOptions, images, manifest, "missing", "", token),
            () => fixture.Creator.CreateMsixAsync(fixture.PackageOptions, token)
        };
        foreach (var call in calls)
        {
            var error = await Assert.ThrowsAnyAsync<OperationCanceledException>(call);
            Assert.Equal(token, error.CancellationToken);
        }
        Assert.Empty(Directory.EnumerateFileSystemEntries(fixture.Root));
    }

    /// <summary>
    /// Verifies ZIP contents and Unicode install scripts remain identical across all package flavors.
    /// </summary>
    [Fact]
    public async Task CreateZipPackage_PreservesAllPackageEntries()
    {
        using var fixture = new PipelineFixture();
        var artifacts = fixture.Temp.CreateDirectory();
        string WriteArtifact(string name, string content)
        {
            var path = Path.Combine(artifacts, name);
            File.WriteAllText(path, content);
            return path;
        }

        var modern = new ModernWindowsPackageResult(WriteArtifact("modern.msixbundle", "modern"), WriteArtifact("sideload.msix", "sideload"), new HostedPackage());
        var classic = new ClassicWindowsPackageResult { AppxFilePath = WriteArtifact("classic.appxbundle", "classic") };
        var loose = fixture.Temp.CreateDirectory();
        await File.WriteAllTextAsync(Path.Combine(loose, "AppxManifest.xml"), "spartan-manifest");
        var spartan = new SpartanWindowsPackageResult { AppxPath = WriteArtifact("spartan.appxbundle", "spartan"), AppxLooseFilesDirectory = loose };
        fixture.Settings.InstallScriptPath = WriteArtifact("install-template.ps1", "$$APP_DISPLAY_NAME$$ $$MSIX_FILE_NAME$$");
        fixture.Settings.SpartanInstallScriptPath = WriteArtifact("spartan-template.ps1", "$$APP_DISPLAY_NAME$$");
        fixture.Settings.PwaInstallerPath = WriteArtifact("installer.exe", "installer");
        fixture.Settings.ReadmePath = WriteArtifact("modern-readme.html", "modern-readme");
        fixture.Settings.SpartanReadmePath = WriteArtifact("spartan-readme.html", "spartan-readme");
        fixture.PackageOptions.Name = "PWA Café";
        fixture.PackageOptions.GenerateModernPackage = true;

        var createZip = typeof(WindowsAppPackageCreator).GetMethod("CreateZipPackage", BindingFlags.NonPublic | BindingFlags.Instance)!;
        var path = await (Task<string>)createZip.Invoke(fixture.Creator, [fixture.PackageOptions, modern, classic, spartan, CancellationToken.None])!;
        using var zip = ZipFile.OpenRead(path);
        Assert.Equal(new[]
        {
            "EdgeHTML-sideload\\AppxManifest.xml", "PWA Café.classic.appxbundle", "PWA Café.edgehtml.appxbundle",
            "PWA Café.msixbundle", "PWA Café.sideload.msix", "install-edgehtml.ps1", "install.ps1",
            "readme-edgehtml.html", "readme.html", "utils\\pwainstaller.exe"
        }.Order(), zip.Entries.Select(entry => entry.FullName).Order());
        using var script = zip.GetEntry("install.ps1")!.Open();
        using var bytes = new MemoryStream();
        await script.CopyToAsync(bytes);
        Assert.Equal(new byte[] { 0xef, 0xbb, 0xbf }, bytes.ToArray()[..3]);
        Assert.Equal("PWA Café PWA Café.sideload.msix", System.Text.Encoding.UTF8.GetString(bytes.ToArray()[3..]));
    }

    private static IOptions<AppSettings> Settings() => Options.Create(new AppSettings
    {
        ImageGeneratorApiUrl = new Uri("https://example.com/images"),
        OutputDirectory = Path.Combine(AppContext.BaseDirectory, $"pipeline-{Guid.NewGuid()}")
    });

    private sealed class HttpFactory(HttpClient http) : IHttpClientFactory
    {
        /// <inheritdoc/>
        public HttpClient CreateClient(string name) => http;
    }

    private sealed class CancelingHandler(CancellationToken token) : HttpMessageHandler
    {
        /// <summary>
        /// Gets the request count.
        /// </summary>
        public int RequestCount { get; private set; }

        /// <inheritdoc/>
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            RequestCount++;
            throw new OperationCanceledException(token);
        }
    }

    private sealed class BlockingHandler(bool onlyPost = false) : HttpMessageHandler
    {
        /// <summary>
        /// Signals when the cancellable request starts.
        /// </summary>
        public TaskCompletionSource Started { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);

        /// <summary>
        /// Gets the request count.
        /// </summary>
        public int RequestCount { get; private set; }

        /// <inheritdoc/>
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            RequestCount++;
            if (onlyPost && request.Method != HttpMethod.Post)
            {
                return new HttpResponseMessage(HttpStatusCode.OK) { Content = new ByteArrayContent([1, 2, 3]) };
            }
            Started.SetResult();
            await Task.Delay(Timeout.InfiniteTimeSpan, cancellationToken);
            throw new InvalidOperationException("The request should have been cancelled.");
        }
    }

    private sealed class ImageHandler : HttpMessageHandler
    {
        /// <inheritdoc/>
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            using var bytes = new MemoryStream();
            if (request.Method == HttpMethod.Post)
            {
                using var zip = new ZipArchive(bytes, ZipArchiveMode.Create, leaveOpen: true);
                using var image = zip.CreateEntry("windows/Square44x44Logo.scale-100.png").Open();
                image.Write([1, 2, 3]);
            }
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new ByteArrayContent(request.Method == HttpMethod.Post ? bytes.ToArray() : [1, 2, 3])
            });
        }
    }

    private sealed class TelemetryChannel : ITelemetryChannel
    {
        /// <summary>
        /// Gets locally captured build events.
        /// </summary>
        public List<EventTelemetry> Events { get; } = [];

        /// <inheritdoc/>
        public bool? DeveloperMode { get; set; }

        /// <inheritdoc/>
        public string EndpointAddress { get; set; } = "";

        /// <inheritdoc/>
        public void Send(ITelemetry item)
        {
            if (item is EventTelemetry telemetry)
            {
                Events.Add(telemetry);
            }
        }

        /// <inheritdoc/>
        public void Flush() { }

        /// <inheritdoc/>
        public void Dispose() { }
    }

    private sealed class Host(string root) : IWebHostEnvironment
    {
        /// <inheritdoc/>
        public string ApplicationName { get; set; } = "PackagingTests";

        /// <inheritdoc/>
        public string EnvironmentName { get; set; } = "Development";

        /// <inheritdoc/>
        public string ContentRootPath { get; set; } = root;

        /// <inheritdoc/>
        public string WebRootPath { get; set; } = root;

        /// <inheritdoc/>
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();

        /// <inheritdoc/>
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
    }

    private sealed class PipelineFixture : IDisposable
    {
        private readonly ServiceProvider provider;

        private readonly HttpClient http;

        private readonly ZombieProcessKiller killer;

        private readonly TelemetryConfiguration telemetry;

        /// <summary>
        /// Creates an isolated pipeline with in-memory HTTP and telemetry.
        /// </summary>
        public PipelineFixture(HttpMessageHandler? handler = null)
        {
            Root = Directory.CreateDirectory(Path.Combine(AppContext.BaseDirectory, $"pipeline-{Guid.NewGuid()}")).FullName;
            Settings = new AppSettings
            {
                ImageGeneratorApiUrl = new Uri("https://example.com/images"),
                OutputDirectory = Root,
                PwaBuilderPath = "missing-native-tool.exe",
                ApplicationInsightsConnectionString = "InstrumentationKey=00000000-0000-0000-0000-000000000001"
            };
            var settings = Options.Create(Settings);
            provider = new ServiceCollection()
                .AddScoped(_ => new TempDirectory(settings, NullLogger<TempDirectory>.Instance))
                .BuildServiceProvider();
            Scope = provider.CreateScope();
            Temp = Scope.ServiceProvider.GetRequiredService<TempDirectory>();
            http = new HttpClient(handler ?? new ImageHandler());
            var factory = new HttpFactory(http);
            var host = new Host(Root);
            killer = new ZombieProcessKiller(NullLogger<ZombieProcessKiller>.Instance);
            var runner = new ProcessRunner(NullLogger<ProcessRunner>.Instance, killer);
            MakeAppx = new MakeAppxWrapper(settings, runner, NullLogger<MakeAppxWrapper>.Instance);
            MakePri = new MakePriWrapper(settings, runner, NullLogger<MakePriWrapper>.Instance);
            PwaBuilder = new PwaBuilderWrapper(settings, runner, host, NullLogger<PwaBuilderWrapper>.Instance, factory, Temp,
                new WindowsActionsService(Temp, factory, NullLogger<WindowsActionsService>.Instance));
            Modern = new ModernWindowsPackageCreator(PwaBuilder, MakeAppx, MakePri, NullLogger<ModernWindowsPackageCreator>.Instance);
            Classic = new ClassicWindowsPackageCreator(MakeAppx, MakePri, settings);
            Spartan = new SpartanWindowsPackageCreator(MakePri, MakeAppx, settings);
            Channel = new TelemetryChannel();
            telemetry = new TelemetryConfiguration { TelemetryChannel = Channel, ConnectionString = Settings.ApplicationInsightsConnectionString };
            var analytics = new Analytics(settings, NullLogger<Analytics>.Instance, new TelemetryClient(telemetry),
                new CosmosDbService(settings, NullLogger<CosmosDbService>.Instance));
            Creator = new WindowsAppPackageCreator(Modern, Classic, Spartan,
                new WebManifestFinder(factory, NullLogger<WebManifestFinder>.Instance, Temp),
                new ImageGenerator(factory, settings, NullLogger<ImageGenerator>.Instance),
                Temp, analytics, host, factory, settings, NullLogger<WindowsAppPackageCreator>.Instance);
            PackageOptions = new WindowsAppPackageOptions
            {
                Url = new Uri("https://example.com"),
                Name = "Test PWA",
                PackageId = "Example.PWA",
                Version = "1.0.0",
                GenerateModernPackage = false,
                Manifest = JsonDocument.Parse("""{"icons":[{"src":"icon.png","sizes":"512x512","type":"image/png"}]}""")
            };
        }

        /// <summary>
        /// Gets the owned artifact root.
        /// </summary>
        public string Root { get; }

        /// <summary>
        /// Gets the build settings.
        /// </summary>
        public AppSettings Settings { get; }

        /// <summary>
        /// Gets the disposable build scope.
        /// </summary>
        public IServiceScope Scope { get; }

        /// <summary>
        /// Gets the scoped temporary-file owner.
        /// </summary>
        public TempDirectory Temp { get; }

        /// <summary>
        /// Gets the locally captured telemetry.
        /// </summary>
        public TelemetryChannel Channel { get; }

        /// <summary>
        /// Gets the package entry point.
        /// </summary>
        public WindowsAppPackageCreator Creator { get; }

        /// <summary>
        /// Gets the package options.
        /// </summary>
        public WindowsAppPackageOptions PackageOptions { get; }

        /// <summary>
        /// Gets the SDK packager.
        /// </summary>
        public MakeAppxWrapper MakeAppx { get; }

        /// <summary>
        /// Gets the SDK resource generator.
        /// </summary>
        public MakePriWrapper MakePri { get; }

        /// <summary>
        /// Gets the classic package generator.
        /// </summary>
        public ClassicWindowsPackageCreator Classic { get; }

        /// <summary>
        /// Gets the EdgeHTML package generator.
        /// </summary>
        public SpartanWindowsPackageCreator Spartan { get; }

        /// <summary>
        /// Gets the modern package generator.
        /// </summary>
        public ModernWindowsPackageCreator Modern { get; }

        /// <summary>
        /// Gets the native PWABuilder tool.
        /// </summary>
        public PwaBuilderWrapper PwaBuilder { get; }

        /// <inheritdoc/>
        public void Dispose()
        {
            Scope.Dispose();
            provider.Dispose();
            killer.Dispose();
            telemetry.Dispose();
            http.Dispose();
            PackageOptions.Manifest?.Dispose();
            Directory.Delete(Root, recursive: true);
        }
    }
}
