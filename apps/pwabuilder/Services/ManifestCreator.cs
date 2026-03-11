using System.Diagnostics.CodeAnalysis;
using System.Text;
using HtmlAgilityPack;
using PWABuilder.Common;
using PWABuilder.Models;
using PWABuilder.Models.W3C;

namespace PWABuilder.Services;

/// <summary>
/// Service that loads a website and generates a web manifest from some of the HTML metadata on the page.
/// </summary>
public class ManifestCreator
{
    private readonly ILogger logger;
    private readonly HttpClient http;

    public ManifestCreator(IHttpClientFactory httpClientFactory, ILogger<ManifestCreator> logger)
    {
        this.logger = logger;
        this.http = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
    }

    /// <summary>
    /// Creates a web manifest for the specified site. It will use any metadata on the page to help generate a manifest.
    /// </summary>
    /// <param name="siteUri">The URL of the site to generate the manifest for.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>A new web manifest.</returns>
    public async Task<WebAppManifest> Create(Uri siteUri, CancellationToken cancelToken)
    {
        // Fetch the site
        var manifestResult = await this.LoadPage(siteUri, cancelToken)
            .PipeAsync(async html => await CreateManifestFromHtml(siteUri, html));
        if (manifestResult.Error != null)
        {
            logger.LogWarning(manifestResult.Error, "Unable to load site due to error. Falling back to creating manifest from URL");
        }

        return manifestResult.ValueOr(() => CreateManifestFromUrl(siteUri));
    }

    private WebAppManifest CreateManifestFromUrl(Uri siteUri)
    {
        return new WebAppManifest
        {
            BackgroundColor = "#ffffff",
            Categories = new List<string>(),
            Description = null,
            Dir = null,
            Display = "standalone",
            IarcRatingId = null,
            Icons = new List<WebManifestIcon>(),
            Lang = null,
            Name = GuessNameFromUrl(siteUri),
            Orientation = "any",
            PreferRelatedApplications = null,
            RelatedApplications = null,
            Scope = "/",
            Screenshots = new List<WebManifestIcon>(),
            Shortcuts = new List<WebManifestShortcutItem>(),
            ShortName = GuessNameFromUrl(siteUri),
            StartUrl = "/",
            ThemeColor = "#ffffff"
        };
    }

    private async Task<WebAppManifest> CreateManifestFromHtml(Uri siteUri, HtmlDocument html)
    {
        // See https://gist.github.com/lancejpollard/1978404 for a complete list of meta tags
        var head = html.DocumentNode?.SelectSingleNode("//head");
        return new WebAppManifest
        {
            BackgroundColor = GetMetaTagContent(head, new AttrQuery("name", "msapplication-TileColor"), "#ffffff"),
            Categories = GetMetaTagContent(head, new AttrQuery("name", "category"), string.Empty).Split(',', StringSplitOptions.RemoveEmptyEntries).ToList(),
            Description = GetDescriptionFromHead(head),
            Dir = GetDirFromHtml(html, head),
            Display = GetDisplayFromHead(head),
            IarcRatingId = null,
            Icons = await GetIconsFromHtml(siteUri, head),
            Lang = GetLangFromHtml(html),
            Name = GetNameFromHead(siteUri, head),
            Orientation = "any",
            RelatedApplications = null,
            PreferRelatedApplications = null, // Do we need this? https://github.com/pwa-builder/pwabuilder-lib/blob/master/lib/manifestTools/manifestCreator/scrapers/related_applications.js
            Scope = "/",
            Screenshots = [],
            Shortcuts = [],
            ShortName = GetNameFromHead(siteUri, head),
            StartUrl = "/",
            ThemeColor = GetMetaTagContent(head, new AttrQuery("name", "theme-color"), "#ffffff")
        };
    }

