using System.Text.RegularExpressions;
using PWABuilder.Common;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    public class ServiceWorkerAnalyzer : IServiceWorkerAnalyzer
    {
        private readonly WebStringCache webCache;
        private readonly Regex[] PushNotificationRegexes =
        [
            new Regex(@"[.|\n\s*]addEventListener\s*\(\s*['""]push['""]", RegexOptions.Multiline),
            new Regex(@"[.|\n\s*]onpush\s*=", RegexOptions.Multiline),
        ];
        private readonly Regex[] PeriodicSyncRegexes =
        [
            new Regex(
                @"[.|\n\s*]addEventListener\s*\(\s*['""]periodicsync['""]",
                RegexOptions.Multiline
            ),
            new Regex(@"[.|\n\s*]onperiodicsync\s*=", RegexOptions.Multiline),
        ];
        private readonly Regex[] BackgroundSyncRegexes =
        [
            new Regex(@"[.|\n\s*]addEventListener\s*\(\s*['""]sync['""]", RegexOptions.Multiline),
            new Regex(@"[.|\n\s*]onsync\s*=", RegexOptions.Multiline),
            new Regex(@"BackgroundSyncPlugin", RegexOptions.Multiline),
        ];
        private readonly Regex[] ServiceWorkerLogicRegexes =
        [
            new Regex(@"importScripts|self\.|^self", RegexOptions.Multiline),
            new Regex(@"[.|\n\s*]addAll", RegexOptions.Multiline),
            new Regex(
                @"[.|\n\s*]addEventListener\s*\(\s*['""]install['""]",
                RegexOptions.Multiline
            ),
            new Regex(@"[.|\n\s*]addEventListener\s*\(\s*['""]fetch['""]", RegexOptions.Multiline),
        ];
        private readonly Regex[] EmptyRegexes =
        [
            new Regex(
                @"\.addEventListener\(['""]fetch['""],\(?(function)?\(?\w*\)?(=>)?{?(return(?!\w)|\w+\.respondWith\(fetch\(\w+\.request\)(?!\.catch)|})",
                RegexOptions.Multiline
            ),
        ];

        public ServiceWorkerAnalyzer(WebStringCache webCache)
        {
            this.webCache = webCache;
        }

        /// <inheritdoc />
        public async Task<List<PwaCapability>> TryAnalyzeServiceWorkerAsync(ServiceWorkerDetection? swDetection, Uri appUrl, ILogger logger, CancellationToken cancelToken)
        {
            var swCaps = PwaCapability.CreateServiceWorkerCapabilities();
            if (swDetection == null)
            {
                HandleNoServiceWorker(swCaps, logger);
                return swCaps;
            }

            var serviceWorkerJs = swDetection.Raw;
            try
            {
                var scriptsContent = await TryFindAndFetchImportScriptsAsync(swDetection.Raw, appUrl, logger, cancelToken);
                foreach (var scriptContent in scriptsContent)
                {
                    serviceWorkerJs += scriptContent;
                }
            }
            catch (Exception importScriptError)
            {
                logger.LogWarning(importScriptError, "Unable to load service worker import script due to an error.");
            }

            var compactContent = Regex.Replace(serviceWorkerJs, @"\n+|\s+|\r", "");
            foreach (var swCapability in swCaps)
            {
                swCapability.Status = RunCapabilityCheck(swCapability, swDetection, compactContent);
            }

            return swCaps;
        }

        private PwaCapabilityCheckStatus RunCapabilityCheck(PwaCapability swCapability, ServiceWorkerDetection swDetection, string swScripts)
        {
            return swCapability.Id switch
            {
                PwaCapabilityId.HasServiceWorker => swDetection != null ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed,
                PwaCapabilityId.OfflineSupport => PwaCapabilityCheckStatus.Failed, // TODO: implement offline check. We used to test this using Lighthouse, but they removed offline audit check as of Lighthouse v12.
                PwaCapabilityId.ServiceWorkerIsNotEmpty => CheckServiceWorkerNotEmpty(swScripts),
                PwaCapabilityId.BackgroundSync => CheckBackgroundSync(swScripts),
                PwaCapabilityId.PeriodicSync => CheckPeriodicSync(swScripts),
                PwaCapabilityId.PushNotifications => CheckPushNotifications(swScripts),
                _ => throw new NotSupportedException("Unknown service worker capability check: " + swCapability.Id)
            };
        }

        private PwaCapabilityCheckStatus CheckServiceWorkerNotEmpty(string swScripts)
        {
            var swSizeInKb = System.Text.Encoding.UTF8.GetByteCount(swScripts) / 1024.0;
            var isEmpty = swSizeInKb < 0.2 ||
                Array.Exists(EmptyRegexes, reg => reg.IsMatch(swScripts)) ||
                !Array.Exists(ServiceWorkerLogicRegexes, reg => reg.IsMatch(swScripts));
            return isEmpty ? PwaCapabilityCheckStatus.Failed : PwaCapabilityCheckStatus.Passed;
        }

        private PwaCapabilityCheckStatus CheckBackgroundSync(string swScripts)
        {
            return BackgroundSyncRegexes.Any(r => r.IsMatch(swScripts)) ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
        }

        private PwaCapabilityCheckStatus CheckPeriodicSync(string swScripts)
        {
            return PeriodicSyncRegexes.Any(r => r.IsMatch(swScripts)) ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
        }

        private PwaCapabilityCheckStatus CheckPushNotifications(string swScripts)
        {
            return PushNotificationRegexes.Any(r => r.IsMatch(swScripts)) ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
        }

        private static void HandleNoServiceWorker(List<PwaCapability> serviceWorkerCaps, ILogger logger)
        {
            // Mark the "has service worker" capability as failed.
            // And mark the rest of the service worker capabilities as skipped.
            foreach (var cap in serviceWorkerCaps)
            {
                if (cap.Id == PwaCapabilityId.HasServiceWorker)
                {
                    cap.Status = PwaCapabilityCheckStatus.Failed;
                }
                else
                {
                    cap.Status = PwaCapabilityCheckStatus.Skipped;
                }
            }

            logger.LogInformation("Couldn't find service worker for analysis. Skipping remaining service worker capability checks.");
        }

        private async Task<List<string>> TryFindAndFetchImportScriptsAsync(string code, Uri appUrl, ILogger logger, CancellationToken cancelToken)
        {
            // Find all importScripts statements
            var importScripts = Regex.Matches(code, @"importScripts\s*\((.+?)\)");
            if (importScripts.Count == 0)
            {
                return [];
            }

            var urls = new List<string>();
            foreach (Match statement in importScripts)
            {
                var matches = Regex.Match(statement.Value, @"\(\s*[""'](.+?)[""']\s*\)");
                if (matches.Success && matches.Groups.Count > 1)
                {
                    urls.Add(matches.Groups[1].Value);
                }
            }

            // Normalize URLs
            var normalizedUrls = new List<Uri>();
            foreach (var url in urls)
            {
                normalizedUrls.Add(new Uri(appUrl, url));
            }

            // Fetch the content of each script
            var contents = new List<string>();
            var scriptFetches = normalizedUrls
                .Select(url => webCache.Get(url, Constants.JavascriptMimeTypes, cancelToken));
            try
            {
                var scriptResults = await Task.WhenAll(scriptFetches);
                contents.AddRange(scriptResults.Select(s => s ?? string.Empty).Where(s => s.Length > 0));
            }
            catch (Exception ex)
            {
                // Log the error and continue with the next script
                logger.LogWarning(ex, "Service worker analyzer failed to fetch one or more service worker import scripts due to an error.");
            }

            return contents;
        }
    }
}
