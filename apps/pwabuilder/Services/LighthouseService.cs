using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using System.Text.Json.Nodes;
using PuppeteerSharp;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    public class LighthouseService : ILighthouseService
    {
        private readonly IHostEnvironment env;

        public LighthouseService(IHostEnvironment env)
        {
            this.env = env;
        }

        private const int lhTimeoutMilliseconds = 300000;

        private readonly string[] disabledFeatures =
        [
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

        private readonly Dictionary<bool, ViewPortOptions> viewPorts = new()
        {
            [true] = new ViewPortOptions // desktop
            {
                Width = 1024,
                Height = 768,
                DeviceScaleFactor = 1,
                IsMobile = false,
                HasTouch = false,
                IsLandscape = true,
            },
            [false] = new ViewPortOptions // mobile
            {
                Width = 375,
                Height = 667,
                DeviceScaleFactor = 2,
                IsMobile = true,
                HasTouch = true,
                IsLandscape = false,
            },
        };

        private readonly Dictionary<bool, string> userAgent = new()
        {
            [true] = // desktop
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 PWABuilderHttpAgent",
            [false] = // mobile
                "Mozilla/5.0 (Linux; Android 10; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36 PWABuilderHttpAgent",
        };

        private static int GetAvailablePort()
        {
            var listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            int port = ((IPEndPoint)listener.LocalEndpoint).Port;
            listener.Stop();
            return port;
        }

        public async Task<LighthouseReport> RunAuditAsync(string url, bool desktop)
        {
            if (!Uri.IsWellFormedUriString(url, UriKind.Absolute))
            {
                throw new ArgumentException("Invalid URL.");
            }

            int headlessChromePort = GetAvailablePort();

            var nodePath = Environment.GetEnvironmentVariable("NODE_BIN");
            var lighthouseDirectory = Environment.GetEnvironmentVariable("LIGHTHOUSE_WORKDIR");
            var workingDirectory = !string.IsNullOrWhiteSpace(lighthouseDirectory)
                ? Path.GetFullPath(lighthouseDirectory, Directory.GetCurrentDirectory())
                : Path.Combine(Directory.GetCurrentDirectory(), "node-scripts");
            var lighthouseSettingsPath = Path.Combine(
                workingDirectory,
                "dist",
                "src",
                "lighthouserc.js"
            );
            string lighthouseScript = Path.Combine("node_modules", "lighthouse", "cli", "index.js");

            if (string.IsNullOrWhiteSpace(nodePath) || !File.Exists(nodePath))
            {
                throw new FileNotFoundException($"NODE_BIN not found or invalid: {nodePath}");
            }

            var lighthouseScriptFullPath = Path.Combine(workingDirectory, lighthouseScript);
            if (!File.Exists(lighthouseScriptFullPath))
            {
                throw new FileNotFoundException(
                    $"Lighthouse script not found: {lighthouseScriptFullPath}"
                );
            }

            var lhArgs =
                $"\"{lighthouseScript}\" "
                + $"{url} "
                + $"--quiet "
                + $"--chrome-flags=\"--headless --no-sandbox\" "
                + $"--output=json --output-path=stdout "
                + $"--port={headlessChromePort} "
                + $"--config-path=\"{lighthouseSettingsPath}\" "
                + $"--only-audits=installable-manifest,is-on-https,service-worker-audit,https-audit,offline-audit,web-app-manifest-raw-audit "
                + $"--form-factor={(desktop ? "desktop" : "mobile")} "
                + $"{(desktop ? "" : "--screenEmulation.mobile ")}"
                + $"--screenEmulation.width={viewPorts[desktop].Width} "
                + $"--screenEmulation.height={viewPorts[desktop].Height} "
                + $"--screenEmulation.deviceScaleFactor={viewPorts[desktop].DeviceScaleFactor} "
                + $"--emulatedUserAgent=\"{userAgent[desktop]}\" "
                + $"--locale=en-US "
                + $"--max-wait-for-fcp=15000 "
                + $"--max-wait-for-load=30000 "
                + $"--disable-storage-reset "
                + $"--disable-full-page-screenshot "
                + $"--skip-about-blank";

            var pptManifestRaw = "";
            var pptManifestUrl = "";
            var valveTriggered = false;

            var pptDisableFeaturesArg = $"--disable-features={string.Join(",", disabledFeatures)}";
            var pptlaunchOptions = new LaunchOptions
            {
                Args =
                [
                    "--no-sandbox",
                    "--no-pings",
                    "--deny-permission-prompts",
                    "--disable-domain-reliability",
                    "--disable-gpu",
                    "--block-new-web-contents",
                    pptDisableFeaturesArg,
                    $"--remote-debugging-port={headlessChromePort}",
                ],
                Headless = true,
                DefaultViewport = viewPorts[desktop],
            };

            await using var puppeteer = new PuppeteerService(env);
            await puppeteer.CreateAsync(pptlaunchOptions);

            await using var browser = puppeteer.GetBrowser();
            await using var page = await browser.NewPageAsync();

            // Set up request interception
            await page.SetBypassServiceWorkerAsync(true);
            await page.SetRequestInterceptionAsync(true);

            // Skipped resources
            page.Request += async (sender, e) =>
            {
                await e.Request.ContinueAsync();
            };

            // Handle dialogs
            page.Dialog += async (sender, e) =>
            {
                await e.Dialog.Dismiss();
            };

            // Intercept manifest
            page.Response += async (sender, e) =>
            {
                if (e.Response.Request.ResourceType == ResourceType.Manifest)
                {
                    pptManifestRaw = await e.Response.TextAsync();
                    pptManifestUrl = e.Response.Url;
                }
            };

            // Puppeteer valve trigger timeout
            var ctsValve = new CancellationTokenSource();
            var valveTask = Task.Delay(lhTimeoutMilliseconds * 2, ctsValve.Token)
                .ContinueWith(async t =>
                {
                    valveTriggered = true;
                    try
                    {
                        var client = await page.CreateCDPSessionAsync();
                        await client.SendAsync("ServiceWorker.enable");
                        await client.SendAsync("ServiceWorker.stopAllWorkers");
                    }
                    catch { }
                });

            await page.GoToAsync(
                url,
                new NavigationOptions
                {
                    Timeout = 30000,
                    WaitUntil = [WaitUntilNavigation.DOMContentLoaded],
                }
            );

            await Task.Delay(1000);

            // Start Lighthouse process
            var lighthouseStartInfo = new ProcessStartInfo
            {
                FileName = nodePath,
                WorkingDirectory = workingDirectory,
                Arguments = lhArgs,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var lhProcess = Process.Start(lighthouseStartInfo);
            if (
                lhProcess == null
                || lhProcess.StandardOutput == null
                || lhProcess.StandardError == null
            )
                throw new Exception("Failed to start Lighthouse process.");

            // Lighthouse Timeout
            using var ctsLighthouse = new CancellationTokenSource(lhTimeoutMilliseconds);

            var lhOutputTask = lhProcess.StandardOutput.ReadToEndAsync();
            var lhErrorTask = lhProcess.StandardError.ReadToEndAsync();
            var lhWaitTask = lhProcess.WaitForExitAsync(ctsLighthouse.Token);

            try
            {
                await lhWaitTask;
            }
            catch (OperationCanceledException)
            {
                try
                {
                    if (!lhProcess.HasExited)
                        lhProcess.Kill(entireProcessTree: true);
                }
                catch { }
                throw new TimeoutException("Lighthouse process timed out.");
            }

            var lhOutput = await lhOutputTask;
            var lhError = await lhErrorTask;

            if (lhProcess.ExitCode != 0)
                throw new Exception($"Lighthouse failed: {lhError}");

            // Get the result from Lighthouse.
            var lighthouseReport = JsonSerializer.Deserialize<LighthouseReport>(lhOutput, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true
            });
            if (lighthouseReport == null || lighthouseReport.Audits == null)
            {
                var error = new Exception("Lighthouse was null or didn't contain audits");
                error.Data.Add("LHOutput", lhOutput);
                throw error;
            }

            //var audits = lighthouseReport.Audits;
            //var artifacts = new JsonObject();
            //var manifestRawNode = new JsonObject();

            // if (hasWebAppManifestAudit && manifestRawAudit?.Details != null)
            // {
            //     var manifestUrl = manifestRawAudit.Details.ManifestUrl;
            //     var manifestRaw = manifestRawAudit.Details.ManifestRaw;
                // if (!string.IsNullOrEmpty(manifestUrl))
                //     manifestRawNode["url"] = manifestUrl;
                // if (!string.IsNullOrEmpty(manifestRaw))
                //     manifestRawNode["raw"] = manifestRaw;
            //}

            // Inject error if the service worker couldn't be found.
            if (valveTriggered && lighthouseReport.ServiceWorkerAudit != null && lighthouseReport.ServiceWorkerAudit.Details == null)
            {
                lighthouseReport.ServiceWorkerAudit.Error ??= "SService worker timed out";
            }

            // Manifest replacement
            // if (!string.IsNullOrEmpty(pptManifestRaw))
            // {
            //     var lhManifestRaw = manifestRawAudit?.Details?.ManifestRaw;
            //     if (
            //         string.IsNullOrEmpty(lhManifestRaw)
            //         || pptManifestRaw.Length > lhManifestRaw.Length
            //     )
            //     {
            //         manifestRawNode["raw"] = pptManifestRaw;
            //         manifestRawNode["url"] = pptManifestUrl ?? "";
            //     }
            // }

            // artifacts["Manifest"] = manifestRawNode;

            // Build and return the result object
            // var resultNode = new JsonObject
            // {
            //     ["audits"] = audits?.DeepClone(),
            //     ["artifacts"] = artifacts?.DeepClone(),
            // };

            // Cancel Puppeteer timeout and close browser
            ctsValve.Cancel();
            await browser.CloseAsync();

            return lighthouseReport;
        }
    }
}
