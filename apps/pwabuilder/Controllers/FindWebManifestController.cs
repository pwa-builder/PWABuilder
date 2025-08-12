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
            http = httpClientFactory.CreateClient();
            this.puppeteer = puppeteer;
        }

        [HttpGet]
        public async Task<ActionResult<ManifestResult>> GetAsync([FromQuery] Uri site, [FromServices] ManifestDetector manifestDetector, CancellationToken cancelToken)
        {
            var manifestDetection = await manifestDetector.TryDetectAsync(site, this.logger, cancelToken);
            if (manifestDetection != null)
            {
                return StatusCode(200, new { Content = manifestDetection });
            }

            return StatusCode(400, "Manifest not found.");
        }
    }
}
