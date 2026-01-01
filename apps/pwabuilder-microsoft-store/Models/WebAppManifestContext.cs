using PWABuilder.MicrosoftStore.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace PWABuilder.MicrosoftStore.Models
{
    /// <summary>
    /// Contains a web app manifest and the URL where the manifest was located.
    /// </summary>
    public class WebAppManifestContext : WebAppManifest
    {
        /// <summary>
        /// The URI from which the manifest was fetched.
        /// </summary>
        public Uri ManifestUri { get; set; } = new Uri("https://localhost");

        /// <summary>
        /// Creates a web app manifest context
        /// </summary>
        /// <param name="manifest"></param>
        /// <param name="manifestUri"></param>
        /// <returns></returns>
        public static WebAppManifestContext From(JsonDocument manifest, Uri manifestUri)
        {
            var context = new WebAppManifestContext
            {
                ManifestUri = manifestUri
            };

            var contextProps = typeof(WebAppManifestContext).GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance).Where(p => p.CanRead && p.CanWrite);

            var typeMapping = new Dictionary<string, Type>
    {
             { "icons", typeof(List<WebManifestIcon>) },
             { "screenshots", typeof(List<WebManifestScreenshot>) },
             { "shortcuts", typeof(List<WebManifestShortcutItem>) },
             { "categories", typeof(List<string>) }
    };
            foreach (var contextProp in contextProps)
            {
                bool exists = manifest.RootElement.TryGetProperty(contextProp.Name.ToLower(), out var manifestProp);

                if (exists && typeMapping.ContainsKey(contextProp.Name.ToLower()))
                {
                    JsonSerializerOptions options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    var propVal = JsonSerializer.Deserialize(manifestProp.GetRawText(), typeMapping[contextProp.Name.ToLower()], options);
                    contextProp.SetValue(context, propVal);
                }

                else if (exists && manifestProp.ValueKind != JsonValueKind.Null)
                {
                    var propVal = JsonSerializer.Deserialize(manifestProp.GetRawText(), contextProp.PropertyType);
                    contextProp.SetValue(context, propVal);
                }
            }

            return context;
        }

        public static WebAppManifestContext From(WebAppManifest manifest, Uri manifestUri)
        {
            var context = new WebAppManifestContext
            {
                ManifestUri = manifestUri
            };

            var manifestProps = typeof(WebAppManifest).GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            foreach (var prop in manifestProps.Where(p => p.CanRead && p.CanWrite))
            {
                var propVal = prop.GetValue(manifest);
                prop.SetValue(context, propVal);
            }

            return context;
        }

        /// <summary>
        /// Finds a general purpose manifest icon that matches the specified image scale.
        /// </summary>
        /// <param name="imageSetType"></param>
        /// <param name="scale"></param>
        /// <returns></returns>
        public Uri? GetIconUriFromScale(ImageScaleSetType imageSetType, ImageScale scale)
        {
            var imageDimensions = WindowsImages.GetDimensionFromScale(imageSetType, scale);
            return this.GetIconWithDimensions(imageDimensions)
                .Where(i => i.IsFormatSupportedByWindowsApps())
                .FirstOrDefault()?
                .GetSrcUri(this.ManifestUri);
        }

        /// <summary>
        /// Gets an icon from the specified target size.
        /// </summary>
        /// <param name="size"></param>
        /// <param name="altForm"></param>
        /// <returns></returns>
        public Uri? GetIconUriFromTargetSize(ImageTargetSize size, ImageAltForm altForm)
        {
            // NOTE: we ignore altForm here because the web manifest doesn't support light mode icons or unplated icons.
            // If web manifest supports these in the future, we should use those here.

            // Find images with the right dimensions.
            var (width, height) = size.GetDimensions();
            var windowsIconsWithDimensions = GetIconsWithDimensions(width, height)
                .Where(i => i.IsFormatSupportedByWindowsApps());

            // Are we looking for a light mode icon? If so, prioritize icons with "light" as the color_scheme
            if (altForm == ImageAltForm.Light)
            {
                windowsIconsWithDimensions = windowsIconsWithDimensions
                    .Where(i => i.IsLightMode() || i.IsAnyPurpose())
                    .OrderBy(i => i.IsLightMode() ? 0 : 1);
            }
            else if (altForm == ImageAltForm.Unplated)
            {
                // Looking for an unplated icon? Prioritize icons with "unplated" as the purpose.
                windowsIconsWithDimensions = windowsIconsWithDimensions
                    .Where(i => i.HasPurpose("unplated") || i.IsAnyPurpose())
                    .OrderBy(i => i.HasPurpose("unplated") ? 0 : 1);
            }

            return windowsIconsWithDimensions
                .Select(i => i.GetSrcUri(this.ManifestUri == null ? new Uri(this.Url!) : this.ManifestUri))
                .FirstOrDefault();
        }

        /// <summary>
        /// Finds the largest available icon that can be used as an app icon for Windows apps.
        /// Requirements:
        /// - Must be "any" purpose
        /// - Must be square
        /// - Must be PNG (preferred), JPG
        /// </summary>
        /// <remarks>
        /// For more info, see https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-uap-visualelements
        /// </remarks>
        /// <returns>The URI of the square icon, or null if no such icon could be found.</returns>
        /// <param name="minDimensions">The minimum dimensions to find.</param>
        public Uri? GetIconSuitableForWindowsApps(int minDimensions)
        {
            var isSuitable = new Func<WebManifestIcon, bool>(i =>
                (i.IsAnyPurpose() || i.IsMaskablePurpose()) &&
                i.IsSquare() &&
                i.GetLargestDimension().GetValueOrDefault().width >= minDimensions);

            var iconsOrderByLargest = GetIconsOrderedByLargest();
            iconsOrderByLargest.TryGetValue(IconFormat.Png, out var pngIcons);
            iconsOrderByLargest.TryGetValue(IconFormat.Jpg, out var jpgIcons);
            iconsOrderByLargest.TryGetValue(IconFormat.Gif, out var gifIcons);
            iconsOrderByLargest.TryGetValue(IconFormat.Unspecified, out var unknownFormatIcons);
            var candidates = new[]
            {
                pngIcons?.FirstOrDefault(isSuitable),
                jpgIcons?.FirstOrDefault(isSuitable),
                gifIcons?.FirstOrDefault(),
                unknownFormatIcons?.FirstOrDefault(isSuitable) // Risky, but some manifests don't provide enough metadata to determine format. If it's the wrong format, we'll get an exception while building the package.
            };
            return candidates
                .Where(i => i != null) // first suitable icon
                .Select(i => i!.GetSrcUri(this.ManifestUri)) // grab its URL
                .Where(uri => uri != null) // filter out any that don't have a URL
                .FirstOrDefault();
        }

        /// <summary>
        /// Resolves a URI to an absolute path relative to this web manifest's path.
        /// </summary>
        /// <param name="path">The path to resolve.</param>
        /// <returns>A new URI containing an absolute path relative to this web manifest's path.</returns>
        public Uri ResolveUri(string path, Uri url)
        {
            return new Uri(this.ManifestUri != null ? this.ManifestUri : this.Url != null ? new Uri(this.Url) : url, path);
        }

        /// <summary>
        /// Gets all the icons grouped by format. The icons (values of the dictionary) are sorted from largest to smallest.
        /// </summary>
        /// <returns>A dictionary containing <see cref="IconFormat"/> keys and a list of <see cref="WebManifestIcon"/> values.</returns>
        private Dictionary<IconFormat, List<WebManifestIcon>> GetIconsOrderedByLargest()
        {
            var iconsOrEmpty = this.Icons ?? Enumerable.Empty<WebManifestIcon>();
            return iconsOrEmpty
                .GroupBy(i => i.GetFormat())
                .ToDictionary(
                    i => i.Key, // icon format is the key
                    i => i.OrderByDescending(i => i.GetLargestDimension().GetValueOrDefault().height + i.GetLargestDimension().GetValueOrDefault().width).ToList() // Icons sorted by largest dimensions are the value
                );
        }
    }
}
