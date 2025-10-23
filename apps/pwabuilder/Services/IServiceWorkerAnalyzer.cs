

using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Analyzes a service worker to determine its features and capabilities.
/// </summary>
public interface IServiceWorkerAnalyzer
{
    /// <summary>
    /// Attempts to analyze the service worker. Any errors will be logged to the specified <paramref name="logger"/>.
    /// </summary>
    /// <param name="swDetection">Contains information about the detected service worker, or null if no service worker was detected.</param>
    /// <param name="appUrl">The URL of the web app being analyzed.</param>
    /// <param name="logger">The logger to log errors, warnings, and information to.</param>
    /// <param name="cancelToken">Cancellation token.</param>
    /// <returns>A task that will resolve when the analysis completes. The analysis results will be stored in <paramref name="swDetection"/> object's <see cref="ServiceWorkerDetection.Capabilities"/>.</returns>
    Task<List<PwaCapability>> TryAnalyzeServiceWorkerAsync(ServiceWorkerDetection? swDetection, Uri appUrl, ILogger logger, CancellationToken cancelToken);

    /// <summary>
    /// Checks whether the web app supports offline capability. This is implemented as a separate method from <see cref="TryAnalyzeServiceWorkerAsync"/> because it takes a potentially long time to run.
    /// </summary>
    /// <param name="swDetection">The service worker detection.</param>
    /// <param name="appUrl">The application URL.</param>
    /// <param name="logger">The logger.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>The offline capability.</returns>
    Task<PwaCapability> TryRunOfflineCheck(ServiceWorkerDetection? swDetection, Uri appUrl, ILogger logger, CancellationToken cancelToken);
}