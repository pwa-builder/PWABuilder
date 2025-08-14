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
    /// A list of validation results run on the manifest. For example, whether the manifest 
    /// </summary>
    public List<Validation> Validations { get; set; } = [];

    /// <summary>
    /// The parsed manifest object.
    /// </summary>
    public object? Json { get; set; }

    /// <summary>
    /// The raw JSON of the manifest.
    /// </summary>
    public string? Raw { get; set; }
}
