using PuppeteerSharp;
using PWABuilder.Common;

namespace PWABuilder.Services
{
    public class PuppeteerService : IPuppeteerService
    {
        private IBrowser? browser;

        private string? chromePath;

        private readonly IHostEnvironment env;

        public PuppeteerService(IHostEnvironment env)
        {
            this.env = env;
        }

        public async Task CreateAsync(LaunchOptions? customLaunchOptions = null)
        {
            if (env.IsProduction())
            {
                chromePath = "/usr/bin/google-chrome-stable";
            }
            else
            {
                // download the browser executable
                var fetcher = new BrowserFetcher();
                var revisionInfo = await fetcher.DownloadAsync();
                chromePath = fetcher.GetExecutablePath(revisionInfo.BuildId);
            }

            // browser execution configs
            var defaultLaunchOptions = new LaunchOptions
            {
                Headless = true, // = false for testing
                Args = ["--no-sandbox", "--disable-setuid-sandbox"],
            };
            var launchOptions = customLaunchOptions ?? defaultLaunchOptions;

            launchOptions.ExecutablePath = chromePath;

            // open a new page in the controlled browser
            var browser = await Puppeteer.LaunchAsync(launchOptions);

            this.browser = browser;
        }

        public async Task<IPage> GoToSite(string site)
        {
            if (browser == null)
                await CreateAsync();

            var page = await browser.NewPageAsync();
            await page.SetUserAgentAsync(Constant.DESKTOP_USERAGENT);
            await page.GoToAsync(
                site,
                new NavigationOptions
                {
                    Timeout = 30000,
                    WaitUntil = [WaitUntilNavigation.DOMContentLoaded],
                }
            );

            await Task.Delay(1000);

            return page;
        }

        public IBrowser GetBrowser()
        {
            return browser;
        }

        public async ValueTask DisposeAsync()
        {
            if (browser != null)
                await browser.DisposeAsync();
        }
    }
}
