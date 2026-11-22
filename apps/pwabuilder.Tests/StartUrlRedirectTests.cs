using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using PWABuilder.Models;
using PWABuilder.Services;
using PWABuilder.Validations.Services;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Covers the start_url redirect check (#4527).</summary>
public sealed class StartUrlRedirectTests
{
    /// <summary>A redirect that stays on the origin and inside the scope passes, as does no redirect at all.</summary>
    [Theory]
    [InlineData("/", null, "https://example.com/")]
    [InlineData("/", null, "https://example.com/en/")]
    [InlineData("/app/", "/app/", "https://example.com/app/home")]
    [InlineData("/app/start", null, "https://example.com/app/start?lang=en")]
    public async Task Redirects_that_stay_in_scope_pass(string startUrl, string? scope, string finalUrl)
    {
        var capability = await CheckAsync(startUrl, scope, new Uri(finalUrl));

        Assert.Equal(PwaCapabilityCheckStatus.Passed, capability.Status);
        Assert.Null(capability.ErrorMessage);
    }

    /// <summary>A redirect to another origin fails and names the destination.</summary>
    [Theory]
    [InlineData("https://login.example.net/signin")]
    [InlineData("https://www.example.com/")]
    [InlineData("http://example.com/")]
    public async Task Redirect_to_another_origin_fails(string finalUrl)
    {
        var capability = await CheckAsync("/", null, new Uri(finalUrl));

        Assert.Equal(PwaCapabilityCheckStatus.Failed, capability.Status);
        Assert.Contains("different origin", capability.ErrorMessage);
    }

    /// <summary>A same origin redirect that leaves the scope fails and names the scope.</summary>
    [Theory]
    [InlineData("/app/", "/app/", "https://example.com/login")]
    [InlineData("/app/", "/app/", "https://example.com/app")]
    [InlineData("/app/start", null, "https://example.com/other/start")]
    public async Task Redirect_outside_the_scope_fails(string startUrl, string? scope, string finalUrl)
    {
        var capability = await CheckAsync(startUrl, scope, new Uri(finalUrl));

        Assert.Equal(PwaCapabilityCheckStatus.Failed, capability.Status);
        Assert.Contains("outside your app's scope (/app/)", capability.ErrorMessage);
    }

    /// <summary>When the final URL can't be determined, the check only requires start_url to exist.</summary>
    [Fact]
    public async Task Unknown_final_url_does_not_fail_the_check()
    {
        var capability = await CheckAsync("/", null, finalUrl: null);

        Assert.Equal(PwaCapabilityCheckStatus.Passed, capability.Status);
    }

    /// <summary>A scope that doesn't contain start_url is ignored, so the default scope applies.</summary>
    [Fact]
    public async Task Scope_that_excludes_start_url_falls_back_to_the_default()
    {
        var capability = await CheckAsync("/app/", "/other/", new Uri("https://example.com/app/home"));

        Assert.Equal(PwaCapabilityCheckStatus.Passed, capability.Status);
    }

    /// <summary>A missing start_url still fails as before, without a network request.</summary>
    [Fact]
    public async Task Missing_start_url_fails_without_a_request()
    {
        var resolver = new FakeResolver(new Uri("https://example.com/"));
        var capability = await CheckAsync(null, null, resolver);

        Assert.Equal(PwaCapabilityCheckStatus.Failed, capability.Status);
        Assert.Equal(0, resolver.Calls);
    }

    /// <summary>Without a resolver, as in callers that don't register one, the check is the old field check.</summary>
    [Fact]
    public async Task No_resolver_means_field_check_only()
    {
        var detection = CreateDetection("/", null);
        var capabilities = await new ManifestAnalyzer(new ValidImageService()).TryAnalyzeManifestAsync(detection, NullLogger.Instance, CancellationToken.None);

        Assert.Equal(PwaCapabilityCheckStatus.Passed, capabilities.Single(c => c.Id == PwaCapabilityId.StartUrl).Status);
    }

    private static Task<PwaCapability> CheckAsync(string? startUrl, string? scope, Uri? finalUrl) =>
        CheckAsync(startUrl, scope, new FakeResolver(finalUrl));

    private static async Task<PwaCapability> CheckAsync(string? startUrl, string? scope, FakeResolver resolver)
    {
        var capabilities = await new ManifestAnalyzer(new ValidImageService(), resolver)
            .TryAnalyzeManifestAsync(CreateDetection(startUrl, scope), NullLogger.Instance, CancellationToken.None);
        return capabilities.Single(c => c.Id == PwaCapabilityId.StartUrl);
    }

    private static ManifestDetection CreateDetection(string? startUrl, string? scope)
    {
        var manifest = new Dictionary<string, string> { ["name"] = "App" };
        if (startUrl is not null)
        {
            manifest["start_url"] = startUrl;
        }

        if (scope is not null)
        {
            manifest["scope"] = scope;
        }

        var json = JsonSerializer.Serialize(manifest);
        return new ManifestDetection
        {
            Url = new Uri("https://example.com/manifest.json"),
            Manifest = JsonSerializer.Deserialize<JsonElement>(json),
            ManifestRaw = json
        };
    }

    /// <summary>Returns a fixed final URL instead of making a request.</summary>
    private sealed class FakeResolver(Uri? finalUrl) : IUrlRedirectResolver
    {
        public int Calls { get; private set; }

        public Task<Uri?> TryGetFinalUrlAsync(Uri url, CancellationToken cancelToken)
        {
            Calls++;
            return Task.FromResult(finalUrl);
        }
    }

    /// <summary>Avoids network requests while exercising manifest checks.</summary>
    private sealed class ValidImageService : IImageValidationService
    {
        public Task<Result<bool>> TryImageExistsAsync(Uri imageUri, CancellationToken cancelToken) => Task.FromResult(Result.From(true));

        public Task<Result<bool>> TryValidateImageTypeAsync(Uri imageUri, string? declaredType, CancellationToken cancelToken) => Task.FromResult(Result.From(true));

        public Task<Result<string?>> TryDetectImageTypeAsync(Uri imageUri, CancellationToken cancelToken) => Task.FromResult(Result.From<string?>("image/png"));

        public Task<Result<bool>> TryValidateImageSizeAsync(Uri imageUri, string? declaredSizes, CancellationToken cancelToken) => Task.FromResult(Result.From(true));

        public Task<Result<bool>> IsValidImageAsync(Stream imageStream, CancellationToken cancellationToken) => Task.FromResult(Result.From(true));
    }
}

/// <summary>Covers UrlRedirectResolver with a fake HTTP handler.</summary>
public sealed class UrlRedirectResolverTests
{
    /// <summary>The final request URI is returned, which is where the client ended up after following redirects.</summary>
    [Fact]
    public async Task Returns_the_final_request_uri()
    {
        var final = new Uri("https://example.com/en/");
        var resolver = Create(_ => new HttpResponseMessage(System.Net.HttpStatusCode.OK) { RequestMessage = new HttpRequestMessage(HttpMethod.Get, final) });

        Assert.Equal(final, await resolver.TryGetFinalUrlAsync(new Uri("https://example.com/"), CancellationToken.None));
    }

    /// <summary>Network errors and timeouts give null rather than throwing, so the check doesn't fail the site.</summary>
    [Fact]
    public async Task Network_errors_give_null()
    {
        var failing = Create(_ => throw new HttpRequestException("connection refused"));
        var timingOut = Create(_ => throw new TaskCanceledException("timeout"));

        Assert.Null(await failing.TryGetFinalUrlAsync(new Uri("https://example.com/"), CancellationToken.None));
        Assert.Null(await timingOut.TryGetFinalUrlAsync(new Uri("https://example.com/"), CancellationToken.None));
    }

    /// <summary>Cancelling the analysis still cancels: it is not swallowed as a network error.</summary>
    [Fact]
    public async Task Caller_cancellation_is_not_swallowed()
    {
        using var cancel = new CancellationTokenSource();
        cancel.Cancel();
        var resolver = Create(_ => throw new TaskCanceledException());

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => resolver.TryGetFinalUrlAsync(new Uri("https://example.com/"), cancel.Token));
    }

    private static UrlRedirectResolver Create(Func<HttpRequestMessage, HttpResponseMessage> respond) =>
        new(new FakeFactory(new FakeHandler(respond)), NullLogger<UrlRedirectResolver>.Instance);

    private sealed class FakeHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => Task.FromResult(respond(request));
    }

    private sealed class FakeFactory(HttpMessageHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }
}
