using System.Net;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PWABuilder.Controllers;
using PWABuilder.Models;
using PWABuilder.Services;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Offline coverage of support authorization, safe projections, and real Razor HTTP endpoints.</summary>
public sealed class SupportAdminTests
{
    private static readonly Guid Tenant = Guid.Parse("79313999-1ba1-4b8e-bfe0-ae46b452d287");

    /// <summary>The actual policy rejects anonymous, wrong-tenant, missing-role, and unconfigured access.</summary>
    [Theory]
    [InlineData(false, true, true, true, false)]
    [InlineData(true, false, true, true, false)]
    [InlineData(true, true, false, true, false)]
    [InlineData(true, true, true, false, false)]
    [InlineData(true, true, true, true, true)]
    public async Task Policy_requires_authenticated_assigned_role_in_configured_tenant(
        bool authenticated, bool correctTenant, bool role, bool configured, bool expected)
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSupportAdmin(Configuration(configured));
        await using var provider = services.BuildServiceProvider();
        var authorization = provider.GetRequiredService<IAuthorizationService>();
        var result = await authorization.AuthorizeAsync(Principal(authenticated, correctTenant, role), null,
            SupportAdminAuthentication.Policy);
        Assert.Equal(expected, result.Succeeded);
    }

    /// <summary>Tenant and role cannot be spliced across identities or inferred from an email address.</summary>
    [Fact]
    public void Policy_does_not_combine_identities_or_trust_email_suffix()
    {
        var principal = new ClaimsPrincipal([
            new ClaimsIdentity([new Claim("tid", Tenant.ToString()), new Claim("email", "reader@microsoft.com")], "one"),
            new ClaimsIdentity([new Claim("roles", SupportAdminAuthentication.Role)], "two")
        ]);
        Assert.False(SupportAdminAuthentication.IsSupportReader(principal, Tenant));
    }

    /// <summary>Production options use secure bounded cookies and a single-tenant code flow without Graph.</summary>
    [Fact]
    public async Task Authentication_options_are_secure_and_do_not_retain_tokens()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSupportAdmin(Configuration(true));
        await using var provider = services.BuildServiceProvider();
        var cookie = provider.GetRequiredService<IOptionsMonitor<CookieAuthenticationOptions>>()
            .Get(SupportAdminAuthentication.CookieScheme);
        Assert.True(cookie.Cookie.HttpOnly);
        Assert.Equal(Microsoft.AspNetCore.Http.CookieSecurePolicy.Always, cookie.Cookie.SecurePolicy);
        Assert.Equal("__Host-PWABuilder.Support", cookie.Cookie.Name);
        Assert.False(cookie.SlidingExpiration);
        var oidc = provider.GetRequiredService<IOptionsMonitor<OpenIdConnectOptions>>().Get("SupportEntra");
        Assert.Equal($"https://login.microsoftonline.com/{Tenant:D}/v2.0", oidc.Authority);
        Assert.Equal("/admin/signin-oidc", oidc.CallbackPath);
        Assert.Equal("code", oidc.ResponseType);
        Assert.False(oidc.SaveTokens);
        Assert.False(oidc.GetClaimsFromUserInfoEndpoint);
        Assert.Equal(["openid"], oidc.Scope);
        Assert.Equal("SupportEntra", provider.GetRequiredService<IOptions<AuthenticationOptions>>().Value.DefaultChallengeScheme);
    }

    /// <summary>All three routes enforce policy before reading data and always emit private response headers.</summary>
    [Theory]
    [InlineData(false, true, true, 401)]
    [InlineData(true, false, true, 403)]
    [InlineData(true, true, false, 403)]
    public async Task Admin_routes_reject_unauthorized_requests(bool authenticated, bool tenant, bool role, int status)
    {
        await using var app = await CreateAppAsync(true, Principal(authenticated, tenant, role));
        var client = app.GetTestClient();
        foreach (var path in new[] { "/admin", "/admin/analyses/analysis:example.com:123", $"/admin/package-jobs/{Guid.NewGuid():D}" })
        {
            var response = await client.GetAsync(path);
            Assert.Equal(status, (int)response.StatusCode);
            Assert.True(response.Headers.CacheControl?.NoStore);
            Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
        }
    }

    /// <summary>Missing configuration disables support while the public app remains available.</summary>
    [Fact]
    public async Task Unconfigured_support_fails_closed_without_breaking_public_routes()
    {
        await using var app = await CreateAppAsync(false, Principal(true, true, true));
        var client = app.GetTestClient();
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/admin")).StatusCode);
        Assert.Equal("public", await client.GetStringAsync("/api/support-test-public"));
    }

    /// <summary>Authorized support readers need no owner token; Razor encodes untrusted metadata.</summary>
    [Fact]
    public async Task Authorized_reader_gets_encoded_safe_diagnostics_without_owner_token()
    {
        await using var app = await CreateAppAsync(true, Principal(true, true, true));
        var reference = Guid.NewGuid();
        var data = Package(reference);
        await app.Services.GetRequiredService<IRedisCache>().SaveAsync($"package-diagnostics:{reference:D}", data);
        var client = app.GetTestClient();
        var response = await client.GetAsync($"/admin/package-jobs/{reference:D}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var html = await response.Content.ReadAsStringAsync();
        Assert.Contains("&lt;script&gt;", html);
        Assert.DoesNotContain("<script>", html);
        Assert.DoesNotContain("secret-marker", html);
        Assert.DoesNotContain("hasKeyPassword", html);
        Assert.Contains("Project generation", html);
        Assert.Contains("project generation failed", html);
        Assert.Contains("Gradle build timeout", html);
        Assert.Contains("Uploaded key supplied", html);
        Assert.True(response.Headers.CacheControl?.NoStore);
        Assert.Contains("default-src 'none'", response.Headers.GetValues("Content-Security-Policy").Single());
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/admin")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/admin/package-jobs/raw-job-id")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/admin/package-jobs/{Guid.Empty:D}")).StatusCode);
        var analysis = Analysis("analysis:example.com:123");
        await app.Services.GetRequiredService<IAnalysisStore>().SaveAsync(analysis);
        var analysisResponse = await client.GetAsync($"/admin/analyses/{analysis.Id}");
        Assert.Equal(HttpStatusCode.OK, analysisResponse.StatusCode);
        var analysisHtml = await analysisResponse.Content.ReadAsStringAsync();
        Assert.DoesNotContain("secret-marker", analysisHtml);
        Assert.DoesNotContain("password", analysisHtml);
        Assert.Contains("Structured checks", analysisHtml);
        Assert.Contains("Manifest parsing failed", analysisHtml);
        Assert.Contains("Starting service worker scan", analysisHtml);
    }

    /// <summary>Analysis support data never contains raw logs, URLs, errors, or capability error text.</summary>
    [Fact]
    public void Analysis_projection_excludes_sensitive_fields_and_keeps_structured_checks()
    {
        var analysis = Analysis("analysis:example.com:123");
        analysis.Capabilities[0].ErrorMessage = "secret-marker";
        var projection = SupportDiagnosticsService.ProjectAnalysis(analysis);
        Assert.Equal("https://example.com", projection.SiteOrigin);
        Assert.Equal(analysis.Capabilities.Count, projection.Checks.Count);
        var json = JsonSerializer.Serialize(projection);
        Assert.DoesNotContain("secret-marker", json);
        Assert.DoesNotContain("password", json);
        Assert.Contains("Analysis failed", json);
        Assert.Contains("Manifest parsing failed", projection.Error);
        Assert.Contains("Starting service worker scan", projection.Logs.Single());
    }

    /// <summary>Recent analysis results have a strict count, status, date window, and newest-first order.</summary>
    [Fact]
    public async Task Recent_analysis_query_is_bounded_and_omits_old_or_successful_records()
    {
        var store = new InMemoryAnalysisStore();
        for (var index = 0; index < 70; index++)
        {
            var analysis = Analysis($"analysis:example.com:{index}");
            await store.SaveAsync(analysis);
            analysis.LastModifiedAt = DateTimeOffset.UtcNow.AddMinutes(-index);
        }
        var old = Analysis("analysis:example.com:old");
        await store.SaveAsync(old);
        old.LastModifiedAt = DateTimeOffset.UtcNow.AddDays(-15);
        var healthy = Analysis("analysis:example.com:healthy");
        healthy.Status = AnalysisStatus.Completed;
        await store.SaveAsync(healthy);
        var results = await store.GetRecentFailuresAsync();
        Assert.Equal(50, results.Count);
        Assert.All(results, item => Assert.Equal(AnalysisStatus.Failed, item.Status));
        Assert.All(results, item => Assert.Empty(item.Logs));
        Assert.All(results, item => Assert.Empty(item.Error));
        Assert.Equal(results.OrderByDescending(item => item.UpdatedAt), results);
        Assert.Null(await store.GetSupportByIdAsync(old.Id));
    }

    /// <summary>Package parsing handles Node casing independently and drops secrets and malformed inputs.</summary>
    [Fact]
    public void Package_projection_rejects_mismatched_or_expired_data_and_excludes_secrets()
    {
        var reference = Guid.NewGuid();
        var json = JsonSerializer.Serialize(Package(reference), new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        json = json.Replace("\"configuration\":{", "\"configuration\":{\"signingKey\":\"secret-marker\",\"hasKeyPassword\":true,");
        var parsed = RedisCache.DeserializePackageDiagnostics(json);
        Assert.NotNull(parsed);
        Assert.Equal(reference.ToString("D"), parsed.SupportReference);
        var projection = SupportDiagnosticsService.ProjectPackage(parsed, reference, DateTimeOffset.UtcNow);
        Assert.NotNull(projection);
        var serialized = JsonSerializer.Serialize(projection);
        Assert.DoesNotContain("secret-marker", serialized);
        Assert.DoesNotContain("signingKey", serialized);
        Assert.True(projection.Configuration.HasKeyPassword);
        Assert.Equal("mine", projection.Configuration.SigningMode);
        Assert.Null(SupportDiagnosticsService.ProjectPackage(parsed, Guid.NewGuid(), DateTimeOffset.UtcNow));
        Assert.Null(SupportDiagnosticsService.ProjectPackage(parsed, reference, DateTimeOffset.UtcNow.AddDays(15)));
        Assert.Null(RedisCache.DeserializePackageDiagnostics("{broken"));
        Assert.Null(RedisCache.DeserializePackageDiagnostics(new string('x', 600 * 1024 + 1)));
    }

    /// <summary>Only HTTP(S) origins survive sanitization.</summary>
    [Theory]
    [InlineData("https://user:password@example.com:8443/path?token=secret#fragment", "https://example.com:8443")]
    [InlineData("javascript:alert(1)", "(unavailable)")]
    [InlineData("not a url", "(unavailable)")]
    public void Origins_strip_credentials_path_query_and_fragment(string input, string expected) =>
        Assert.Equal(expected, SupportDiagnosticsService.SanitizeOrigin(input));

    /// <summary>Recent package reads are bounded and disregard unrelated raw job records.</summary>
    [Fact]
    public async Task Package_failure_list_is_bounded_and_reads_only_diagnostics_keys()
    {
        var cache = new InMemoryRedisCache();
        for (var index = 0; index < 70; index++)
        {
            var reference = Guid.NewGuid();
            await cache.SaveAsync($"package-diagnostics:{reference:D}", Package(reference));
        }
        var unrelated = Guid.NewGuid();
        await cache.SaveAsync(unrelated.ToString("D"), Package(unrelated));
        var diagnostics = new SupportDiagnosticsService(cache);
        var failures = await diagnostics.GetRecentPackagesAsync();
        Assert.Equal(50, failures.Count);
        Assert.Null(await diagnostics.GetPackageAsync(unrelated));
    }

    /// <summary>Creates an analysis containing sensitive sentinel values.</summary>
    private static Analysis Analysis(string id) => new()
    {
        Id = id,
        Url = new Uri("https://user:password@example.com/secret-marker?token=secret-marker#secret-marker"),
        Status = AnalysisStatus.Failed,
        Error = "Manifest parsing failed; apiToken=secret-marker",
        Logs = ["Starting service worker scan; accessToken=secret-marker"]
    };

    /// <summary>Creates a valid producer diagnostic with unsafe free-text sentinel values.</summary>
    private static PackageDiagnosticsData Package(Guid reference) => new()
    {
        SupportReference = reference.ToString("D"),
        Status = "Failed",
        CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-5),
        UpdatedAt = DateTimeOffset.UtcNow.AddMinutes(-1),
        SiteOrigin = "https://user:password@example.com/secret-marker?token=secret-marker",
        Configuration = new PackageSupportConfiguration
        {
            Name = "<script>alert(1)</script>", PackageId = "com.example.app",
            SigningMode = "mine", HasUploadedKey = true, HasKeyPassword = true, HasStorePassword = true
        },
        Logs = ["bubblewrap project generation failed; keyPassword=secret-marker"],
        Errors = ["Gradle build timeout; storePassword=secret-marker"]
    };

    /// <summary>Creates an isolated test principal without contacting an identity provider.</summary>
    private static ClaimsPrincipal Principal(bool authenticated, bool correctTenant, bool role)
    {
        var claims = new List<Claim>
        {
            new("tid", (correctTenant ? Tenant : Guid.NewGuid()).ToString("D")),
            new("oid", Guid.NewGuid().ToString("D"))
        };
        if (role) claims.Add(new Claim("roles", SupportAdminAuthentication.Role));
        return new ClaimsPrincipal(new ClaimsIdentity(claims, authenticated ? "Test" : null));
    }

    /// <summary>Provides synthetic test configuration, not deployment credentials.</summary>
    private static IConfiguration Configuration(bool configured) => new ConfigurationBuilder()
        .AddInMemoryCollection(configured ? new Dictionary<string, string?>
        {
            ["SupportAdmin:TenantId"] = Tenant.ToString("D"),
            ["SupportAdmin:ClientId"] = Guid.NewGuid().ToString("D"),
            ["SupportAdmin:ClientSecret"] = "test-only-not-a-credential"
        } : []).Build();

    /// <summary>Hosts the real controller, policy, and compiled Razor views with local test authentication.</summary>
    private static async Task<WebApplication> CreateAppAsync(bool configured, ClaimsPrincipal principal)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Testing" });
        builder.WebHost.UseTestServer();
        var enabled = builder.Services.AddSupportAdmin(Configuration(configured));
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = "Test";
            options.DefaultChallengeScheme = "Test";
            options.DefaultForbidScheme = "Test";
        }).AddScheme<TestAuthenticationOptions, TestAuthenticationHandler>("Test", options => options.Principal = principal);
        builder.Services.AddSingleton<IAnalysisStore, InMemoryAnalysisStore>();
        builder.Services.AddSingleton<IRedisCache, InMemoryRedisCache>();
        builder.Services.AddScoped<SupportDiagnosticsService>();
        builder.Services.AddControllersWithViews().AddApplicationPart(typeof(SupportAdminController).Assembly);
        var app = builder.Build();
        app.UseRouting();
        app.UseSupportAdmin(enabled);
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.MapGet("/api/support-test-public", () => "public");
        await app.StartAsync();
        return app;
    }

    private sealed class TestAuthenticationOptions : AuthenticationSchemeOptions
    {
        /// <summary>The synthetic test identity.</summary>
        public ClaimsPrincipal Principal { get; set; } = new();
    }

    private sealed class TestAuthenticationHandler : AuthenticationHandler<TestAuthenticationOptions>
    {
        /// <summary>Creates the local test authentication handler.</summary>
        public TestAuthenticationHandler(IOptionsMonitor<TestAuthenticationOptions> options,
            ILoggerFactory logger, UrlEncoder encoder) : base(options, logger, encoder) { }

        /// <inheritdoc/>
        protected override Task<AuthenticateResult> HandleAuthenticateAsync() =>
            Task.FromResult(Options.Principal.Identity?.IsAuthenticated is true
                ? AuthenticateResult.Success(new AuthenticationTicket(Options.Principal, Scheme.Name))
                : AuthenticateResult.NoResult());
    }
}
