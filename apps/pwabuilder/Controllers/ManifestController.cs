using Microsoft.AspNetCore.Mvc;

namespace PWABuilder.Controllers;

/// <summary>
/// Controller for PWA web manifest-related actions, such as finding a manifest for a web app or validating a manifest.
/// </summary>
[ApiController]
[Route("[controller]")]
public class ManifestController : ControllerBase
{
    private readonly ILogger<ManifestController> logger;
    public ManifestController(ILogger<ManifestController> logger)
    {
        this.logger = logger;
    }

    [HttpGet]
    public string Get()
    {
        return "Hello, world";
    }
}
