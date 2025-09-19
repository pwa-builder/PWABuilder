using System.Text.Json;
using PwaBuilder.Common;
using PWABuilder.IOS.Common;

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
    /// Gets the URL of a reasonable app icon from the manifest.
    /// </summary>
    public Uri? AppIcon => this.GetAppIcon();

    private Uri? GetAppIcon()
    {
        return this.Manifest
            .GetIcons()
            .OrderBySuitableAppIcon()
            .Where(s => !string.IsNullOrWhiteSpace(s.Src))
            .Select(s => UriExtensions.TryCreateUriOrNull(this.Url, s.Src))
            .FirstOrDefault();
    }
}
