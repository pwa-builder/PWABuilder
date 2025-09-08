using PuppeteerSharp;
using PWABuilder.Models;
using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Text.Json;

namespace PWABuilder.Services;

public class LighthouseService : ILighthouseService
{
    private readonly IHostEnvironment env;

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

    private static readonly ViewPortOptions DesktopViewport = new()
    {
        Width = 1024,
        Height = 768,
        DeviceScaleFactor = 1,
        IsMobile = false,
        HasTouch = false,
        IsLandscape = true,
    };
    private static readonly ViewPortOptions MobileViewport = new()
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
    private static readonly JsonSerializerOptions reportSerializationOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        AllowTrailingCommas = true
    };

    public LighthouseService(IHostEnvironment env)
    {
        this.env = env;
    }

    /// <inheritDoc />
    public async Task<LighthouseReport> RunAuditAsync(Uri url, BrowserFormFactor formFactor, ILogger logger, CancellationToken cancelToken)
    {
        int headlessChromePort = GetAvailablePort();
        using var browser = await this.CreatePuppeteerBrowserWithRemoteDebugging(url, formFactor, headlessChromePort);
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
        using var cancelTokenSrc = new CancellationTokenSource();
        var valveTriggered = false;
        var valveTask = Task.Delay(lhTimeoutMilliseconds * 2, cancelTokenSrc.Token)
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
            url.ToString(),
            new NavigationOptions
            {
                Timeout = 15000,
                WaitUntil = [WaitUntilNavigation.DOMContentLoaded],
            }
        );

        // Start Lighthouse process
        using var lhProcess = StartLighthouse(url, formFactor, headlessChromePort);

        // Lighthouse Timeout
        using var ctsLighthouse = new CancellationTokenSource(lhTimeoutMilliseconds);
        var lhOutputTask = lhProcess.StandardOutput.ReadToEndAsync(cancelToken);
        var lhErrorTask = lhProcess.StandardError.ReadToEndAsync(cancelToken);
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
                {
                    lhProcess.Kill(entireProcessTree: true);
                }
            }
            catch (Exception error)
            {
                logger.LogWarning(error, "Unable to kill the Lighthouse process after timeout.");
            }
            throw new TimeoutException("Lighthouse process timed out.");
        }

        var lhOutput = await lhOutputTask;
        var lhError = await lhErrorTask;

        if (lhProcess.ExitCode != 0)
        {
            throw new Exception($"Lighthouse failed with exit code: {lhProcess.ExitCode} \r\n{lhError}");
        }

        // Get the result from Lighthouse.
        var lighthouseReport = JsonSerializer.Deserialize<LighthouseReport>(lhOutput, reportSerializationOptions);
        if (lighthouseReport == null || lighthouseReport.Audits == null)
        {
            var error = new Exception("Lighthouse was null or didn't contain audits");
            error.Data.Add("LHOutput", lhOutput);
            throw error;
        }

        // Inject error if the service worker couldn't be found.
        if (valveTriggered && lighthouseReport.ServiceWorkerAudit != null && lighthouseReport.ServiceWorkerAudit.Details == null)
        {
            lighthouseReport.ServiceWorkerAudit.Error ??= "Service worker timed out";
        }

        // Cancel Puppeteer timeout and close browser
        cancelTokenSrc.Cancel();
        await browser.CloseAsync();
        return lighthouseReport;
    }

    private static int GetAvailablePort()
    {
        var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        int port = ((IPEndPoint)listener.LocalEndpoint).Port;
        listener.Stop();
        return port;
    }

    private async Task<IBrowser> CreatePuppeteerBrowserWithRemoteDebugging(Uri url, BrowserFormFactor formFactor, int headlessChromePort)
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

        return await PuppeteerService.CreateBrowserAsync(env, launchOptions);
    }

    private static Process StartLighthouse(Uri url, BrowserFormFactor formFactor, int headlessChromePort)
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
            + $"--only-audits=is-on-https,service-worker-audit,https-audit,offline-audit,web-app-manifest-raw-audit " // used to include installable-manifest, but removed August 2025 due to runtime failures running Lighthouse service
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
