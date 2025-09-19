using System.Text.Json;
using PWABuilder.Models.W3C;

namespace PwaBuilder.Common;

public static class ManifestJsonExtensions
{
    public static IEnumerable<WebManifestIcon> GetIcons(this JsonElement manifest)
    {
        var hasIcons = manifest.TryGetProperty("icons", out var icons)
            && icons.ValueKind == JsonValueKind.Array
            && icons.GetArrayLength() > 0;
        if (!hasIcons)
        {
            return [];
        }

        return icons.EnumerateArray().Select(ParseIcon);
    }

    /// <summary>
    /// Sorts the icons by their suitability for use as an app icon. It prefers large, square PNG icons with purpose set to any.
    /// </summary>
    /// <param name="icons">The icons to sort.</param>
    /// <returns>A new sorted list, with the most suitable first.</returns>
    public static IEnumerable<WebManifestIcon> OrderBySuitableAppIcon(this IEnumerable<WebManifestIcon> icons)
    {
        return icons
            .OrderByDescending(icon => !string.IsNullOrWhiteSpace(icon.Src))
            .ThenByDescending(i => i.Is512x512)
            .ThenByDescending(i => i.Is256x256)
            .ThenByDescending(i => i.Is192x192)
            .ThenByDescending(i => i.IsSquare)
            .ThenByDescending(i => i.Width)
            .ThenByDescending(i => i.IsPng)
            .ThenByDescending(i => i.IsWebp)
            .ThenByDescending(i => i.Purpose == "any" || i.Purpose == "");
    }
    
    private static WebManifestIcon ParseIcon(JsonElement icon)
    {
        var hasSrc = icon.TryGetProperty("src", out var src)
            && src.ValueKind == JsonValueKind.String
            && !string.IsNullOrWhiteSpace(src.GetString());
        var srcVal = hasSrc ? src.GetString() ?? string.Empty : string.Empty;

        var hasSizes = icon.TryGetProperty("sizes", out var sizes)
            && sizes.ValueKind == JsonValueKind.String
            && !string.IsNullOrWhiteSpace(sizes.GetString());
        var sizeVal = hasSizes ? sizes.GetString() ?? string.Empty : string.Empty;

        var hasType = icon.TryGetProperty("type", out var type)
            && type.ValueKind == JsonValueKind.String;
        var typeVal = hasType ? type.GetString() ?? string.Empty : string.Empty;

        var hasPurpose = icon.TryGetProperty("purpose", out var purpose)
            && purpose.ValueKind == JsonValueKind.String;
        var purposeVal = hasPurpose ? purpose.GetString() ?? string.Empty : "any";

        return new WebManifestIcon
        {
            Src = srcVal,
            Sizes = sizeVal,
            Type = typeVal,
            Purpose = purposeVal
        };
    }
}