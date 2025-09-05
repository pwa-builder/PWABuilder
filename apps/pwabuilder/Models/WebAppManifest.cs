using System.Text.Json.Serialization;

namespace PWABuilder.Models;

/// <summary>
    /// W3C web manifest. https://www.w3.org/TR/appmanifest/
    /// </summary>
    public class WebAppManifest
    {
        [JsonPropertyName("background_color")]
        public string? BackgroundColor { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("dir")]
        public string? Dir { get; set; }

        [JsonPropertyName("display")]
        public string? Display { get; set; }

        [JsonPropertyName("lang")]
        public string? Lang { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("orientation")]
        public string? Orientation { get; set; }

        [JsonPropertyName("prefer_related_applications")]
        public bool? PreferRelatedApplications { get; set; }

        [JsonPropertyName("related_applications")]
        public List<ExternalApplicationResource>? RelatedApplications { get; set; }

        [JsonPropertyName("scope")]
        public string? Scope { get; set; }

        [JsonPropertyName("short_name")]
        public string? ShortName { get; set; }

        [JsonPropertyName("start_url")]
        public string? StartUrl { get; set; }

        [JsonPropertyName("theme_color")]
        public string? ThemeColor { get; set; }

        [JsonPropertyName("categories")]
        public List<string>? Categories { get; set; }

        [JsonPropertyName("screenshots")]
        public List<WebManifestIcon>? Screenshots { get; set; }

        [JsonPropertyName("iarc_rating_id")]
        public string? IarcRatingId { get; set; }

        [JsonPropertyName("icons")]
        public List<WebManifestIcon>? Icons { get; set; }

        [JsonPropertyName("shortcuts")]
        public List<WebManifestShortcutItem>? Shortcuts { get; set; }

        /// <summary>
        /// Finds a general purpose icon with the specified dimensions.
        /// </summary>
        /// <returns>A match</returns>
        public WebManifestIcon? GetIconWithDimensions(string dimensions)
        {
            var widthAndHeight = dimensions.Split('x', StringSplitOptions.RemoveEmptyEntries);
            if (!int.TryParse(widthAndHeight.ElementAtOrDefault(0), out var width) || !int.TryParse(widthAndHeight.ElementAtOrDefault(1), out var height))
            {
                throw new ArgumentException($"Invalid dimensions string. Expected format 100x100, but received {dimensions}", nameof(dimensions));
            }

            return GetIconsWithDimensions(width, height).FirstOrDefault();
        }

        /// <summary>
        /// Finds a general purpose icon with the specified dimensions.
        /// </summary>
        /// <returns>A match</returns>
        public IEnumerable<WebManifestIcon> GetIconsWithDimensions(int width, int height)
        {
            if (this.Icons == null)
            {
                return [];
            }

            // Find icons that have the specified dimensions, ordered by those with purpose = "any" (or empty), then ordered by png, then jpg.
            return this.Icons
                .Where(i => i.GetAllDimensions().Any(d => d.width == width && d.height == height))
                .OrderBy(i => !string.IsNullOrEmpty(i.Src) ? 0 : 1)
                .OrderBy(i => i.IsAnyPurpose() ? 0 : 1)
                .ThenBy(i => i.GetImageFormatPreferredSortOrder());
        }

        public static string[] DisplayTypes => new[]
        {
            "fullscreen",
            "standalone",
            "minimal-ui",
            "browser"
        };

        public static string[] OrientationTypes => new[]
        {
            "any",
            "natural",
            "landscape",
            "portrait",
            "portrait-primary",
            "portrait-secondary",
            "landscape-primary",
            "landscape-secondary"
        };

        /// <summary>
        /// Checks whether the manifest has any properties set to a non-null value.
        /// </summary>
        /// <returns></returns>
        public bool HasAnyNonNullProps()
        {
            var props = typeof(WebAppManifest).GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            return props
                .Select(p => p.GetValue(this))
                .Any(val => val != null);
        }
    }

    /// <summary>
    /// A W3C icon.
    /// </summary>
    public class WebManifestIcon
    {
        /// <summary>
        /// The source URL.
        /// </summary>
        [JsonPropertyName("src")]
        public string? Src { get; set; }

        /// <summary>
        /// The type.
        /// </summary>
        [JsonPropertyName("type")]
        public string? Type { get; set; }

        /// <summary>
        /// The sizes.
        /// </summary>
        [JsonPropertyName("sizes")]
        public string? Sizes { get; set; }

        /// <summary>
        /// The purpose.
        /// </summary>
        [JsonPropertyName("purpose")]
        public string? Purpose { get; set; } // "any" | "maskable" | "monochrome";

        /// <summary>
        /// The platform.
        /// </summary>
        [JsonPropertyName("platform")]
        public string? Platform { get; set; }

        /// <summary>
        /// Gets the absolute source URI using the manifest URI as the base.
        /// </summary>
        /// <param name="manifestUri"></param>
        /// <returns></returns>
        public Uri? GetSrcUri(Uri manifestUri)
        {
            if (Uri.TryCreate(manifestUri, this.Src, out var iconUri))
            {
                return iconUri;
            }

            return null;
        }

        /// <summary>
        /// Checks if the icon is any purpose. An icon is considered any purpose if the purpose contains "any" or if purpose is null.
        /// </summary>
        /// <returns></returns>
        public bool IsAnyPurpose()
        {
            return this.GetPurposes().Contains("any", StringComparer.InvariantCultureIgnoreCase);
        }

        /// <summary>
        /// Checks whether the icon is square.
        /// </summary>
        /// <returns></returns>
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
            return Type switch
            {
                "image/png" => 0, // best format
                "" => 0, // empty and null are common here, and are often png. Put those above jpg
                null => 0,
                "image/jpeg" => 1, // failing that use jpeg, the official mime type
                "image/jpg" => 1, // then use the erroneous but often used "image/jpg" mime type.
                "image/svg+xml" => 3, // deprioritize svg because Windows app packages won't work with them: https://docs.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-uap-visualelements
                _ => 2
            };
        }

        public bool IsPng()
        {
            return this.Type == "image/png" || this.Src?.EndsWith(".png", StringComparison.InvariantCultureIgnoreCase) == true;
        }

        public string[] GetPurposes()
        {
            if (string.IsNullOrWhiteSpace(this.Purpose))
            {
                return ["any"];
            }

            return this.Purpose.Split(' ');
        }
    }

    public class WebManifestShortcutItem
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("short_name")]
        public string? ShortName { get; set; }

        [JsonPropertyName("icons")]
        public List<WebManifestIcon>? Icons { get; set; }
    }

    public class ExternalApplicationResource
    {
        [JsonPropertyName("platform")]
        
        public string Platform { get; set; } = string.Empty;

        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("min_version")]
        public string? MinVersion { get; set; }

        [JsonPropertyName("fingerprints")]
        public List<Fingerprint>? Fingerprints { get; set; }
    }

    public class Fingerprint
    {
        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("value")]
        public string? Value { get; set; }
    }