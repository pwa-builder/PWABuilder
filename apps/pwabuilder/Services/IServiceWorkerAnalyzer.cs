

using PWABuilder.Models;

namespace PWABuilder.Services
{
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
    }
}
