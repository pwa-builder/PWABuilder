namespace PWABuilder.Models;

/// <summary>
/// The current state of an app store package operation.
/// </summary>
public enum AppStorePackageStatus
{
    /// <summary>
    /// No package status has been set.
    /// </summary>
    None,

    /// <summary>
    /// Package generation has started.
    /// </summary>
    Started,

    /// <summary>
    /// Package generation completed successfully.
    /// </summary>
    Completed,

    /// <summary>
    /// Package generation failed.
    /// </summary>
    Failed
}