using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Nodes;
using PuppeteerSharp;

namespace PWABuilder.Services
{
    public class LighthouseService : ILighthouseService
    {
        private const int timeoutMilliseconds = 165000;
        private const int headlessChromePort = 9222;

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
                Width = 1350,
                Height = 940,
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

        private string CreateTempLighthouseConfig(bool desktop)
        {
            var screenEmulation = desktop
                ? @"{ mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }"
                : @"{ mobile: true, width: 375, height: 667, deviceScaleFactor: 2, disabled: false }";

            var userAgent = desktop
                ? "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 PWABuilderHttpAgent"
                : "Mozilla/5.0 (Linux; Android 10; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36 PWABuilderHttpAgent";

            var customSettingsPath =
                @"C:\Users\JoseVelarde\Southworks\PWABuilder\apps\pwabuilder-backend\node-scripts\src\lighthouserc.cjs";

            var configContent =
                $@"
const settings = require('{customSettingsPath.Replace("\\", "\\\\")}');
settings.screenEmulation = {screenEmulation};
settings.emulatedUserAgent = '{userAgent}';

module.exports = {{
  extends: 'lighthouse:default',
  settings,
}};
";
            var tempPath = Path.Combine(Path.GetTempPath(), $"lighthouserc_{Guid.NewGuid()}.cjs");
            File.WriteAllText(tempPath, configContent);
            return tempPath;
        }

        public async Task<JsonDocument> RunAuditAsync(string url, bool desktop)
        {
            var lhPath = $"C:\\Program Files\\nodejs\\lighthouse.cmd";

            var customConfigPath = CreateTempLighthouseConfig(desktop);
            var lhArgs =
                $"{url} "
                + $"--quiet "
                + $"--chrome-flags=\"--headless --no-sandbox\" "
                + $"--output=json --output-path=stdout "
                + $"--port={headlessChromePort} "
                + $"--config-path=\"{customConfigPath}\" "
                + $"--only-audits=installable-manifest,is-on-https,service-worker-audit,https-audit,offline-audit "
                + $"--form-factor={(desktop ? "desktop" : "mobile")} "
                + $"--locale=en-US "
                + $"--max-wait-for-fcp=15000 "
                + $"--max-wait-for-load=30000 "
                + $"--disable-storage-reset "
                + $"--disable-full-page-screenshot "
                + $"--skip-about-blank";

            string pptManifestRaw = "";
            string pptManifestUrl = "";
            bool valveTriggered = false;

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

            if (!Uri.IsWellFormedUriString(url, UriKind.Absolute))
                throw new ArgumentException("Invalid URL.");

            // Puppeteer Setup: Download Chromium if needed
            await new BrowserFetcher().DownloadAsync();

            // No need to close pptBrowser, await using will dispose of i automatically
            await using var pptBrowser = await Puppeteer.LaunchAsync(pptlaunchOptions);
            await using var pptPage = await pptBrowser.NewPageAsync();

            // Set up request interception
            await pptPage.SetBypassServiceWorkerAsync(true);
            await pptPage.SetRequestInterceptionAsync(true);

            // Skipped resources
            pptPage.Request += async (sender, e) =>
            {
                await e.Request.ContinueAsync();
            };

            // Handle dialogs
            pptPage.Dialog += async (sender, e) =>
            {
                await e.Dialog.Dismiss();
            };

            // Intercept manifest
            pptPage.Response += async (sender, e) =>
            {
                if (e.Response.Request.ResourceType == ResourceType.Manifest)
                {
                    pptManifestRaw = await e.Response.TextAsync();
                    pptManifestUrl = e.Response.Url;
                }
            };

            // Puppeteer Timeout
            var ctsValve = new CancellationTokenSource();
            var valveTask = Task.Delay(timeoutMilliseconds * 2, ctsValve.Token)
                .ContinueWith(async t =>
                {
                    valveTriggered = true;
                    try
                    {
                        var client = await pptPage.CreateCDPSessionAsync();
                        await client.SendAsync("ServiceWorker.enable");
                        await client.SendAsync("ServiceWorker.stopAllWorkers");
                    }
                    catch { }
                });

            await pptPage.GoToAsync(url);

            // Start Lighthouse process
            var lhPsi = new ProcessStartInfo
            {
                FileName = lhPath,
                Arguments = lhArgs,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var lhProcess = Process.Start(lhPsi);
            if (
                lhProcess == null
                || lhProcess.StandardOutput == null
                || lhProcess.StandardError == null
            )
                throw new Exception("Failed to start Lighthouse process.");

            // Lighthouse Timeout
            using var ctsLighthouse = new CancellationTokenSource(timeoutMilliseconds);

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

            // Cancel Puppeteer Timeout if audit finished
            ctsValve.Cancel();

            var lhOutput = await lhOutputTask;
            var lhError = await lhErrorTask;

            if (lhProcess.ExitCode != 0)
                throw new Exception($"Lighthouse failed: {lhError}");

            // Build mutable Json Object
            var rootNode = JsonNode.Parse(lhOutput)?.AsObject();
            if (rootNode == null)
                throw new Exception("Failed to parse Lighthouse output as JSON.");

            var audits = rootNode["audits"] as JsonObject;
            var artifacts = rootNode["artifacts"] as JsonObject;

            // Inject error
            if (
                valveTriggered
                && audits != null
                && audits["service-worker-audit"] is JsonObject swAuditNode
            )
            {
                if (swAuditNode["details"] is not JsonObject detailsNode)
                {
                    detailsNode = new JsonObject();
                    swAuditNode["details"] = detailsNode;
                }
                detailsNode["error"] = "Service worker timed out";
            }

            // Manifest replacement
            if (
                !string.IsNullOrEmpty(pptManifestRaw)
                && artifacts != null
                && artifacts["Manifest"] is JsonObject manifestNode
            )
            {
                var lhManifestRaw = manifestNode["raw"]?.GetValue<string>();
                if (
                    string.IsNullOrEmpty(lhManifestRaw)
                    || pptManifestRaw.Length > lhManifestRaw.Length
                )
                {
                    manifestNode["raw"] = pptManifestRaw;
                    manifestNode["url"] = pptManifestUrl ?? "";
                }
            }

            // Build and return the result object
            var resultNode = new JsonObject
            {
                ["audits"] = audits?.DeepClone(),
                ["artifacts"] = artifacts?.DeepClone(),
            };

            return JsonDocument.Parse(resultNode.ToJsonString());
        }
    }
}
