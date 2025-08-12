using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PWABuilder.Models;
using PWABuilder.Services;
using PWABuilder.Utils;
using PWABuilder.Validations;
using PWABuilder.Validations.Models;
using PWABuilder.Validations.Services;

namespace PWABuilder.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ILogger<ReportController> logger;
        private readonly ILighthouseService lighthouseService;
        private readonly IServiceWorkerAnalyzer serviceWorkerAnalyzer;
        private readonly ITelemetryService analyticsService;
        private readonly IImageValidationService imageValidationService;

        // private readonly IManifestValidationService manifestValidationService;

        public ReportController(
            ILogger<ReportController> logger,
            ILighthouseService lighthouseService,
            IServiceWorkerAnalyzer serviceWorkerAnalyzer,
            ITelemetryService analyticsService,
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
        public async Task<ActionResult<Report>> GetAsync(
            [FromQuery] Uri site,
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
                var lighthouseReport = await lighthouseService.RunAuditAsync(site, desktop == true ? BrowserFormFactor.Desktop : BrowserFormFactor.Mobile);
                if (lighthouseReport.Audits == null)
                {
                    logger.LogError("Lighthouse output missing audits.");
                    var auditFailedOutput = RequestUtils.CreateStatusCodeErrorResult(
                        500,
                        "AuditFailed",
                        "Lighthouse audit failed or timed out."
                    );
                    return StatusCode(auditFailedOutput.Status, auditFailedOutput);
                }

                // Service Worker features analysis
                ServiceWorkerValidationResult serviceWorkerValidationResult;
                try
                {
                    serviceWorkerValidationResult =
                        await ServiceWorkerValidation.ValidateServiceWorkerAsync(
                            serviceWorkerAnalyzer,
                            lighthouseReport.ServiceWorkerAudit?.Details?.ScriptUrl,
                            lighthouseReport
                        );
                }
                catch (Exception ex)
                {
                    serviceWorkerValidationResult = new ServiceWorkerValidationResult
                    {
                        Error = ex.Message,
                    };
                }

                // Image validation
                var webAppManifestDetails = ReportUtils.TryGetWebManifest(lighthouseReport);
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
                    webAppManifestDetails != null
                    && webAppManifestDetails.json != null
                    && webAppManifestDetails.url != null
                )
                {
                    try
                    {
                        var iconsValidation =
                            await imageValidationService.ValidateIconsMetadataAsync(
                                webAppManifestDetails.json,
                                webAppManifestDetails.url
                            );
                        var screenshotsValidation =
                            await imageValidationService.ValidateScreenshotsMetadataAsync(
                                webAppManifestDetails.json,
                                webAppManifestDetails.url
                            );

                        bool score = false;
                        if (iconsValidation != null && screenshotsValidation != null)
                        {
                            score =
                                (iconsValidation.Valid ?? false)
                                && (screenshotsValidation.Valid ?? false);
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

                var manifestValidations = ManifestValidations.ValidateManifest(webAppManifestDetails?.json);
                var securityValidations = SecurityValidation.ValidateSecurityAsync(lighthouseReport);

                // Build the report object
                var report = ReportUtils.MapReportOutput(
                    lighthouseReport,
                    webAppManifestDetails,
                    lighthouseReport.ServiceWorkerAudit?.Details?.ScriptUrl,
                    serviceWorkerValidationResult,
                    imagesAudit,
                    manifestValidations,
                    securityValidations
                );

                // Analytics
                var analyticsInfo = new AnalyticsInfo
                {
                    Url = site,
                    PlatformId = Request.Headers["platform-identifier"],
                    PlatformIdVersion = Request.Headers["platform-identifier-version"],
                    CorrelationId = Request.Headers["correlation-id"],
                    Properties = !string.IsNullOrEmpty(referrer)
                        ? new Dictionary<string, string> { { "referrer", referrer } }
                        : null,
                };
                await analyticsService.UploadToAppInsights(
                    report,
                    analyticsInfo,
                    serviceWorkerValidationResult?.SWFeatures
                );

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
