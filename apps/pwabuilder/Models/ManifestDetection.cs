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
    /// An empty manifest object, used when we can't store the real manifest contents.
    /// </summary>
    private static readonly JsonElement EmptyManifest = JsonSerializer.Deserialize<JsonElement>("{}");

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

    /// <summary>
    /// Checks whether the manifest contains base64-encoded images, such as an icon or screenshot whose src is a data URI.
    /// Such manifests can be many megabytes in size, too large to store in our database.
    /// </summary>
    /// <returns>True if any value inside the manifest is a data URI.</returns>
    public bool ContainsBase64EncodedImages() => ContainsDataUri(this.Manifest);

    /// <summary>
    /// Creates a copy of this detection without the manifest contents. Used when the manifest is too large to store,
    /// for example when it contains base64-encoded images.
    /// </summary>
    /// <returns>A new <see cref="ManifestDetection"/> containing only the manifest URL.</returns>
    public ManifestDetection WithoutManifestContents() => new()
    {
        Url = this.Url,
        Manifest = EmptyManifest,
        ManifestRaw = null
    };

    /// <summary>
    /// Recursively checks whether any string value in the specified JSON is a data URI.
    /// We check the whole manifest rather than just icons because data URIs can appear in
    /// icons, screenshots, shortcut icons, file handler icons, and other manifest members.
    /// </summary>
    /// <param name="element">The JSON element to check.</param>
    /// <returns>True if a data URI was found.</returns>
    private static bool ContainsDataUri(JsonElement element) => element.ValueKind switch
    {
        JsonValueKind.String => element.GetString()?.TrimStart().StartsWith("data:", StringComparison.OrdinalIgnoreCase) == true,
        JsonValueKind.Array => element.EnumerateArray().Any(ContainsDataUri),
        JsonValueKind.Object => element.EnumerateObject().Any(p => ContainsDataUri(p.Value)),
        _ => false
    };

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
