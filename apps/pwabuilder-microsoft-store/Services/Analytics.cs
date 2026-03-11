using Microsoft.ApplicationInsights;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Communicates with PWABuilder's CosmosDB to save Microsoft Store app packages. We use this info to link them up to published PWAs in the Store.
    /// </summary>
    public class Analytics
    {
        private readonly IOptions<AppSettings> settings;
        private readonly ILogger<Analytics> logger;
        private readonly TelemetryClient telemetryClient;
        private readonly CosmosDbService cosmosDbService;
        private readonly bool isAppInsightsEnabled;

        public Analytics(
            IOptions<AppSettings> settings,
            ILogger<Analytics> logger,
            TelemetryClient telemetryClient,
            CosmosDbService cosmosDbService)
        {
            this.settings = settings;
            this.logger = logger;
            this.telemetryClient = telemetryClient;
            this.cosmosDbService = cosmosDbService;
            this.isAppInsightsEnabled = !string.IsNullOrEmpty(this.settings.Value.ApplicationInsightsConnectionString);
        }

        /// <summary>
        /// Records a package generation failure in PWABuilder's backend analytics database.
        /// </summary>
        /// <param name="error">The error that occurred during package generation.</param>
        /// <param name="packageOptions">The options used to generate the package.</param>
        /// <param name="packageType">The type of package generated.</param>
        /// <param name="analyticsInfo">The analytics info associated with this package generation request.</param>
        public async Task RecordStorePackageFailure(Exception error, WindowsAppPackageOptions packageOptions, WindowsPackageType packageType, AnalyticsInfo analyticsInfo)
        {
            var package = new PwaBuilderMsStorePackage
            {
                Id = analyticsInfo.correlationId ?? Guid.NewGuid().ToString(),
                Url = packageOptions.Url,
                ManifestUrl = packageOptions.ManifestUrl,
                Manifest = packageOptions.Manifest?.RootElement.GetRawText(),
                IsDevPackage = packageType == WindowsPackageType.DeveloperPackage,
                CorrelationId = analyticsInfo.correlationId,
                PlatformId = analyticsInfo.platformId,
                PlatformIdVersion = analyticsInfo.platformIdVersion,
                ErrorMessage = error.Message,
                ErrorStack = error.StackTrace,
                PackageId = packageOptions.PackageId,
                PublisherDisplayName = packageOptions.Publisher?.DisplayName,
                PublisherId = packageOptions.Publisher?.CommonName
            };
            await TryRecordStorePackageCore(package, analyticsInfo);
        }

        /// <summary>
        /// Records a successful package generation in PWABuilder's backend analytics database.
        /// </summary>
        /// <param name="packageOptions">The options used to generate the package.</param>
        /// <param name="packageType">The type of package generated.</param>
        /// <param name="analyticsInfo">The analytics info associated with this package generation request.</param>
        public async Task RecordStorePackageSuccess(WindowsAppPackageOptions packageOptions, WindowsPackageType? packageType, AnalyticsInfo analyticsInfo)
        {
            var package = new PwaBuilderMsStorePackage
            {
                Id = analyticsInfo.correlationId ?? Guid.NewGuid().ToString(),
                Url = packageOptions.Url,
                ManifestUrl = packageOptions.ManifestUrl,
                Manifest = packageOptions.Manifest?.RootElement.GetRawText(),
                IsDevPackage = packageType == WindowsPackageType.DeveloperPackage,
                CorrelationId = analyticsInfo.correlationId,
                PlatformId = analyticsInfo.platformId,
                PlatformIdVersion = analyticsInfo.platformIdVersion,
                ErrorMessage = null,
                ErrorStack = null,
                PackageId = packageOptions.PackageId,
                PublisherDisplayName = packageOptions.Publisher?.DisplayName,
                PublisherId = packageOptions.Publisher?.CommonName
            };
            await TryRecordStorePackageCore(package, analyticsInfo);
        }

        private async Task TryRecordStorePackageCore(PwaBuilderMsStorePackage package, AnalyticsInfo analyticsInfo)
        {
            try
            {
                SendAppInsightsEvent(package, analyticsInfo);

                // Save to CosmosDB using the package's correlation ID as the partition key
                var success = await this.cosmosDbService.SaveItemAsync(package, package.Id);

                if (success)
                {
                    this.logger.LogInformation("Successfully saved package analytics to CosmosDB for {url}", package.Url);
                }
            }
            catch (Exception error)
            {
                logger.LogError(error, "Unable to record Microsoft Store package analytics for {url} due to an error", package.Url);
            }
        }

        private void SendAppInsightsEvent(PwaBuilderMsStorePackage package, AnalyticsInfo analyticsInfo)
        {
            if (!this.isAppInsightsEnabled)
            {
                this.logger.LogWarning("Skipping analytics event recording in App insights due to no connection string. For development, this should be expected.");
                return;
            }
            this.telemetryClient.Context.Operation.Id = analyticsInfo?.correlationId != null ? analyticsInfo.correlationId : System.Guid.NewGuid().ToString();

            Dictionary<string, string> record;
            string name;
            if (string.IsNullOrEmpty(package.ErrorMessage))
            {
                if (!package.IsDevPackage)
                {
                    record = new()
                    {
                        { "URL", package.Url?.ToString() ?? string.Empty },
                        { "WindowsPackageID", package.PackageId ?? "" },
                        { "WindowsStorePackage", "true" },
                        { "WindowsPublisherDisplayName", package.PublisherDisplayName ?? "" },
                        { "WindowsPublisherID", package.PublisherId ?? "" }
                    };
                    name = "WindowsPackageEvent";
                }
                else
                {
                    record = new()
                    {
                        { "URL", package.Url?.ToString() ?? string.Empty },
                        { "WindowsStorePackage", "false" }
                    };
                    name = "WindowsTestPackageEvent";
                }
            }
            else
            {
                record = new()
                {
                    { "URL", package.Url?.ToString() ?? string.Empty },
                    { "WindowsPackageError", package.ErrorMessage },
                    { "WindowsStorePackage", package.IsDevPackage ? "false" : "true" }
                };
                name = "WindowsPackageFailureEvent";
            }
            if (analyticsInfo?.platformId != null)
            {
                record.Add("PlatformId", analyticsInfo.platformId);
                if (analyticsInfo?.platformIdVersion != null)
                {
                    record.Add("PlatformVersion", analyticsInfo.platformIdVersion);
                }
            }
            if (analyticsInfo?.referrer != null)
            {
                record.Add("referrer", analyticsInfo.referrer);
            }
            telemetryClient.TrackEvent(name, record);
        }
    }
}