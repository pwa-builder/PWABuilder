using System.Text.RegularExpressions;
using PuppeteerSharp;
using PWABuilder.Common;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    public class ServiceWorkerAnalyzer : IServiceWorkerAnalyzer
    {
        private const int ActivationWaitMilliseconds = 60000;
        private const int OfflineCheckAttempts = 2;
        private static readonly Regex WorkboxRoutingRegex = new(@"precacheAndRoute|registerRoute|NavigationRoute|createHandlerBoundToURL");
        private static readonly Regex FetchHandlerRegex = new(@"addEventListener\s*\(\s*['""]fetch['""]|\bonfetch\s*=");
        private static readonly Regex CacheStorageRegex = new(@"\bcaches\s*\.\s*(open|match)\s*\(");

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
        private readonly IPuppeteerService puppeteerService;

        /// <summary>
        /// Creates a new service worker analyzer.
        /// </summary>
        /// <param name="webCache"></param>
        /// <param name="puppeteer"></param>
        public ServiceWorkerAnalyzer(WebStringCache webCache, IPuppeteerService puppeteer)
        {
            this.webCache = webCache;
            this.puppeteerService = puppeteer;
        }

        /// <inheritdoc />
        public async Task<List<PwaCapability>> TryAnalyzeServiceWorkerAsync(ServiceWorkerDetection? swDetection, Uri appUrl, ILogger logger, CancellationToken cancelToken)
        {
            var swCaps = PwaCapability.CreateServiceWorkerCapabilities()
                .Where(c => c.Id != PwaCapabilityId.OfflineSupport) // OfflineSupport is checked separately in the TryRunOfflineCheck method.
                .ToList();
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

        /// <inheritdoc />
        public async Task<PwaCapability> TryRunOfflineCheck(ServiceWorkerDetection? swDetection, Uri appUrl, ILogger logger, CancellationToken cancelToken)
        {
            var offlineCapability = PwaCapability.CreateServiceWorkerCapabilities()
                .First(c => c.Id == PwaCapabilityId.OfflineSupport);
            if (swDetection is null)
            {
                offlineCapability.Status = PwaCapabilityCheckStatus.Skipped;
                return offlineCapability;
            }

            // The live check runs in a headless browser tab. That tab can crash for reasons unrelated to the app being tested
            // (memory pressure in the shared browser, a renderer hiccup during the offline reload), which showed up as
            // "Page failed to process Inspector.targetCrashed" and marked working PWAs as having no offline support.
            // So we retry once on a fresh tab, and if the browser still crashes we fall back to static analysis of the service worker.
            for (var attempt = 1; attempt <= OfflineCheckAttempts; attempt++)
            {
                try
                {
                    return await RunLiveOfflineCheck(swDetection, appUrl, offlineCapability, logger, cancelToken);
                }
                catch (Exception ex) when (IsBrowserCrash(ex) && attempt < OfflineCheckAttempts)
                {
                    logger.LogWarning(ex, "The browser tab crashed during offline detection for {url} (attempt {attempt} of {attempts}). Retrying on a fresh tab.", appUrl, attempt, OfflineCheckAttempts);
                }
                catch (Exception ex) when (IsBrowserCrash(ex))
                {
                    var hasOfflineLogic = HasOfflineCachingLogic(swDetection.Raw);
                    logger.LogWarning(ex, "The browser tab crashed during offline detection for {url} on every attempt. Falling back to static analysis, which found offline caching logic: {hasOfflineLogic}", appUrl, hasOfflineLogic);
                    offlineCapability.Status = hasOfflineLogic ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
                    if (!hasOfflineLogic)
                    {
                        offlineCapability.ErrorMessage = "The browser crashed during the live offline check, and no offline caching logic was found in the service worker.";
                    }

                    return offlineCapability;
                }
                catch (Exception ex)
                {
                    offlineCapability.ErrorMessage = $"Offline capability check failed due to an exception: {ex.Message}";
                    logger.LogWarning(ex, "Error checking offline capability for {url}", appUrl);
                    offlineCapability.Status = PwaCapabilityCheckStatus.Failed;
                    return offlineCapability;
                }
            }

            return offlineCapability;
        }

        /// <summary>
        /// Loads the page in the headless browser, waits for an active service worker, goes offline and reloads.
        /// Throws if the browser tab crashes; the caller decides whether to retry.
        /// </summary>
        /// <param name="swDetection">The detected service worker.</param>
        /// <param name="appUrl">The URL of the PWA.</param>
        /// <param name="offlineCapability">The capability to fill in.</param>
        /// <param name="logger">The logger.</param>
        /// <param name="cancelToken">The cancellation token.</param>
        /// <returns>The offline capability with its status set.</returns>
        private async Task<PwaCapability> RunLiveOfflineCheck(ServiceWorkerDetection swDetection, Uri appUrl, PwaCapability offlineCapability, ILogger logger, CancellationToken cancelToken)
        {
            // To test offline capability, we load the page in puppeteer. Then we disconnect the network and try to reload the page.
            // If the page loads successfully while offline, we mark the capability as passed.
            // NOTE: in the past we used Lighthouse's offline audit for this check. But as of summer 2025, Lighthouse has removed PWA audits including offline support audit.
            using var page = await puppeteerService.NavigateAsync(appUrl);
            cancelToken.ThrowIfCancellationRequested();

            // Give the page a chance to settle. Many PWAs never reach network idle (e.g. long-polling, large asset streaming), so this is best-effort.
            try
            {
                await page.WaitForNetworkIdleAsync(new WaitForNetworkIdleOptions { IdleTime = 2000, Timeout = 10000 });
            }
            catch (TimeoutException)
            {
                logger.LogInformation("During offline detection for {url}, network didn't become idle. Continuing with offline check.", appUrl);
            }

            cancelToken.ThrowIfCancellationRequested();

            // Wait until we have an active service worker. Service workers that precache many assets can take a long time to install,
            // so we wait a while. Returns the state of the service worker when we stopped waiting.
            var swState = await page.EvaluateFunctionAsync<string>($@"
                async () => {{
                    if (!('serviceWorker' in navigator)) return 'none';
                    const deadline = Date.now() + {ActivationWaitMilliseconds};
                    while (true) {{
                        const registration = await navigator.serviceWorker.getRegistration();
                        if (registration?.active) return 'active';
                        if (Date.now() >= deadline) {{
                            return registration?.installing || registration?.waiting ? 'installing' : 'none';
                        }}
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }}
                }}
            ");
            if (swState == "installing")
            {
                // The service worker is still installing, typically because it's precaching a large number of assets.
                // We can't run a real offline test in our time budget, so fall back to static analysis of the service worker code.
                var hasOfflineLogic = HasOfflineCachingLogic(swDetection.Raw);
                logger.LogInformation("During offline detection for {url}, service worker was still installing after {seconds} seconds. Falling back to static analysis, which found offline caching logic: {hasOfflineLogic}", appUrl, ActivationWaitMilliseconds / 1000, hasOfflineLogic);
                offlineCapability.Status = hasOfflineLogic ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed;
                if (!hasOfflineLogic)
                {
                    offlineCapability.ErrorMessage = "Service worker was still installing during offline detection, and no offline caching logic was found in the service worker.";
                }

                return offlineCapability;
            }

            if (swState != "active")
            {
                logger.LogInformation("During offline detection attempt for {url}, no service worker was registered. Marking offline detection test as failed.", appUrl);
                offlineCapability.Status = PwaCapabilityCheckStatus.Failed;
                offlineCapability.ErrorMessage = "During offline detection attempt, no active service worker found after load.";
                return offlineCapability;
            }

            cancelToken.ThrowIfCancellationRequested();

            // Disconnect network
            await page.SetOfflineModeAsync(true);

            // Try to reload the page
            var response = await page.ReloadAsync(20000, [WaitUntilNavigation.DOMContentLoaded, WaitUntilNavigation.Load]);
            if (response is { Ok: true })
            {
                offlineCapability.Status = PwaCapabilityCheckStatus.Passed;
            }
            else
            {
                offlineCapability.ErrorMessage = $"Offline capability check failed due to response {response?.Status}";
                offlineCapability.Status = PwaCapabilityCheckStatus.Failed;
                logger.LogInformation("Offline capability check for {url} failed. Response: {status} {statusText}", appUrl, (int?)response?.Status, response?.StatusText);
            }

            return offlineCapability;
        }

        /// <summary>
        /// Whether an exception means the headless browser tab died under us, as opposed to the app failing the check.
        /// PuppeteerSharp reports a crashed renderer as TargetCrashedException, and any protocol call made afterwards
        /// fails with TargetClosedException whose close reason carries "Inspector.targetCrashed".
        /// </summary>
        /// <param name="ex">The exception thrown by the live check.</param>
        /// <returns>True when the browser tab crashed or was closed from under the check.</returns>
        public static bool IsBrowserCrash(Exception ex)
        {
            // TargetCrashedException is internal to PuppeteerSharp, so it is matched by name.
            return ex is TargetClosedException
                || ex.GetType().Name is "TargetCrashedException"
                || ex.Message.Contains("targetCrashed", StringComparison.OrdinalIgnoreCase)
                || (ex.InnerException is not null && IsBrowserCrash(ex.InnerException));
        }

        /// <summary>
        /// Statically checks whether service worker code appears to serve content offline: either Workbox precaching/routing,
        /// or a fetch handler that uses the Cache Storage API. Used when a real offline test can't run, e.g. because the service worker is still installing.
        /// </summary>
        /// <param name="serviceWorkerJs">The service worker source code.</param>
        /// <returns>True if the service worker appears to contain offline caching logic.</returns>
        public static bool HasOfflineCachingLogic(string serviceWorkerJs)
        {
            return WorkboxRoutingRegex.IsMatch(serviceWorkerJs) ||
                (FetchHandlerRegex.IsMatch(serviceWorkerJs) && CacheStorageRegex.IsMatch(serviceWorkerJs));
        }

        private PwaCapabilityCheckStatus RunCapabilityCheck(PwaCapability swCapability, ServiceWorkerDetection swDetection, string swScripts)
        {
            return swCapability.Id switch
            {
                PwaCapabilityId.HasServiceWorker => swDetection != null ? PwaCapabilityCheckStatus.Passed : PwaCapabilityCheckStatus.Failed,
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
                .Select(url => webCache.GetOrFetchAsync(url, Constants.JavascriptMimeTypes, logger, cancelToken));
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
