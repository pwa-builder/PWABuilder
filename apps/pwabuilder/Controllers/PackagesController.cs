using Microsoft.AspNetCore.Mvc;
using PWABuilder.IOS.Models;
using PWABuilder.IOS.Services;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.IOS.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    public class PackagesController : ControllerBase
    {
        private readonly ILogger<PackagesController> logger;
        private readonly IOSPackageCreator packageCreator;
        private readonly IAnalyticsService analyticsService;

        public PackagesController(
            IOSPackageCreator packageCreator,
            IAnalyticsService analyticsService,
            ILogger<PackagesController> logger
        )
        {
            this.packageCreator = packageCreator;
            this.analyticsService = analyticsService;
            this.logger = logger;
        }

        [HttpPost]
        public async Task<FileResult> Create(IOSAppPackageOptions options)
        {
            var analyticsInfo = new AnalyticsInfo();

            if (HttpContext?.Request.Headers != null)
            {
                analyticsInfo.PlatformId = HttpContext.Request.Headers.TryGetValue(
                    "platform-identifier",
                    out var id
                )
                    ? id.ToString()
                    : null;
                analyticsInfo.PlatformIdVersion = HttpContext.Request.Headers.TryGetValue(
                    "platform-identifier-version",
                    out var version
                )
                    ? version.ToString()
                    : null;
                analyticsInfo.CorrelationId = HttpContext.Request.Headers.TryGetValue(
                    "correlation-id",
                    out var corrId
                )
                    ? corrId.ToString()
                    : null;
                analyticsInfo.Referrer = HttpContext.Request.Query.TryGetValue(
                    "ref",
                    out var referrer
                )
                    ? referrer.ToString()
                    : null;
            }

            try
            {
                var optionsValidated = ValidateOptions(options);
                var packageBytes = await packageCreator.Create(optionsValidated);
                await analyticsService.Record(
                    optionsValidated.Url.ToString(),
                    success: true,
                    optionsValidated,
                    analyticsInfo,
                    error: null
                );
                return File(packageBytes, "application/zip", $"{options.Name}-ios-app-package.zip");
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

        private IOSAppPackageOptions.Validated ValidateOptions(IOSAppPackageOptions options)
        {
            try
            {
                return options.Validate();
            }
            catch (Exception error)
            {
                logger.LogError(error, "Invalid package options");
                throw;
            }
        }
    }
}
