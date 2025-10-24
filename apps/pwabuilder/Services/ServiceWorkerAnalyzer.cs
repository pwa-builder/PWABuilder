using System.Text.RegularExpressions;
using PuppeteerSharp;
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
            if (swDetection == null)
            {
                offlineCapability.Status = PwaCapabilityCheckStatus.Skipped;
                return offlineCapability;
            }

            // To test offline capability, we load the page in puppeteer. Then we disconnect the network and try to reload the page.
            // If the page loads successfully while offline, we mark the capability as passed.
            // NOTE: in the past we used Lighthouse's offline audit for this check. But as of summer 2025, Lighthouse has removed PWA audits including offline support audit.
            IPage? page = null;
            try
            {
                page = await puppeteerService.NavigateAsync(appUrl);
                cancelToken.ThrowIfCancellationRequested();

                // Wait for network to be idle
                await page.WaitForNetworkIdleAsync(new WaitForNetworkIdleOptions { IdleTime = 2000, Timeout = 20000 });

                // Wait until we have an active service worker.
                var swRegistered = await page.EvaluateFunctionAsync<bool>(@"
                    () => {
                        // Await service worker registration, or timeout after 10s
                        const swRegistrationReady = navigator.serviceWorker.ready.then(() => true);
                        const swRegTimeout = new Promise(resolve => setTimeout(() => resolve(false), 10000));
                        return Promise.race([
                            swRegistrationReady,
                            swRegTimeout
                        ]);
                    }
                ");
                if (!swRegistered)
                {
                    logger.LogInformation("During offline detection attempt for {url}, no service worker was registered. Marking offline detection test as failed.", appUrl);
                    offlineCapability.Status = PwaCapabilityCheckStatus.Failed;
                    offlineCapability.ErrorMessage = "During offline detection attempt, no active service worker found after load.";
                    return offlineCapability;
                }

                cancelToken.ThrowIfCancellationRequested();

                // Disconnect network
                page = await SetOfflineModeWithDisconnectedFallback(page, appUrl, logger);

                // Try to reload the page
                var response = await page.ReloadAsync(new NavigationOptions
                {
                    Timeout = 20000,
                    WaitUntil = [WaitUntilNavigation.DOMContentLoaded, WaitUntilNavigation.Load],
                });

                if (response != null && response.Ok)
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
            catch (Exception ex)
            {
                offlineCapability.ErrorMessage = $"Offline capability check failed due to an exception: {ex.Message}";
                logger.LogWarning(ex, "Error checking offline capability for {url}", appUrl);
                offlineCapability.Status = PwaCapabilityCheckStatus.Failed;
            }
            finally
            {
                if (page != null)
                {
                    page.Dispose();
                }
            }

            return offlineCapability;
        }

        private async Task<IPage> SetOfflineModeWithDisconnectedFallback(IPage page, Uri appUrl, ILogger logger)
        {
            try
            {
                // Try to set offline mode. 
                await page.SetOfflineModeAsync(true);
                return page;
            }
            catch (TargetClosedException closedError)
            {
                // Some PWAs, such as https://belgrade.plus, have a disconnection error after waiting for service worker. 
                // Re-navigate the page and immediately set offline mode since we've already loaded it.
                logger.LogWarning(closedError, "During offline detection test, the page disconnected. Reloading the page.");
                using var newPage = await this.puppeteerService.NavigateAsync(appUrl);
                await newPage.SetOfflineModeAsync(true);

                try
                {
                    page.Dispose();
                }
                catch (Exception disposeError)
                {
                    logger.LogWarning(disposeError, "Error disposing Puppeteer page during offline detection fallback.");
                }

                return newPage;
            }
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
