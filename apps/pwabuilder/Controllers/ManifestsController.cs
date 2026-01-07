using Microsoft.AspNetCore.Mvc;
using PWABuilder.Common;
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
    public async Task<IActionResult> Create([FromQuery] Uri url, [FromServices] ManifestCreator manifestCreatorService, CancellationToken cancellationToken)
    {
        if (!url.IsAbsoluteUri)
        {
            url = new Uri($"https://{url}", UriKind.Absolute);
        }

        var manifest = await manifestCreatorService.Create(url, cancellationToken);
        return Ok(manifest);
    }

    /// <summary>
    /// Attempts to get a web manifest from our web string cache from a previous manifest detection. If not found, it will attempt to fetch it from the network.
    /// The purpose here is to handle scenarios where app packaging fails to fetch the web manifest, but we previously fetched it via ManifestDetectionService.
    /// </summary>
    /// <param name="manifestUrl">The URL of the web manifest to fetch.</param>
    /// <param name="webStringCache">The web string cache service.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The web manifest content. If not found in cache, it will be fetched from the network. If there is an error fetching from the network, that HTTP result will be returned.</returns>
    [HttpGet("getFromCacheOrProxy")]
    public async Task<IActionResult> GetFromCacheOrProxy([FromQuery] Uri manifestUrl, [FromServices] WebStringCache webStringCache, CancellationToken cancellationToken)
    {
        if (!manifestUrl.IsAbsoluteInternetHttps())
        {
            return BadRequest("Manifest URL must be an absolute HTTPS URI pointing to a non-local address.");
        }

        // See if we have the manifest in our web string cache.
        string? manifestContent;
        try
        {
            manifestContent = await webStringCache.GetOrFetchAsync(manifestUrl, Constants.ManifestMimeTypes, logger: null, cancelToken: cancellationToken);
        }
        catch (HttpRequestException httpRequestEx) when (httpRequestEx.StatusCode != null)
        {
            return StatusCode((int)httpRequestEx.StatusCode.Value, httpRequestEx.Message);
        }

        if (string.IsNullOrEmpty(manifestContent))
        {
            return NotFound($"No manifest found at {manifestUrl}");
        }

        return Content(manifestContent, "application/manifest+json");
    }
}