namespace PWABuilder.Models;

/// <summary>
/// The category of the analysis check: service worker, web app manifest, or HTTPS.
/// </summary>
public enum PwaCapabilityCategory
{
    /// <summary>
    /// The analysis check was on a service worker.
    /// </summary>
    ServiceWorker,

    /// <summary>
    /// The analysis check was on a web app manifest.
    /// </summary>
    WebAppManifest,

    /// <summary>
    /// The analysis check was on HTTPS status.
    /// </summary>
    Https,
    
    /// <summary>
    /// The analysis check was on general web app capabilities, unrelated to web app manifest, service worker, or HTTPS.
    /// </summary>
    General,
}