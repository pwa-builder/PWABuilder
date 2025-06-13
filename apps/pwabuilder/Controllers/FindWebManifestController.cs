using Microsoft.AspNetCore.Mvc;
using PWABuilder.Common;
using PWABuilder.Models;
using PWABuilder.Services;
using System.Text.RegularExpressions;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FindWebManifestController
    {
        private readonly ILogger<FindWebManifestController> logger;
        private readonly PuppeteerService puppeteer;
        public FindWebManifestController(ILogger<FindWebManifestController> logger, PuppeteerService puppeteer)
        {
            this.logger = logger;
            this.puppeteer = puppeteer;
        }

        [HttpGet]
        public async Task<ActionResult<ManifestResult>> GetAsync([FromQuery] string site)
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
                var linkMatch = Regex.Matches(rawHtml, @"<link\s*rel=""manifest""\s*href=\s*['""](.*?)['""]>");
                var link = linkMatch.Count() > 0 ? linkMatch.First().Groups[1].Value : null;
                link = link != null && link.EndsWith("/") ? link.Remove(link.Length - 1) : link;

                var manifestUri = new Uri(siteUri, link);
                var manifest = client.GetAsync(manifestUri).Result;
                if (!manifest.IsSuccessStatusCode)
                {
                    return new BadRequestResult();
                }

                var manifestJson = manifest.Content.ReadFromJsonAsync<object>().Result;
                return new ManifestResult(manifestJson, manifestUri);
            }
            catch (Exception ex)
            {
                await puppeteer.CreateAsync();
                using var page = await puppeteer.GoToSite(site);
                var jsSelectAllManifestLink = @"Array.from(document.querySelectorAll('link[rel*=manifest]')).map(a => a.href);";
                var urls = await page.EvaluateExpressionAsync<string[]>(jsSelectAllManifestLink);

                var manifestUri = new Uri(siteUri, urls.Last());
                var manifest = client.GetAsync(manifestUri).Result;
                if (!manifest.IsSuccessStatusCode)
                {
                    return new BadRequestResult();
                }

                var manifestJson = manifest.Content.ReadFromJsonAsync<object>().Result;
                return new ManifestResult(manifestJson, manifestUri);
            }
        }
    }
}
