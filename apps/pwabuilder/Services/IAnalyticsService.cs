using PWABuilder.Models;

namespace PWABuilder.Services
{
    public interface IAnalyticsService
    {
        Task TrackEvent(AnalyticsInfo analyticsInfo, string? error, bool success);

        Task UploadToAppInsights(Report webAppReport, AnalyticsInfo analyticsInfo);
    }
}
