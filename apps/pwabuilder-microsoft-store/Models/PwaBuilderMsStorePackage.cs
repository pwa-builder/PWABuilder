using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PWABuilder.MicrosoftStore.Models;

/// <summary>
/// A model stored in PWABuilder's CosmosDB to track app packages generated for the Microsoft Store.
/// PWABuilder's web backend uses these to determine which Microsoft Store packages have been published to the Store.
/// </summary>
public class PwaBuilderMsStorePackage
{
    /// <summary>
    /// The unique identifier for this document in CosmosDB. 
    /// </summary>
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    /// <summary>
    /// The URL of the PWA.
    /// </summary>
    public Uri? Url { get; set; }

    /// <summary>
    /// The URL of the PWA's web app manifest.
    /// </summary>
    public Uri? ManifestUrl { get; set; }

    /// <summary>
    /// The raw JSON of the PWA's web app manifest.
    /// </summary>
    public JsonDocument? Manifest { get; set; }

    /// <summary>
    /// The error message that occurred during package generation, if any.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets the stack trace of the error that occurred during package generation.
    /// </summary>
    public string? ErrorStack { get; set; }

    /// <summary>
    /// Whether the package generation was a developer test package.
    /// </summary>
    public bool IsDevPackage { get; set; }

    /// <summary>
    /// The package ID, e.g. MyCompany.MyPWA_1.0.0.0_neutral__2weykb3d8dbew.
    /// </summary>
    public string? PackageId { get; set; }

    /// <summary>
    /// The publisher display name of the package, e.g. Contoso Inc.
    /// </summary>
    public string? PublisherDisplayName { get; set; }

    /// <summary>
    /// The publisher ID (common name) of the package, e.g. CN=12345678-90AB-CDEF-1234-567890ABCDEF.
    /// </summary>
    public string? PublisherId { get; set; }

    /// <summary>
    /// The correlation ID associated with this package generation request.
    /// </summary>
    public string? CorrelationId { get; set; }

    /// <summary>
    /// ID of the platform that generated the package.
    /// </summary>
    public string? PlatformId { get; set; }

    /// <summary>
    /// Version of the platform that generated the package.
    /// </summary>
    public string? PlatformIdVersion { get; set; }
}