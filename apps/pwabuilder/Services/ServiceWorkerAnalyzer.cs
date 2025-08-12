using System.Security.Policy;
using System.Text.RegularExpressions;
using PWABuilder.Common;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    public class ServiceWorkerAnalyzer : IServiceWorkerAnalyzer
    {
        private readonly WebStringCache webCache;

        public ServiceWorkerAnalyzer(WebStringCache webCache)
        {
            this.webCache = webCache;
        }

        private readonly Regex[] PushRegexes =
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
        private readonly Regex[] ServiceWorkerRegexes =
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

        public async Task<ServiceWorkerFeatures?> AnalyzeServiceWorkerAsync(Uri serviceWorkerUrl, Uri appUrl, ILogger logger, CancellationToken cancelToken)
        {
            string? serviceWorkerJs = null;
            var separateContent = new List<string>();            
            try
            {
                serviceWorkerJs = await webCache.Get(serviceWorkerUrl, Constants.JavascriptMimeTypes, cancelToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Service worker analyzer failed to fetch content from {url}", serviceWorkerUrl);
                return null;
            }

            if (string.IsNullOrWhiteSpace(serviceWorkerJs))
            {
                logger.LogWarning("Service worker analyzer found no content at {url}", serviceWorkerUrl);
                return new ServiceWorkerFeatures
                {
                    Empty = true
                };
            }

            
            separateContent.Add(serviceWorkerJs);
            try
            {
                var scriptsContent = await FindAndFetchImportScriptsAsync(serviceWorkerJs, appUrl, logger, cancelToken);
                foreach (var scriptContent in scriptsContent)
                {
                    serviceWorkerJs += scriptContent;
                    separateContent.Add(scriptContent);
                }
            }
            catch { }
            double swSize = System.Text.Encoding.UTF8.GetByteCount(serviceWorkerJs) / 1024.0;
            string compactContent = Regex.Replace(serviceWorkerJs, @"\n+|\s+|\r", "");

            return new ServiceWorkerFeatures
            {
                BackgroundSync = Array.Exists(
                    BackgroundSyncRegexes,
                    reg => reg.IsMatch(compactContent)
                ),
                PeriodicBackgroundSync = Array.Exists(
                    PeriodicSyncRegexes,
                    reg => reg.IsMatch(compactContent)
                ),
                PushRegistration = Array.Exists(
                    PushRegexes,
                    reg => reg.IsMatch(compactContent)
                ),
                SignsOfLogic = Array.Exists(
                    ServiceWorkerRegexes,
                    reg => reg.IsMatch(compactContent)
                ),
                Empty =
                    Array.Exists(EmptyRegexes, reg => reg.IsMatch(compactContent))
                    || swSize < 0.2,
                Offline = null // This is not determined by this analyzer, but by the Lighthouse audit.
            };
        }

        private async Task<List<string>> FindAndFetchImportScriptsAsync(string code, Uri appUrl, ILogger logger, CancellationToken cancelToken)
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
