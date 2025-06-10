using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Text.Json;
using System.Threading;
using System.IO;
using PuppeteerSharp;

namespace PWABuilder.Services
{
    public class LighthouseService : ILighthouseService
    {
        private const int timeoutMilliseconds = 165000;

        private string[] disabledFeatures = [
          "Translate",
            "TranslateUI",
            // AcceptCHFrame disabled because of crbug.com/1348106.
            "AcceptCHFrame",
            "AutofillServerCommunication",
            "CalculateNativeWinOcclusion",
            "CertificateTransparencyComponentUpdater",
            "InterestFeedContentSuggestions",
            "MediaRouter",
            "DialMediaRouteProvider",
            // 'OptimizationHints'
            ];

        public async Task<JsonDocument> RunAuditAsync(string url, bool desktop)
        {
            string manifestRaw = "";
            string manifestUrl = "";

            if (!Uri.IsWellFormedUriString(url, UriKind.Absolute))
                throw new ArgumentException("Invalid URL.");

            // Download Chromium if needed
            await new BrowserFetcher().DownloadAsync(BrowserFetcher.DefaultChromiumRevision);

            var launchOptions = new LaunchOptions
            {
                Headless = true,
                Args =
                [
                "--no-sandbox",
                "--no-pings",
                "--deny-permission-prompts",
                "--disable-domain-reliability",
                "--disable-gpu",
                "--block-new-web-contents"
            ]
            };

            using (var browser = await Puppeteer.LaunchAsync(launchOptions))
            using (var page = await browser.NewPageAsync())
            {
                // Intercept manifest
                page.Response += async (sender, e) =>
                {
                    if (e.Response.Request.ResourceType == ResourceType.Manifest)
                    {
                        manifestRaw = await e.Response.TextAsync();
                        manifestUrl = e.Response.Url;
                    }
                };

                await page.GoToAsync(url);
            }

            var lighthouseArgs = $"\"{url}\" --output=json --quiet --chrome-flags=\"--headless --no-sandbox\"";
            lighthouseArgs += desktop ? " --preset=desktop" : " --preset=mobile";

            var psi = new ProcessStartInfo
            {
                FileName = $"C:\\Program Files\\nodejs\\lighthouse.cmd",
                Arguments = lighthouseArgs,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var process = Process.Start(psi);
            if (process == null || process.StandardOutput == null || process.StandardError == null)
                throw new Exception("Failed to start Lighthouse process.");


            using var cts = new CancellationTokenSource(timeoutMilliseconds);

            var outputTask = process.StandardOutput.ReadToEndAsync();
            var errorTask = process.StandardError.ReadToEndAsync();
            var waitTask = process.WaitForExitAsync(cts.Token);

            try
            {
                await waitTask;
            }
            catch (OperationCanceledException)
            {
                try
                {
                    if (!process.HasExited)
                        process.Kill(entireProcessTree: true);
                }
                catch { }
                throw new TimeoutException("Lighthouse process timed out.");
            }

            var output = await outputTask;
            var error = await errorTask;

            if (process.ExitCode != 0)
                throw new Exception($"Lighthouse failed: {error}");


            try
            {
                var doc = JsonDocument.Parse(output);
                var lhr = doc.RootElement;

                // Extract audits and artifacts as needed
                var audits = lhr.TryGetProperty("audits", out var auditsElem) ? auditsElem : default;
                var artifacts = lhr.TryGetProperty("artifacts", out var artifactsElem) ? artifactsElem : default;

                // Optionally, shape the result to match your Report type
                // (You can also return the raw JsonDocument and shape it in your controller)
                return doc;
            }
            catch (JsonException ex)
            {
                throw new Exception("Failed to parse Lighthouse output as JSON.", ex);
            }

        }
    }
}

