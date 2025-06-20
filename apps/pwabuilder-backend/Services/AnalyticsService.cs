using Microsoft.ApplicationInsights;
using Microsoft.Extensions.Options;
using PWABuilder.Models;
using PWABuilder.Utils;

namespace PWABuilder.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IOptions<AppSettings> settings;
        private readonly ILogger<AnalyticsService> logger;
        private readonly TelemetryClient _telemetryClient;
        private readonly bool isAppInsightsEnabled;

        public AnalyticsService(
            IOptions<AppSettings> settings,
            ILogger<AnalyticsService> logger,
            TelemetryClient telemetryClient
        )
        {
            this.settings = settings;
            this.logger = logger;
            _telemetryClient = telemetryClient;
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
                    { "url", analyticsInfo.Url?.ToString() ?? String.Empty },
                    { "platformId", analyticsInfo.PlatformId ?? String.Empty },
                    { "platformIdVersion", analyticsInfo.PlatformIdVersion ?? String.Empty },
                };

                if (success)
                {
                    var analyticsInfoProperties =
                        analyticsInfo.Properties ?? new Dictionary<string, string>();
                    analyticsInfoProperties
                        .ToList()
                        .ForEach(prop => properties.Add(prop.Key, prop.Value));
                    _telemetryClient.TrackEvent(
                        "ReportCardEvent",
                        properties
                    );
                }
                else
                {
                    properties.Add("error", error ?? string.Empty);
                    _telemetryClient.TrackEvent("ReportCardFailureEvent", properties);
                }
            });
        }

        public async Task UploadToAppInsights(
            Report webAppReport,
            AnalyticsInfo analyticsInfo
        )
        {
            var manifestJson = webAppReport.artifacts?.webAppManifest?.json;

            var enrichAnalyticsInfoProperties = analyticsInfo.Properties ?? new Dictionary<string, string>();

            if (manifestJson == null)
            {
                enrichAnalyticsInfoProperties.Add("hasManifest", "False");
            }
            else
            {
                //Validate string
                enrichAnalyticsInfoProperties.Add("name", ValidationsHelper.ValidateSingleFieldString("name", manifestJson).ToString());
            
                //Validate string with hex pattern
                enrichAnalyticsInfoProperties.Add("hasBackgroundColor", ValidationsHelper.ValidateSingleFieldString("background_color", manifestJson).ToString());
            
                //Validate array
                enrichAnalyticsInfoProperties.Add("hasCategories", ValidationsHelper.ValidateSingleField("categories", manifestJson).ToString());
            
                //Validate string
                enrichAnalyticsInfoProperties.Add("hasDescription", ValidationsHelper.ValidateSingleFieldString("description", manifestJson).ToString());
            
                //Validate array object with specific structure
                enrichAnalyticsInfoProperties.Add("hasFileHandlers", ValidationsHelper.ValidateSingleField("file_handlers", manifestJson).ToString());

                //Validate object with property client_mode string or array
                enrichAnalyticsInfoProperties.Add("hasLaunchHandlers", ValidationsHelper.ValidateSingleField("client_mode", manifestJson?.GetType()?.GetProperty("launch_handler")?.GetValue(manifestJson,null)).ToString());
            
                //Validate boolean
                enrichAnalyticsInfoProperties.Add("hasPreferRelatedApps", ValidationsHelper.ValidateSingleFieldBoolean("prefer_related_applications", manifestJson).ToString());
            
                //Validate array url
                enrichAnalyticsInfoProperties.Add("hasRelatedApps", ValidationsHelper.ValidateSingleField("related_applications", manifestJson).ToString());

                //Validate array object with specific structrure
                enrichAnalyticsInfoProperties.Add("hasProtocolHandlers", ValidationsHelper.ValidateSingleField("prefer_related_applications", manifestJson).ToString());
            
                //Validate array object with wih specific structure
                enrichAnalyticsInfoProperties.Add("hasScreenshots", ValidationsHelper.ValidateSingleField("screenshots", manifestJson).ToString());
            
                //Validate object
                enrichAnalyticsInfoProperties.Add("hasShareTarget", ValidationsHelper.ValidateSingleField("share_target", manifestJson).ToString());
            
                //Validate array object 
                enrichAnalyticsInfoProperties.Add("hasShortcuts", ValidationsHelper.ValidateSingleField("shortcuts", manifestJson).ToString());
            
                //Validate string with hex pattern
                enrichAnalyticsInfoProperties.Add("hasThemeColor", ValidationsHelper.ValidateSingleField("theme_color", manifestJson).ToString());
            
                //validate string
                enrichAnalyticsInfoProperties.Add("hasRating", ValidationsHelper.ValidateSingleField("iarc_rating_id", manifestJson).ToString());
            
                //validate array object with specific structure
                enrichAnalyticsInfoProperties.Add("hasWidgets", ValidationsHelper.ValidateSingleField("widgets", manifestJson).ToString());
            
                //Validate array object with specific structure
                enrichAnalyticsInfoProperties.Add("hasIcons", ValidationsHelper.ValidateSingleField("icons", manifestJson).ToString());
            
                //Validate object
                enrichAnalyticsInfoProperties.Add("hasEdgeSidePanel", ValidationsHelper.ValidateSingleField("edge_side_panel", manifestJson).ToString());
            
                //Validate array string
                enrichAnalyticsInfoProperties.Add("hasDisplayOverride", ValidationsHelper.ValidateSingleField("display_override", manifestJson).ToString());
            
                //Validate string with options
                enrichAnalyticsInfoProperties.Add("hasHandleLinks", ValidationsHelper.ValidateSingleField("handle_links", manifestJson).ToString());
            }

            var serviceWorkerFeatures = webAppReport?.audits?.serviceWorker?.details?.features;
            if (serviceWorkerFeatures != null)
            {
                enrichAnalyticsInfoProperties.Add("hasBackgroundSync", ValidationsHelper.GetSingleFieldBoolean("detectedBackgroundSync", serviceWorkerFeatures).ToString());
                enrichAnalyticsInfoProperties.Add("hasPeriodicBackgroundSync", ValidationsHelper.GetSingleFieldBoolean("detectedPeriodicBackgroundSync", serviceWorkerFeatures).ToString());
                enrichAnalyticsInfoProperties.Add("hasSignsOfLogic", ValidationsHelper.GetSingleFieldBoolean("detectedSignsOfLogic", serviceWorkerFeatures).ToString());
                enrichAnalyticsInfoProperties.Add("hasEmptyLogic", ValidationsHelper.GetSingleFieldBoolean("detectedEmpty", serviceWorkerFeatures).ToString());
                enrichAnalyticsInfoProperties.Add("hasPushRegistration", ValidationsHelper.GetSingleFieldBoolean("detectedPushRegistration", serviceWorkerFeatures).ToString());
            }

            var offlineSupport = webAppReport?.audits?.offlineSupport;
            if (offlineSupport != null)
            {
                enrichAnalyticsInfoProperties.Add("hasOfflineSupport", ValidationsHelper.GetSingleFieldBoolean("score", offlineSupport).ToString());
            }

            analyticsInfo.Properties = enrichAnalyticsInfoProperties;

            await TrackEvent(analyticsInfo, null, true);
        }
    }
}
