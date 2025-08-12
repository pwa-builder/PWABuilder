using PWABuilder.IOS.Models;
using PWABuilder.Models;

namespace PWABuilder.Services;

public interface ITelemetryService
{
    Task TrackEvent(AnalyticsInfo analyticsInfo, string? error, bool success);

    Task UploadToAppInsights(
        Report webAppReport,
        AnalyticsInfo analyticsInfo,
        ServiceWorkerFeatures? serviceWorkerFeatures
    );

    Task Record(
        string url,
        bool success,
        IOSAppPackageOptions.Validated? packageOptions,
        AnalyticsInfo? analyticsInfo,
        string? error
    );
}
