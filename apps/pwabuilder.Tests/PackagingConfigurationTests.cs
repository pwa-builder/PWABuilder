using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PWABuilder.Controllers;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Verifies packaging routing comes from destination-slot configuration, never build or host names.</summary>
public sealed class PackagingConfigurationTests
{
    /// <summary>The same production build reads the endpoint assigned to each slot.</summary>
    [Theory]
    [InlineData("https://pwabuilder-cloudapk-staging.azurewebsites.net")]
    [InlineData("https://pwabuilder-cloudapk.azurewebsites.net")]
    public async Task Returns_only_configured_endpoint_without_caching(string endpoint)
    {
        await using var app = await CreateApp(endpoint);
        var client = app.GetTestClient();
        var response = await client.GetAsync("/api/packaging/config");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.CacheControl?.NoStore);
        var body = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        Assert.NotNull(body);
        Assert.Single(body);
        Assert.Equal(endpoint, body["androidPackageGeneratorUrl"]);
    }

    /// <summary>Missing or unsafe settings must not silently send signing material to production or another host.</summary>
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("http://pwabuilder-cloudapk-staging.azurewebsites.net")]
    [InlineData("https://pwabuilder-cloudapk-staging.azurewebsites.net.evil.test")]
    [InlineData("https://pwabuilder-cloudapk.azurewebsites.net/path")]
    [InlineData("https://pwabuilder-cloudapk.azurewebsites.net?token=unsafe")]
    [InlineData("http://localhost:5858")]
    public async Task Invalid_hosted_configuration_fails_closed(string? endpoint)
    {
        await using var app = await CreateApp(endpoint);
        var response = await app.GetTestClient().GetAsync("/api/packaging/config");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.True(response.Headers.CacheControl?.NoStore);
        Assert.DoesNotContain("azurewebsites.net", await response.Content.ReadAsStringAsync());
    }

    /// <summary>Local development retains its existing local packager without hosted fallbacks.</summary>
    [Fact]
    public async Task Development_defaults_to_local_packager()
    {
        await using var app = await CreateApp(null, "Development");
        var response = await app.GetTestClient().GetFromJsonAsync<Dictionary<string, string>>("/api/packaging/config");
        Assert.Equal("http://localhost:5858", response!["androidPackageGeneratorUrl"]);
    }

    /// <summary>Hosts real controllers without cloud services or production requests.</summary>
    private static async Task<WebApplication> CreateApp(string? endpoint, string environment = "Production")
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = environment });
        builder.WebHost.UseTestServer();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Packaging:AndroidServiceUrl"] = endpoint
        });
        builder.Services.AddControllers().AddApplicationPart(typeof(SupportAdminController).Assembly);
        var app = builder.Build();
        app.MapControllers();
        await app.StartAsync();
        return app;
    }
}
