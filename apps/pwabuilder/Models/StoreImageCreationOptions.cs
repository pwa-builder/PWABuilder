using System.ComponentModel.DataAnnotations;

namespace PWABuilder.Models;

/// <summary>
/// Represents a request to generate store images from a base image.
/// </summary>
public sealed class StoreImageCreationOptions
{
    /// <summary>
    /// The base image file uploaded by the client.
    /// </summary>
    public required IFormFile BaseImage { get; set; }

    /// <summary>
    /// The padding to apply around the image, from 0 (no padding) to 1 (maximum padding).
    /// </summary>
    [Range(0.0, 1.0)]
    public required double Padding { get; set; }

    /// <summary>
    /// The background color to use. Can be a hex color, named color, or "transparent". This color will be used when adding any specified padding or for the background when bringing the image into a non-square target.
    /// </summary>
    public required string BackgroundColor { get; set; }

    /// <summary>
    /// One or more target platform identifiers for which store images should be generated.
    /// </summary>
    [MinLength(1)]
    public required List<string> Platforms { get; set; }
}