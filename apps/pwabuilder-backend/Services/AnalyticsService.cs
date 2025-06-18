using Microsoft.ApplicationInsights;
using Microsoft.Extensions.Options;
using PWABuilder.Models;
using System.Text.Json;


namespace PWABuilder.Services
{
    public class AnalyticsService: IAnalyticsService
    {
        private readonly IOptions<AppSettings> settings;
        private readonly ILogger<AnalyticsService> logger;
        private readonly TelemetryClient _telemetryClient;
        private readonly bool isAppInsightsEnabled;

        public AnalyticsService(IOptions<AppSettings> settings,
            ILogger<AnalyticsService> logger,
            TelemetryClient telemetryClient)
        {
            this.settings = settings;
            this.logger = logger;
            this._telemetryClient = telemetryClient;
            this.isAppInsightsEnabled = !string.IsNullOrEmpty(this.settings.Value.ApplicationInsightsConnectionString);
        }

        public async Task TrackEvent(AnalyticsInfo analyticsInfo, string? error, bool success)
        {
            await Task.Run(() =>
            {
                var properties = new Dictionary<string, string> {
                    { "url", analyticsInfo.Url?.ToString() ?? String.Empty },
                    { "platformId", analyticsInfo.PlatformId ?? String.Empty },
                    { "platformIdVersion", analyticsInfo.PlatformIdVersion ?? String.Empty }
                };

                if (success)
                {
                    var analyticsInfoProperties = analyticsInfo.Properties ?? new Dictionary<string, string>();
                    analyticsInfoProperties.ToList().ForEach(prop => properties.Add(prop.Key, prop.Value));
                    _telemetryClient.TrackEvent("ReportCardEvent", (IDictionary<string, string>)properties);
                }
                else
                {
                    properties.Add("error", error);
                    _telemetryClient.TrackEvent("ReportCardFailureEvent", properties);
                }

            });
        }

        public async Task UploadToAppInsights(JsonDocument webAppReport, AnalyticsInfo analyticsInfo)
        {
            var enrichAnalyticsInfo = analyticsInfo;
            //Compare and validate here
            //...
            await TrackEvent(enrichAnalyticsInfo, null, true);
        }
    }
}
