using System.Net;
using PWABuilder.Common;
using Xunit;

namespace PWABuilder.Tests;

/// <summary>Verifies outbound fetches of user-supplied URLs can only reach public addresses (SSRF protection).</summary>
public sealed class PublicNetworkGuardTests
{
    /// <summary>Private, loopback, link-local, metadata, and reserved addresses are blocked.</summary>
    [Theory]
    [InlineData("0.0.0.0")]
    [InlineData("10.1.2.3")]
    [InlineData("100.64.0.1")]
    [InlineData("127.0.0.1")]
    [InlineData("169.254.169.254")]
    [InlineData("172.16.0.1")]
    [InlineData("172.31.255.255")]
    [InlineData("192.168.1.1")]
    [InlineData("198.18.0.1")]
    [InlineData("224.0.0.1")]
    [InlineData("255.255.255.255")]
    [InlineData("::")]
    [InlineData("::1")]
    [InlineData("::ffff:127.0.0.1")]
    [InlineData("::ffff:169.254.169.254")]
    [InlineData("::ffff:8.8.8.8")]
    [InlineData("64:ff9b::a9fe:a9fe")]
    [InlineData("2002:a9fe:a9fe::")]
    [InlineData("fc00::1")]
    [InlineData("fd12:3456::1")]
    [InlineData("fe80::1")]
    [InlineData("ff02::1")]
    public void Non_public_addresses_are_blocked(string address)
    {
        Assert.False(PublicNetworkGuard.IsPublicAddress(IPAddress.Parse(address)));
    }

    /// <summary>Ordinary internet addresses are allowed.</summary>
    [Theory]
    [InlineData("8.8.8.8")]
    [InlineData("1.1.1.1")]
    [InlineData("13.107.42.14")]
    [InlineData("172.32.0.1")]
    [InlineData("2606:4700:4700::1111")]
    [InlineData("2620:1ec:bdf::40")]
    public void Public_addresses_are_allowed(string address)
    {
        Assert.True(PublicNetworkGuard.IsPublicAddress(IPAddress.Parse(address)));
    }

    /// <summary>A DNS name is rejected when any of its records points at a non-public address.</summary>
    [Theory]
    [InlineData("10.0.0.5")]
    [InlineData("8.8.8.8", "169.254.169.254")]
    public async Task Host_resolving_to_any_non_public_address_is_rejected(params string[] records)
    {
        var resolver = FakeResolver(records);
        await Assert.ThrowsAsync<PublicNetworkAccessDeniedException>(() => PublicNetworkGuard.ResolvePublicAddressesAsync("evil.example", resolver, CancellationToken.None));
    }

    /// <summary>A DNS name with no records is rejected.</summary>
    [Fact]
    public async Task Host_resolving_to_nothing_is_rejected()
    {
        await Assert.ThrowsAsync<PublicNetworkAccessDeniedException>(() => PublicNetworkGuard.ResolvePublicAddressesAsync("empty.example", FakeResolver(), CancellationToken.None));
    }

    /// <summary>A DNS name resolving only to public addresses returns those addresses.</summary>
    [Fact]
    public async Task Host_resolving_to_public_addresses_is_allowed()
    {
        var addresses = await PublicNetworkGuard.ResolvePublicAddressesAsync("good.example", FakeResolver("8.8.8.8", "2606:4700:4700::1111"), CancellationToken.None);
        Assert.Equal(2, addresses.Length);
    }

    /// <summary>IP literal hosts, including bracketed IPv6, are validated without DNS.</summary>
    [Theory]
    [InlineData("[::1]")]
    [InlineData("[fd00::1]")]
    [InlineData("10.0.0.1")]
    public async Task Ip_literal_hosts_are_validated_without_dns(string host)
    {
        await Assert.ThrowsAsync<PublicNetworkAccessDeniedException>(() => PublicNetworkGuard.ResolvePublicAddressesAsync(host, ThrowingResolver, CancellationToken.None));
    }

    /// <summary>The guarded handler refuses to connect to non-public addresses, and the failure is recognizable.</summary>
    [Theory]
    [InlineData("http://127.0.0.1/")]
    [InlineData("http://169.254.169.254/latest/meta-data/")]
    [InlineData("https://[::1]/")]
    [InlineData("http://localhost/")]
    public async Task Guarded_handler_blocks_non_public_destinations(string url)
    {
        using var http = new HttpClient(PublicNetworkGuard.CreateHandler());
        var error = await Assert.ThrowsAsync<HttpRequestException>(() => http.GetAsync(url));
        Assert.True(PublicNetworkGuard.IsAccessDenied(error));
    }

    /// <summary>URL validation rejects non-public IP literals early and still accepts public hosts.</summary>
    [Theory]
    [InlineData("https://169.254.169.254/", false)]
    [InlineData("https://10.0.0.1/manifest.json", false)]
    [InlineData("https://[fd00::1]/", false)]
    [InlineData("https://[::ffff:10.0.0.1]/", false)]
    [InlineData("https://localhost/", false)]
    [InlineData("http://example.com/", false)]
    [InlineData("https://example.com/", true)]
    [InlineData("https://8.8.8.8/", true)]
    public void Internet_https_check_rejects_non_public_ip_literals(string url, bool expected)
    {
        Assert.Equal(expected, new Uri(url).IsAbsoluteInternetHttps());
    }

    /// <summary>The HTTP-or-HTTPS check allows plain HTTP sites but keeps the same address restrictions.</summary>
    [Theory]
    [InlineData("http://example.com/", true)]
    [InlineData("https://example.com/", true)]
    [InlineData("http://192.168.0.1/", false)]
    [InlineData("ftp://example.com/", false)]
    public void Internet_http_or_https_check_allows_http(string url, bool expected)
    {
        Assert.Equal(expected, new Uri(url).IsAbsoluteInternetHttpOrHttps());
    }

    private static Func<string, CancellationToken, Task<IPAddress[]>> FakeResolver(params string[] records)
    {
        return (_, _) => Task.FromResult(records.Select(IPAddress.Parse).ToArray());
    }

    private static Task<IPAddress[]> ThrowingResolver(string host, CancellationToken cancelToken)
    {
        throw new InvalidOperationException("IP literals must not trigger DNS resolution.");
    }
}
