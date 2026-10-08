using Microsoft.AspNetCore.Mvc;
using PWABuilder.MacOS.Models;
using PWABuilder.MacOS.Services;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.MacOS.Controllers
{
    /// <summary>
    /// REST endpoint for generating native macOS PWA packages (WKWebView Xcode projects).
    /// </summary>
    [ApiController]
    [Route("api/[controller]/[action]")]
    public sealed class MacOSPackageController : ControllerBase
    {
        private readonly ILogger<MacOSPackageController> logger;
        private readonly MacOSPackageCreator packageCreator;
        private readonly ITelemetryService analyticsService;

        /// <summary>
        /// Initializes a new instance of <see cref="MacOSPackageController"/>.
        /// </summary>
        public MacOSPackageController(
            MacOSPackageCreator packageCreator,
            ITelemetryService analyticsService,
            ILogger<MacOSPackageController> logger
        )
        {
            this.packageCreator = packageCreator;
            this.analyticsService = analyticsService;
            this.logger = logger;
        }

        /// <summary>
        /// Generates a macOS Xcode project for the given PWA and returns it as a zip file download.
        /// </summary>
        [HttpPost]
        public async Task<FileResult> Create(MacOSAppPackageOptions options)
        {
            var analyticsInfo = BuildAnalyticsInfo();

            try
            {
                var validatedOptions = ValidateOptions(options);
                var packageBytes = await packageCreator.Create(validatedOptions);

                await analyticsService.Record(
                    validatedOptions.Url.ToString(),
                    success: true,
                    null,
                    analyticsInfo,
                    error: null
                );

                return File(packageBytes, "application/zip", $"{options.Name}-macos-app-package.zip");
            }
            catch (Exception error)
            {
                await analyticsService.Record(
                    options.Url ?? "https://EMPTY_URL",
                    success: false,
                    null,
                    analyticsInfo,
                    error: error.ToString()
                );
                throw;
            }
        }

        private MacOSAppPackageOptions.Validated ValidateOptions(MacOSAppPackageOptions options)
        {
            try
            {
                return options.Validate();
            }
            catch (Exception error)
            {
                logger.LogError(error, "Invalid macOS package options.");
                throw;
            }
        }

        private AnalyticsInfo BuildAnalyticsInfo()
        {
            var info = new AnalyticsInfo();
            if (HttpContext?.Request.Headers is null)
            {
                return info;
            }

            info.PlatformId = HttpContext.Request.Headers.TryGetValue("platform-identifier", out var id)
                ? id.ToString() : null;
            info.PlatformIdVersion = HttpContext.Request.Headers.TryGetValue("platform-identifier-version", out var version)
                ? version.ToString() : null;
            info.CorrelationId = HttpContext.Request.Headers.TryGetValue("correlation-id", out var corrId)
                ? corrId.ToString() : null;
            info.Referrer = HttpContext.Request.Query.TryGetValue("ref", out var referrer)
                ? referrer.ToString() : null;

            return info;
        }
    }
}
