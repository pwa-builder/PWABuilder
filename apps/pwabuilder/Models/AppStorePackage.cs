using System.Text.Json.Serialization;

namespace PWABuilder.Models;

/// <summary>
/// Represents a user packaging a PWA for an app store.
/// </summary>
public sealed class AppStorePackage
{
    /// <summary>
    /// The ID of the analysis this package operation belongs to.
    /// </summary>
    public required string AnalysisId { get; init; }

    /// <summary>
    /// The app store where the package is being generated.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public AppStore AppStore { get; init; }

    /// <summary>
    /// The package operation status.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public AppStorePackageStatus Status { get; init; }

    /// <summary>
    /// The date and time when this package record was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// The error text for a failed package operation, if any.
    /// </summary>
    public string? Error { get; init; }
}