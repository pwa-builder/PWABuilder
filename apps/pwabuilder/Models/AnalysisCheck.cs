namespace PWABuilder.Models;

/// <summary>
/// A check performed on a PWA to determine if it meets certain criteria. 
/// For example, a check that a PWA has a web manifest with icons defined.
/// </summary>
public class AnalysisCheck
{
    /// <summary>
    /// The name of the member that this check applies to, e.g. "icons", indicating the check was performed on a web manifest's icons property.
    /// </summary>
    public required string Member { get; set; }

    /// <summary>
    /// The label shown in the UI for this check, e.g. "Manifest has icons"
    /// </summary>
    public string? Label { get; set; }

    /// <summary>
    /// Gets a longer description of the check, e.g. "Your web manifest should have an icons array containing at least one icon, ideally 512x512 PNG format."
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// URL to any documentation about the check.
    /// </summary>
    public Uri? DocsLink { get; set; }

    /// <summary>
    /// A default value for the member, if applicable. For example, if the member is "icons", the default value might be "[]", indicating an empty array of icons.
    /// </summary>
    public string? DefaultValue { get; set; }

    /// <summary>
    /// Indicates whether the check passed or failed.
    /// </summary>
    public bool Passed { get; set; }

    /// <summary>
    /// The category of the analysis check, such as ServiceWorker, Manifest, or HTTPS.
    /// </summary>
    public AnalysisCheckCategory Category { get; set; }

    /// <summary>
    /// The analysis check level, such as required or recommended.
    /// </summary>
    public AnalysisCheckLevel Level { get; set; }
}