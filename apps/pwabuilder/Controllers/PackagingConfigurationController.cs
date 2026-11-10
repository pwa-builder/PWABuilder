using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PWABuilder.Controllers;

/// <summary>Exposes only the public packager endpoint selected by destination-slot runtime settings.</summary>
[AllowAnonymous]
[Route("api/packaging/config")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class PackagingConfigurationController : ControllerBase
{
    private readonly IConfiguration configuration;
    private readonly IWebHostEnvironment environment;
    private readonly ILogger<PackagingConfigurationController> logger;

    /// <summary>Uses runtime configuration rather than baking an environment into the frontend image.</summary>
    public PackagingConfigurationController(IConfiguration configuration, IWebHostEnvironment environment,
        ILogger<PackagingConfigurationController> logger)
    {
        this.configuration = configuration;
        this.environment = environment;
        this.logger = logger;
    }

    /// <summary>Returns the allowed CloudAPK origin or explicitly disables packaging when misconfigured.</summary>
    [HttpGet]
    public IActionResult Get()
    {
        var endpoint = configuration["Packaging:AndroidServiceUrl"];
        if (environment.IsDevelopment() && string.IsNullOrEmpty(endpoint))
        {
            endpoint = "http://localhost:5858";
        }
        var allowed = endpoint is "https://pwabuilder-cloudapk.azurewebsites.net"
            or "https://pwabuilder-cloudapk-staging.azurewebsites.net"
            || (environment.IsDevelopment() && endpoint is "http://localhost:5858");
        if (!allowed)
        {
            logger.LogError("Packaging:AndroidServiceUrl is missing or unsupported. Android packaging is disabled.");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "Android packaging is not configured for this environment.");
        }
        return Ok(new { androidPackageGeneratorUrl = endpoint });
    }
}
