using Azure;
using PuppeteerSharp;
using PWABuilder.Common;

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
                Args = ["--no-sandbox", "--disable-setuid-sandbox"],
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

        public async ValueTask DisposeAsync()
        {
            var browser = await this.reusableBrowser;
            await browser.DisposeAsync();
        }
    }
}
