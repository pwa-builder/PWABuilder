using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace PWABuilder.MicrosoftStore.Tests;

/// <summary>
/// Verifies user-supplied manifest and icon URLs can only be fetched from public addresses (SSRF protection).
/// </summary>
public sealed class PublicNetworkGuardTests
{
    /// <summary>
    /// Verifies private, loopback, link-local, metadata, and reserved addresses are blocked.
    /// </summary>
    [Theory]
    [InlineData("10.0.0.1")]
    [InlineData("127.0.0.1")]
    [InlineData("169.254.169.254")]
    [InlineData("172.16.0.1")]
    [InlineData("192.168.0.1")]
    [InlineData("::1")]
    [InlineData("::ffff:10.0.0.1")]
    [InlineData("fd00::1")]
    [InlineData("fe80::1")]
    public void IsPublicAddress_BlocksNonPublicAddresses(string address)
    {
        Assert.False(PublicNetworkGuard.IsPublicAddress(IPAddress.Parse(address)));
    }

    /// <summary>
    /// Verifies ordinary internet addresses are allowed.
    /// </summary>
    [Theory]
    [InlineData("8.8.8.8")]
    [InlineData("2606:4700:4700::1111")]
    public void IsPublicAddress_AllowsPublicAddresses(string address)
    {
        Assert.True(PublicNetworkGuard.IsPublicAddress(IPAddress.Parse(address)));
    }

    /// <summary>
    /// Verifies a DNS name is rejected when any record is non-public, or when there are no records.
    /// </summary>
    [Theory]
    [InlineData]
    [InlineData("10.0.0.5")]
    [InlineData("8.8.8.8", "169.254.169.254")]
    public async Task ResolvePublicAddresses_RejectsNonPublicOrEmptyResolution(params string[] records)
    {
        Task<IPAddress[]> Resolve(string host, CancellationToken cancelToken) => Task.FromResult(records.Select(IPAddress.Parse).ToArray());
        await Assert.ThrowsAsync<PublicNetworkAccessDeniedException>(() => PublicNetworkGuard.ResolvePublicAddressesAsync("evil.example", Resolve, CancellationToken.None));
    }

    /// <summary>
    /// Verifies the guarded handler refuses to connect to non-public destinations.
    /// </summary>
    [Theory]
    [InlineData("http://169.254.169.254/metadata/instance")]
    [InlineData("https://127.0.0.1/manifest.json")]
    [InlineData("http://localhost/")]
    public async Task CreateHandler_BlocksNonPublicDestinations(string url)
    {
        using var http = new HttpClient(PublicNetworkGuard.CreateHandler());
        var error = await Assert.ThrowsAsync<HttpRequestException>(() => http.GetAsync(url));
        Assert.True(PublicNetworkGuard.IsAccessDenied(error));
    }

    /// <summary>
    /// Verifies package option validation rejects private IP literal URLs and manifest URLs.
    /// </summary>
    [Theory]
    [InlineData("https://10.0.0.1/", null)]
    [InlineData("https://example.com/", "https://169.254.169.254/manifest.json")]
    [InlineData("https://example.com/", "http://localhost/manifest.json")]
    public void GetValidationErrors_RejectsNonPublicAddresses(string url, string? manifestUrl)
    {
        var options = CreateValidOptions(url, manifestUrl);
        Assert.Contains(options.GetValidationErrors(new AppSettings { ImageGeneratorApiUrl = new Uri("https://example.com/") }), error => error.Contains("private network address"));
    }

    /// <summary>
    /// Verifies package option validation still accepts public URLs.
    /// </summary>
    [Fact]
    public void GetValidationErrors_AllowsPublicAddresses()
    {
        var options = CreateValidOptions("https://example.com/", "https://example.com/manifest.json");
        Assert.DoesNotContain(options.GetValidationErrors(new AppSettings { ImageGeneratorApiUrl = new Uri("https://example.com/") }), error => error.Contains("private network address"));
    }

    private static WindowsAppPackageOptions CreateValidOptions(string url, string? manifestUrl)
    {
        return new WindowsAppPackageOptions
        {
            PackageId = "Contoso.App",
            Url = new Uri(url),
            ManifestUrl = manifestUrl is null ? null : new Uri(manifestUrl),
            Version = "1.0.1"
        };
    }
}
