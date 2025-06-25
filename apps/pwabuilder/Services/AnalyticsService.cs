using System.Text.Json;
using Microsoft.ApplicationInsights;
using Microsoft.Extensions.Options;
using PWABuilder.Models;
using PWABuilder.Validations;

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
                    _telemetryClient.TrackEvent("ReportCardEvent", properties);
                }
                else
                {
                    properties.Add("error", error ?? string.Empty);
                    _telemetryClient.TrackEvent("ReportCardFailureEvent", properties);
                }
            });
        }

        public async Task UploadToAppInsights(Report webAppReport, AnalyticsInfo analyticsInfo)
        {
            var manifestJson = webAppReport.artifacts?.webAppManifest?.json;

            var enrichAnalyticsInfoProperties =
                analyticsInfo.Properties ?? new Dictionary<string, string>();

            if (manifestJson == null || manifestJson is not JsonElement manifestJsonElement)
            {
                enrichAnalyticsInfoProperties.Add("hasManifest", "False");
            }
            else
            {
                if (
                    ManifestValidations.ValidateSingleField("name", manifestJsonElement) is
                    { Exists: true } name
                )
                {
                    enrichAnalyticsInfoProperties.Add("name", name.Valid.ToString());
                }

                if (
                    ManifestValidations.ValidateSingleField(
                        "background_color",
                        manifestJsonElement
                    ) is
                    { Exists: true } backGroundColor
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasBackgroundColor",
                        backGroundColor.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField("categories", manifestJsonElement) is
                    { Exists: true } categories
                )
                {
                    enrichAnalyticsInfoProperties.Add("hasCategories", categories.Valid.ToString());
                }

                if (
                    ManifestValidations.ValidateSingleField("description", manifestJsonElement) is
                    { Exists: true } description
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasDescription",
                        description.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField("file_handlers", manifestJsonElement) is
                    { Exists: true } fileHandler
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasFileHandlers",
                        fileHandler.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField(
                        "launch_handler",
                        manifestJsonElement
                    ) is
                    { Exists: true } launchHandler
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasLaunchHandlers",
                        launchHandler.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField(
                        "prefer_related_applications",
                        manifestJsonElement
                    ) is
                    { Exists: true } preferRelatedApps
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasPreferRelatedApps",
                        preferRelatedApps.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField(
                        "related_applications",
                        manifestJsonElement
                    ) is
                    { Exists: true } relatedApps
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasRelatedApps",
                        relatedApps.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField(
                        "protocol_handlers",
                        manifestJsonElement
                    ) is
                    { Exists: true } protocolHandler
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasProtocolHandlers",
                        protocolHandler.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField("screenshots", manifestJsonElement) is
                    { Exists: true } screenshots
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasScreenshots",
                        screenshots.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField("share_target", manifestJsonElement) is
                    { Exists: true } shareTarget
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasShareTarget",
                        shareTarget.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField("shortcuts", manifestJsonElement) is
                    { Exists: true } shortcuts
                )
                {
                    enrichAnalyticsInfoProperties.Add("hasShortcuts", shortcuts.Valid.ToString());
                }

                if (
                    ManifestValidations.ValidateSingleField("theme_color", manifestJsonElement) is
                    { Exists: true } themeColor
                )
                {
                    enrichAnalyticsInfoProperties.Add("hasThemeColor", themeColor.Valid.ToString());
                }

                if (
                    ManifestValidations.ValidateSingleField(
                        "iarc_rating_id",
                        manifestJsonElement
                    ) is
                    { Exists: true } iarcRatingId
                )
                {
                    enrichAnalyticsInfoProperties.Add("hasRating", iarcRatingId.Valid.ToString());
                }

                if (
                    ManifestValidations.ValidateSingleField("widgets", manifestJsonElement) is
                    { Exists: true } widgets
                )
                {
                    enrichAnalyticsInfoProperties.Add("hasWidgets", widgets.Valid.ToString());
                }

                if (
                    ManifestValidations.ValidateSingleField("icons", manifestJsonElement) is
                    { Exists: true } icons
                )
                {
                    enrichAnalyticsInfoProperties.Add("hasIcons", icons.Valid.ToString());
                }

                if (
                    ManifestValidations.ValidateSingleField(
                        "edge_side_panel",
                        manifestJsonElement
                    ) is
                    { Exists: true } edgeSidePanel
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasEdgeSidePanel",
                        edgeSidePanel.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField(
                        "display_override",
                        manifestJsonElement
                    ) is
                    { Exists: true } displayOverride
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasDisplayOverride",
                        displayOverride.Valid.ToString()
                    );
                }

                if (
                    ManifestValidations.ValidateSingleField("handle_links", manifestJsonElement) is
                    { Exists: true } handleLinks
                )
                {
                    enrichAnalyticsInfoProperties.Add(
                        "hasHandleLinks",
                        handleLinks.Valid.ToString()
                    );
                }
            }

            var serviceWorker = webAppReport?.audits?.serviceWorker?.details?.features;
            if (
                serviceWorker != null
                && serviceWorker is AnalyzeServiceWorkerResponse serviceWorkerFeatures
            )
            {
                enrichAnalyticsInfoProperties.Add(
                    "hasBackgroundSync",
                    (serviceWorkerFeatures.DetectedBackgroundSync ?? false).ToString()
                );
                enrichAnalyticsInfoProperties.Add(
                    "hasPeriodicBackgroundSync",
                    (serviceWorkerFeatures.DetectedPeriodicBackgroundSync ?? false).ToString()
                );
                enrichAnalyticsInfoProperties.Add(
                    "hasSignsOfLogic",
                    (serviceWorkerFeatures.DetectedSignsOfLogic ?? false).ToString()
                );
                enrichAnalyticsInfoProperties.Add(
                    "hasEmptyLogic",
                    (serviceWorkerFeatures.DetectedEmpty ?? false).ToString()
                );
                enrichAnalyticsInfoProperties.Add(
                    "hasPushRegistration",
                    (serviceWorkerFeatures.DetectedPushRegistration ?? false).ToString()
                );
            }

            var offlineSupport = webAppReport?.audits?.offlineSupport;
            if (offlineSupport != null)
            {
                enrichAnalyticsInfoProperties.Add(
                    "hasOfflineSupport",
                    offlineSupport.score.ToString()
                );
            }

            analyticsInfo.Properties = enrichAnalyticsInfoProperties;

            await TrackEvent(analyticsInfo, null, true);
        }
    }
}
