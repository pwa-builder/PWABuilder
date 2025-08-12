using System.Text.Json;
using Microsoft.ApplicationInsights;
using Microsoft.Extensions.Options;
using PWABuilder.IOS.Models;
using PWABuilder.Models;
using PWABuilder.Validations;

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

        public async Task UploadToAppInsights(
            Report webAppReport,
            AnalyticsInfo analyticsInfo,
            ServiceWorkerFeatures? serviceWorkerFeatures
        )
        {
            var manifestJson = webAppReport.artifacts?.webAppManifestDetails?.json;

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

            if (serviceWorkerFeatures != null)
            {
                enrichAnalyticsInfoProperties.Add(
                    "hasBackgroundSync",
                    (serviceWorkerFeatures.BackgroundSync ?? false).ToString()
                );
                enrichAnalyticsInfoProperties.Add(
                    "hasPeriodicBackgroundSync",
                    (serviceWorkerFeatures.PeriodicBackgroundSync ?? false).ToString()
                );
                enrichAnalyticsInfoProperties.Add(
                    "hasSignsOfLogic",
                    (serviceWorkerFeatures.SignsOfLogic ?? false).ToString()
                );
                enrichAnalyticsInfoProperties.Add(
                    "hasEmptyLogic",
                    (serviceWorkerFeatures.Empty ?? false).ToString()
                );
                enrichAnalyticsInfoProperties.Add(
                    "hasPushRegistration",
                    (serviceWorkerFeatures.PushRegistration ?? false).ToString()
                );
            }
            var serviceWorkerValidation = webAppReport?.serviceWorkerValidations;

            var offlineSupport =
                serviceWorkerValidation != null && serviceWorkerValidation.Any()
                    ? serviceWorkerValidation.ToList().Find(x => x.Member == "offline_support")
                    : null;
            if (offlineSupport != null)
            {
                enrichAnalyticsInfoProperties.Add(
                    "hasOfflineSupport",
                    offlineSupport.Result.ToString()
                );
            }

            analyticsInfo.Properties = enrichAnalyticsInfoProperties;

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
