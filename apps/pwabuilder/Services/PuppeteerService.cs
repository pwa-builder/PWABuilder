using PuppeteerSharp;
using PWABuilder.Common;

namespace PWABuilder.Services
{
    public class PuppeteerService : IPuppeteerService
    {
        private static readonly TimeSpan StalePageThreshold = TimeSpan.FromMinutes(10);
        private static readonly int MaxOpenPages = 50;

        private readonly Task<IBrowser> reusableBrowser;
        private readonly ILogger<PuppeteerService> logger;
        private readonly Lock pagesLock = new();
        private readonly List<PageReference> openPages = [];

        public PuppeteerService(Task<IBrowser> reusableBrowser, ILogger<PuppeteerService> logger)
        {
            this.reusableBrowser = reusableBrowser;
            this.logger = logger;
        }

        /// <summary>
        /// Creates a new browser instance. This should only be used when you need your own specially-configured browser, for example, with port for communicating with dev tools. If you only need to navigate to a page, use puppeteerService.NavigateToPage(...).
        /// </summary>
        /// <param name="customLaunchOptions">Any custom launch options.</param>
        /// <returns></returns>
        public static async Task<IBrowser> CreateBrowserAsync(IHostEnvironment env, LaunchOptions? customLaunchOptions = null)
        {
            var chromePath = "/usr/bin/google-chrome-stable"; // production chrome path
            if (env.IsDevelopment()) // If we're in development, fetch it.
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
            var browser = await Puppeteer.LaunchAsync(launchOptions);
            return browser;
        }

        /// <summary>
        /// Creates a new page in the reusable browser instance and navigates it to the given site and waits for DOMContentLoaded.
        /// </summary>
        /// <param name="site"></param>
        /// <returns></returns>
        public async Task<IPage> NavigateAsync(Uri site)
        {
            var browser = await this.reusableBrowser;

            // Safety check: if we have too many pages open, something might be wrong
            var pages = await browser.PagesAsync();
            if (pages.Length > 10)
            {
                logger.LogWarning("There are {pageCount} pages open in the Puppeteer browser. Possible page leak detected.", pages.Length);
            }

            await TryCleanupOldPages();

            // If we still have too many pages after cleanup, force-close the oldest tracked pages.
            if (pages.Length > MaxOpenPages)
            {
                logger.LogWarning("Page count ({pageCount}) exceeds max ({maxPages}) after cleanup. Force-closing oldest pages.", pages.Length, MaxOpenPages);
                await ForceCloseOldestPages(pages.Length - MaxOpenPages + 1);
            }

            var page = await browser.NewPageAsync();
            var pageRef = new PageReference(page, site);
            lock (pagesLock)
            {
                openPages.Add(pageRef);
            }

            try
            {
                // Disable performance monitoring to avoid Protocol error (Performance.enable) issues
                await page.SetCacheEnabledAsync(false);

                await page.SetUserAgentAsync(Constants.DesktopUserAgent);
                await page.GoToAsync(
                    site.ToString(),
                    new NavigationOptions
                    {
                        Timeout = 30000,
                        WaitUntil = [WaitUntilNavigation.DOMContentLoaded, WaitUntilNavigation.Load, /* WaitUntilNavigation.Networkidle2 - COMMENTED OUT: many PWAs have preload service worker scripts that preload all app assets. We don't want to wait for that. */],
                    }
                );

                return page;
            }
            catch
            {
                // Navigation or setup failed — close the page to prevent leaking a Chrome tab.
                RemovePageRef(pageRef);
                await TryClosePageAsync(page, site);
                throw;
            }
        }

        public async Task<IPage?> TryNavigate(Uri site, ILogger logger)
        {
            try
            {
                return await NavigateAsync(site);
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

        /// <summary>
        /// Removes a page reference from the tracking list.
        /// </summary>
        private void RemovePageRef(PageReference pageRef)
        {
            lock (pagesLock)
            {
                openPages.Remove(pageRef);
            }
        }

        /// <summary>
        /// Attempts to close a Puppeteer page, logging any errors.
        /// </summary>
        private async Task TryClosePageAsync(IPage page, Uri url)
        {
            try
            {
                if (!page.IsClosed)
                {
                    await page.CloseAsync();
                }
            }
            catch (Exception closeError)
            {
                logger.LogWarning(closeError, "Error closing Puppeteer page for {url}.", url);
            }
        }

        /// <summary>
        /// Closes pages that have been open longer than <see cref="StalePageThreshold"/>.
        /// </summary>
        private async Task TryCleanupOldPages()
        {
            var cutoff = DateTimeOffset.UtcNow - StalePageThreshold;

            // Identify and remove stale entries under the lock, then close pages outside the lock.
            List<PageReference> stalePages;
            lock (pagesLock)
            {
                stalePages = openPages.Where(p => p.CreatedAt < cutoff).ToList();
                foreach (var stale in stalePages)
                {
                    openPages.Remove(stale);
                }
            }

            foreach (var stale in stalePages)
            {
                logger.LogInformation("Closing stale Puppeteer page for {url} opened {time} ago.", stale.Url, (DateTimeOffset.UtcNow - stale.CreatedAt).ToString(@"hh\:mm"));
                await TryClosePageAsync(stale.Page, stale.Url);
            }
        }

        /// <summary>
        /// Force-closes the oldest tracked pages when the page count exceeds the maximum.
        /// </summary>
        private async Task ForceCloseOldestPages(int countToClose)
        {
            List<PageReference> toClose;
            lock (pagesLock)
            {
                toClose = openPages
                    .OrderBy(p => p.CreatedAt)
                    .Take(countToClose)
                    .ToList();
                foreach (var page in toClose)
                {
                    openPages.Remove(page);
                }
            }

            foreach (var pageRef in toClose)
            {
                logger.LogWarning("Force-closing Puppeteer page for {url} to stay within page limit.", pageRef.Url);
                await TryClosePageAsync(pageRef.Page, pageRef.Url);
            }
        }
    }

    /// <summary>
    /// An open page in Puppeteer. Used for tracking and cleaning up pages that weren't properly closed.
    /// </summary>
    public sealed class PageReference
    {
        /// <summary>
        /// The Puppeteer page. Strong reference to ensure we can always close it.
        /// </summary>
        public IPage Page { get; }

        /// <summary>
        /// When the page was created.
        /// </summary>
        public DateTimeOffset CreatedAt { get; }

        /// <summary>
        /// The URL the page was navigated to.
        /// </summary>
        public Uri Url { get; }

        public PageReference(IPage page, Uri url)
        {
            Page = page;
            CreatedAt = DateTimeOffset.UtcNow;
            Url = url;
        }
    }
}
