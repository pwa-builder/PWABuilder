using Microsoft.AspNetCore.Mvc;
using PWABuilder.Common;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly IPWABuilderDatabase analysisDb;
    private readonly HttpClient http;

    public ImagesController(IPWABuilderDatabase analysisDb, IHttpClientFactory httpClientFactory)
    {
        this.analysisDb = analysisDb;
        this.http = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
    }

    /// <summary>
    /// Proxy an image for the specified analysis. This creates a temporary URL for the image with the specified image URL; it will expire when the analysis is deleted.
    /// </summary>
    /// <param name="analysisId">The ID of the analysis whose manifest contains the image.</param>
    /// <param name="imageUrl">The URL of the image to proxy.</param>
    /// <returns></returns>
    [HttpGet("getSafeImageForAnalysis")]
    public async Task<IActionResult> GetSafeImageForAnalysis(/*[FromQuery] string analysisId, */ [FromQuery] Uri imageUrl, CancellationToken cancelToken)
    {
        // TODO: uncomment this once all our endpoints are passing in analysisId
        // var analysis = await analysisDb.GetByIdAsync(analysisId);
        // if (analysis == null)
        // {
        //     return NotFound($"No analysis found with ID {analysisId}");
        // }

        var maxSize = 1024 * 1024 * 5; // 5mb
        var imageStream = await http.GetImageAsync(imageUrl, maxSize, cancelToken);
        if (imageStream == null)
        {
            return NotFound($"Image not found at {imageUrl}");
        }
        Response.RegisterForDispose(imageStream);
        return File(imageStream, string.IsNullOrWhiteSpace(imageStream.MediaType) ? "image/png" : imageStream.MediaType);
    }
}