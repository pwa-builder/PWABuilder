using PWABuilder.Common;
using PWABuilder.Models;
using PWABuilder.Validations;
using System.Text.Json;

namespace PWABuilder.Services;

public class ManifestDetector
{
    private readonly WebStringCache webStringCache;
    private readonly HttpClient http;
    private readonly IPuppeteerService puppeteer;

    public ManifestDetector(WebStringCache webStringCache, IHttpClientFactory httpClientFactory, IPuppeteerService puppeteer)
    {
        this.webStringCache = webStringCache;
        http = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
        this.puppeteer = puppeteer;
    }

    /// <summary>
    /// Attempts to detect the web manifest for a given app URL. It will attempt to find the manifest by loading and parsing the HTML of the web app. If that fails, it will spin up headless browser instance and try to find the manifest through that way.
    /// If any errors occur during the process, they will be logged, and the method will return null.
    /// </summary>
    /// <param name="appUrl">The URL of the web app to analyze.</param>
    /// <param name="logger">The logger to log information, warnings, and exceptions.</param>
    /// <param name="cancelToken"></param>
    /// <returns>The manifest</returns>
    public async Task<ManifestDetection?> TryDetectAsync(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        // See if we can find the manifest quickly by parsing the HTML of the page.
        var webManifest = await TryGetManifestFromHtmlParsing(appUrl, logger, cancelToken);
        if (webManifest == null)
        {
            webManifest = await TryGetManifestFromPuppeteer(appUrl, logger, cancelToken);
        }

        if (webManifest == null)
        {
            logger.LogInformation("No manifest detected for {appUrl} in either HTML parsing or Puppeteer.", appUrl);
            return null;
        }

        // Run the validations on the manifest.
        var manifestValidationResult = TryValidateManifest(webManifest, logger, cancelToken);
        return manifestValidationResult;
    }

    private async Task<ManifestContext?> TryGetManifestFromPuppeteer(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        // Spin up a headless browser to find the manifest link.
        var manifestUrl = await TryGetManifestUrlFromPuppeteer(appUrl, logger, cancelToken);

        // See if we can fetch and parse the manifest.
        var manifestContext = await TryFetchManifest(manifestUrl, logger, cancelToken);
        return manifestContext;
    }

    private async Task<ManifestContext?> TryGetManifestFromHtmlParsing(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        // Fetch the HTML of the page.
        var htmlString = await TryGetHtmlPage(appUrl, logger, cancelToken);

        // We've got the HTML of the page. Do we have a manifest link?
        var manifestUrl = TryFindWebManifestLinkInHtml(htmlString, appUrl, logger);

        // See if we can fetch and parse the manifest.
        var manifestContext = await TryFetchManifest(manifestUrl, logger, cancelToken);
        return manifestContext;
    }

    private async Task<Uri?> TryGetManifestUrlFromPuppeteer(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        try
        {
            // Spin up a headless browser
            using var page = await puppeteer.Navigate(appUrl);

            // Execute JS in the browser to find the manifest.
            var jsSelectAllManifestLink =
                @"Array.from(document.querySelectorAll('link[rel*=manifest]')).map(a => a.href);";
            var manifestUrls = await page.EvaluateExpressionAsync<string[]>(jsSelectAllManifestLink);

            // No manifest links? OK, punt.
            var manifestUrl = manifestUrls.LastOrDefault();
            if (manifestUrl == null)
            {
                logger.LogWarning("Using Puppeteer to find manifest, no manifest links found in the page at {appUrl}.", appUrl);
                return null;
            }

            // Consturct the absolute URL for the manifest.
            return new Uri(appUrl, manifestUrl);
        }
        catch (Exception error)
        {
            logger.LogWarning(error, "Error using Puppeteer to find manifest link in {appUrl}.", appUrl);
            return null;
        }
    }

    private ManifestDetection? TryValidateManifest(ManifestContext? manifestContext, ILogger logger, CancellationToken cancelToken)
    {
        if (manifestContext == null)
        {
            return null;
        }

        try
        {
            var validations = ManifestValidations.ValidateManifest(manifestContext.Manifest);
            return new ManifestDetection
            {
                Url = manifestContext.Uri,
                Json = manifestContext.Manifest,
                Raw = manifestContext.ManifestJson,
                Validations = validations.ToList()
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error validating manifest from {manifestUrl}.", manifestContext.Uri);
            return null;
        }
    }

    private async Task<ManifestContext?> TryFetchManifest(Uri? manifestUrl, ILogger logger, CancellationToken cancelToken)
    {
        if (manifestUrl == null)
        {
            return null;
        }

        try
        {
            var manifestJson = await http.GetStringAsync(manifestUrl, Constants.ManifestMimeTypes, 1024 * 1024 * 5, cancelToken);
            if (manifestJson == null)
            {
                logger.LogWarning("Manifest at {manifestUrl} returned null content.", manifestUrl);
                return null;
            }

            var manifest = JsonSerializer.Deserialize<object>(manifestJson);
            if (manifest == null)
            {
                logger.LogWarning("Manifest at {manifestUrl} deserialization returned null.", manifestUrl);
                return null;
            }

            return new ManifestContext
            {
                Uri = manifestUrl,
                ManifestJson = manifestJson,
                Manifest = manifest
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching and parsing manifest from {manifestUrl}.", manifestUrl);
            return null;
        }
    }

    private async Task<string?> TryGetHtmlPage(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        try
        {
            var htmlString = await webStringCache.Get(appUrl, ["text/html"], cancelToken);
            return htmlString;
        }
        catch (Exception htmlFetchError)
        {
            logger.LogWarning(htmlFetchError, "Unable to fetch HTML of {url} in order to find the web manifest.", appUrl);
            return null;
        }
    }

    private Uri? TryFindWebManifestLinkInHtml(string? html, Uri baseUrl, ILogger logger)
    {
        if (html == null)
        {
            return null;
        }

        try
        {
            // Use HtmlAgilityPack to parse the HTML and find any <link rel="manifest" href="..."/> tags.
            var doc = new HtmlAgilityPack.HtmlDocument();
            doc.LoadHtml(html);
            var manifestHref = doc.DocumentNode?
                .SelectNodes("//link[@rel='manifest']")
                .Where(n => !string.IsNullOrWhiteSpace(n.Attributes["href"]?.Value))
                .Select(n => n.Attributes["href"].Value)
                .Where(v => !string.IsNullOrEmpty(v))
                .FirstOrDefault();

            if (string.IsNullOrWhiteSpace(manifestHref))
            {
                return null;
            }

            // Construct the full manifest URL, as it may be relative.
            return new Uri(baseUrl, manifestHref);
        }
        catch (Exception error)
        {
            logger.LogWarning(error, "Error parsing HTML to find web manifest link in {url}. Will fallback to headless Chrome for manifest parsing.", baseUrl);
            return null;
        }
    }
}