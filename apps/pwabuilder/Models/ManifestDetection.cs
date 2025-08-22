using System.Text.Json;
using PWABuilder.Validations.Models;

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
}
