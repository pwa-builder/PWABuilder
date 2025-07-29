using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microsoft.PWABuilder.Windows.Chromium.Models
{
    /// <summary>
    /// W3C web manifest. https://www.w3.org/TR/appmanifest/
    /// </summary>
    public class WebAppManifest
    {
        public string? Background_color { get; set; }
        public string? Description { get; set; }
        public string? Dir { get; set; }
        public string? Display { get; set; }
        public string? Lang { get; set; }
        public string? Name { get; set; }
        public string? Orientation { get; set; }
        public bool? Prefer_related_applications { get; set; }
        public string? Scope { get; set; }
        public string? Short_name { get; set; }
        public string? Start_url { get; set; }
        public string? Theme_color { get; set; }
        public string? Url { get; set; }
        public List<string>? Categories { get; set; }
        public List<WebManifestScreenshot>? Screenshots { get; set; }
        public string? Iarc_rating_id { get; set; }
        public List<WebManifestIcon>? Icons { get; set; }
        public List<WebManifestShortcutItem>? Shortcuts { get; set; }

        /// <summary>
        /// Finds a general purpose icon with the specified dimensions.
        /// </summary>
        /// <returns>A match</returns>
        public IEnumerable<WebManifestIcon> GetIconWithDimensions(string dimensions)
        {
            var widthAndHeight = dimensions.Split('x', StringSplitOptions.RemoveEmptyEntries);
            if (!int.TryParse(widthAndHeight.ElementAtOrDefault(0), out var width) || !int.TryParse(widthAndHeight.ElementAtOrDefault(1), out var height))
            {
                throw new ArgumentException($"Invalid dimensions string. Expected format 100x100, but received {dimensions}", nameof(dimensions));
            }

            return GetIconsWithDimensions(width, height);
        }

        /// <summary>
        /// Finds a general purpose icon with the specified dimensions.
        /// </summary>
        /// <returns>A match</returns>
        public IEnumerable<WebManifestIcon> GetIconsWithDimensions(int width, int height)
        {
            if (this.Icons == null)
            {
                return Enumerable.Empty<WebManifestIcon>();
            }

            // Find icons that have the specified dimensions, ordered by those with purpose = "any" (or empty), then ordered by png, then jpg.
            return this.Icons
                .Where(i => i.GetAllDimensions().Any(d => d.width == width && d.height == height))
                .OrderBy(i => !string.IsNullOrEmpty(i.Src) ? 0 : 1)
                .ThenBy(i => i.GetImageFormatPreferredSortOrder());
        }

        /// <summary>
        /// Gets the value of the <see cref="Display"/> member and returns it if it's one of the supported values.
        /// If it's not a supported value, or it's null or empty, null will be returned.
        /// </summary>
        /// <returns>The <see cref="Display"/> value if it's one of the known, supported values. Otherwise null.</returns>
        /// <remarks>
        /// Supported display mode values: https://www.w3.org/TR/appmanifest/#dfn-display-modes-values
        /// </remarks>
        public string? GetDisplayModeOrNull()
        {
            var supportedDisplayModes = new[]
            {
                "fullscreen",
                "standalone",
                "minimal-ui",
                "browser"
            };
            return supportedDisplayModes.FirstOrDefault(d => string.Equals(d, this.Display));
        }
    }

    public class WebManifestIcon
    {
        public string? Src { get; set; }
        public string? Type { get; set; }
        public string? Sizes { get; set; }
        public string? Purpose { get; set; } // "any" | "maskable" | "monochrome";
        public string? Label { get; set; }

        /// <summary>
        /// Color scheme. See https://github.com/w3c/image-resource/issues/26
        /// </summary>
        public string? Color_scheme { get; set; }

        public Uri? GetSrcUri(Uri manifestUri)
        {
            if (Uri.TryCreate(manifestUri, this.Src, out var iconUri))
            {
                return iconUri;
            }

            return null;
        }

        public IconFormat GetFormat()
        {
            return this.Type switch
            {
                "image/png" => IconFormat.Png,
                "image/jpeg" => IconFormat.Jpg,
                "image/jpg" => IconFormat.Jpg,
                "image/gif" => IconFormat.Gif,
                "image/x-icon" => IconFormat.Ico,
                "image/vnd.microsoft.icon" => IconFormat.Ico,
                "image/svg+xml" => IconFormat.Svg,
                "image/svg" => IconFormat.Svg,
                "image/webp" => IconFormat.Webp,
                _ => GuessFormatFromExtension()
            };
        }

        /// <summary>
        /// Checks whether the icon's format is supported in Windows apps.
        /// </summary>
        /// <returns>True </returns>
        public bool IsFormatSupportedByWindowsApps()
        {
            return this.GetFormat() switch
            {
                IconFormat.Jpg => true,
                IconFormat.Png => true,
                IconFormat.Gif => true,
                IconFormat.Svg => false, 
                IconFormat.Unspecified => true, // No format specified in the manifest? Gamble and hope for the best.
                _ => false // Partner Center will reject anything except JPG, PNG, and GIF.
            };
        }

        /// <summary>
        /// Whether the <see cref="Color_scheme"/> is "light".
        /// </summary>
        /// <returns></returns>
        public bool IsLightMode()
        {
            return string.Equals(this.Color_scheme, "light", StringComparison.OrdinalIgnoreCase);
        }

        public bool HasPurpose(string purpose)
        {
            // Special case: if purpose is empty, it should match "any" purpose.
            var isLookingAnyPurpose = string.Equals(purpose, "any", StringComparison.InvariantCultureIgnoreCase);
            if (string.IsNullOrWhiteSpace(this.Purpose))
            {
                return isLookingAnyPurpose;
            }

            return this.Purpose.Split(' ')
                .Any(p => string.Equals(p, purpose, StringComparison.InvariantCultureIgnoreCase));
        }

        public bool IsAnyPurpose()
        {
            return this.HasPurpose("any");
        }

        public bool IsMaskablePurpose()
        {
            return this.HasPurpose("maskable");
        }

        public bool IsSquare()
        {
            if (this.Sizes == null)
            {
                return false;
            }

            return this.GetAllDimensions()
                .Any(d => d.width == d.height);
        }

        /// <summary>
        /// Gets the largest dimension for the image.
        /// </summary>
        /// <returns></returns>
        public (int width, int height)? GetLargestDimension()
        {
            var largest = GetAllDimensions()
                .OrderByDescending(i => i.width + i.height)
                .FirstOrDefault();
            if (largest.height == 0 && largest.width == 0)
            {
                return null;
            }

            return largest;
        }

        /// <summary>
        /// Finds the largest dimension from the <see cref="Sizes"/> property
        /// </summary>
        /// <returns>The largest dimension from the <see cref="Sizes"/> string. If no valid size could be found, null.</returns>
        public List<(int width, int height)> GetAllDimensions()
        {
            if (this.Sizes == null)
            {
                return new List<(int width, int height)>(0);
            }

            return this.Sizes.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Select(size => size.Split('x', StringSplitOptions.RemoveEmptyEntries))
                .Select(widthAndHeight =>
                {
                    if (int.TryParse(widthAndHeight.ElementAtOrDefault(0), out var width) &&
                        int.TryParse(widthAndHeight.ElementAtOrDefault(1), out var height))
                    {
                        return (width, height);
                    }
                    return (width: 0, height: 0);
                })
                .Where(d => d.width != 0 && d.height != 0)
                .ToList();
        }

        public int GetImageFormatPreferredSortOrder()
        {            
            return this.GetFormat() switch
            {
                IconFormat.Png => 0, // best format
                IconFormat.Jpg => 1, // Windows apps can use JPG
                IconFormat.Unspecified => 2, // If the format is unspecified, let's gamble and hope for the best.
                _ => 3, // deprioritize others because Windows app packages won't work with them: https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-uap-visualelements
            };
        }

        private IconFormat GuessFormatFromExtension()
        {
            // No src? Punt.
            if (string.IsNullOrWhiteSpace(this.Src))
            {
                return IconFormat.Unspecified;
            }

            var extensionFormats = new Dictionary<string, IconFormat>
            {
                { ".png", IconFormat.Png },
                { ".jpg", IconFormat.Jpg },
                { ".jpeg", IconFormat.Jpg },
                { ".gif", IconFormat.Gif },
                { ".ico", IconFormat.Ico },
                { ".svg", IconFormat.Svg },
                { ".webp", IconFormat.Webp }
            };
            
            foreach (var (extension, format) in extensionFormats)
            {
                if (this.Src.EndsWith(extension, StringComparison.InvariantCultureIgnoreCase))
                {
                    return format;
                }
            }

            return IconFormat.Other;
        }
    }

    public class WebManifestScreenshot : WebManifestIcon
    {
        public string? Platform { get; set; }
    }

    public class WebManifestShortcutItem {
        public string? Name { get; set; }
        public string? Url { get; set; }
        public string? Description { get; set; }
        public string? Short_name { get; set; }
        public List<WebManifestIcon>? Icons { get; set; }
    }
}
