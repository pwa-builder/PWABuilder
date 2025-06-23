using PuppeteerSharp;
using PWABuilder.Common;

namespace PWABuilder.Services
{
    public class PuppeteerService: IAsyncDisposable
    {

        private IBrowser browser;
        
        public PuppeteerService()
        {
        }

        public async Task CreateAsync()
        {
            // download the browser executable
            await new BrowserFetcher().DownloadAsync();

            // browser execution configs
            var launchOptions = new LaunchOptions
            {
                Headless = false, // = false for testing
                Args = ["--no-sandbox", "--disable-setuid-sandbox"]
            };

            // open a new page in the controlled browser
            var browser = await Puppeteer.LaunchAsync(launchOptions);
            

            this.browser = browser;
        }

        public async Task<IPage> GoToSite(string site)
        {
            if (this.browser == null) await this.CreateAsync();

            var page = await this.browser.NewPageAsync();
            await page.SetUserAgentAsync(Constant.DESKTOP_USERAGENT);
            await page.GoToAsync(site, 15000, [WaitUntilNavigation.Load]);
            await page.WaitForNetworkIdleAsync(new() { IdleTime = 1000 });

            return page;
        }

        public IBrowser GetBrowser()
        {
            return this.browser;
        }

        public async ValueTask DisposeAsync()
        {
            if (this.browser != null) await this.browser.DisposeAsync();
        }
    }
}