using PWABuilder.IOS.Models;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    public interface IAnalyticsService
    {
        Task TrackEvent(AnalyticsInfo analyticsInfo, string? error, bool success);

        Task UploadToAppInsights(
            Report webAppReport,
            AnalyticsInfo analyticsInfo,
            AnalyzeServiceWorkerResponse? serviceWorkerFeatures
        );

        Task Record(
            string url,
            bool success,
            IOSAppPackageOptions.Validated? packageOptions,
            AnalyticsInfo? analyticsInfo,
            string? error
        );
    }
}
