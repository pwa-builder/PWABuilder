using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Models;
using PWABuilder.Services;
using PWABuilder.Utils;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ILogger<ReportController> _logger;
        private readonly ILighthouseService _lighthouseService;
        private readonly IServiceWorkerAnalyzer _serviceWorkerAnalyzer;
        private readonly IAnalyticsService _analyticsService;

        // private readonly IManifestValidationService _manifestValidationService;
        private readonly IImageValidationService _imageValidationService;

        public ReportController(
            ILogger<ReportController> logger,
            ILighthouseService lighthouseService,
            IServiceWorkerAnalyzer serviceWorkerAnalyzer,
            IAnalyticsService analyticsService,
            // IManifestValidationService manifestValidationService,
            IImageValidationService imageValidationService
        )
        {
            _logger = logger;
            _lighthouseService = lighthouseService;
            _serviceWorkerAnalyzer = serviceWorkerAnalyzer;
            _analyticsService = analyticsService;
            // _manifestValidationService = manifestValidationService;
            _imageValidationService = imageValidationService;
        }

        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] string site,
            [FromQuery] bool? desktop,
            // [FromQuery] bool? validation,
            [FromQuery(Name = "ref")] string? referrer = null
        )
        {
            var paramCheckResult = RequestUtils.CheckParams(Request, ["site"]);
            if (paramCheckResult.Status != 200)
            {
                _logger.LogError("Report: {paramCheckResult}", paramCheckResult);
                return StatusCode(paramCheckResult.Status, paramCheckResult);
            }

            _logger.LogInformation(
                "Report: function is processing a request for site: {Site}",
                site
            );

            try
            {
                // Run Lighthouse audit
                var auditResult = await _lighthouseService.RunAuditAsync(site, desktop ?? false);

                var root = auditResult.RootElement;
                var audits = root.TryGetProperty("audits", out var auditsElem)
                    ? auditsElem
                    : default;
                var artifacts_lh = root.TryGetProperty("artifacts", out var artifactsElem)
                    ? artifactsElem
                    : default;

                if (audits.ValueKind == JsonValueKind.Undefined)
                {
                    _logger.LogWarning("Lighthouse output missing audits.");
                    var auditFailedOutput = RequestUtils.CreateStatusCodeErrorResult(
                        500,
                        "AuditFailed",
                        "Lighthouse audit failed or timed out."
                    );
                    return StatusCode(auditFailedOutput.Status, auditFailedOutput);
                }

                // Service Worker features analysis
                AnalyzeServiceWorkerResponse? swFeatures = null;
                var swUrl = ReportUtils.TryGetServiceWorkerUrl(audits);

                if (!string.IsNullOrEmpty(swUrl))
                {
                    try
                    {
                        swFeatures = await _serviceWorkerAnalyzer.AnalyzeServiceWorkerAsync(swUrl);
                    }
                    catch (Exception ex)
                    {
                        swFeatures = new AnalyzeServiceWorkerResponse { Error = ex.Message };
                    }
                }

                // Manifest validation
                // if (validation == true && auditResult.ManifestJson != null)
                // {
                //     auditResult.ManifestValidation = await _manifestValidationService.ValidateAsync(auditResult.ManifestJson);
                // }

                // Image validation
                var webAppManifest = ReportUtils.TryGetWebManifest(artifacts_lh);
                var imagesAudit = new ImagesAudit
                {
                    details = new ImagesDetails
                    {
                        iconsValidation = null,
                        screenshotsValidation = null,
                    },
                    score = false,
                };

                if (
                    webAppManifest != null
                    && webAppManifest.json != null
                    && webAppManifest.url != null
                )
                {
                    try
                    {
                        var iconsValidation =
                            await _imageValidationService.ValidateIconsMetadataAsync(
                                webAppManifest.json,
                                webAppManifest.url
                            );
                        var screenshotsValidation =
                            await _imageValidationService.ValidateScreenshotsMetadataAsync(
                                webAppManifest.json,
                                webAppManifest.url
                            );

                        bool score = false;
                        if (iconsValidation != null && screenshotsValidation != null)
                        {
                            score =
                                (iconsValidation.valid ?? false)
                                && (screenshotsValidation.valid ?? false);
                        }

                        imagesAudit.details = new ImagesDetails
                        {
                            iconsValidation = iconsValidation,
                            screenshotsValidation = screenshotsValidation,
                        };
                        imagesAudit.score = score;
                    }
                    catch { }
                }

                // Build the report object
                var report = ReportUtils.MapReportOutput(
                    audits,
                    webAppManifest,
                    swUrl,
                    swFeatures,
                    imagesAudit
                );

                // Analytics
                var analyticsInfo = new AnalyticsInfo
                {
                    Url = new Uri(site),
                    PlatformId = Request.Headers["platform-identifier"],
                    PlatformIdVersion = Request.Headers["platform-identifier-version"],
                    CorrelationId = Request.Headers["correlation-id"],
                    Properties = !string.IsNullOrEmpty(referrer)
                        ? new Dictionary<string, string> { { "referrer", referrer } }
                        : null,
                };
                await _analyticsService.UploadToAppInsights(report, analyticsInfo);

                _logger.LogInformation(
                    "Report: function is DONE processing a request for site: {Site}",
                    site
                );

                var output = RequestUtils.CreateStatusCodeOKResult(report);

                return StatusCode(output.Status, output.Body);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Report: function failed for {Site} with error: {Error}",
                    site,
                    ex.Message
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
