using System.Text.RegularExpressions;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    public class ServiceWorkerAnalyzer : IServiceWorkerAnalyzer
    {
        private readonly HttpClient httpClient;

        public ServiceWorkerAnalyzer(IHttpClientFactory httpClientFactory)
        {
            httpClient = httpClientFactory.CreateClient();
        }

        private readonly Regex[] PushRegexes =
        {
            new Regex(@"[.|\n\s*]addEventListener\s*\(\s*['""]push['""]", RegexOptions.Multiline),
            new Regex(@"[.|\n\s*]onpush\s*=", RegexOptions.Multiline),
        };
        private readonly Regex[] PeriodicSyncRegexes =
        {
            new Regex(
                @"[.|\n\s*]addEventListener\s*\(\s*['""]periodicsync['""]",
                RegexOptions.Multiline
            ),
            new Regex(@"[.|\n\s*]onperiodicsync\s*=", RegexOptions.Multiline),
        };
        private readonly Regex[] BackgroundSyncRegexes =
        {
            new Regex(@"[.|\n\s*]addEventListener\s*\(\s*['""]sync['""]", RegexOptions.Multiline),
            new Regex(@"[.|\n\s*]onsync\s*=", RegexOptions.Multiline),
            new Regex(@"BackgroundSyncPlugin", RegexOptions.Multiline),
        };
        private readonly Regex[] ServiceWorkerRegexes =
        {
            new Regex(@"importScripts|self\.|^self", RegexOptions.Multiline),
            new Regex(@"[.|\n\s*]addAll", RegexOptions.Multiline),
            new Regex(
                @"[.|\n\s*]addEventListener\s*\(\s*['""]install['""]",
                RegexOptions.Multiline
            ),
            new Regex(@"[.|\n\s*]addEventListener\s*\(\s*['""]fetch['""]", RegexOptions.Multiline),
        };
        private readonly Regex[] EmptyRegexes =
        {
            new Regex(
                @"\.addEventListener\(['""]fetch['""],\(?(function)?\(?\w*\)?(=>)?{?(return(?!\w)|\w+\.respondWith\(fetch\(\w+\.request\)(?!\.catch)|})",
                RegexOptions.Multiline
            ),
        };

        public async Task<List<string>> FindAndFetchImportScriptsAsync(
            string code,
            string? origin = null
        )
        {
            // Find all importScripts statements
            var importScripts = Regex.Matches(code, @"importScripts\s*\((.+?)\)");
            if (importScripts.Count == 0)
                return new List<string>();

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
            var normalizedUrls = new List<string>();
            foreach (var url in urls)
            {
                if (url.StartsWith("https:", StringComparison.OrdinalIgnoreCase))
                {
                    normalizedUrls.Add(url);
                }
                else if (!string.IsNullOrEmpty(origin))
                {
                    try
                    {
                        var absoluteUrl = new Uri(new Uri(origin), url).ToString();
                        normalizedUrls.Add(absoluteUrl);
                    }
                    catch { }
                }
            }

            // Fetch the content of each script
            var contents = new List<string>();
            foreach (var url in normalizedUrls)
            {
                try
                {
                    var response = await httpClient.GetAsync(url);
                    if (response.IsSuccessStatusCode)
                    {
                        contents.Add(await response.Content.ReadAsStringAsync());
                    }
                }
                catch { }
            }

            return contents;
        }

        public async Task<AnalyzeServiceWorkerResponse> AnalyzeServiceWorkerAsync(
            string serviceWorkerUrl
        )
        {
            string? content = null;
            var separateContent = new List<string>();

            if (!string.IsNullOrEmpty(serviceWorkerUrl))
            {
                try
                {
                    var response = await httpClient.GetAsync(serviceWorkerUrl);
                    if (response.IsSuccessStatusCode)
                    {
                        content = await response.Content.ReadAsStringAsync();
                    }
                }
                catch (Exception ex)
                {
                    return new AnalyzeServiceWorkerResponse
                    {
                        Error = $"analyzeServiceWorker: fetch failed: {ex.Message}",
                    };
                }
            }

            if (!string.IsNullOrEmpty(content))
            {
                separateContent.Add(content);

                try
                {
                    string? origin = null;
                    if (!string.IsNullOrEmpty(serviceWorkerUrl))
                    {
                        origin = new Uri(serviceWorkerUrl).GetLeftPart(UriPartial.Authority);
                    }
                    var scriptsContent = await FindAndFetchImportScriptsAsync(content, origin);
                    foreach (var scriptContent in scriptsContent)
                    {
                        content += scriptContent;
                        separateContent.Add(scriptContent);
                    }
                }
                catch { }
                double swSize = System.Text.Encoding.UTF8.GetByteCount(content) / 1024.0;
                string compactContent = Regex.Replace(content, @"\n+|\s+|\r", "");

                return new AnalyzeServiceWorkerResponse
                {
                    DetectedBackgroundSync = Array.Exists(
                        BackgroundSyncRegexes,
                        reg => reg.IsMatch(compactContent)
                    ),
                    DetectedPeriodicBackgroundSync = Array.Exists(
                        PeriodicSyncRegexes,
                        reg => reg.IsMatch(compactContent)
                    ),
                    DetectedPushRegistration = Array.Exists(
                        PushRegexes,
                        reg => reg.IsMatch(compactContent)
                    ),
                    DetectedSignsOfLogic = Array.Exists(
                        ServiceWorkerRegexes,
                        reg => reg.IsMatch(compactContent)
                    ),
                    DetectedEmpty =
                        Array.Exists(EmptyRegexes, reg => reg.IsMatch(compactContent))
                        || swSize < 0.2,
                    Raw = swSize < 2048 ? separateContent : new List<string> { ">2Mb" },
                };
            }

            return new AnalyzeServiceWorkerResponse
            {
                Error = "analyzeServiceWorker: no content of Service Worker or it's unreachable",
            };
        }
    }
}
