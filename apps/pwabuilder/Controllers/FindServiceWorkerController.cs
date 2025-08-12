using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Common;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FindServiceWorkerController : ControllerBase
    {
        private readonly ILogger<FindServiceWorkerController> logger;
        private readonly HttpClient http;
        private readonly IPuppeteerService puppeteer;

        public FindServiceWorkerController(
            ILogger<FindServiceWorkerController> logger,
            IHttpClientFactory httpClientFactory,
            IPuppeteerService puppeteer
        )
        {
            this.logger = logger;
            http = httpClientFactory.CreateClient();
            this.puppeteer = puppeteer;
        }

        [HttpGet]
        public async Task<ActionResult<ServiceWorkerHttpResult>> GetAsync([FromQuery] string site)
        {
            var siteUri = new Uri(site);
            http.DefaultRequestHeaders.Add(
                "User-Agent",
                $"{Constants.DesktopUserAgent} PWABuilderHttpAgent"
            );

            try
            {
                var response = http.GetAsync(siteUri).Result;
                if (!response.IsSuccessStatusCode)
                {
                    return new BadRequestResult();
                }

                var rawHtml = response.Content.ReadAsStringAsync().Result;
                var match = Regex.Matches(
                    rawHtml,
                    @"navigator\s*\.\s*serviceWorker\s*\.\s*register\(\s*['""](.*?)['""]"
                );
                match =
                    match.Count() == 0
                        ? Regex.Matches(rawHtml, @"new Workbox\s*\(\s*['""](.*)['""]")
                        : match;
                var link = match.Count() > 0 ? match.First().Groups[1] : null;
                if (link == null)
                {
                    throw new Exception("Service worker not found by regex, trying with puppeteer");
                }

                var serviceWorkerUri = new Uri(siteUri, link.Value);
                var serviceWorker = http.GetAsync(serviceWorkerUri).Result;
                if (!serviceWorker.IsSuccessStatusCode)
                {
                    return new BadRequestResult();
                }

                var rawServiceWorker = serviceWorker.Content.ReadAsStringAsync().Result;
                var output = new ServiceWorkerHttpResult()
                {
                    Status = 200,
                    Body = new ServiceWorkerBodyResult()
                    {
                        Content = new ServiceWorkerContentResult()
                        {
                            Raw = rawServiceWorker,
                            Url = serviceWorkerUri,
                        },
                    },
                };

                return StatusCode(output.Status, output.Body);
            }
            catch
            {
                logger.LogWarning(
                    "Service worker not found by regex, trying with puppeteer for site {Site}",
                    site
                );
                try
                {
                    var page = await puppeteer.Navigate(siteUri);
                    var jsGetServiceWorker =
                        @"('serviceWorker' in navigator ? navigator.serviceWorker.getRegistration().then((registration) => registration ? registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL : null ) : Promise.resolve(null))";
                    var serviceWorkerUrl = await page.EvaluateExpressionAsync<string>(
                        jsGetServiceWorker
                    );

                    if (serviceWorkerUrl == null)
                    {
                        throw new Exception("Service worker not found");
                    }

                    var serviceWorkerUri = new Uri(siteUri, serviceWorkerUrl);
                    var serviceWorker = http.GetAsync(serviceWorkerUri).Result;
                    if (!serviceWorker.IsSuccessStatusCode)
                    {
                        return new BadRequestResult();
                    }

                    var rawServiceWorker = serviceWorker.Content.ReadAsStringAsync().Result;

                    var output = new ServiceWorkerHttpResult()
                    {
                        Status = 200,
                        Body = new ServiceWorkerBodyResult()
                        {
                            Content = new ServiceWorkerContentResult()
                            {
                                Raw = rawServiceWorker,
                                Url = serviceWorkerUri,
                            },
                        },
                    };

                    return StatusCode(output.Status, output.Body);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error finding service worker for site {Site}", site);
                    return StatusCode(400, new { error = new { message = ex.Message } });
                }
            }
        }
    }
}