    private string GetNameFromHead(Uri siteUri, HtmlNode? head)
    {
        var metaTags = new[]
        {
                new AttrQuery("name", "application-name"), // W3C meta
                new AttrQuery("name", "apple-mobile-web-app-title"), // Safari pinned tile title
                new AttrQuery("property", "al:ios:app_name"), // iOS app name
                new AttrQuery("property", "al:android:app_name"), // Android app name
                new AttrQuery("property", "og:site_name"), // open graph app name
                new AttrQuery("name", "twitter:title"), // Twitter page title,
                new AttrQuery("itemprop", "name") // Schema.org app name
            };

        var matchingMeta = metaTags
            .Select(m => GetMetaTagContent(head, m, string.Empty))
            .FirstOrDefault(name => !string.IsNullOrWhiteSpace(name));
        if (matchingMeta != null)
        {
            return matchingMeta;
        }

        // Don't have a name? Guess it from the URL.
        return GuessNameFromUrl(siteUri);
    }

    private string GuessNameFromUrl(Uri siteUri)
    {
        var host = siteUri.Host;
        var tldIndex = host.LastIndexOf('.');
        if (tldIndex != -1)
        {
            return host.Substring(0, tldIndex);
        }

        return host;
    }

    private static string? GetLangFromHtml(HtmlDocument html)
    {
        var langAttr = html.DocumentNode?.GetAttributeValue("lang", string.Empty);
        if (string.IsNullOrWhiteSpace(langAttr))
        {
            return null;
        }

        return langAttr;
    }

    private async Task<List<WebManifestIcon>> GetIconsFromHtml(Uri siteUri, HtmlNode? head)
    {
        var imageSources = GetImageSources(head);

        // Check if there's a fav icon. If so, append it to the image sources.
        var (favIcon, _) = await CheckFavIconExistence(siteUri);
        if (favIcon != null)
        {
            imageSources = imageSources.Append(favIcon);
        }

        var manifestIcons = imageSources
            .Select(async source => await CreateManifestIconFromImageSource(siteUri, source));
        return [.. await Task.WhenAll(manifestIcons)];
    }

    private async Task<Result<ImageSource>> CheckFavIconExistence(Uri siteUri)
    {
        try
        {
            var favIconSrc = new ImageSource("/favicon.ico", "image/x-icon", null);
            var favIconUri = new Uri(siteUri, favIconSrc.Url);
            var favIconRequest = new HttpRequestMessage(HttpMethod.Head, favIconUri);
            var favIconResponse = await http.SendAsync(favIconRequest);
            favIconResponse.EnsureSuccessStatusCode();
            return favIconSrc;
        }
        catch (Exception favIconFetchError)
        {
            logger.LogInformation(favIconFetchError, "/favicon.ico not found due to error during fetch");
            return new Result<ImageSource>(null, favIconFetchError);
        }
    }

    private async Task<WebManifestIcon> CreateManifestIconFromImageSource(Uri siteUri, ImageSource source)
    {
        var mimeType = source.MimeType;
        var sizes = source.Sizes;

        // Are we missing mime type or sizes?
        // If so, try to fetch the image and find out the missing info.
        if (string.IsNullOrWhiteSpace(source.MimeType) || string.IsNullOrWhiteSpace(source.Sizes))
        {
            logger.LogInformation("Missing image metadata for {source}. Fetching image...", source.Url);
            var imageMetadata = await TryFetchImageStream(siteUri, source.Url)
                .PipeAsync(async stream => await TryGetImageInfoAndDispose(stream, source.Url));
            if (imageMetadata.Value != null)
            {
                mimeType = imageMetadata.Value.MimeType;
                sizes = imageMetadata.Value.Sizes;
            }
        }

        return new WebManifestIcon
        {
            Sizes = string.IsNullOrEmpty(sizes) ? null : sizes,
            Type = string.IsNullOrEmpty(mimeType) ? null : mimeType,
            Src = new Uri(siteUri, source.Url).ToString()
        };
    }

