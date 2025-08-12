using PWABuilder.Validations.Models;

namespace PWABuilder.Models;

/// <summary>
/// The result of a manifest detection.
/// </summary>
public class ManifestDetection
{
    public required Uri Url { get; set; }
    public List<Validation> Validations { get; set; } = [];
    public object? Json { get; set; }
    public string? Raw { get; set; }
}
