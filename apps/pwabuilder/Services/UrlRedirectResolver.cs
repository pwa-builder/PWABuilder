using PWABuilder.Common;

namespace PWABuilder.Services;

/// <summary>
/// Finds where a URL ends up after HTTP redirects.
/// </summary>
public interface IUrlRedirectResolver
{
    /// <summary>
    /// Requests the URL, follows redirects and returns the address of the final response.
    /// </summary>
    /// <param name="url">The URL to request.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>The final URL, or null when it could not be determined (network error, timeout, blocked address).</returns>
    Task<Uri?> TryGetFinalUrlAsync(Uri url, CancellationToken cancelToken);
}

/// <summary>
/// Resolves redirects with the PWABuilder agent HTTP client, which only connects to public addresses.
/// </summary>
public class UrlRedirectResolver : IUrlRedirectResolver
{
    private static readonly TimeSpan Timeout = TimeSpan.FromSeconds(10);
    private readonly HttpClient httpClient;
    private readonly ILogger<UrlRedirectResolver> logger;

    public UrlRedirectResolver(IHttpClientFactory httpClientFactory, ILogger<UrlRedirectResolver> logger)
    {
        this.httpClient = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
        this.logger = logger;
    }

    /// <inheritdoc />
    public async Task<Uri?> TryGetFinalUrlAsync(Uri url, CancellationToken cancelToken)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancelToken);
        timeout.CancelAfter(Timeout);
        try
        {
            // Only the headers are needed: the client follows redirects, and RequestMessage holds the final request.
            using var response = await httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, timeout.Token);
            return response.RequestMessage?.RequestUri;
        }
        catch (Exception error) when (error is HttpRequestException or OperationCanceledException && !cancelToken.IsCancellationRequested)
        {
            logger.LogInformation("Could not resolve redirects for {url}: {error}", url, error.Message);
            return null;
        }
    }
}
