using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Common;
using PWABuilder.Models;
using PWABuilder.Services;
using PWABuilder.Validations;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FindWebManifestController : ControllerBase
    {
        private readonly ILogger<FindWebManifestController> logger;
        private readonly HttpClient http;
        private readonly IPuppeteerService puppeteer;

        public FindWebManifestController(
            ILogger<FindWebManifestController> logger,
            IHttpClientFactory httpClientFactory,
            IPuppeteerService puppeteer
        )
        {
            this.logger = logger;
            this.http = httpClientFactory.CreateClient();
            this.puppeteer = puppeteer;
        }

        [HttpGet]
        public async Task<ActionResult<ManifestResult>> GetAsync([FromQuery] string site)
        {
            var siteUri = new Uri(site);
            http.DefaultRequestHeaders.Add(
                "User-Agent",
                $"{Constant.DESKTOP_USERAGENT} PWABuilderHttpAgent"
            );

            try
            {
                var response = http.GetAsync(siteUri).Result;
                if (!response.IsSuccessStatusCode)
                {
                    return new BadRequestResult();
                }

                var rawHtml = response.Content.ReadAsStringAsync().Result;
                var linkMatch = Regex.Matches(
                    rawHtml,
                    @"<link\s*rel=""manifest""\s*href=\s*['""](.*?)['""]\/>"
                );
                var link = linkMatch.Count() > 0 ? linkMatch.First().Groups[1].Value : null;
                link = link != null && link.EndsWith("/") ? link.Remove(link.Length - 1) : link;

                if (link == null)
                {
                    throw new Exception("Web Manifest not found by regex, trying with puppeteer");
                }

                var manifestUri = new Uri(siteUri, link);
                var manifest = http.GetAsync(manifestUri).Result;
                if (!manifest.IsSuccessStatusCode)
                {
                    return new BadRequestResult();
                }

                var manifestJson = manifest.Content.ReadFromJsonAsync<object>().Result;
                var validations = ManifestValidations.ValidateManifest(manifestJson);
                var output = new
                {
                    Status = 200,
                    Body = new
                    {
                        Content = new ManifestResult(manifestJson, manifestUri, validations),
                    },
                };

                return StatusCode(output.Status, output.Body);
            }
            catch
            {
                logger.LogWarning(
                    "Web manifest not found by regex, trying with puppeteer for site {Site}",
                    site
                );
                try
                {
                    await puppeteer.CreateAsync();
                    using var page = await puppeteer.GoToSite(site);
                    var jsSelectAllManifestLink =
                        @"Array.from(document.querySelectorAll('link[rel*=manifest]')).map(a => a.href);";
                    var urls = await page.EvaluateExpressionAsync<string[]>(
                        jsSelectAllManifestLink
                    );

                    if (urls == null || urls.Length == 0)
                    {
                        throw new Exception("Web Manifest not found");
                    }

                    var manifestUri = new Uri(siteUri, urls.Last());
                    var manifest = http.GetAsync(manifestUri).Result;
                    if (!manifest.IsSuccessStatusCode)
                    {
                        return new BadRequestResult();
                    }

                    var manifestJson = manifest.Content.ReadFromJsonAsync<object>().Result;
                    var validations = ManifestValidations.ValidateManifest(manifestJson);
                    var output = new
                    {
                        Status = 200,
                        Body = new
                        {
                            Content = new ManifestResult(manifestJson, manifestUri, validations),
                        },
                    };

                    return StatusCode(output.Status, output.Body);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error finding web manifest for site {Site}", site);
                    return StatusCode(400, new { error = new { message = ex.Message } });
                }
            }
        }
    }
}
