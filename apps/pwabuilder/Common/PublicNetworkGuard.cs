using System.Net;
using System.Net.Sockets;

namespace PWABuilder.Common;

/// <summary>
/// Restricts outbound HTTP connections made on behalf of user-supplied URLs to public IP addresses, preventing server-side request forgery (SSRF).
/// </summary>
/// <remarks>
/// Validation runs inside <see cref="SocketsHttpHandler.ConnectCallback"/>, so every new connection — including connections opened while following redirects — 
/// is checked against the addresses the host actually resolves to, and the socket is connected to that validated address. 
/// This closes DNS-rebinding gaps that a URL string check cannot. The blocked ranges mirror apps/pwabuilder-google-play/utils/public-url-fetch.ts.
/// </remarks>
public static class PublicNetworkGuard
{
    private static readonly IPNetwork[] blockedNetworks =
    [
        // IPv4
        IPNetwork.Parse("0.0.0.0/8"),
        IPNetwork.Parse("10.0.0.0/8"),
        IPNetwork.Parse("100.64.0.0/10"),
        IPNetwork.Parse("127.0.0.0/8"),
        IPNetwork.Parse("169.254.0.0/16"),
        IPNetwork.Parse("172.16.0.0/12"),
        IPNetwork.Parse("192.0.0.0/24"),
        IPNetwork.Parse("192.0.2.0/24"),
        IPNetwork.Parse("192.88.99.0/24"),
        IPNetwork.Parse("192.168.0.0/16"),
        IPNetwork.Parse("198.18.0.0/15"),
        IPNetwork.Parse("198.51.100.0/24"),
        IPNetwork.Parse("203.0.113.0/24"),
        IPNetwork.Parse("224.0.0.0/4"),
        IPNetwork.Parse("240.0.0.0/4"),

        // IPv6. ::ffff:0:0/96 blocks all IPv4-mapped addresses.
        IPNetwork.Parse("::/128"),
        IPNetwork.Parse("::1/128"),
        IPNetwork.Parse("::ffff:0:0/96"),
        IPNetwork.Parse("64:ff9b::/96"),
        IPNetwork.Parse("64:ff9b:1::/48"),
        IPNetwork.Parse("100::/64"),
        IPNetwork.Parse("2001::/23"),
        IPNetwork.Parse("2001:db8::/32"),
        IPNetwork.Parse("2002::/16"),
        IPNetwork.Parse("3fff::/20"),
        IPNetwork.Parse("5f00::/16"),
        IPNetwork.Parse("fc00::/7"),
        IPNetwork.Parse("fe80::/10"),
        IPNetwork.Parse("ff00::/8"),
    ];

    /// <summary>
    /// Determines whether the address is a public, routable internet address.
    /// </summary>
    /// <param name="address">The address to check.</param>
    /// <returns>True if the address is outside every private, loopback, link-local, and reserved range; otherwise false.</returns>
    public static bool IsPublicAddress(IPAddress address)
    {
        // Checked explicitly because IPNetwork.Contains doesn't reliably match IPv4-mapped IPv6 addresses against ::ffff:0:0/96.
        if (address.IsIPv4MappedToIPv6)
        {
            return false;
        }

        return !blockedNetworks.Any(network => network.Contains(address));
    }

    /// <summary>
    /// Determines whether the URI's host is an IP literal in a private, loopback, link-local, or reserved range.
    /// </summary>
    /// <param name="uri">The absolute URI to check.</param>
    /// <returns>True if the host is a non-public IP literal; false for public IP literals and for DNS names, which are validated at connection time.</returns>
    public static bool HasNonPublicIPLiteralHost(Uri uri)
    {
        return uri.HostNameType is UriHostNameType.IPv4 or UriHostNameType.IPv6
            && IPAddress.TryParse(uri.DnsSafeHost, out var address)
            && !IsPublicAddress(address);
    }

