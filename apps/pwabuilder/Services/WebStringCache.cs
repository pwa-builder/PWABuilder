using PWABuilder.Common;
using StackExchange.Redis;

namespace PWABuilder.Services;

/// <summary>
/// Fetches and caches resources on the web. This is so that we can avoid fetching the same resource multiple times in a short timespan.
/// The cached content is stored in Redis.
/// </summary>
public class WebStringCache
{
    private readonly IDatabase redis;
    private readonly ILogger<WebStringCache> logger;
    private readonly HttpClient http;

    private const int defaultMaxSizeInBytes = 2 * 1024 * 1024; // 2MB
    private static readonly TimeSpan cacheExpiration = TimeSpan.FromMinutes(5);

    /// <summary>
    /// Creates a new WebStringCache.
    /// </summary>
    /// <param name="redis">The Redis cache.</param>
    /// <param name="httpClientFactory">The HTTP client factory.</param>
    /// <param name="logger">The logger.</param>
    public WebStringCache(IDatabase redis, IHttpClientFactory httpClientFactory, ILogger<WebStringCache> logger)
    {
        this.redis = redis;
        http = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
        this.logger = logger;
    }

    /// <summary>
    /// Gets the cached content for a given URL. If the content isn't cached, it will be fetched and cached.
    /// </summary>
    /// <param name="url">The URL to fetch.</param>
    /// <param name="accepts"> The type of content to accept (e.g., "text/html", "application/json").</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <param name="logger">An optional logger to log the results to.</param>
    /// <param name="maxSizeInBytes">The maximum size of the resource to fetch
    /// <returns>The resource at the given URL.</returns>
    public async Task<string?> GetOrFetchAsync(Uri url, IEnumerable<string> accepts, ILogger? logger, CancellationToken cancelToken, int maxSizeInBytes = defaultMaxSizeInBytes)
    {
        var cacheKey = GetCacheKey(url, accepts);
        var cached = await redis.StringGetAsync(cacheKey);
        if (cached.HasValue && !string.IsNullOrWhiteSpace(cached))
        {
            (logger ?? this.logger).LogInformation("Web string cache hit for {url}", url);
            return cached;
        }

        // It's not in the cache. Fetch it and if fetch was successful, put it in the cache.
        var webString = await TryFetchResourceAsync(url, accepts, maxSizeInBytes, logger ?? this.logger, cancelToken);
        if (webString != null)
        {
            await redis.StringSetAsync(cacheKey, webString, cacheExpiration);
        }

        return webString;
    }

    private async Task<string?> TryFetchResourceAsync(Uri appUrl, IEnumerable<string> accepts, int maxSizeInBytes, ILogger logger, CancellationToken cancelToken)
    {
        try
        {
            var webString = await http.GetStringAsync(appUrl, accepts, maxSizeInBytes, cancelToken);
            if (webString == null)
            {
                logger.LogWarning("No response received for {appUrl} with accept headers {accept}.", appUrl, accepts);
                return null;
            }

            return webString;
        }
        catch (Exception fetchError)
        {
            logger.LogWarning(fetchError, "Unable to fetch {url} due to an error.", appUrl);
            return null;
        }
    }

    private static string GetCacheKey(Uri url, IEnumerable<string> accepts)
    {
        var firstAccept = accepts.FirstOrDefault();
        var id = firstAccept?.ToLower() switch
        {
            "text/html" => "html",
            "application/javascript" or "text/javascript" => "js",
            "text/plain" => "text",
            "application/json" => "json",
            "application/manifest+json" => "manifest",
            null => "unspecified",
            _ => "other"
        };
        return $"{id}:{url.Host}:{url.GetHashCode()}";
    }
}