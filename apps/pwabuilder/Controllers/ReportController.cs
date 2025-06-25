using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Models;
using PWABuilder.Services;
using PWABuilder.Utils;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ILogger<ReportController> logger;
        private readonly ILighthouseService lighthouseService;
        private readonly IServiceWorkerAnalyzer serviceWorkerAnalyzer;
        private readonly IAnalyticsService analyticsService;
        private readonly IImageValidationService imageValidationService;

        // private readonly IManifestValidationService manifestValidationService;

        public ReportController(
            ILogger<ReportController> logger,
            ILighthouseService lighthouseService,
            IServiceWorkerAnalyzer serviceWorkerAnalyzer,
            IAnalyticsService analyticsService,
            IImageValidationService imageValidationService
        // IManifestValidationService manifestValidationService,
        )
        {
            this.logger = logger;
            this.lighthouseService = lighthouseService;
            this.serviceWorkerAnalyzer = serviceWorkerAnalyzer;
            this.analyticsService = analyticsService;
            this.imageValidationService = imageValidationService;
            // this.manifestValidationService = manifestValidationService;
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
                logger.LogError("Report: {paramCheckResult}", paramCheckResult);
                return StatusCode(paramCheckResult.Status, paramCheckResult);
            }

            logger.LogInformation(
                "Report: function is processing a request for site: {Site}",
                site
            );

            try
            {
                // Run Lighthouse audit
                var auditResult = await lighthouseService.RunAuditAsync(site, desktop ?? false);

                var root = auditResult.RootElement;
                var audits = root.TryGetProperty("audits", out var auditsElem)
                    ? auditsElem
                    : default;
                var artifacts_lh = root.TryGetProperty("artifacts", out var artifactsElem)
                    ? artifactsElem
                    : default;

                if (audits.ValueKind == JsonValueKind.Undefined)
                {
                    logger.LogWarning("Lighthouse output missing audits.");
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
                        swFeatures = await serviceWorkerAnalyzer.AnalyzeServiceWorkerAsync(swUrl);
                    }
                    catch (Exception ex)
                    {
                        swFeatures = new AnalyzeServiceWorkerResponse { Error = ex.Message };
                    }
                }

                // Manifest validation
                // if (validation == true && auditResult.ManifestJson != null)
                // {
                //     auditResult.ManifestValidation = await manifestValidationService.ValidateAsync(auditResult.ManifestJson);
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
                            await imageValidationService.ValidateIconsMetadataAsync(
                                webAppManifest.json,
                                webAppManifest.url
                            );
                        var screenshotsValidation =
                            await imageValidationService.ValidateScreenshotsMetadataAsync(
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
                await analyticsService.UploadToAppInsights(report, analyticsInfo);

                logger.LogInformation(
                    "Report: function is DONE processing a request for site: {Site}",
                    site
                );

                var output = RequestUtils.CreateStatusCodeOKResult(report);

                return StatusCode(output.Status, output.Body);
            }
            catch (Exception ex)
            {
                logger.LogError(
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
