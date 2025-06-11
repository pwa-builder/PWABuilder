using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using PWABuilder.Services;
using PWABuilder.Utils;
using PWABuilder.Models;
using System.Text.Json;

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
                return StatusCode(paramCheckResult.Status, paramCheckResult);
            }

            _logger.LogInformation("Report: function is processing a request for site: {Site}", site);

            try
            {
                // Run Lighthouse audit
                var auditResult = await _lighthouseService.RunAuditAsync(site, desktop ?? false);

                var root = auditResult.RootElement;
                var audits = root.TryGetProperty("audits", out var auditsElem) ? auditsElem : default;
                var artifacts_lh = root.TryGetProperty("artifacts", out var artifactsElem) ? artifactsElem : default;

                if (audits.ValueKind == JsonValueKind.Undefined)
                {
                    _logger.LogWarning("Lighthouse output missing audits.");
                    var auditFailedOutput = RequestUtils.CreateStatusCodeErrorResult(500, "AuditFailed", "Lighthouse audit failed or timed out.");
                    return StatusCode(auditFailedOutput.Status, auditFailedOutput);
                }

                // Prepare artifacts and features
                var artifacts = new Dictionary<string, object>();
                object? swFeatures = null;

                // Service Worker analysis (pseudo, implement AnalyzeServiceWorkerAsync)
                if (audits.TryGetProperty("service-worker-audit", out var swAudit) &&
                    swAudit.TryGetProperty("details", out var swDetails) &&
                    swDetails.TryGetProperty("scriptUrl", out var swUrlElem))
                {
                    var swUrl = swUrlElem.GetString();
                    artifacts["ServiceWorker"] = new { url = swUrl };
                    try
                    {
                        // swFeatures = await _serviceWorkerAnalyzer.AnalyzeAsync(swUrl);
                    }
                    catch (Exception ex)
                    {
                        swFeatures = new { error = ex.Message };
                    }
                    // artifacts["ServiceWorkerRaw"] = swFeatures?.raw;
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

                // Build the report object
                var report = new
                {
                    audits = new
                    {
                        isOnHttps = new
                        {
                            score = audits.TryGetProperty("https-audit", out var httpsAudit) && httpsAudit.TryGetProperty("score", out _)
                        },
                        // ...
                    },
                    artifacts
                };

                var output = RequestUtils.CreateStatusCodeOKResult(auditResult);

                return StatusCode(output.Status, output);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Report: function failed for {Site} with error: {Error}", site, ex.Message);
                var output = RequestUtils.CreateStatusCodeErrorResult(500, ex.ToString(), ex.Message);

                return StatusCode(output.Status, output);
            }
        }
    }
}
