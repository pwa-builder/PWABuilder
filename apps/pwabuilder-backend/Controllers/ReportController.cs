using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
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
            // [FromQuery] bool? validation,
            [FromQuery(Name = "ref")] string referrer = null
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

                // Prepare artifacts and features
                var artifacts = new Dictionary<string, object>();
                object? swFeatures = null;

                // Service Worker analysis (pseudo, implement AnalyzeServiceWorkerAsync)
                if (
                    audits.TryGetProperty("service-worker-audit", out var swAudit)
                    && swAudit.TryGetProperty("details", out var swDetails)
                    && swDetails.TryGetProperty("scriptUrl", out var swUrlElem)
                )
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

                _logger.LogInformation(
                    "Report: function is DONE processing a request for site: {Site}",
                    site
                );

                // Build the report object
                var report = new Report
                {
                    audits = new Audits
                    {
                        isOnHttps = new ScoreObj
                        {
                            score =
                                audits.TryGetProperty("https-audit", out var httpsAudit)
                                && httpsAudit.ValueKind == JsonValueKind.Object
                                && httpsAudit.TryGetProperty("score", out var scoreProp)
                                && scoreProp.ValueKind == JsonValueKind.True,
                        },
                        noMixedContent = new ScoreObj
                        {
                            score =
                                audits.TryGetProperty("is-on-https", out var mixedContentAudit)
                                && mixedContentAudit.ValueKind == JsonValueKind.Object
                                && mixedContentAudit.TryGetProperty("score", out var mixedScore)
                                && (
                                    mixedScore.ValueKind == JsonValueKind.True
                                    || mixedScore.ValueKind == JsonValueKind.False
                                ),
                        },
                        installableManifest = new InstallableManifestAudit
                        {
                            score =
                                audits.TryGetProperty(
                                    "installable-manifest",
                                    out var installableManifestAudit
                                )
                                && installableManifestAudit.ValueKind == JsonValueKind.Object
                                && installableManifestAudit.TryGetProperty("score", out var imScore)
                                && (
                                    imScore.ValueKind == JsonValueKind.True
                                    || imScore.ValueKind == JsonValueKind.False
                                ),
                            details = new InstallableManifestDetails
                            {
                                url =
                                    installableManifestAudit.ValueKind == JsonValueKind.Object
                                    && installableManifestAudit.TryGetProperty(
                                        "details",
                                        out var installableDetails
                                    )
                                    && installableDetails.ValueKind == JsonValueKind.Object
                                    && installableDetails.TryGetProperty(
                                        "debugData",
                                        out var debugData
                                    )
                                    && debugData.ValueKind == JsonValueKind.Object
                                    && debugData.TryGetProperty(
                                        "manifestUrl",
                                        out var manifestUrlElem
                                    )
                                        ? manifestUrlElem.GetString()
                                        : null,
                                validation =
                                    installableManifestAudit.ValueKind == JsonValueKind.Object
                                    && installableManifestAudit.TryGetProperty(
                                        "details",
                                        out var installableDetails2
                                    )
                                    && installableDetails2.ValueKind == JsonValueKind.Object
                                    && installableDetails2.TryGetProperty(
                                        "validation",
                                        out var validationElem
                                    )
                                        ? validationElem.ToString()
                                        : null,
                            },
                        },
                        serviceWorker = new ServiceWorkerAudit
                        {
                            score =
                                audits.TryGetProperty("service-worker-audit", out var swAuditObj)
                                && swAuditObj.ValueKind == JsonValueKind.Object
                                && swAuditObj.TryGetProperty("score", out var swScore)
                                && (
                                    swScore.ValueKind == JsonValueKind.True
                                    || swScore.ValueKind == JsonValueKind.False
                                ),
                            details = new ServiceWorkerDetails
                            {
                                url =
                                    swAuditObj.ValueKind == JsonValueKind.Object
                                    && swAuditObj.TryGetProperty("details", out var swDetailsObj)
                                    && swDetailsObj.ValueKind == JsonValueKind.Object
                                    && swDetailsObj.TryGetProperty(
                                        "scriptUrl",
                                        out var scriptUrlElem
                                    )
                                        ? scriptUrlElem.GetString()
                                        : null,
                                scope =
                                    swAuditObj.ValueKind == JsonValueKind.Object
                                    && swAuditObj.TryGetProperty("details", out var swDetailsObj2)
                                    && swDetailsObj2.ValueKind == JsonValueKind.Object
                                    && swDetailsObj2.TryGetProperty(
                                        "scopeUrl",
                                        out var scopeUrlElem
                                    )
                                        ? scopeUrlElem.GetString()
                                        : null,
                                features = swFeatures,
                                error =
                                    swAuditObj.ValueKind == JsonValueKind.Object
                                    && swAuditObj.TryGetProperty("details", out var swDetailsObj3)
                                    && swDetailsObj3.ValueKind == JsonValueKind.Object
                                    && swDetailsObj3.TryGetProperty("error", out var errorElem)
                                        ? errorElem.GetString()
                                        : null,
                            },
                        },
                        offlineSupport = new ScoreObj
                        {
                            score =
                                audits.TryGetProperty("offline-audit", out var offlineAudit)
                                && offlineAudit.ValueKind == JsonValueKind.Object
                                && offlineAudit.TryGetProperty("score", out var offlineScore)
                                && (
                                    offlineScore.ValueKind == JsonValueKind.True
                                    || offlineScore.ValueKind == JsonValueKind.False
                                ),
                        },
                        images = new ImagesAudit
                        {
                            score =
                                audits.TryGetProperty("images-audit", out var imagesAudit)
                                && imagesAudit.ValueKind == JsonValueKind.Object
                                && imagesAudit.TryGetProperty("score", out var imagesScore)
                                && (
                                    imagesScore.ValueKind == JsonValueKind.True
                                    || imagesScore.ValueKind == JsonValueKind.False
                                ),
                            details = new ImagesDetails
                            {
                                iconsValidation =
                                    imagesAudit.ValueKind == JsonValueKind.Object
                                    && imagesAudit.TryGetProperty("details", out var imagesDetails)
                                    && imagesDetails.ValueKind == JsonValueKind.Object
                                    && imagesDetails.TryGetProperty(
                                        "iconsValidation",
                                        out var iconsValidationElem
                                    )
                                        ? iconsValidationElem.ToString()
                                        : null,
                                screenshotsValidation =
                                    imagesAudit.ValueKind == JsonValueKind.Object
                                    && imagesAudit.TryGetProperty("details", out var imagesDetails2)
                                    && imagesDetails2.ValueKind == JsonValueKind.Object
                                    && imagesDetails2.TryGetProperty(
                                        "screenshotsValidation",
                                        out var screenshotsValidationElem
                                    )
                                        ? screenshotsValidationElem.ToString()
                                        : null,
                            },
                        },
                    },
                    artifacts = new Artifacts
                    {
                        webAppManifest =
                            artifacts_lh.ValueKind == JsonValueKind.Object
                            && artifacts_lh.TryGetProperty("Manifest", out var manifestElem)
                            && manifestElem.ValueKind == JsonValueKind.Object
                                ? new
                                {
                                    url = manifestElem.TryGetProperty("url", out var urlElem)
                                        ? urlElem.GetString()
                                        : null,
                                    raw = manifestElem.TryGetProperty("raw", out var rawElem)
                                        ? rawElem.GetString()
                                        : null,
                                }
                                : null,
                        serviceWorker =
                            artifacts_lh.ValueKind == JsonValueKind.Object
                            && artifacts_lh.TryGetProperty("ServiceWorker", out var swElem)
                                ? swElem.ToString()
                                : null,
                    },
                };
                var output = RequestUtils.CreateStatusCodeOKResult(auditResult);

                return StatusCode(output.Status, output);
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
