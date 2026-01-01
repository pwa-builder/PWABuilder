using Microsoft.ApplicationInsights;
using Microsoft.Extensions.Options;
using PWABuilder.IOS.Models;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    public class TelemetryService : ITelemetryService
    {
        private readonly IOptions<AppSettings> settings;
        private readonly ILogger<TelemetryService> logger;
        private readonly TelemetryClient telemetryClient;
        private readonly bool isAppInsightsEnabled;

        public TelemetryService(
            IOptions<AppSettings> settings,
            ILogger<TelemetryService> logger,
            TelemetryClient telemetryClient
        )
        {
            this.settings = settings;
            this.logger = logger;
            this.telemetryClient = telemetryClient;
            isAppInsightsEnabled = !string.IsNullOrEmpty(
                this.settings.Value.ApplicationInsightsConnectionString
            );
        }

        public async Task TrackEvent(AnalyticsInfo analyticsInfo, string? error, bool success)
        {
            await Task.Run(() =>
            {
                var properties = new Dictionary<string, string>
                {
                    { "url", analyticsInfo.Url?.ToString() ?? string.Empty },
                    { "platformId", analyticsInfo.PlatformId ?? string.Empty },
                    { "platformIdVersion", analyticsInfo.PlatformIdVersion ?? string.Empty },
                };

                if (success)
                {
                    var analyticsInfoProperties =
                        analyticsInfo.Properties ?? new Dictionary<string, string>();
                    analyticsInfoProperties
                        .ToList()
                        .ForEach(prop => properties.Add(prop.Key, prop.Value));
                    telemetryClient.TrackEvent("ReportCardEvent", properties);
                }
                else
                {
                    properties.Add("error", error ?? string.Empty);
                    telemetryClient.TrackEvent("ReportCardFailureEvent", properties);
                }
            });
        }

        public async Task TrackAnalysis(Analysis analysis, AnalyticsInfo analyticsInfo)
        {
            var appInsightProps =
                analyticsInfo.Properties ?? new Dictionary<string, string>();
            appInsightProps.Add("analysisUrl", analysis.Url.ToString());
            appInsightProps.Add("analysisDuration", analysis.Duration?.ToString() ?? string.Empty);
            appInsightProps.Add("analysisCanPackage", analysis.CanPackage.ToString());
            appInsightProps.Add("analysisManifestUrl", analysis.WebManifest?.Url.ToString() ?? string.Empty);
            appInsightProps.Add("analysisServiceWorkerUrl", analysis.ServiceWorker?.Url.ToString() ?? string.Empty);
            analysis.Capabilities.ForEach(p => appInsightProps.Add("analysis-capability-" + p.Id.ToString(), p.Status.ToString()));
            analyticsInfo.Properties = appInsightProps;

            await TrackEvent(analyticsInfo, null, true);
        }

        public async Task Record(
            string url,
            bool success,
            IOSAppPackageOptions.Validated? packageOptions,
            AnalyticsInfo? analyticsInfo,
            string? error
        )
        {
            await Task.Run(() =>
            {
                telemetryClient.Context.Operation.Id =
                    analyticsInfo?.CorrelationId != null
                        ? analyticsInfo.CorrelationId
                        : Guid.NewGuid().ToString();

                Dictionary<string, string> record;
                var name = "";

                if (success && packageOptions != null)
                {
                    record = new()
                    {
                        { "URL", url.ToString() },
                        { "IOSBundleID", packageOptions.BundleId ?? "" },
                        { "IOSAppName", packageOptions.Name ?? "" },
                    };
                    name = "IOSPackageEvent";
                }
                else
                {
                    record = new()
                    {
                        { "URL", url.ToString() },
                        { "IOSPackageError", error ?? "" },
                    };
                    name = "IOSPackageFailureEvent";
                }
                if (analyticsInfo?.PlatformId != null)
                {
                    record.Add("PlatformId", analyticsInfo.PlatformId);
                    if (analyticsInfo?.PlatformIdVersion != null)
                    {
                        record.Add("PlatformVersion", analyticsInfo.PlatformIdVersion);
                    }
                }
                if (analyticsInfo?.Referrer != null)
                {
                    record.Add("referrer", analyticsInfo.Referrer);
                }
                telemetryClient.TrackEvent(name, record);
            });
        }
    }
}
