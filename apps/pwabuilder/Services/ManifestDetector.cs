using PuppeteerSharp;
using PWABuilder.Common;
using PWABuilder.Models;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace PWABuilder.Services;

public class ManifestDetector
{
    private readonly WebStringCache webStringCache;
    private readonly IPuppeteerService puppeteer;

    public ManifestDetector(WebStringCache webStringCache, IPuppeteerService puppeteer)
    {
        this.webStringCache = webStringCache;
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

        return webManifest;
    }

    private async Task<ManifestDetection?> TryGetManifestFromPuppeteer(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        // Spin up a headless browser to find the manifest link.
        using var page = await puppeteer.TryNavigate(appUrl, logger);
        if (page == null)
        {
            logger.LogError("Unable to get manifest of {appUrl} using Puppeteer due to a page nav error.", appUrl);
            return null;
        }

        var manifestUrl = await TryGetManifestUrlFromPuppeteer(page, appUrl, logger, cancelToken);

        // See if we can get the manifest contents, either from HTTP GET or Puppeteer.
        if (manifestUrl != null)
        {
            // First try HTTP GET. This already returns a fully-formed detection with any inline base64 images
            // sanitized and HasBase64EncodedImages set, so return it directly. We must NOT extract its (already
            // sanitized) raw and re-run detection: doing so would find no base64 and incorrectly clear the flag.
            var manifestDetection = await TryFetchManifest(manifestUrl, logger, cancelToken);
            if (manifestDetection != null)
            {
                return manifestDetection;
            }

            // HTTP GET didn't yield a manifest (e.g. the manifest link is a data: URL or is otherwise not fetchable
            // outside the browser). Fall back to fetching the raw manifest contents through the open Puppeteer page.
            logger.LogWarning("Unable to fetch manifest contents for {manifestUrl} via HTTP GET. Falling back to Puppeteer to get manifest contents.", manifestUrl);
            var manifestContents = await TryGetWebManifestContentsFromPuppeteer(page, manifestUrl, logger, cancelToken);
            if (string.IsNullOrWhiteSpace(manifestContents))
            {
                logger.LogError("Unable to get manifest contents for {manifestUrl} via Puppeteer fallback. Manifest contents cannot be fetched.", manifestUrl);
                return null;
            }

            // Cache the raw (unsanitized) manifest and run detection exactly once so base64 images are sanitized
            // and HasBase64EncodedImages is set correctly.
            await webStringCache.UpdateAsync(manifestUrl, manifestContents, Constants.ManifestMimeTypes);
            return CreateManifestDetection(manifestUrl, manifestContents, logger);
        }

        // See if we can fetch and parse the manifest.
        var manifestContext = await TryFetchManifest(manifestUrl, logger, cancelToken);
        return manifestContext;
    }

    private static async Task<string?> TryGetWebManifestContentsFromPuppeteer(IPage page, Uri manifestUrl, ILogger logger, CancellationToken cancelToken)
    {
        try
        {
            var manifestContents = await page.EvaluateExpressionAsync<string?>($"fetch('{manifestUrl}').then(response => response.text())");
            if (!string.IsNullOrWhiteSpace(manifestContents))
            {
                logger.LogInformation("Successfully retrieved manifest contents via Puppeteer for {manifestUrl}.", manifestUrl);
            }
            else
            {
                logger.LogWarning("Manifest URL {manifestUrl} was found via Puppeteer but returned empty content when fetched through Puppeteer.", manifestUrl);
            }

            return manifestContents;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving manifest contents via Puppeteer.");
            return null;
        }
    }

    private async Task<ManifestDetection?> TryGetManifestFromHtmlParsing(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        // Fetch the HTML of the page.
        var htmlString = await TryGetHtmlPage(appUrl, logger, cancelToken);

        // We've got the HTML of the page. Do we have a manifest link?
        var manifestUrl = TryFindWebManifestLinkInHtml(htmlString, appUrl, logger);

        // See if we can fetch and parse the manifest.
        var manifestContext = await TryFetchManifest(manifestUrl, logger, cancelToken);
        return manifestContext;
    }

