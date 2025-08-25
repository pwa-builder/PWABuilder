using PWABuilder.Validations.Models;

namespace PWABuilder.Models;

/// <summary>
/// Result of a service worker detection for a web app.
/// </summary>
public class ServiceWorkerDetection
{
    /// <summary>
    /// The URL of the service worker script.
    /// </summary>
    public required Uri Url { get; set; }

    /// <summary>
    /// The raw string content of the service worker. This will be null if the service worker could not be fetched.
    /// </summary>
    public required string Raw { get; set; }
}
