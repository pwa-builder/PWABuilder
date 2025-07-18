using Microsoft.AspNetCore.Mvc;
using PWABuilder.Android.Models;
using PWABuilder.Android.Services;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.Android.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class AndroidPackageController : ControllerBase
    {
        private readonly ILogger<AndroidPackageController> logger;
        private readonly IAndroidPackageCreator packageCreator;
        private readonly IAndroidZipService zipService;
        private readonly IAnalyticsService analyticsService;

        public AndroidPackageController(
            IAndroidPackageCreator packageCreator,
            IAndroidZipService zipService,
            IAnalyticsService analyticsService,
            ILogger<AndroidPackageController> logger
        )
        {
            this.packageCreator = packageCreator;
            this.zipService = zipService;
            this.analyticsService = analyticsService;
            this.logger = logger;
        }

        [HttpPost]
        [Route("/generateAppPackage")]
        [Route("/generateApkZip")]
        public async Task<FileResult> Create(AndroidPackageOptions options)
        {
            var analyticsInfo = new AnalyticsInfo();

            if (HttpContext?.Request.Headers != null)
            {
                analyticsInfo.PlatformId = Request.Headers.TryGetValue(
                    "platform-identifier",
                    out var id
                )
                    ? id.ToString()
                    : null;
                analyticsInfo.PlatformIdVersion = Request.Headers.TryGetValue(
                    "platform-identifier-version",
                    out var version
                )
                    ? version.ToString()
                    : null;
                analyticsInfo.CorrelationId = Request.Headers.TryGetValue(
                    "correlation-id",
                    out var corrId
                )
                    ? corrId.ToString()
                    : null;
                analyticsInfo.Referrer = Request.Query.TryGetValue("ref", out var referrer)
                    ? referrer.ToString()
                    : null;
            }

            AndroidPackageOptions.Validated validatedOptions;
            try
            {
                validatedOptions = options.Validate();
            }
            catch (Exception ex)
            {
                var errorMessage = $"Invalid PWA settings: {ex.Message}";
                logger.LogError(ex, "Validation failed for Android package request.");
                await analyticsService.Record(
                    options?.PwaUrl ?? options?.Host ?? "UNKNOWN",
                    false,
                    null,
                    analyticsInfo,
                    errorMessage
                );
                return StatusCode(500, errorMessage);
            }

            try
            {
                var appPackage = await packageCreator.Create(validatedOptions);
                var zipFilePath = await zipService.CreateZipAsync(appPackage, validatedOptions);

                await analyticsService.Record(
                    validatedOptions.PwaUrl?.ToString()
                        ?? validatedOptions.Host?.ToString()
                        ?? "UNKNOWN",
                    true,
                    validatedOptions,
                    analyticsInfo,
                    null
                );
                logger.LogInformation("APK Package process completed successfully.");
                return File(
                    zipFilePath,
                    "application/zip",
                    $"{validatedOptions.Name}-android-app-package.zip"
                );
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error generating Android app package.");
                var errorMessage = $"Error generating app package: {ex.Message}";
                await analyticsService.Record(
                    validatedOptions.PwaUrl?.ToString()
                        ?? validatedOptions.Host?.ToString()
                        ?? "UNKNOWN",
                    false,
                    validatedOptions,
                    analyticsInfo,
                    errorMessage
                );
                return StatusCode(500, errorMessage);
            }
        }
    }
}
