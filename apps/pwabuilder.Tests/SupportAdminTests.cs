using System.Net;
using System.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using PWABuilder.Controllers;
using PWABuilder.Models;
using PWABuilder.Services;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Offline coverage of real JWT authentication, support authorization and diagnostic projections.</summary>
public sealed class SupportAdminTests
{
    private static readonly Guid Tenant = Guid.Parse("79313999-1ba1-4b8e-bfe0-ae46b452d287");
    private static readonly Guid Client = Guid.Parse("e46a0c15-6f87-4a9c-aa4b-57716b43a65e");
    private static readonly RsaSecurityKey SigningKey = new(RSA.Create(2048)) { KeyId = "offline-test-key" };

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
        Assert.False(SupportAdminAuthentication.IsSupportReader(principal, Tenant, Client));
    }

    /// <summary>Production options validate API access tokens without cookies, client secrets or Graph permissions.</summary>
    [Fact]
    public async Task Authentication_options_are_secure_and_do_not_retain_tokens()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSupportAdmin(Configuration(true));
        await using var provider = services.BuildServiceProvider();
        var bearer = provider.GetRequiredService<IOptionsMonitor<JwtBearerOptions>>().Get(SupportAdminAuthentication.BearerScheme);
        Assert.Equal($"https://login.microsoftonline.com/{Tenant:D}/v2.0", bearer.Authority);
        Assert.Equal(Client.ToString("D"), bearer.Audience);
        Assert.True(bearer.TokenValidationParameters.ValidateIssuer);
        Assert.True(bearer.TokenValidationParameters.ValidateAudience);
        Assert.True(bearer.TokenValidationParameters.ValidateLifetime);
        Assert.True(bearer.TokenValidationParameters.RequireSignedTokens);
        Assert.False(bearer.SaveToken);
        Assert.False(bearer.IncludeErrorDetails);
        Assert.Equal(SupportAdminAuthentication.BearerScheme, provider.GetRequiredService<IOptions<AuthenticationOptions>>().Value.DefaultChallengeScheme);
    }

    /// <summary>All three routes enforce policy before reading data and always emit private response headers.</summary>
    [Theory]
    [InlineData(false, true, true, 401)]
    [InlineData(true, false, true, 403)]
    [InlineData(true, true, false, 403)]
    public async Task Admin_routes_reject_unauthorized_requests(bool authenticated, bool tenant, bool role, int status)
    {
        await using var app = await CreateAppAsync(true);
        var client = CreateClient(app, Principal(authenticated, tenant, role));
        foreach (var path in new[] { "/api/admin", "/api/admin/analyses/analysis:example.com:123", $"/api/admin/package-jobs/{Guid.NewGuid():D}" })
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
        await using var app = await CreateAppAsync(false);
        var client = app.GetTestClient();
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/admin")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/admin/config")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/admin")).StatusCode);
        Assert.Equal("public", await client.GetStringAsync("/api/support-test-public"));
    }

    /// <summary>Authorized support readers need no owner token; API responses contain only safe projections.</summary>
    [Fact]
    public async Task Authorized_reader_gets_encoded_safe_diagnostics_without_owner_token()
    {
        await using var app = await CreateAppAsync(true);
        var reference = Guid.NewGuid();
        var data = Package(reference);
        await app.Services.GetRequiredService<IRedisCache>().SaveAsync($"package-diagnostics:{reference:D}", data);
        var client = CreateClient(app, Principal(true, true, true));
        var response = await client.GetAsync($"/api/admin/package-jobs/{reference:D}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        Assert.DoesNotContain("secret-marker", json);
        Assert.Contains("Project generation", json);
        Assert.Contains("project generation failed", json);
        Assert.Contains("Gradle build timeout", json);
        var package = JsonSerializer.Deserialize<SupportPackage>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.NotNull(package);
        Assert.True(package.Configuration.HasKeyPassword);
        Assert.Equal("<script>alert(1)</script>", package.Configuration.Name);
        Assert.True(response.Headers.CacheControl?.NoStore);
        Assert.Contains("default-src 'none'", response.Headers.GetValues("Content-Security-Policy").Single());
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/admin/package-jobs/raw-job-id")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/admin/package-jobs/{Guid.Empty:D}")).StatusCode);
        var analysis = Analysis("analysis:example.com:123");
        await app.Services.GetRequiredService<IAnalysisStore>().SaveAsync(analysis);
        var analysisResponse = await client.GetAsync($"/api/admin/analyses/{analysis.Id}");
        Assert.Equal(HttpStatusCode.OK, analysisResponse.StatusCode);
        var analysisHtml = await analysisResponse.Content.ReadAsStringAsync();
        Assert.DoesNotContain("secret-marker", analysisHtml);
        Assert.DoesNotContain("password", analysisHtml);
        Assert.Contains("\"checks\"", analysisHtml);
        Assert.Contains("Manifest parsing failed", analysisHtml);
        Assert.Contains("Starting service worker scan", analysisHtml);
    }

    /// <summary>The unauthenticated shell exposes only sign-in assets and public IDs, not diagnostics or tokens.</summary>
    [Fact]
    public async Task Public_shell_and_configuration_expose_no_diagnostics()
    {
        await using var app = await CreateAppAsync(true);
        var client = app.GetTestClient();
        var configResponse = await client.GetAsync("/api/admin/config");
        Assert.Equal(HttpStatusCode.OK, configResponse.StatusCode);
        var config = JsonDocument.Parse(await configResponse.Content.ReadAsStringAsync()).RootElement;
        Assert.Equal(3, config.EnumerateObject().Count());
        Assert.Equal(Tenant.ToString("D"), config.GetProperty("tenantId").GetString());
        Assert.Equal(Client.ToString("D"), config.GetProperty("clientId").GetString());
        Assert.Equal($"api://{Client:D}/Support.Read", config.GetProperty("scope").GetString());
        Assert.True(configResponse.Headers.CacheControl?.NoStore);
        foreach (var path in new[] { "/admin", "/admin/signin-oidc?code=synthetic-code&state=synthetic-state",
            "/admin/analyses/analysis:example.com:123", $"/admin/package-jobs/{Guid.NewGuid():D}" })
        {
            var shell = await client.GetAsync(path);
            Assert.Equal(HttpStatusCode.OK, shell.StatusCode);
            var html = await shell.Content.ReadAsStringAsync();
            Assert.Contains("<support-admin>", html);
            Assert.Contains("<main>", html);
            Assert.Contains("<h1 slot=\"heading\">PWABuilder support</h1>", html);
            Assert.DoesNotContain("app-index", html);
            Assert.DoesNotContain("synthetic-code", html);
            Assert.True(shell.Headers.CacheControl?.NoStore);
            Assert.Equal("no-referrer", shell.Headers.GetValues("Referrer-Policy").Single());
            Assert.Equal(path.StartsWith("/admin/signin-oidc", StringComparison.Ordinal) ? "SAMEORIGIN" : "DENY",
                shell.Headers.GetValues("X-Frame-Options").Single());
        }
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/admin")).StatusCode);
    }

    /// <summary>ID tokens, app-only tokens, other clients and unassigned identities cannot access diagnostics.</summary>
    [Theory]
    [InlineData("scp")]
    [InlineData("roles")]
    [InlineData("tid")]
    [InlineData("oid")]
    [InlineData("azp")]
    [InlineData("ver")]
    public async Task Missing_access_token_claim_is_forbidden(string missingClaim)
    {
        await using var app = await CreateAppAsync(true);
        var client = app.GetTestClient();
        var claims = Principal(true, true, true).Claims.Where(claim => claim.Type != missingClaim);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token(claims));
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/admin")).StatusCode);
    }

    /// <summary>Signed tokens still require the exact delegated scope, version, and originating SPA.</summary>
    [Theory]
    [InlineData("scp", "Support.Read.All")]
    [InlineData("scp", "User.Read")]
    [InlineData("ver", "1.0")]
    [InlineData("azp", "8bab0280-aeb9-4ddb-b8a3-adf1d20554e7")]
    [InlineData("oid", "")]
    public async Task Incorrect_access_token_claim_is_forbidden(string type, string value)
    {
        await using var app = await CreateAppAsync(true);
        var client = app.GetTestClient();
        var claims = Principal(true, true, true).Claims.Where(claim => claim.Type != type).Append(new Claim(type, value));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token(claims));
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/admin")).StatusCode);
    }

    /// <summary>Actual bearer validation rejects expired, wrong-audience, wrong-issuer, and forged signatures.</summary>
    [Theory]
    [InlineData("expired")]
    [InlineData("graph")]
    [InlineData("issuer")]
    [InlineData("signature")]
    public async Task Invalid_tokens_are_unauthenticated(string failure)
    {
        await using var app = await CreateAppAsync(true);
        var client = app.GetTestClient();
        var jwt = Token(Principal(true, true, true).Claims,
            audience: failure is "graph" ? "00000003-0000-0000-c000-000000000000" : null,
            issuer: failure is "issuer" ? "https://issuer.example.test" : null,
            expires: failure is "expired" ? DateTime.UtcNow.AddMinutes(-5) : null,
            key: failure is "signature" ? new RsaSecurityKey(RSA.Create(2048)) { KeyId = "forged" } : null);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwt);
        var response = await client.GetAsync("/api/admin");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.True(response.Headers.CacheControl?.NoStore);
        Assert.DoesNotContain(jwt, await response.Content.ReadAsStringAsync());
    }

    /// <summary>Neither query-string credentials nor the retired support cookie authenticate API calls.</summary>
    [Fact]
    public async Task Tokens_are_accepted_only_in_authorization_header()
    {
        await using var app = await CreateAppAsync(true);
        var client = app.GetTestClient();
        var token = Token(Principal(true, true, true).Claims);
        client.DefaultRequestHeaders.Add("Cookie", $"__Host-PWABuilder.Support={token}");
        var response = await client.GetAsync("/api/admin?access_token=" + token);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
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
            new("oid", Guid.NewGuid().ToString("D")),
            new("azp", Client.ToString("D")),
            new("ver", "2.0"),
            new("scp", SupportAdminAuthentication.Scope)
        };
        if (role) claims.Add(new Claim("roles", SupportAdminAuthentication.Role));
        return new ClaimsPrincipal(new ClaimsIdentity(claims, authenticated ? "Test" : null));
    }

    /// <summary>Provides synthetic test configuration, not deployment credentials.</summary>
    private static IConfiguration Configuration(bool configured) => new ConfigurationBuilder()
        .AddInMemoryCollection(configured ? new Dictionary<string, string?>
        {
            ["SupportAdmin:TenantId"] = Tenant.ToString("D"),
            ["SupportAdmin:ClientId"] = Client.ToString("D")
        } : []).Build();

    /// <summary>Hosts the actual bearer handler with an offline signing key instead of Entra metadata.</summary>
    private static async Task<WebApplication> CreateAppAsync(bool configured)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Development" });
        builder.WebHost.UseTestServer();
        builder.Configuration.AddConfiguration(Configuration(configured));
        var enabled = builder.Services.AddSupportAdmin(builder.Configuration);
        builder.Services.PostConfigure<JwtBearerOptions>(SupportAdminAuthentication.BearerScheme, options =>
        {
            var metadata = new OpenIdConnectConfiguration { Issuer = $"https://login.microsoftonline.com/{Tenant:D}/v2.0" };
            metadata.SigningKeys.Add(SigningKey);
            options.ConfigurationManager = new StaticConfigurationManager<OpenIdConnectConfiguration>(metadata);
        });
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

    /// <summary>Creates a client carrying a signed test access token, or no credential for anonymous requests.</summary>
    private static HttpClient CreateClient(WebApplication app, ClaimsPrincipal principal)
    {
        var client = app.GetTestClient();
        if (principal.Identity?.IsAuthenticated is true)
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token(principal.Claims));
        }
        return client;
    }

    /// <summary>Signs a synthetic token for testing the complete bearer-token validation path.</summary>
    private static string Token(IEnumerable<Claim> claims, string? audience = null, string? issuer = null,
        DateTime? expires = null, RsaSecurityKey? key = null)
    {
        var jwt = new JwtSecurityToken(
            issuer ?? $"https://login.microsoftonline.com/{Tenant:D}/v2.0",
            audience ?? Client.ToString("D"),
            claims, DateTime.UtcNow.AddHours(-1), expires ?? DateTime.UtcNow.AddMinutes(10),
            new SigningCredentials(key ?? SigningKey, SecurityAlgorithms.RsaSha256));
        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}
