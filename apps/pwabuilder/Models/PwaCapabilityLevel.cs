namespace PWABuilder.Models;

/// <summary>
/// The level of an analysis check.
public enum PwaCapabilityLevel
{
    /// <summary>
    /// The capability is required. For example, the manifest has a name property.
    /// </summary>
    Required,

    /// <summary>
    /// The capability is recommended. For example, the manifest has a screenshots property.
    /// </summary>
    Recommended,

    /// <summary>
    /// The capability is an optional enhancement. For example, the manifest has an iarc_rating_id property.
    /// </summary>
    Optional,

    /// <summary>
    /// The capability is a feature. For example, the PWA can work offline or be a single-instance app.
    /// </summary>
    Feature
}