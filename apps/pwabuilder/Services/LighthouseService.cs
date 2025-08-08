using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Runtime.CompilerServices;
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

        private static readonly ViewPortOptions DesktopViewport = new ViewPortOptions
        {
            Width = 1024,
            Height = 768,
            DeviceScaleFactor = 1,
            IsMobile = false,
            HasTouch = false,
            IsLandscape = true,
        };
        private static readonly ViewPortOptions MobileViewport = new ViewPortOptions
        {
            Width = 375,
            Height = 667,
            DeviceScaleFactor = 2,
            IsMobile = true,
            HasTouch = true,
            IsLandscape = false,
        };

        private const string DesktopUserAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 PWABuilderHttpAgent";
        private const string MobileUserAgent = "Mozilla/5.0 (Linux; Android 10; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36 PWABuilderHttpAgent";

        private static int GetAvailablePort()
        {
            var listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            int port = ((IPEndPoint)listener.LocalEndpoint).Port;
            listener.Stop();
            return port;
        }

        public async Task<LighthouseReport> RunAuditAsync(string url, BrowserFormFactor formFactor)
        {
            if (!Uri.IsWellFormedUriString(url, UriKind.Absolute))
            {
                throw new ArgumentException("Invalid URL.");
            }

            int headlessChromePort = GetAvailablePort();
            var puppeteer = await this.CreatePuppeteer(url, formFactor, headlessChromePort);

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

            // Puppeteer valve trigger timeout
            using var ctsValve = new CancellationTokenSource();
            var valveTriggered = false;
            var valveTask = Task.Delay(lhTimeoutMilliseconds * 2, ctsValve.Token)
                .ContinueWith(async t =>
                {
                    valveTriggered = true;
                    try
                    {
                        // Start a Chrome dev tools protocol session.
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

            // Start Lighthouse process
            using var lhProcess = StartLighthouse(url, formFactor, headlessChromePort);

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

            // Inject error if the service worker couldn't be found.
            if (valveTriggered && lighthouseReport.ServiceWorkerAudit != null && lighthouseReport.ServiceWorkerAudit.Details == null)
            {
                lighthouseReport.ServiceWorkerAudit.Error ??= "SService worker timed out";
            }

            // Cancel Puppeteer timeout and close browser
            ctsValve.Cancel();
            await browser.CloseAsync();
            return lighthouseReport;
        }

        private async Task<PuppeteerService> CreatePuppeteer(string url, BrowserFormFactor formFactor, int headlessChromePort)
        {
            var viewport = formFactor == BrowserFormFactor.Desktop
                ? DesktopViewport
                : MobileViewport;
            var disabledFeaturesArg = $"--disable-features={string.Join(",", disabledFeatures)}";
            var launchOptions = new LaunchOptions
            {
                Args =
                [
                    "--no-sandbox",
                    "--no-pings",
                    "--deny-permission-prompts",
                    "--disable-domain-reliability",
                    "--disable-gpu",
                    "--block-new-web-contents",
                    disabledFeaturesArg,
                    $"--remote-debugging-port={headlessChromePort}",
                ],
                Headless = true,
                DefaultViewport = viewport
            };

            var puppeteer = new PuppeteerService(env);
            await puppeteer.CreateAsync(launchOptions);
            return puppeteer;
        }

        private static Process StartLighthouse(string url, BrowserFormFactor formFactor, int headlessChromePort)
        {
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

            var lighthouseScript = Path.Combine("node_modules", "lighthouse", "cli", "index.js");
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

            var viewport = formFactor == BrowserFormFactor.Desktop
                ? DesktopViewport
                : MobileViewport;
            var userAgent = formFactor == BrowserFormFactor.Desktop
                ? DesktopUserAgent
                : MobileUserAgent;
            var lhArgs =
                $"\"{lighthouseScript}\" "
                + $"{url} "
                + $"--quiet "
                + $"--chrome-flags=\"--headless --no-sandbox\" "
                + $"--output=json --output-path=stdout "
                + $"--port={headlessChromePort} "
                + $"--config-path=\"{lighthouseSettingsPath}\" "
                + $"--only-audits=installable-manifest,is-on-https,service-worker-audit,https-audit,offline-audit,web-app-manifest-raw-audit "
                + $"--form-factor={(formFactor == BrowserFormFactor.Desktop ? "desktop" : "mobile")} "
                + $"{(formFactor == BrowserFormFactor.Mobile ? "--screenEmulation.mobile " : string.Empty)}"
                + $"--screenEmulation.width={viewport.Width} "
                + $"--screenEmulation.height={viewport.Height} "
                + $"--screenEmulation.deviceScaleFactor={viewport.DeviceScaleFactor} "
                + $"--emulatedUserAgent=\"{userAgent}\" "
                + $"--locale=en-US "
                + $"--max-wait-for-fcp=15000 "
                + $"--max-wait-for-load=30000 "
                + $"--disable-storage-reset "
                + $"--disable-full-page-screenshot "
                + $"--skip-about-blank";
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

            var lhProcess = Process.Start(lighthouseStartInfo);
            if (lhProcess == null || lhProcess.StandardOutput == null || lhProcess.StandardError == null)
            {
                lhProcess?.Dispose();
                throw new Exception("Failed to start Lighthouse process.");
            }

            return lhProcess;
        }
    }

    /// <summary>
    /// Browser form factor.
    /// </summary>
    public enum BrowserFormFactor
    {
        Desktop,
        Mobile
    }
}
