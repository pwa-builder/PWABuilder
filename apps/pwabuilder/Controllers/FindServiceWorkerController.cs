using Microsoft.AspNetCore.Mvc;
using PWABuilder.Common;
using PWABuilder.Models;
using PWABuilder.Services;
using System.Text.RegularExpressions;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FindServiceWorkerController
    {
        private readonly ILogger<FindServiceWorkerController> logger;

        private readonly PuppeteerService puppeteer;

        public FindServiceWorkerController(ILogger<FindServiceWorkerController> logger, PuppeteerService puppeteer)
        {
            this.logger = logger;
            this.puppeteer = puppeteer;
        }

        [HttpGet]
        public async Task<ActionResult<ServiceWorkerResult>> GetAsync([FromQuery] string site)
        {
            var siteUri = new Uri(site);
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("User-Agent", $"{Constant.DESKTOP_USERAGENT} PWABuilderHttpAgent");

            try
            {
                var response = client.GetAsync(siteUri).Result;
                if (!response.IsSuccessStatusCode)
                {
                    return new BadRequestResult();
                }

                var rawHtml = response.Content.ReadAsStringAsync().Result;
                var match = Regex.Matches(rawHtml, @"navigator\s*\.\s*serviceWorker\s*\.\s*register\(\s*['""](.*?)['""]");
                match = match.Count() == 0 ? Regex.Matches(rawHtml, @"new Workbox\s*\(\s*['""](.*)['""]") : match;
                var link = match.Count() > 0 ? match.First().Groups[1] : null;
                if (link == null)
                {
                    return new BadRequestResult();
                }

                var serviceWorkerUri = new Uri(siteUri, link.Value);
                var serviceWorker = client.GetAsync(serviceWorkerUri).Result;
                if (!serviceWorker.IsSuccessStatusCode)
                {
                    return new BadRequestResult();
                }

                var rawServiceWorker = serviceWorker.Content.ReadAsStringAsync().Result;

                return new ServiceWorkerResult() { Status = 200, Body = new ServiceWorkerBodyResult() { Content = new ServiceWorkerContentResult() { Raw = rawServiceWorker, Url = serviceWorkerUri } } };

            }
            catch (Exception ex)
            {
                await puppeteer.CreateAsync();
                var page = await puppeteer.GoToSite(site);
                var jsGetServiceWorker = @"('serviceWorker' in navigator ? navigator.serviceWorker.getRegistration().then((registration) => registration ? registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting.scriptURL : null ) : Promise.resolve(null))";
                var serviceWorkerUrl = await page.EvaluateExpressionAsync<string>(jsGetServiceWorker);

                var serviceWorkerUri = new Uri(siteUri, serviceWorkerUrl);
                var serviceWorker = client.GetAsync(serviceWorkerUri).Result;
                if (!serviceWorker.IsSuccessStatusCode)
                {
                    return new BadRequestResult();
                }

                var rawServiceWorker = serviceWorker.Content.ReadAsStringAsync().Result;

                return new ServiceWorkerResult() { Status = 200, Body = new ServiceWorkerBodyResult() { Content = new ServiceWorkerContentResult() { Raw = rawServiceWorker, Url = serviceWorkerUri } } };
            }
            

        }
    }
}