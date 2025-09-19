using System.Text.Json.Serialization;

namespace PWABuilder.Models.W3C;

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
    public bool IsSquare => this.Sizes != null && this.GetAllDimensions().Any(d => d.width == d.height);

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

    public string[] GetPurposes()
    {
        if (string.IsNullOrWhiteSpace(this.Purpose))
        {
            return ["any"];
        }

        return this.Purpose.Split(' ');
    }
    
    public (int Width, int Height)? GetSize()
    {
        var parts = (Sizes ?? string.Empty).Split('x');
        if (
            parts.Length == 2
            && int.TryParse(parts[0], out var width)
            && int.TryParse(parts[1], out var height)
        )
        {
            return (width, height);
        }
        return null;
    }

    [JsonIgnore]
    public string SrcOrEmpty => this.Src ?? string.Empty;

    public bool IsPngOrSvg() =>
        Type == "image/png"
        || Type == "image/svg"
        || SrcOrEmpty.EndsWith(".png", StringComparison.OrdinalIgnoreCase)
        || SrcOrEmpty.EndsWith(".svg", StringComparison.OrdinalIgnoreCase);

    public bool IsPng => Type == "image/png" || SrcOrEmpty.EndsWith(".png", StringComparison.OrdinalIgnoreCase);

    public bool IsWebp => Type == "image/webp" || SrcOrEmpty.EndsWith(".webp", StringComparison.OrdinalIgnoreCase);

    public bool IsJpg => Type == "image/jpg" || Type == "image/jpeg" || SrcOrEmpty.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) || SrcOrEmpty.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase);

    public int Width => GetSize()?.Width ?? 0;

    public bool Is512x512 => GetSize() is (int width, int height) && width == 512 && height == 512;

    public bool Is256x256 => GetSize() is (int width, int height) && width == 256 && height == 256;

    public bool Is192x192 => GetSize() is (int width, int height) && width == 192 && height == 192;
}