    private async Task<Result<Stream>> TryFetchImageStream(Uri siteUri, string url)
    {
        if (!Uri.TryCreate(siteUri, url, out var absoluteUri))
        {
            logger.LogWarning("Unable to fetch image {url} for site {siteUrl} due to invalid absolute URI", url, siteUri);
            return new Result<Stream>(null, new ArgumentException($"Unable to create absolute URL for image"));
        }

        try
        {
            using var httpMessage = new HttpRequestMessage(HttpMethod.Get, absoluteUri);
            using var httpResponse = await http.SendAsync(httpMessage);
            httpResponse.EnsureSuccessStatusCode();

            var maxImageSize = 1_500_000; // 1.5MB
            var imageStreamLength = httpResponse.Content.Headers.ContentLength.HasValue ? (int)httpResponse.Content.Headers.ContentLength.GetValueOrDefault() : 20_000;
            if (imageStreamLength > maxImageSize)
            {
                throw new Exception($"Image is too large. Max size {maxImageSize}, actual image size {httpResponse.Content.Headers.ContentLength}");
            }

            using var cancelTokenSrc = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(5));
            using var imageStream = await httpResponse.Content.ReadAsStreamAsync(cancelTokenSrc.Token);

            // Copy it to a memory stream because we need to seek and change the position later.
            var memoryStream = new MemoryStream(imageStreamLength);
            await imageStream.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            return new Result<Stream>(memoryStream);
        }
        catch (Exception imageFetchError)
        {
            logger.LogWarning(imageFetchError, "Attempted to fetch image {url}, but encountered an error.", absoluteUri);
            return new Result<Stream>(null, imageFetchError);
        }
    }

    private async Task<Result<ImageMetadata>> TryGetImageInfoAndDispose(Stream imageStream, string url)
    {
        using (imageStream)
        {
            var mimeType = await TryGetImageMimeType(imageStream, url);
            imageStream.Position = 0;
            var dimensions = await TryGetImageDimensions(imageStream, url);

            if (mimeType.Value != null || dimensions.Value != null)
            {
                return new ImageMetadata(mimeType.Value ?? string.Empty, dimensions.Value ?? string.Empty);
            }

            // An error somewhere in the pipeline.
            var error = mimeType.Error != null && dimensions.Error != null ?
                new AggregateException($"Unable to fetch image dimensions and mime type for {url}", mimeType.Error, dimensions.Error) :
                mimeType.Error ??
                dimensions.Error ??
                new Exception("Unable to fetch image metadata");
            return new Result<ImageMetadata>(null, error);
        }
    }

    private async Task<Result<string>> TryGetImageDimensions(Stream imageStream, string url)
    {
        try
        {
            var imgDimensions = await SixLabors.ImageSharp.Image.IdentifyAsync(imageStream);
            if (imgDimensions == null)
            {
                throw new Exception($"Unable to identify image dimensions for {url}. Image metadata was null.");
            }

            return $"{imgDimensions.Width}x{imgDimensions.Height}";
        }
        catch (Exception imageDimensionError)
        {
            logger.LogWarning(imageDimensionError, "Unable to identify image dimensions for {url}", url);
            return new Result<string>(null, imageDimensionError);
        }
    }

    private async Task<Result<string>> TryGetImageMimeType(Stream imageStream, string url)
    {
        try
        {
            // ImageSharp can't detect ico images. If the URL ends in .ico extension, assume it's a legit ico file.
            if (url.EndsWith(".ico", StringComparison.InvariantCultureIgnoreCase))
            {
                return "image/x-icon";
            }

            var imageFormat = await SixLabors.ImageSharp.Image.DetectFormatAsync(imageStream);
            if (imageFormat == null)
            {
                throw new Exception($"Unable to identify image mime type for {url}. The image format was null.");
            }

            return imageFormat.DefaultMimeType;
        }
        catch (Exception imageDimensionError)
        {
            logger.LogWarning(imageDimensionError, "Unable to identify image mime type for {url}", url);
            return new Result<string>(null, imageDimensionError);
        }
    }

    private static IEnumerable<ImageSource> GetImageSources(HtmlNode? head)
    {
        if (head == null)
        {
            return Enumerable.Empty<ImageSource>();
        }

        // See https://github.com/audreyfeldroy/favicon-cheat-sheet
        var imageNodes = Enumerable.Empty<HtmlNode>()
            .Concat(head.SelectNodesOrEmpty("//link[@rel='icon']")) // declared fav icon
            .Concat(head.SelectNodesOrEmpty("//link[@rel='shortcut']")) // fav icon alternate
            .Concat(head.SelectNodesOrEmpty("//link[@rel='shortcut icon']")) // fav icon alternate
            .Concat(head.SelectNodesOrEmpty("//link[@rel='apple-touch-icon']")) // apple touch icons
            .Concat(head.SelectNodesOrEmpty("//link[@rel='apple-touch-icon-precomposed']")) // apple touch icon precomposed
            .Concat(head.SelectNodesOrEmpty("//link[@rel='mask-icon']")) // Safari pinned tab icon
            .Concat(head.SelectNodesOrEmpty("//meta[@name='twitter:image']")) // Image for Twitter preview
            .Concat(head.SelectNodesOrEmpty("//meta[@property='og:image']")) // Image for Facebook preview
            .Concat(head.SelectNodesOrEmpty("//meta[@name='msapplication-TileImage']")); // IE pinned site icon

        return imageNodes
            .Select(n => new ImageSource(n))
            .Where(s => !string.IsNullOrWhiteSpace(s.Url)) // filter out empty URLs
            .Distinct(new ImageSource.ImageSourceUrlComparer()); // filter out duplicate URLs
    }

    private static string GetDisplayFromHead(HtmlNode? head)
    {
        // Do we have a viewport meta tag that contains 'minimal-ui'? See https://www.perpetual-beta.org/weblog/ios-7-dot-1-mobile-safari-minimal-ui.html
        var viewportMeta = GetMetaTagContent(head, new AttrQuery("name", "viewport"), string.Empty);
        if (viewportMeta.Contains("minimal-ui", StringComparison.InvariantCultureIgnoreCase))
        {
            return "minimal-ui";
        }

        return "standalone";
    }

    private static string GetDirFromHtml(HtmlDocument html, HtmlNode? head)
    {
        // Do we have a dir attribute on the document itself?
        var dirAtt = html.DocumentNode?.GetAttributeValue("dir", string.Empty) ?? string.Empty;
        if (string.Equals(dirAtt, "rtl", StringComparison.InvariantCultureIgnoreCase) ||
            string.Equals(dirAtt, "ltr", StringComparison.InvariantCultureIgnoreCase))
        {
            return dirAtt;
        }

        var htmlLang = html.DocumentNode?.GetAttributeValue("lang", string.Empty) ?? string.Empty;
        var rtlLangs = new[]
        {
                "ar", //Arabic
                "az", //Azerbaijani
                "dv", //Divehi, Dhivehi, Maldivian
                "fa", //Persian
                "he", //Hebrew
                "jv", //Javanese
                "kk", //Kazakh
                "ks", //Kashmiri
                "ku", //Kurdish
                "ml", //Malayalam
                "ms", //Malay
                "pa", //Panjabi, Punjabi
                "ps", //Pushto, Pashto
                "sd", //Sindhi
                "so", //Somali
                "tk", //Turkmen
                "ug", //Uighur, Uyghur
                "ur", //Urdu
                "yi"  //Yiddish
            };
        if (rtlLangs.Any(l => string.Equals(l, htmlLang, StringComparison.InvariantCultureIgnoreCase)) ||
            rtlLangs.Any(l => htmlLang.StartsWith($"{l}-", StringComparison.InvariantCultureIgnoreCase)))
        {
            return "rtl";
        }

        // Do we have a language meta tag?
        var languageMetaVal = GetMetaTagContent(head, new AttrQuery("name", "language"), string.Empty);
        if (rtlLangs.Any(l => string.Equals(l, languageMetaVal, StringComparison.InvariantCultureIgnoreCase)) ||
            rtlLangs.Any(l => languageMetaVal.StartsWith($"{l}-", StringComparison.InvariantCultureIgnoreCase)))
        {
            return "rtl";
        }

        return "ltr";
    }

    private static string GetDescriptionFromHead(HtmlNode? head)
    {
        var possibleMetaNames = new[]
        {
                new AttrQuery("name", "description"),
                new AttrQuery("property", "og:description"),
                new AttrQuery("name", "twitter:description"),
                new AttrQuery("name", "abstract"),
                new AttrQuery("name", "topic"),
                new AttrQuery("name", "subject"),
                new AttrQuery("name", "summary"),
                new AttrQuery("name", "title"),
                new AttrQuery("property", "og:title"),
                new AttrQuery("property", "og:site_name")
            };
        var firstMatch = possibleMetaNames
            .Select(n => GetMetaTagContent(head, n, string.Empty))
            .FirstOrDefault(val => !string.IsNullOrWhiteSpace(val));
        return firstMatch ?? string.Empty;
    }

    private static string GetMetaTagContent(HtmlNode? head, AttrQuery query, string fallbackValue)
    {
        var metaVal = head
            ?.SelectSingleNode($"//meta[@{query.Attribute}='{query.Value}']") // e.g. //meta[@name='title']
            ?.GetAttributeValue("content", fallbackValue);
        return string.IsNullOrWhiteSpace(metaVal) ? fallbackValue : metaVal;
    }

    private async Task<Result<HtmlDocument>> LoadPage(Uri url, CancellationToken cancelToken)
    {
        var fetchResult = await TryFetch(url, ["text/html"], cancelToken);
        return fetchResult.Pipe(CreateDocumentFromHtml);
    }

    private static HtmlDocument CreateDocumentFromHtml(string html)
    {
        var htmlDoc = new HtmlDocument();
        htmlDoc.LoadHtml(html ?? string.Empty);
        return htmlDoc;
    }

    /// <summary>
    /// Attempts to fetch a resource at the specified URL.
    /// If the fetch fails, it will attempt to fetch using HTTP/2.
    /// Failures due to encoding errors will also attempt fetch using UTF-8 encoding as a fallback.
    /// If all fetches fail, the result will contain the exception.
    /// </summary>
    /// <param name="url"></param>
    /// <param name="acceptHeaders"></param>
    /// <returns></returns>
    private async Task<Result<string>> TryFetch(Uri url, IEnumerable<string> acceptHeaders, CancellationToken cancelToken)
    {
        // First, make sure we have HTML. Read just the headers and make sure it has the right content-type response.
        try
        {
            using var headersOnlyResponse = await http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, cancelToken);
            headersOnlyResponse.EnsureSuccessStatusCode();
            headersOnlyResponse.EnsureContentType("text/html");
        }
        catch (Exception contentTypeError)
        {
            logger.LogError(contentTypeError, "Failed to verify {url} serves HTML content during manifest creation process. Will return an empty manifest.", url);
            return string.Empty;
        }

        try
        {
            var htmlResponse = await http.GetStringAsync(url, acceptHeaders, 1024 * 1024 * 2, cancelToken); // 2MB max HTML            httpResponse.EnsureSuccessStatusCode();
            return htmlResponse ?? string.Empty;
        }
        catch (InvalidOperationException invalidOpError) when (invalidOpError.Message.Contains("The character set provided in ContentType is invalid."))
        {
            // Invalid encoding? Sometimes webpages have incorrectly set their charset / content type.
            // See if we can just parse the thing using UTF-8.
            logger.LogWarning(invalidOpError, "Unable to parse using HTTP client due to invalid ContentType. Attempting to parse using UTF-8.");
            return await TryFetchWithForcedUtf8(url, acceptHeaders, cancelToken);
        }
        catch (Exception httpException)
        {
            logger.LogWarning(httpException, "Failed to fetch {url} using HTTP client. Falling back to HTTP/2 fetch.", url);
            return await TryFetchWithHttp2Client(url, acceptHeaders, cancelToken);
        }
    }

    private async Task<Result<string>> TryFetchWithForcedUtf8(Uri url, IEnumerable<string> acceptHeaders, CancellationToken cancelToken)
    {
        try
        {
            var byteStream = await this.http.GetStreamAsync(url, acceptHeaders, 1024 * 1024 * 2, cancelToken);
            using var memStream = new MemoryStream();
            await byteStream.CopyToAsync(memStream, cancelToken);
            return Encoding.UTF8.GetString(memStream.ToArray());
        }
        catch (Exception error)
        {
            logger.LogWarning(error, "Unable to parse HTML using forced UTF-8 mode.");
            return error;
        }
    }

    private async Task<Result<string>> TryFetchWithHttp2Client(Uri url, IEnumerable<string> acceptHeaders, CancellationToken cancelToken)
    {
        try
        {
            using var http2Request = new HttpRequestMessage(HttpMethod.Get, url)
            {
                Version = new Version(2, 0)
            };
            if (acceptHeaders != null)
            {
                foreach (var header in acceptHeaders)
                {
                    http2Request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue(header));
                }
            }
            using var result = await http.SendAsync(http2Request);
            result.EnsureSuccessStatusCode();
            var contentString = await result.Content.ReadAsStringAsync();
            logger.LogInformation("Successfully fetched {url} via HTTP/2 fallback", url);
            return contentString;
        }
        catch (Exception http2Error)
        {
            logger.LogWarning(http2Error, "Unable to fetch {url} using HTTP/2 fallback.", url);
            return http2Error;
        }
    }

    public readonly struct AttrQuery
    {
        public string Attribute { get; }
        public string Value { get; }

        public AttrQuery(string attribute, string value)
        {
            this.Attribute = attribute;
            this.Value = value;
        }
    }

    /// <summary>
    /// Represents an image source in an HTML document.
    /// </summary>
    public class ImageSource
    {
        /// <summary>
        /// Creates a new ImageSource from the specific HTML node. Inspects the node and finds href or content attribute, type attribute, and sizes attribute.
        /// Works best on HTML nodes like: &lt;link rel="icon" href="/images/foo.png" type="image/png" sizes="32x32" /&gt;
        /// </summary>
        /// <param name="node">The parent node whose children to select.</param>
        /// <returns>The content attribute value of the child nodes.</returns>
        public ImageSource(HtmlNode node)
        {
            var href = node.GetAttributeValue("href", string.Empty);
            var content = node.GetAttributeValue("content", string.Empty);
            var url = string.IsNullOrWhiteSpace(href) ? content : href;

            // See if we have a mime type. If not, best guess it.
            var mimeType = node.GetAttributeValue("type", string.Empty);
            if (mimeType == null && url != null)
            {
                mimeType = GuessMimeTypeFromUrl(url);
            }

            this.Url = url ?? string.Empty;
            this.MimeType = mimeType;
            this.Sizes = node.GetAttributeValue("sizes", string.Empty);
        }

        public ImageSource(string url, string? mimeType, string? sizes)
        {
            this.Url = url;
            this.MimeType = mimeType;
            this.Sizes = sizes;
        }

        public string Url { get; private set; }
        public string? MimeType { get; private set; }
        public string? Sizes { get; private set; }

        private static string? GuessMimeTypeFromUrl(string url)
        {
            var extensionMimeTypes = new Dictionary<string, string>
            {
                { ".png", "image/png" },
                { ".jpg", "image/jpeg" },
                { ".jpeg", "image/jpeg" },
                { ".gif", "image/gif" },
                { ".ico", "image/x-icon" },
                { ".svg", "image/svg+xml" },
                { ".webp", "image/webp" }
            };
            return extensionMimeTypes.FirstOrDefault(ext => url.Contains(ext.Key)).Value;
        }

        public class ImageSourceUrlComparer : IEqualityComparer<ImageSource>
        {
            public bool Equals(ImageSource? x, ImageSource? y)
            {
                var xUrl = x?.Url;
                var yUrl = y?.Url;
                return string.Equals(xUrl, yUrl, StringComparison.Ordinal);
            }

            public int GetHashCode([DisallowNull] ImageSource obj)
            {
                return obj.Url?.GetHashCode(StringComparison.Ordinal) ?? 0;
            }
        }
    }

    public record ImageMetadata(string MimeType, string Sizes);
}