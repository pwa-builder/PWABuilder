using System.Text.Json;
using PWABuilder.Common;
using PWABuilder.Validations.Models;

namespace PWABuilder.Validations.Services;

public class ImageValidationService : IImageValidationService
{
    private readonly HttpClient httpClient;

    public ImageValidationService(IHttpClientFactory httpClientFactory)
    {
        httpClient = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
    }

    public class ManifestIcon
    {
        public string? src { get; set; }
        public string? type { get; set; }
        public string? sizes { get; set; }
    }

    public class ManifestScreenshot
    {
        public string? src { get; set; }
        public string? type { get; set; }
        public string? sizes { get; set; }
        public string? platform { get; set; }
    }

    public async Task<Validation> ValidateIconsMetadataAsync(object manifestJson, Uri manifestUrl, CancellationToken cancelToken)
    {
        var icons = new List<ManifestIcon>();
        if (
            manifestJson is JsonElement manifestElem
            && manifestElem.TryGetProperty("icons", out var iconsElem)
            && iconsElem.ValueKind == JsonValueKind.Array
        )
        {
            foreach (var iconElem in iconsElem.EnumerateArray())
            {
                var icon = new ManifestIcon
                {
                    src = iconElem.TryGetProperty("src", out var srcElem)
                        ? srcElem.GetString()
                        : null,
                    type = iconElem.TryGetProperty("type", out var typeElem)
                        ? typeElem.GetString()
                        : null,
                    sizes = iconElem.TryGetProperty("sizes", out var sizesElem)
                        ? sizesElem.GetString()
                        : null,
                };
                icons.Add(icon);
            }
        }

        try
        {
            if (icons.Count == 0)
            {
                return new Validation
                {
                    Member = "icons",
                    Category = "required",
                    DisplayString = "Manifest icons exist",
                    ErrorString = "You must provide at least one icon.",
                    InfoString =
                        "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
                    DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
                    QuickFix = false,
                    Valid = false,
                };
            }

            var iconsData = icons
                .Select(icon => new
                {
                    icon.src,
                    url = new Uri(manifestUrl, icon.src).ToString(),
                    icon.type,
                    icon.sizes
                })
                .ToList();

            var results = await Task.WhenAll(
                iconsData.Select(async icon =>
                {                    
                    return new
                    {
                        icon.src,
                        icon.url,
                        icon.type,
                        icon.sizes,
                        exists = await TryImageExistsAsync(new Uri(manifestUrl, icon.url), cancelToken)
                    };
                })
            );

            bool isValid = results.All(icon => icon.exists);
            var missingIcons = results
                .Where(icon => !icon.exists)
                .Select(icon => icon.src)
                .ToList();

            return new Validation
            {
                Member = "icons",
                Category = "required",
                DisplayString = "Manifest icons exist",
                ErrorString = isValid
                    ? ""
                    : $"Couldn't fetch the following icons: {string.Join(", ", missingIcons)}",
                InfoString =
                    "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
                DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
                QuickFix = false,
                Valid = isValid,
            };
        }
        catch (Exception ex)
        {
            return new Validation
            {
                Member = "icons",
                Category = "required",
                DisplayString = "Manifest icons exist",
                ErrorString = $"Error validating icons: {ex.Message}",
                InfoString =
                    "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
                DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=icons"),
                QuickFix = false,
                Valid = false,
            };
        }
    }

    public async Task<Validation> ValidateScreenshotsMetadataAsync(object manifestJson, Uri manifestUrl, CancellationToken cancelToken)
    {
        var screenshots = new List<ManifestScreenshot>();
        if (
            manifestJson is JsonElement manifestElem
            && manifestElem.TryGetProperty("screenshots", out var screenshotsElem)
            && screenshotsElem.ValueKind == JsonValueKind.Array
        )
        {
            foreach (var screenshotElem in screenshotsElem.EnumerateArray())
            {
                var screenshot = new ManifestScreenshot
                {
                    src = screenshotElem.TryGetProperty("src", out var srcElem)
                        ? srcElem.GetString()
                        : null,
                    type = screenshotElem.TryGetProperty("type", out var typeElem)
                        ? typeElem.GetString()
                        : null,
                    sizes = screenshotElem.TryGetProperty("sizes", out var sizesElem)
                        ? sizesElem.GetString()
                        : null,
                };
                screenshots.Add(screenshot);
            }
        }

        try
        {
            if (screenshots.Count == 0)
            {
                return new Validation
                {
                    Member = "screenshots",
                    Category = "recommended",
                    DisplayString = "Manifest screenshots exist",
                    ErrorString = "Manifest should have at least one screenshot.",
                    InfoString =
                        "The screenshots member defines an array of screenshots intended to showcase the application.",
                    DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=screenshots"),
                    QuickFix = false,
                    Valid = false
                };
            }

            var screenshotsData = screenshots
                .Select(screenshot => new
                {
                    screenshot.src,
                    url = new Uri(manifestUrl, screenshot.src).ToString(),
                    screenshot.type,
                    screenshot.sizes,
                    screenshot.platform,
                })
                .ToList();

            var results = await Task.WhenAll(
                screenshotsData.Select(async screenshot =>
                {
                    return new
                    {
                        screenshot.src,
                        screenshot.url,
                        screenshot.type,
                        screenshot.sizes,
                        screenshot.platform,
                        exists = await TryImageExistsAsync(new Uri(manifestUrl, screenshot.url), cancelToken),
                    };
                })
            );

            bool isValid = results.All(screenshot => screenshot.exists);
            var missingScreenshots = results
                .Where(screenshot => !screenshot.exists)
                .Select(screenshot => screenshot.src)
                .ToList();

            return new Validation
            {
                Member = "screenshots",
                Category = "recommended",
                DisplayString = "Manifest screenshots exist",
                ErrorString = isValid
                    ? ""
                    : $"Couldn't fetch the following screenshots: {string.Join(", ", missingScreenshots)}",
                InfoString =
                    "The screenshots member defines an array of screenshots intended to showcase the application.",
                DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=screenshots"),
                QuickFix = false,
                Valid = isValid,
            };
        }
        catch (Exception ex)
        {
            return new Validation
            {
                Member = "screenshots",
                Category = "recommended",
                DisplayString = "Manifest screenshots exist",
                ErrorString = $"Error validating screenshots: {ex.Message}",
                InfoString =
                    "The screenshots member defines an array of screenshots intended to showcase the application.",
                DocsLink = new Uri("https://docs.pwabuilder.com/#/builder/manifest?id=screenshots"),
                QuickFix = false,
                Valid = false,
            };
        }
    }

    /// <summary>
    /// Checks whether the image exists asynchronously. 
    /// </summary>
    /// <param name="imageUrl"></param>
    /// <returns></returns>
    private async Task<bool> TryImageExistsAsync(Uri imageUrl, CancellationToken cancelToken)
    {
        // First try HEAD which is cheap and quick.
        try
        {
            using var response = await httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Head, imageUrl), cancelToken);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
        }
        catch
        {
            // Ingore exception and see if we can fetch it via GET.
        }

        // We couldn't load the image with HEAD. See if we can load it with GET without fetching the whole body.
        try
        {
            using var response = await httpClient.GetAsync(
                imageUrl,
                HttpCompletionOption.ResponseHeadersRead, // Don't buffer the body
                cancelToken
            );

            return response.IsSuccessStatusCode &&
                   response.Content.Headers.ContentType?.MediaType?.StartsWith("image/") == true;
        }
        catch
        {
            return false;
        }
    }

}
