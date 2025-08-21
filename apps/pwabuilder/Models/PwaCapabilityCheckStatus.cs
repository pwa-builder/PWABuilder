namespace PWABuilder.Models;

/// <summary>
/// The status of a PWA capability check. For example, the status of checking whether a PWA can work offline.
/// </summary>
public enum PwaCapabilityCheckStatus
{
    /// <summary>
    /// The capability check is still in progress.
    /// </summary>
    InProgress,

    /// <summary>
    /// The capability check was skipped because the manifest or service worker or other dependency was not present.
    /// </summary>
    Skipped,

    /// <summary>
    /// The capability check passed.
    /// </summary>
    Passed,

    /// <summary>
    /// The capability check failed.
    /// </summary>
    Failed
}