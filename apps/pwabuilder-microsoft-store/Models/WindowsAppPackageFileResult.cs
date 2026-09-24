namespace PWABuilder.MicrosoftStore.Models;

/// <summary>
/// A generated ZIP package whose files remain available until the owning packaging scope is disposed.
/// </summary>
/// <param name="FilePath">The path of the generated ZIP file.</param>
/// <param name="ModernAppPackage">The modern Windows package metadata, if requested.</param>
public sealed record WindowsAppPackageFileResult(string FilePath, ModernWindowsPackageResult? ModernAppPackage)
{
    /// <summary>
    /// Gets the classic package metadata retained for the legacy byte-array API.
    /// </summary>
    internal ClassicWindowsPackageResult? ClassicAppPackage { get; init; }

    /// <summary>
    /// Gets the EdgeHTML package metadata retained for the legacy byte-array API.
    /// </summary>
    internal SpartanWindowsPackageResult? EdgeHtmlAppPackage { get; init; }
}