    private static async Task<Uri?> TryGetManifestUrlFromPuppeteer(IPage puppeteerPage, Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        try
        {
            // Execute JS in the browser to find the manifest.
            var jsSelectAllManifestLink =
                @"Array.from(document.querySelectorAll('link[rel*=manifest]')).map(a => a.href);";
            var manifestUrls = await puppeteerPage.EvaluateExpressionAsync<string[]>(jsSelectAllManifestLink);

            // No manifest links? OK, punt.
            var manifestUrl = manifestUrls.LastOrDefault();
            if (manifestUrl == null)
            {
                var headContent = await TryGetHeadContentsFromPuppeteerAsync(puppeteerPage, logger);
                logger.LogWarning("Using Puppeteer to find manifest, no manifest links found in the page at {appUrl}. Page <head> content: {pageContent}", appUrl, headContent);
                return null;
            }

            // Consturct the absolute URL for the manifest.
            logger.LogInformation("Manifest detected via Puppeteer for {appUrl}. Manifest URL: {manifestUrl}", appUrl, manifestUrl);
            return new Uri(appUrl, manifestUrl);
        }
        catch (Exception error)
        {
            logger.LogWarning(error, "Error using Puppeteer to find manifest link in {appUrl}.", appUrl);
            return null;
        }
    }
    private async Task<ManifestDetection?> TryFetchManifest(Uri? manifestUrl, ILogger logger, CancellationToken cancelToken)
    {
        if (manifestUrl == null)
        {
            return null;
        }

        try
        {
            var manifestJson = await webStringCache.GetOrFetchAsync(manifestUrl, Constants.ManifestMimeTypes, logger, cancelToken, 1024 * 1024 * 5);
            if (string.IsNullOrWhiteSpace(manifestJson))
            {
                logger.LogWarning("Manifest at {manifestUrl} returned empty content.", manifestUrl);
                return null;
            }

            return CreateManifestDetection(manifestUrl, manifestJson, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching and parsing manifest from {manifestUrl}.", manifestUrl);
            return null;
        }
    }

    private static ManifestDetection? CreateManifestDetection(Uri manifestUrl, string manifestJson, ILogger logger)
    {
        // Strip any inline base64-encoded image data URLs before doing anything else. These payloads can bloat a manifest to
        // many megabytes, which both breaks analysis storage (Cosmos rejects oversized documents with a 413) and isn't supported
        // by app stores, which require images to be external URLs. We surface this to the user as a failed capability check, so
        // we keep analyzing the (now-lightweight) manifest rather than discarding it. See https://github.com/pwa-builder/PWABuilder/issues/6300.
        var sanitizedManifestJson = RemoveBase64EncodedImages(manifestJson, out var hasBase64EncodedImages);
        if (hasBase64EncodedImages)
        {
            logger.LogWarning("Detected inline base64-encoded images in a web manifest for host {manifestHost}. Images in a manifest must be external URLs.", manifestUrl.Host);
        }

        // A manifest can be served from an inline data: URI (for example, a base64-encoded manifest injected into the page at
        // runtime). Such URLs can be many megabytes, which bloats the stored analysis and causes Cosmos to reject the document
        // with a 413. We can neither store nor meaningfully display a multi-megabyte URL, so replace it with a compact placeholder
        // and treat it like the base64 image case: flag it so analysis surfaces the error and halts instead of persisting the value.
        var storedManifestUrl = manifestUrl;
        if (string.Equals(manifestUrl.Scheme, "data", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning("A web manifest was served from an inline data: URI. Replacing the manifest URL with a placeholder to avoid storing megabytes of inline base64 data.");
            storedManifestUrl = OmittedManifestUrl;
            hasBase64EncodedImages = true;
        }

        // We can't have more than 2.5m characters in the manifest (roughly 10MB)
        // This is to prevent very large manifests that encode the entire images inside the manifest.
        if (sanitizedManifestJson.Length > 2_500_000)
        {
            logger.LogWarning("Manifest at {manifestUrl} is too large at {length} characters).", manifestUrl, sanitizedManifestJson.Length);
            return null;
        }

        // Make sure the JSON doesn't start with `<`, which indicates an HTML page (probably a 404). This tends to happen often with apps that
        // have a manifest link but the link is broken. e.g. https://github.com/pwa-builder/PWABuilder/issues/5094
        if (sanitizedManifestJson.TrimStart().StartsWith('<'))
        {
            logger.LogWarning("Manifest at {manifestUrl} appears to be HTML, not JSON. {manifestJsonResponse}", manifestUrl, sanitizedManifestJson);
            return null;
        }

        JsonElement manifest;
        try
        {
            manifest = JsonSerializer.Deserialize<JsonElement>(sanitizedManifestJson);
        }
        catch (Exception jsonError)
        {
            logger.LogWarning(jsonError, "Error parsing manifest JSON at {manifestUrl}.", manifestUrl);
            return null;
        }

        return new ManifestDetection
        {
            Url = storedManifestUrl,
            Manifest = manifest,
            ManifestRaw = sanitizedManifestJson,
            HasBase64EncodedImages = hasBase64EncodedImages
        };
    }

    /// <summary>
    /// Removes inline base64-encoded image data URLs (e.g. <c>data:image/png;base64,AAAA...</c>) from the raw manifest JSON,
    /// replacing each with a short placeholder so the surrounding JSON structure stays intact. This keeps the manifest small
    /// enough to store in Cosmos DB, which rejects oversized documents.
    /// </summary>
    /// <param name="manifestJson">The raw manifest JSON.</param>
    /// <param name="hadBase64EncodedImages">Set to <c>true</c> if any base64-encoded image data URL was found and removed.</param>
    /// <returns>The manifest JSON with base64 image data removed.</returns>
    private static string RemoveBase64EncodedImages(string manifestJson, out bool hadBase64EncodedImages)
    {
        // The base64 payload lives inside a JSON string value, so it never contains an unescaped double quote. Because the base64
        // alphabet ([A-Za-z0-9+/=]) excludes the double quote, matching up to the next non-base64 character safely stops at the
        // closing quote and captures the entire (potentially multi-megabyte) payload without over-matching.
        var foundBase64Image = false;
        var sanitized = Base64ImageDataUrlRegex.Replace(manifestJson, _ =>
        {
            foundBase64Image = true;
            return Base64ImagePlaceholder;
        });

        hadBase64EncodedImages = foundBase64Image;
        return sanitized;
    }

    /// <summary>
    /// The placeholder value that replaces inline base64-encoded image data URLs stripped from a manifest.
    /// </summary>
    private const string Base64ImagePlaceholder = "data:[omitted-by-pwabuilder]";

    /// <summary>
    /// The placeholder manifest URL stored when the real manifest was served from an oversized inline <c>data:</c> URI.
    /// Storing the original multi-megabyte data URI would bloat the analysis document and cause Cosmos to reject it (413).
    /// </summary>
    private static readonly Uri OmittedManifestUrl = new(Base64ImagePlaceholder);

    /// <summary>
    /// Matches inline base64-encoded image data URLs such as <c>data:image/png;base64,AAAA...</c>.
    /// </summary>
    private static readonly Regex Base64ImageDataUrlRegex = new(
        @"data:image/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=_-]*",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private async Task<string?> TryGetHtmlPage(Uri appUrl, ILogger logger, CancellationToken cancelToken)
    {
        try
        {
            var htmlString = await webStringCache.GetOrFetchAsync(appUrl, ["text/html"], logger, cancelToken);
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
            var manifestNodesOrNull = doc.DocumentNode?
                .SelectNodes("//link[@rel='manifest']");

            if (manifestNodesOrNull == null)
            {
                logger.LogInformation("During manifest detection, no manifest nodes could be found in HTML.");
                return null;
            }

            var manifestHref = manifestNodesOrNull
                .Where(n => n != null && n.Attributes != null && n.Attributes.Contains("href") && !string.IsNullOrWhiteSpace(n.Attributes["href"]?.Value))
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

    /// <summary>
    /// Attempts to get the HTML contents of the head element from a Puppeteer page.
    /// </summary>
    /// <param name="page">The Puppeteer page to extract head contents from.</param>
    /// <param name="logger">The logger to use for logging warnings.</param>
    /// <returns>The HTML string of the head element, or null if it doesn't exist or an exception occurs.</returns>
    private static async Task<string?> TryGetHeadContentsFromPuppeteerAsync(IPage page, ILogger logger)
    {
        try
        {
            var headContent = await page.EvaluateExpressionAsync<string?>("document.head?.outerHTML");

            // Ensure head content is reasonable size (under 10k bytes) before returning
            if (headContent is not null && System.Text.Encoding.UTF8.GetByteCount(headContent) > 10_000)
            {
                logger.LogWarning("Head content is too large ({size} bytes), truncating for logging.", System.Text.Encoding.UTF8.GetByteCount(headContent));
                return headContent[..Math.Min(headContent.Length, 10_000)] + "... [truncated]";
            }

            return headContent;
        }
        catch (Exception error)
        {
            logger.LogWarning(error, "Error retrieving head contents from Puppeteer page.");
            return null;
        }
    }
}