using Microsoft.ApplicationInsights;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Communicates with PWABuilder's backend analytics. Records when a user packages for Windows platform.
    /// </summary>
    public class Analytics
    {
        private readonly IOptions<AppSettings> settings;
        private readonly ILogger<Analytics> logger;
        private readonly HttpClient http;
        private readonly TelemetryClient telemetryClient;
        private readonly bool isAppInsightsEnabled;

        public Analytics(
            IOptions<AppSettings> settings,
            IHttpClientFactory httpClientFactory,
            ILogger<Analytics> logger,
            TelemetryClient telemetryClient)
        {
            this.settings = settings;
            this.http = httpClientFactory.CreateClient();
            this.logger = logger;
            this.telemetryClient = telemetryClient;
            this.isAppInsightsEnabled = !string.IsNullOrEmpty(this.settings.Value.ApplicationInsightsConnectionString);
        }

        /// <summary>
        /// Records a package generation failure in PWABuilder's backend analytics database.
        /// </summary>
        /// <param name="url"></param>
        /// <param name="error"></param>
        /// <param name="packageType"></param>
        public void RecordFailure(string url, string error, WindowsPackageType? packageType, string? platformId = null, string? platformIdVersion = null, string? correlationId = null)
        {
             var analysis = new PartialAnalysis(url, false, error, packageType, null, platformId, platformIdVersion, correlationId);
            RecordCore(analysis);
        }

        /// <summary>
        /// Records a successful package generation in PWABuilder's backend analytics database.
        /// </summary>
        /// <param name="url"></param>
        /// <param name="packageType"></param>
        /// <param name="packageId"></param>
        /// <param name="publisherId"></param>
        /// <param name="publisherDisplayName"></param>
        public void RecordSuccess(string url, WindowsPackageType? packageType, string? packageId, string? publisherId, string? publisherDisplayName, string? platformId = null, string? platformIdVersion = null, string? correlationId = null)
        {
            if (packageType == WindowsPackageType.StorePackage)
            {
                var analysis = new PartialAnalysis(url, true, null, packageType, new PartialMicrosoftStoreDetails(packageId, publisherDisplayName, publisherId), platformId, platformIdVersion, correlationId);
                RecordCore(analysis);
            }
            else
            {
                var analysis = new PartialAnalysis(url, true, null, packageType, null, platformId, platformIdVersion, correlationId);
                RecordCore(analysis);
            }
        }

        /// <summary>
        /// Records a Windows app package creation with the backend analytics service.
        /// </summary>
        /// <param name="uri">The URI of the app that was generated.</param>
        /// <param name="success">Whether the generation was successful.</param>
        /// <param name="error">The message of the error that occurred during Oculus app package generation.</param>
        public void Record(string url, bool success, WindowsPackageType? packageType, AnalyticsInfo? analyticsInfo,  string? packageId, string? publisherId, string? publisherDisplayName, string? error)
        {
            //TODO: Code to remove in the future starts here
            if (!string.IsNullOrEmpty(this.settings.Value.UrlLoggerService))
            {
                LogToRavenDB(url, success, packageType, packageId, publisherId, publisherDisplayName, error, analyticsInfo?.platformId, analyticsInfo?.platformIdVersion, analyticsInfo?.correlationId);
            }
            else
            {
                this.logger.LogWarning("Skipping analytics event recording in RavenDB due to no analytics URL in app settings. For development, this should be expected.");
            }
            //Code to remove ends here

            if (!this.isAppInsightsEnabled)
            {
                this.logger.LogWarning("Skipping analytics event recording in App insights due to no connection string. For development, this should be expected.");
                return;
            }
            this.telemetryClient.Context.Operation.Id = analyticsInfo?.correlationId != null ? analyticsInfo.correlationId : System.Guid.NewGuid().ToString();

            Dictionary<string, string> record;
            var name = "";
            if (success && packageType == WindowsPackageType.StorePackage)
            {
                record = new() { { "URL", url.ToString() }, { "WindowsPackageID", packageId ?? "" }, { "WindowsStorePackage", "true" }, { "WindowsPublisherDisplayName", publisherDisplayName ?? "" }, { "WindowsPublisherID", publisherId ?? ""} };
                name = "WindowsPackageEvent";
            }
            else if(success && packageType != WindowsPackageType.StorePackage)
            {
                record = new() { { "URL", url.ToString() }, { "WindowsStorePackage", "false" }};
                name = "WindowsTestPackageEvent";
            }
            else
            {
                record = new() { { "URL", url.ToString() }, { "WindowsPackageError", error ?? ""}, { "WindowsStorePackage", packageType == WindowsPackageType.StorePackage ? "true" : "false" } };
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

        private void LogToRavenDB(string url, bool success, WindowsPackageType? packageType, string? packageId, string? publisherId, string? publisherDisplayName, string? error, string? platformId = null, string? platformIdVersion = null, string? correlationId = null)
        {
            if(!success || !string.IsNullOrEmpty(error))
            {
                this.RecordFailure(url, error, packageType, platformId, platformIdVersion, correlationId);
            }
            else
            {
                this.RecordSuccess(url, packageType, packageId, publisherId, publisherDisplayName, platformId, platformIdVersion, correlationId);
            }
        }

        private void RecordCore(PartialAnalysis analysis)
        {
            var args = System.Text.Json.JsonSerializer.Serialize(analysis);
            this.http.PostAsync(this.settings.Value.UrlLoggerService, new StringContent(args))
                .ContinueWith(httpResponseMessage =>
                {
                    if (httpResponseMessage.IsCompleted && !httpResponseMessage.Result.IsSuccessStatusCode)
                    {
                        logger.LogError("Error when sending URL to logging service. Status code was {code}, {reason}", httpResponseMessage.Result.StatusCode, httpResponseMessage.Result.ReasonPhrase);
                    }
                    else
                    {
                        logger.LogInformation("Successfully sent {url} to URL logging service. Success = {success}, Error = {error}", analysis.Url, string.IsNullOrEmpty(analysis.WindowsPackageError), analysis.WindowsPackageError);
                    }
                }, TaskContinuationOptions.OnlyOnRanToCompletion)
                .ContinueWith(task => logger.LogError(task.Exception ?? new Exception("Unable to send URL to logging service"), "Unable to send {url} to logging service due to an error", analysis.Url), TaskContinuationOptions.OnlyOnFaulted);
        }

        // partial Analysis object containing only Windows platform props.
        // Should correspond roughly to https://github.com/pwa-builder/pwabuilder-analytics/blob/main/PWABuilder.UrlLogger.Common/Analysis.cs
        public record PartialAnalysis(
            string Url, 
            bool? WindowsPackage, 
            string? WindowsPackageError, 
            WindowsPackageType? WindowsPackageType, 
            PartialMicrosoftStoreDetails? MicrosoftStoreDetails,
            //Platform ID of the source of the request 
            string? platformId,
            //Platform version
            string? platformIdVersion,
            //Session ID of the request
            string? correlationId);

        // Details about the Microsoft Store package.
        // Corresponds to https://github.com/pwa-builder/pwabuilder-analytics/blob/main/PWABuilder.UrlLogger.Common/MicrosoftStoreProductDetails.cs
        public record PartialMicrosoftStoreDetails(string? PackageId, string? PublisherDisplayName, string? PublisherId);
    }
}
