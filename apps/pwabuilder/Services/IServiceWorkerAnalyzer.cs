using PWABuilder.Models;

namespace PWABuilder.Services
{
    public interface IServiceWorkerAnalyzer
    {
        Task<AnalyzeServiceWorkerResponse> AnalyzeServiceWorkerAsync(string serviceWorkerUrl);
    }
}
