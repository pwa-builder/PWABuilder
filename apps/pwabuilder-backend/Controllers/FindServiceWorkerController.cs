using Microsoft.AspNetCore.Mvc;
using PWABuilder.Common;
using PWABuilder.Models;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FindWebManifestController
    {
        private readonly ILogger<ManifestController> logger;
        public FindWebManifestController(ILogger<ManifestController> logger)
        {
            this.logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ManifestResult>> GetAsync([FromQuery] string site)
        {
            var siteUri = new Uri(site);
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("User-Agent", $"{Constant.DESKTOP_USERAGENT} PWABuilderHttpAgent");
            var response = client.GetAsync(siteUri).Result;
            if (!response.IsSuccessStatusCode)
            {
                return new BadRequestResult();
            }

            var rawHtml = response.Content.ReadAsStringAsync().Result;
            var link = Finder.getBetween(rawHtml, "rel=\"manifest\"", ">");
            link = Finder.getBetween(link, "href=\"", "\"");
            link = link.EndsWith("/") ? link.Remove(link.Length - 1) : link;

            var manifestUri = new Uri(siteUri, link);
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
