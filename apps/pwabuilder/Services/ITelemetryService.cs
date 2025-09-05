using PWABuilder.IOS.Models;
using PWABuilder.Models;

namespace PWABuilder.Services;

public interface ITelemetryService
{
    /// <summary>
    /// Tracks a generic event in Application Insights.
    /// </summary>
    /// <param name="analyticsInfo"></param>
    /// <param name="error"></param>
    /// <param name="success"></param>
    /// <returns></returns>
    Task TrackEvent(AnalyticsInfo analyticsInfo, string? error, bool success);

    /// <summary>
    /// Tracks the analysis of a web app URL in Application Insights.
    /// </summary>
    /// <param name="analysis">The analysis to track.</param>
    /// <param name="analyticsInfo">The analytics info containing the event.</param>
    /// <returns></returns>
    Task TrackAnalysis(Analysis analysis, AnalyticsInfo analyticsInfo);

    Task Record(string url, bool success, IOSAppPackageOptions.Validated? packageOptions, AnalyticsInfo? analyticsInfo, string? error);
}
