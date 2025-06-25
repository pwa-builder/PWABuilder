using Microsoft.AspNetCore.Mvc;
using PWABuilder.Services;
using PWABuilder.Utils;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditServiceWorkerController : ControllerBase
    {
        private readonly ILogger<AuditServiceWorkerController> logger;
        private readonly IServiceWorkerAnalyzer serviceWorkerAnalyzer;

        public AuditServiceWorkerController(
            ILogger<AuditServiceWorkerController> logger,
            IServiceWorkerAnalyzer serviceWorkerAnalyzer
        )
        {
            this.logger = logger;
            this.serviceWorkerAnalyzer = serviceWorkerAnalyzer;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string url)
        {
            var paramCheckResult = RequestUtils.CheckParams(Request, ["url"]);
            if (paramCheckResult.Status != 200)
            {
                logger.LogError("AuditServiceWorker: Missing required 'url' parameter.");
                return StatusCode(paramCheckResult.Status, paramCheckResult);
            }

            logger.LogInformation(
                $"AuditServiceWorker: function is processing a request for url: {url}"
            );

            try
            {
                var swFeatures = await serviceWorkerAnalyzer.AnalyzeServiceWorkerAsync(url);

                var result = new
                {
                    Status = 200,
                    Body = new
                    {
                        content = new
                        {
                            score = swFeatures?.Error == null,
                            details = new { url, features = swFeatures },
                        },
                    },
                };

                logger.LogInformation(
                    $"AuditServiceWorker: function is DONE processing for url: {url}"
                );

                return StatusCode(result.Status, result.Body);
            }
            catch (Exception ex)
            {
                logger.LogError(
                    $"AuditServiceWorker: function has ERRORED while processing for url: {url} with this error: {ex.Message}"
                );

                var output = RequestUtils.CreateStatusCodeErrorResult(
                    500,
                    ex.ToString(),
                    ex.Message
                );
                return StatusCode(output.Status, output);
            }
        }
    }
}
