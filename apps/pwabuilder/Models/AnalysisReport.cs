namespace PWABuilder.Models;

public class AnalysisReport
{
    /// <summary>
    /// The URL of the service worker that was detected.
    /// </summary>
    public Uri? ServiceWorkerUrl { get; set; }

    /// <summary>
    /// The service worker script content if the service worker was detected.
    /// </summary>
    public string? ServiceWorker { get; set; }

    /// <summary>
    /// The URL of the web app manifest that was detected.
    /// </summary>
    public Uri? WebAppManifestUrl { get; set; }

    /// <summary>
    /// The web app manifest content string if the manifest was detected.
    /// </summary>
    public string? WebAppManifest { get; set; }

    /// <summary>
    /// The list of checks performed during the analysis.
    /// </summary>
    public List<AnalysisCheck> Checks { get; set; } = [];
}