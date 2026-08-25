using System.Text.Json;
using PwaBuilder.Common;
using PWABuilder.Common;

namespace PWABuilder.Models;

/// <summary>
/// The result of a manifest detection.
/// </summary>
public class ManifestDetection
{
    /// <summary>
    /// The URL where the manifest was found.
    /// </summary>
    public required Uri Url { get; set; }

    /// <summary>
    /// The parsed manifest object.
    /// </summary>
    public JsonElement Manifest { get; set; }

    /// <summary>
    /// The raw JSON string of the manifest.
    /// </summary>
    public string? ManifestRaw { get; set; }

    /// <summary>
    /// Indicates whether the manifest contained inline base64-encoded image data URLs (e.g. <c>data:image/png;base64,...</c>).
    /// Such images are stripped from <see cref="Manifest"/> and <see cref="ManifestRaw"/> during detection because they bloat the
    /// manifest (which breaks analysis storage) and aren't supported by app stores, which require external image URLs.
    /// </summary>
    public bool HasBase64EncodedImages { get; set; }

    /// <summary>
    /// Gets the URL of a reasonable app icon from the manifest.
    /// </summary>
    public Uri? AppIcon => this.GetAppIcon();

    private Uri? GetAppIcon()
    {
        if (this.Manifest.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        return this.Manifest
            .GetIcons()
            .OrderBySuitableAppIcon()
            .Where(s => !string.IsNullOrWhiteSpace(s.Src))
            .Select(s => UriExtensions.TryCreateUriOrNull(this.Url, s.Src))
            .FirstOrDefault();
    }
}
