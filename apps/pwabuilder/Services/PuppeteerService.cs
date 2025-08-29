using Azure;
using PuppeteerSharp;
using PWABuilder.Common;
using PWABuilder.Models;

namespace PWABuilder.Services
{
    public class PuppeteerService : IPuppeteerService
    {
        private readonly Task<IBrowser> reusableBrowser;

        public PuppeteerService(Task<IBrowser> reusableBrowser)
        {
            this.reusableBrowser = reusableBrowser;
        }

        /// <summary>
        /// Creates a new browser instance. This should only be used when you need your own specially-configured browser, for example, with port for communicating with dev tools. If you only need to navigate to a page, use puppeteerService.NavigateToPage(...).
        /// </summary>
        /// <param name="customLaunchOptions">Any custom launch options.</param>
        /// <returns></returns>
        public static async Task<IBrowser> CreateBrowserAsync(IHostEnvironment env, LaunchOptions? customLaunchOptions = null)
        {
            var chromePath = "/usr/bin/google-chrome-stable"; // production chrome path
            if (!env.IsProduction()) // If we're not in production, fetch it.
            {
                // download the browser executable
                var fetcher = new BrowserFetcher();
                var revisionInfo = await fetcher.DownloadAsync();
                chromePath = fetcher.GetExecutablePath(revisionInfo.BuildId);
            }

            // browser execution configs
            var launchOptions = customLaunchOptions ?? new LaunchOptions
            {
                Headless = true, // = false for testing
                Args = [
                    // Security (required for containerized environments)
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    
                    // Performance & Speed
                    "--disable-gpu",                          // No GPU needed for your use case
                    "--disable-dev-shm-usage",               // Prevents memory issues in containers
                    "--disable-background-timer-throttling",  // Faster JS execution
                    "--disable-backgrounding-occluded-windows",
                    "--disable-renderer-backgrounding",
                    "--disable-features=TranslateUI",        // Disable translate popup
                    "--disable-ipc-flooding-protection",     // Faster IPC
                    
                    // Reduce resource usage
                    "--no-first-run",                        // Skip first-run setup
                    "--no-default-browser-check",            // Skip browser check
                    "--disable-default-apps",                // Don't load default apps
                    "--disable-extensions",                  // No extensions needed
                    "--disable-plugins",                     // No plugins needed
                    "--disable-sync",                        // No sync needed
                    
                    // Network & Loading optimizations
                    "--aggressive-cache-discard",            // Free memory faster
                    "--memory-pressure-off",                 // Disable memory pressure checks
                    "--max_old_space_size=4096",            // Limit memory usage
                    
                    // Resilience (choose one approach)
                    "--disable-features=VizDisplayCompositor", // Can help with frame detachment
                    // OR if you still get frame detachment issues:
                    // "--disable-features=site-per-process",  // Last resort for frame issues
                    
                    // Additional stability
                    "--disable-background-networking",       // Reduce background activity
                    "--disable-breakpad",                    // Disable crash reporting
                    "--disable-component-extensions-with-background-pages",
                    "--disable-features=MediaRouter",        // Disable casting features
                    "--disable-hang-monitor",               // Faster shutdown
                    "--disable-prompt-on-repost",           // Auto-handle form reposts
                    "--run-all-compositor-stages-before-draw"
                ],
            };
            launchOptions.ExecutablePath = chromePath;

            // open a new page in the controlled browser
            return await Puppeteer.LaunchAsync(launchOptions);
        }

        /// <summary>
        /// Creates a new page in the reusable browser instance and navigates it to the given site and waits for DOMContentLoaded.
        /// </summary>
        /// <param name="site"></param>
        /// <returns></returns>
        public async Task<IPage> Navigate(Uri site)
        {
            var browser = await this.reusableBrowser;
            var page = await browser.NewPageAsync();

            await page.SetUserAgentAsync(Constants.DesktopUserAgent);
            await page.GoToAsync(
                site.ToString(),
                new NavigationOptions
                {
                    Timeout = 30000,
                    WaitUntil = [WaitUntilNavigation.DOMContentLoaded, WaitUntilNavigation.Load, WaitUntilNavigation.Networkidle2],
                }
            );

            return page;
        }

        public async Task<IPage?> TryNavigate(Uri site, ILogger logger)
        {
            try
            {
                return await Navigate(site);
            }
            catch (Exception error)
            {
                logger.LogError(error, "Error navigating to {site}.", site);
                return null;
            }
        }

        public async ValueTask DisposeAsync()
        {
            var browser = await this.reusableBrowser;
            await browser.DisposeAsync();
        }
    }
}
