

using PWABuilder.Models;
using PWABuilder.Validations.Models;

namespace PWABuilder.Services
{
    /// <summary>
    /// Analyzes a service worker to determine its features and capabilities.
    /// </summary>
    public interface IServiceWorkerAnalyzer
    {
        Task<ServiceWorkerFeatures?> AnalyzeServiceWorkerAsync(Uri serviceWorkerUrl, Uri appUrl, ILogger logger, CancellationToken cancelToken);
    }
}