    /// <summary>
    /// Resolves a host and ensures every resolved address is public.
    /// </summary>
    /// <param name="host">The host name or IP literal.</param>
    /// <param name="resolve">The DNS resolver. Injectable so tests never perform real DNS queries.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>The validated public addresses.</returns>
    /// <exception cref="PublicNetworkAccessDeniedException">The host resolved to no addresses, or to any non-public address.</exception>
    public static async Task<IPAddress[]> ResolvePublicAddressesAsync(string host, Func<string, CancellationToken, Task<IPAddress[]>> resolve, CancellationToken cancelToken)
    {
        var trimmedHost = host.Trim('[', ']');
        var addresses = IPAddress.TryParse(trimmedHost, out var literal)
            ? [literal]
            : await resolve(trimmedHost, cancelToken);

        // Reject if ANY answer is non-public, so an attacker can't mix a public and a private record.
        if (addresses.Length == 0 || addresses.Any(address => !IsPublicAddress(address)))
        {
            throw new PublicNetworkAccessDeniedException();
        }

        return addresses;
    }

    /// <summary>
    /// A <see cref="SocketsHttpHandler.ConnectCallback"/> that connects only to validated public addresses.
    /// </summary>
    /// <param name="context">The connection context.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>A network stream connected to a validated public address.</returns>
    public static async ValueTask<Stream> ConnectToPublicAddressAsync(SocketsHttpConnectionContext context, CancellationToken cancelToken)
    {
        var addresses = await ResolvePublicAddressesAsync(context.DnsEndPoint.Host, Dns.GetHostAddressesAsync, cancelToken);
        SocketException? lastError = null;
        foreach (var address in addresses)
        {
            var socket = new Socket(address.AddressFamily, SocketType.Stream, ProtocolType.Tcp) { NoDelay = true };
            try
            {
                // Connect to the validated IP itself, not the host name, so DNS can't be re-resolved to a different address.
                await socket.ConnectAsync(new IPEndPoint(address, context.DnsEndPoint.Port), cancelToken);
                return new NetworkStream(socket, ownsSocket: true);
            }
            catch (SocketException socketError)
            {
                socket.Dispose();
                lastError = socketError;
            }
            catch
            {
                socket.Dispose();
                throw;
            }
        }

        throw lastError ?? new SocketException((int)SocketError.HostNotFound);
    }

    /// <summary>
    /// Creates an HTTP handler that only connects to public addresses. Use this for every HTTP client that fetches user-supplied URLs.
    /// </summary>
    /// <returns>A new handler with the public network guard installed.</returns>
    public static SocketsHttpHandler CreateHandler()
    {
        return new SocketsHttpHandler
        {
            ConnectCallback = ConnectToPublicAddressAsync,
            AutomaticDecompression = DecompressionMethods.All,
            // A proxy would make ConnectCallback validate the proxy's address rather than the destination's.
            UseProxy = false,
            AllowAutoRedirect = true,
            MaxAutomaticRedirections = 5
        };
    }

    /// <summary>
    /// Determines whether the exception, or any of its inner exceptions, was caused by the public network guard blocking a request.
    /// </summary>
    /// <param name="error">The exception to inspect.</param>
    /// <returns>True if the request was blocked by the guard; otherwise false.</returns>
    public static bool IsAccessDenied(Exception? error)
    {
        for (var current = error; current is not null; current = current.InnerException)
        {
            if (current is PublicNetworkAccessDeniedException)
            {
                return true;
            }
        }

        return false;
    }
}

/// <summary>
/// Thrown when a request targets a non-public network address. The message is constant and never reflects the requested URL or address.
/// </summary>
public sealed class PublicNetworkAccessDeniedException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="PublicNetworkAccessDeniedException"/> class.
    /// </summary>
    public PublicNetworkAccessDeniedException()
        : base("The requested URL resolves to a non-public network address.")
    {
    }
}
