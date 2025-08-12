using PWABuilder.Common;
using StackExchange.Redis;

namespace PWABuilder.Services;

/// <summary>
/// Fetches and caches HTML content of web pages. This is so that we can avoid fetching the same page multiple times in a short timespan.
/// The cached content is stored in Redis.
/// </summary>
public class HtmlFetchCache
{
    private readonly IDatabase redis;
    private readonly ILogger<HtmlFetchCache> logger;
    private readonly HttpClient http;

    private const int maxHtmlSizeInBytes = 5 * 1024 * 1024; // 5MB
    private static readonly TimeSpan cacheExpiration = TimeSpan.FromMinutes(5);

    /// <summary>
    /// Creates a new HtmlFetchCache.
    /// </summary>
    /// <param name="redis">The Redis cache.</param>
    /// <param name="httpClientFactory">The HTTP client factory.</param>
    /// <param name="logger">The logger.</param>
    public HtmlFetchCache(IDatabase redis, IHttpClientFactory httpClientFactory, ILogger<HtmlFetchCache> logger)
    {
        this.redis = redis;
        http = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
        this.logger = logger;
    }

    /// <summary>
    /// Gets the cached HTML content for a given URL. If the content isn't cached, it will be fetched.
    /// </summary>
    /// <param name="url">The URL to fetch the HTML for.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns></returns>
    public async Task<string?> GetHtml(Uri url, CancellationToken cancelToken)
    {
        var cacheKey = GetCacheKey(url);
        var cachedHtml = await redis.StringGetAsync(cacheKey);
        if (cachedHtml.HasValue && !string.IsNullOrWhiteSpace(cachedHtml))
        {
            return cachedHtml;
        }

        // It's not in the cache. Fetch it and if fetch was successful, put it in the cache.
        var html = await TryGetHtmlPage(url, cancelToken);
        if (html != null)
        {
            await redis.StringSetAsync(cacheKey, html, cacheExpiration);
        }

        return html;
    }

    private async Task<string?> TryGetHtmlPage(Uri appUrl, CancellationToken cancelToken)
    {
        try
        {
            var htmlString = await http.GetStringAsync(appUrl, "text/html", maxHtmlSizeInBytes, cancelToken);
            if (htmlString == null)
            {
                logger.LogWarning("No HTML response received for {appUrl}.", appUrl);
                return null;
            }

            return htmlString;
        }
        catch (Exception htmlFetchError)
        {
            logger.LogWarning(htmlFetchError, "Unable to fetch HTML of {url} due to an error.", appUrl);
            return null;
        }
    }

    private static string GetCacheKey(Uri url)
    {
        return $"html:{url.GetHashCode()}";
    }
}