using Microsoft.AspNetCore.Mvc;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ManifestsController : ControllerBase
{
    /// <summary>
    /// Creates a new web manifest for the specified URL.
    /// </summary>
    /// <param name="url">The URL of the site to create the web manifest for.</param>
    /// <param name="manifestCreatorService">The manifest creation service.</param>
    /// <returns>A new web manifest for the specified site.</returns>
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromQuery] Uri url, [FromServices] ManifestCreator manifestCreatorService)
    {
        if (!url.IsAbsoluteUri)
        {
            url = new Uri($"https://{url}", UriKind.Absolute);
        }

        var manifest = await manifestCreatorService.Create(url);
        return Ok(manifest);
    }
}