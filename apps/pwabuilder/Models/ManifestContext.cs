namespace PWABuilder.Models;

/// <summary>
/// Contains a web manifest URI, its raw JSON string content, and the parse manifest object.
/// </summary>
public class ManifestContext
{
    public required Uri Uri { get; set; }
    public required string ManifestJson { get; set; }
    public required object Manifest { get; set; }
}
