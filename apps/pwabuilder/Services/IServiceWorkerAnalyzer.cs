

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
        /// <param name="analysis">The PWA analysis. The <see cref="Analysis.Capabilities"/> will be updated to reflect the findings of the analysis.</param>
        /// <param name="logger">The logger to log errors, warnings, and information to.</param>
        /// <param name="cancelToken">Cancellation token.</param>
        /// <returns>A task that will resolve when the analysis completes. The analysis results will be stored in <paramref name="analysis"/> object's <see cref="Analysis.Capabilities"/>.</returns>
        Task TryAnalyzeServiceWorkerAsync(Analysis analysis, ILogger logger, CancellationToken cancelToken);
    }
}
