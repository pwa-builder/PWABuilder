using System.Drawing;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PuppeteerSharp;
using PWABuilder.Common;
using PWABuilder.Models;
using PWABuilder.Services;

namespace PWABuilder.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly HttpClient http;
    private readonly ILogger<ImagesController> logger;
    private const int maxSize = 1024 * 1024 * 5; // 5mb

    public ImagesController(IHttpClientFactory httpClientFactory, ILogger<ImagesController> logger)
    {
        this.http = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
        this.logger = logger;
    }

    /// <summary>
    /// Proxy an image for the specified analysis. This creates a temporary URL for the image with the specified image URL; it will expire when the analysis is deleted.
    /// </summary>
    /// <param name="analysisId">The ID of the analysis whose manifest contains the image.</param>
    /// <param name="puppeteer">The Puppeteer service.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <param name="imageUrl">The URL of the image to proxy.</param>
    /// <returns></returns>
    [HttpGet("getSafeImageForAnalysis")]
    public async Task<IActionResult> GetSafeImageForAnalysis([FromQuery] string analysisId, [FromQuery] Uri imageUrl, [FromServices] IPuppeteerService puppeteer, [FromServices] IRedisCache db, CancellationToken cancelToken)
    {
        if (!imageUrl.IsAbsoluteInternetHttps())
        {
            return BadRequest("Image URL must be an absolute HTTPS URI pointing to a non-local address.");
        }

        HttpClientExtensions.LimitedReadStreamWithMediaType imageStream;
        try
        {
            imageStream = await http.GetImageAsync(imageUrl, maxSize, cancelToken);
            Response.RegisterForDispose(imageStream);
            return File(imageStream, string.IsNullOrWhiteSpace(imageStream.MediaType) ? "image/png" : imageStream.MediaType);
        }
        catch (Exception error)
        {
            // Download via C# HttpClient failed. Try to load the image via Puppeteer.
            if (!string.IsNullOrEmpty(analysisId))
            {
                var puppeteerImageStream = await TryDownloadImageViaPuppeteer(analysisId, imageUrl, puppeteer, db);
                if (puppeteerImageStream != null)
                {
                    Response.RegisterForDispose(puppeteerImageStream);
                    return File(puppeteerImageStream, puppeteerImageStream.MediaType ?? "image/png");
                }
            }

            // OK, we couldn't get it via Puppeteer either. Return the original error.
            // If it's an HTTP error, such as a 403, return that status code to the caller.
            var requestError = error is HttpRequestException httpRequestError ? httpRequestError : null;
            if (requestError?.StatusCode.HasValue == true)
            {
                logger.LogError("Image proxy failed to download image from {url} with status code {statusCode}", imageUrl, requestError.StatusCode.Value);
                return StatusCode((int)requestError.StatusCode.Value, requestError.Message);
            }

            logger.LogError(error, "Image proxy failed to download image from {url} due to an error.", imageUrl);
            return NotFound($"Image not found at {imageUrl} due to an error.");
        }
    }

    /// <summary>
    /// Generates store images from a base image for one or more platforms.
    /// </summary>
    /// <param name="request">The image generation parameters including the base image file, padding, color, and target platforms.</param>
    /// <returns>The generated store images.</returns>
    [HttpPost("generateStoreImages")]
    [RequestFormLimits(MultipartBodyLengthLimit = 5 * 1024 * 1024)]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> GenerateStoreImages([FromForm] StoreImageCreationOptions request, [FromServices] StoreImageCreator storeImageCreator, CancellationToken cancelToken)
    {
        try
        {
            using var baseImageStream = request.BaseImage.OpenReadStream();
            var storeImagesZipStream = await storeImageCreator.CreateStoreImagesZipAsync(baseImageStream, request.BaseImage.ContentType, request.Padding, request.BackgroundColor, request.Platforms, cancelToken);
            return File(storeImagesZipStream, "application/zip", "appstore-images.zip");
        }
        catch (Exception imageCreationError)
        {
            logger.LogError(imageCreationError, "Error generating store images for image of size {size} for {platforms} with padding {padding} and color {color}.", request.BaseImage.Length, string.Join(", ", request.Platforms), request.Padding, request.BackgroundColor);
            return StatusCode(500, $"An error occurred while generating store images: {imageCreationError.Message}");
        }
    }

    private async Task<HttpClientExtensions.LimitedReadStreamWithMediaType?> TryDownloadImageViaPuppeteer(string analysisId, Uri imageUrl, IPuppeteerService puppeteer, IRedisCache db)
    {
        try
        {
            // See if we can load the analysis.
            var analysis = await db.GetByIdAsync<Analysis>(analysisId);
            if (analysis == null)
            {
                logger.LogWarning("Image proxy endpoint failed to find analysis {analysisId} for Puppeteer image download of {imageUrl}", analysisId, imageUrl);
                return null;
            }

            // Use Puppeteer to navigate to the web app.
            using var page = await puppeteer.TryNavigate(analysis.Url, logger);
            if (page == null)
            {
                logger.LogWarning("Image proxy endpoint failed to navigate to {url} for Puppeteer image download of {imageUrl}. The page was null.", analysis.Url, imageUrl);
                return null;
            }

            return await InvokePuppeteerImageFetch(page, imageUrl);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Image proxy with Puppeteer failed to fetch image {imageUrl} due to an error", imageUrl);
            return null;
        }
    }

    private async Task<HttpClientExtensions.LimitedReadStreamWithMediaType?> InvokePuppeteerImageFetch(IPage page, Uri imageUrl)
    {
        // Tell the web app to fetch the image and return both byte array and Content-Type
        var fetchImageScript = $@"
            (async () => {{
                try {{
                    const response = await fetch('{imageUrl}');
                    if (!response.ok) {{
                        throw new Error(`HTTP error! status: ${{response.status}}`);
                    }}
                    
                    const arrayBuffer = await response.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const contentType = response.headers.get('content-type') || '';
                    
                    // Convert Uint8Array to regular array for JSON serialization
                    const byteArray = Array.from(uint8Array);
                    
                    return {{
                        data: byteArray,
                        contentType: contentType
                    }};
                }} catch (error) {{
                    return {{
                        data: null,
                        contentType: null,
                        error: `${{error?.message || error || 'Error fetching image'}}`
                    }}
                }}
            }})();
        ";

        // Execute the JavaScript and get the result handle
        var resultHandle = await page.EvaluateExpressionHandleAsync(fetchImageScript);
        if (resultHandle == null)
        {
            logger.LogWarning("Image proxy with Puppeteer failed to fetch image bytes for {imageUrl} - JavaScript result was null.", imageUrl);
            return null;
        }

        try
        {
            // Get the data (data, contentType, and error) from the JS result object.
            var errorHandle = await resultHandle.GetPropertyAsync("error");
            var dataHandle = await resultHandle.GetPropertyAsync("data");
            var contentTypeHandle = await resultHandle.GetPropertyAsync("contentType");

            if (dataHandle == null)
            {
                var error = errorHandle != null ? await errorHandle.JsonValueAsync<string>() : null;
                logger.LogWarning("Image proxy with Puppeteer failed to fetch image bytes for {imageUrl} - no data property. Error from JS: {error}", imageUrl, error);
                return null;
            }

            // Convert the JavaScript array to byte array
            var jsArray = await dataHandle.JsonValueAsync<int[]>();
            if (jsArray == null || jsArray.Length == 0)
            {
                logger.LogWarning("Image proxy with Puppeteer failed to fetch image bytes for {imageUrl} - no data received.", imageUrl);
                return null;
            }

            // Convert int array to byte array
            var imageBytes = jsArray.Select(i => (byte)i).ToArray();

            // Get the content type
            string contentType = "application/octet-stream";
            if (contentTypeHandle != null)
            {
                contentType = await contentTypeHandle.JsonValueAsync<string>() ?? "application/octet-stream";
            }

            logger.LogInformation("Image proxy with Puppeteer successfully fetched image {imageUrl} with content type: {contentType}, size: {size} bytes",
                imageUrl, contentType, imageBytes.Length);
            return new HttpClientExtensions.LimitedReadStreamWithMediaType(new MemoryStream(imageBytes), maxSize, contentType);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Image proxy with Puppeteer encountered an error processing fetched image {imageUrl}", imageUrl);
            return null;
        }
        finally
        {
            // Dispose all handles to free memory in the browser
            await resultHandle.DisposeAsync();
        }
    }
}