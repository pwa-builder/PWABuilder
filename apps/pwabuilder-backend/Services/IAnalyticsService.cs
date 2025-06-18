using PWABuilder.Models;
using System.Text.Json;

namespace PWABuilder.Services
{
    public interface IAnalyticsService
    {
        Task TrackEvent(AnalyticsInfo analyticsInfo, string? error, bool success);

        Task UploadToAppInsights(JsonDocument webAppReport, AnalyticsInfo analyticsInfo);
    }
}
