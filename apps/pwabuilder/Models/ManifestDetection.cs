using System.Buffers;
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
    /// The value used in place of a base64-encoded image, such as an icon whose src is a data URI.
    /// </summary>
    public const string OmittedDataUri = "data:[omitted-by-pwabuilder]";

    /// <summary>
    /// An empty manifest object, used when we can't store the real manifest contents.
    /// </summary>
    private static readonly JsonElement EmptyManifest = JsonSerializer.Deserialize<JsonElement>("{}");

    /// <summary>
    /// The options used when regenerating the raw manifest JSON, matching the formatting of a typical manifest file.
    /// </summary>
    private static readonly JsonSerializerOptions ManifestRawSerializerOptions = new()
    {
        WriteIndented = true
    };

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
    /// Creates a copy of this detection whose base64-encoded images are replaced with <see cref="OmittedDataUri"/>.
    /// Used when the manifest is too large to store because of its embedded images; the rest of the manifest is preserved.
    /// </summary>
    /// <returns>A new <see cref="ManifestDetection"/> without base64-encoded images.</returns>
    public ManifestDetection WithoutBase64EncodedImages()
    {
        var manifest = ReplaceDataUris(this.Manifest);
        return new ManifestDetection
        {
            Url = this.Url,
            Manifest = manifest,
            ManifestRaw = manifest.ValueKind == JsonValueKind.Undefined ? null : JsonSerializer.Serialize(manifest, ManifestRawSerializerOptions)
        };
    }

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
    /// Recursively creates a copy of the specified JSON in which every data URI string is replaced with <see cref="OmittedDataUri"/>.
    /// </summary>
    /// <param name="element">The JSON element to copy.</param>
    /// <returns>The copied JSON element.</returns>
    private static JsonElement ReplaceDataUris(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.Undefined)
        {
            return element;
        }

        var buffer = new ArrayBufferWriter<byte>();
        using (var writer = new Utf8JsonWriter(buffer))
        {
            WriteWithoutDataUris(element, writer);
        }

        // Clone the element so that it remains usable after the document is disposed.
        using var document = JsonDocument.Parse(buffer.WrittenMemory);
        return document.RootElement.Clone();
    }

    /// <summary>
    /// Writes the specified JSON element, replacing any data URI string with <see cref="OmittedDataUri"/>.
    /// </summary>
    /// <param name="element">The JSON element to write.</param>
    /// <param name="writer">The writer to write to.</param>
    private static void WriteWithoutDataUris(JsonElement element, Utf8JsonWriter writer)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.String when IsDataUri(element):
                writer.WriteStringValue(OmittedDataUri);
                break;
            case JsonValueKind.Array:
                writer.WriteStartArray();
                foreach (var item in element.EnumerateArray())
                {
                    WriteWithoutDataUris(item, writer);
                }
                writer.WriteEndArray();
                break;
            case JsonValueKind.Object:
                writer.WriteStartObject();
                foreach (var property in element.EnumerateObject())
                {
                    writer.WritePropertyName(property.Name);
                    WriteWithoutDataUris(property.Value, writer);
                }
                writer.WriteEndObject();
                break;
            default:
                element.WriteTo(writer);
                break;
        }
    }

    /// <summary>
    /// Recursively checks whether any string value in the specified JSON is a data URI.
    /// We check the whole manifest rather than just icons because data URIs can appear in
    /// icons, screenshots, shortcut icons, file handler icons, and other manifest members.
    /// </summary>
    /// <param name="element">The JSON element to check.</param>
    /// <returns>True if a data URI was found.</returns>
    private static bool ContainsDataUri(JsonElement element) => element.ValueKind switch
    {
        JsonValueKind.String => IsDataUri(element),
        JsonValueKind.Array => element.EnumerateArray().Any(ContainsDataUri),
        JsonValueKind.Object => element.EnumerateObject().Any(p => ContainsDataUri(p.Value)),
        _ => false
    };

    /// <summary>
    /// Checks whether the specified JSON string value is a data URI. Values we've already replaced with
    /// <see cref="OmittedDataUri"/> don't count, so that re-saving an analysis doesn't detect them again.
    /// </summary>
    /// <param name="element">The JSON string element to check.</param>
    /// <returns>True if the value is a data URI.</returns>
    private static bool IsDataUri(JsonElement element)
    {
        var value = element.GetString()?.TrimStart();
        return value?.StartsWith("data:", StringComparison.OrdinalIgnoreCase) == true
            && !string.Equals(value, OmittedDataUri, StringComparison.Ordinal);
    }

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
