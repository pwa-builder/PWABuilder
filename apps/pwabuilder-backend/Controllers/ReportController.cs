using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using PWABuilder.Services;
using PWABuilder.Utils;
using PWABuilder.Models;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ILogger<ReportController> _logger;
        private readonly ILighthouseService _lighthouseService;
        // private readonly IManifestValidationService _manifestValidationService;
        // private readonly IAnalyticsService _analyticsService;
        // private readonly IImageValidationService _imageValidationService;

        public ReportController(
            ILogger<ReportController> logger,
            ILighthouseService lighthouseService
            // IManifestValidationService manifestValidationService,
            // IAnalyticsService analyticsService,
            // IImageValidationService imageValidationService
            )
        {
            _logger = logger;
            _lighthouseService = lighthouseService;
            // _manifestValidationService = manifestValidationService;
            // _analyticsService = analyticsService;
            // _imageValidationService = imageValidationService;
        }

        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] string site,
            [FromQuery] bool? desktop,
            [FromQuery] bool? validation,
            [FromQuery(Name = "ref")] string referrer = null)
        {
            var paramCheckResult = RequestUtils.CheckParams(Request, ["site"]);
            if (paramCheckResult.Status != 200)
            {
                _logger.LogError("Report: {paramCheckResult}", paramCheckResult);
                return StatusCode(paramCheckResult.Status, paramCheckResult.Body);
            }

            _logger.LogInformation("Report: function is processing a request for site: {Site}", site);

            try
            {
                // Run Lighthouse audit
                var auditResult = await _lighthouseService.RunAuditAsync(site, desktop ?? false);

                if (auditResult == null || auditResult.Error != null)
                {
                    throw new Exception(auditResult?.Error ?? "UnexpectedError");
                }

                // Manifest validation
                // if (validation == true && auditResult.ManifestJson != null)
                // {
                //     auditResult.ManifestValidation = await _manifestValidationService.ValidateAsync(auditResult.ManifestJson);
                // }

                // Image validation
                // if (auditResult.ManifestJson != null && auditResult.ManifestUrl != null)
                // {
                //     auditResult.IconsValidation = await _imageValidationService.ValidateIconsAsync(auditResult.ManifestJson, auditResult.ManifestUrl);
                //     auditResult.ScreenshotsValidation = await _imageValidationService.ValidateScreenshotsAsync(auditResult.ManifestJson, auditResult.ManifestUrl);
                // }

                // Analytics
                // var analyticsInfo = new AnalyticsInfo
                // {
                //     Url = site,
                //     PlatformId = Request.Headers["platform-identifier"],
                //     PlatformIdVersion = Request.Headers["platform-identifier-version"],
                //     CorrelationId = Request.Headers["correlation-id"],
                //     Properties = !string.IsNullOrEmpty(referrer) ? new Dictionary<string, string> { { "referrer", referrer } } : null
                // };
                // await _analyticsService.UploadAsync(auditResult, analyticsInfo);

                _logger.LogInformation("Report: function is DONE processing a request for site: {Site}", site);

                var output = new OutputStatus
                {
                    Status = 200,
                    Body = new OutputBody { Data = auditResult }
                };

                return StatusCode(output.Status, output);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Report: function failed for {Site} with error: {Error}", site, ex.Message);

                var output = new OutputStatus
                {
                    Status = 500,
                    Body = new OutputBody
                    {
                        Error = new OutputError
                        {
                            Object = ex.ToString(),
                            Message = ex.Message
                        }
                    }
                };
                return StatusCode(output.Status, output);
            }
        }
    }
}
