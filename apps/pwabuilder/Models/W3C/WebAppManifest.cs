using System.Text.Json.Serialization;

namespace PWABuilder.Models.W3C;

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