using System.Text.Json;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    public class ImageValidationService : IImageValidationService
    {
        private readonly HttpClient httpClient = new HttpClient();

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

        public async Task<Validation> ValidateIconsMetadataAsync(
            object manifestJson,
            string manifestUrl
        )
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
                    throw new Exception("Could not list Manifest 'icons' property.");

                var iconsData = icons
                    .Select(icon => new
                    {
                        icon.src,
                        url = new Uri(new Uri(manifestUrl), icon.src).ToString(),
                        icon.type,
                        icon.sizes,
                    })
                    .ToList();

                var results = await Task.WhenAll(
                    iconsData.Select(async icon =>
                    {
                        try
                        {
                            var res = await httpClient.SendAsync(
                                new HttpRequestMessage(HttpMethod.Head, icon.url)
                            );
                            if (!res.IsSuccessStatusCode)
                            {
                                res = await httpClient.GetAsync(icon.url);
                            }
                            return new
                            {
                                icon.src,
                                icon.url,
                                icon.type,
                                icon.sizes,
                                exists = res.IsSuccessStatusCode,
                            };
                        }
                        catch
                        {
                            return new
                            {
                                icon.src,
                                icon.url,
                                icon.type,
                                icon.sizes,
                                exists = false,
                            };
                        }
                    })
                );

                bool isValid = results.All(icon => icon.exists);
                var missingIcons = results
                    .Where(icon => !icon.exists)
                    .Select(icon => icon.src)
                    .ToList();

                return new Validation
                {
                    member = "icons",
                    category = "required",
                    displayString = "Manifest icons exist",
                    errorString = isValid
                        ? ""
                        : $"Couldn't fetch the following icons: {string.Join(", ", missingIcons)}",
                    infoString =
                        "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
                    docsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
                    quickFix = false,
                    valid = isValid,
                };
            }
            catch (Exception ex)
            {
                return new Validation
                {
                    member = "icons",
                    category = "required",
                    displayString = "Manifest icons exist",
                    errorString = $"Error validating icons: {ex.Message}",
                    infoString =
                        "The icons member specifies an array of objects representing image files that can serve as application icons for different contexts.",
                    docsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=icons",
                    quickFix = false,
                    valid = false,
                };
            }
        }

        public async Task<Validation> ValidateScreenshotsMetadataAsync(
            object manifestJson,
            string manifestUrl
        )
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
                    throw new Exception("Could not list Manifest 'screenshots' property.");

                var screenshotsData = screenshots
                    .Select(screenshot => new
                    {
                        screenshot.src,
                        url = new Uri(new Uri(manifestUrl), screenshot.src).ToString(),
                        screenshot.type,
                        screenshot.sizes,
                        screenshot.platform,
                    })
                    .ToList();

                var results = await Task.WhenAll(
                    screenshotsData.Select(async screenshot =>
                    {
                        try
                        {
                            var res = await httpClient.SendAsync(
                                new HttpRequestMessage(HttpMethod.Head, screenshot.url)
                            );
                            if (!res.IsSuccessStatusCode)
                            {
                                res = await httpClient.GetAsync(screenshot.url);
                            }
                            return new
                            {
                                screenshot.src,
                                screenshot.url,
                                screenshot.type,
                                screenshot.sizes,
                                screenshot.platform,
                                exists = res.IsSuccessStatusCode,
                            };
                        }
                        catch
                        {
                            return new
                            {
                                screenshot.src,
                                screenshot.url,
                                screenshot.type,
                                screenshot.sizes,
                                screenshot.platform,
                                exists = false,
                            };
                        }
                    })
                );

                bool isValid = results.All(screenshot => screenshot.exists);
                var missingScreenshots = results
                    .Where(screenshot => !screenshot.exists)
                    .Select(screenshot => screenshot.src)
                    .ToList();

                return new Validation
                {
                    member = "screenshots",
                    category = "required",
                    displayString = "Manifest screenshots exist",
                    errorString = isValid
                        ? ""
                        : $"Couldn't fetch the following screenshots: {string.Join(", ", missingScreenshots)}",
                    infoString =
                        "The screenshots member defines an array of screenshots intended to showcase the application.",
                    docsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=screenshots",
                    quickFix = false,
                    valid = isValid,
                };
            }
            catch (Exception ex)
            {
                return new Validation
                {
                    member = "screenshots",
                    category = "required",
                    displayString = "Manifest screenshots exist",
                    errorString = $"Error validating screenshots: {ex.Message}",
                    infoString =
                        "The screenshots member defines an array of screenshots intended to showcase the application.",
                    docsLink = "https://docs.pwabuilder.com/#/builder/manifest?id=screenshots",
                    quickFix = false,
                    valid = false,
                };
            }
        }
    }
}
