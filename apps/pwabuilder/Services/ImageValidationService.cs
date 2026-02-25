using System.Text.Json;
using PWABuilder.Common;
using PWABuilder.Models;
using SixLabors.ImageSharp;

namespace PWABuilder.Validations.Services;

/// <summary>
/// Validates the icons and screenshots within a manifest by ensuring they exist.
/// </summary>
public interface IImageValidationService
{
    /// <summary>
    /// Checks if the image exists. Returns true if it exists, otherwise false.
    /// </summary>
    /// <param name="imageUri">The URI of the image to check.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>True if the image exists, otherwise false.</returns>
    Task<Result<bool>> TryImageExistsAsync(Uri imageUri, CancellationToken cancelToken);

    /// <summary>
    /// Validates that the image matches the declared type in the manifest.
    /// </summary>
    /// <param name="imageUri">The URI of the image to check.</param>
    /// <param name="declaredType">The type declared in the manifest (e.g., "image/png").</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>True if the actual image type matches the declared type, otherwise false.</returns>
    Task<Result<bool>> TryValidateImageTypeAsync(Uri imageUri, string? declaredType, CancellationToken cancelToken);

    /// <summary>
    /// Validates that the image matches the declared dimensions in the manifest.
    /// </summary>
    /// <param name="imageUri">The URI of the image to check.</param>
    /// <param name="declaredSizes">The sizes declared in the manifest (e.g., "192x192").</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>True if the actual image dimensions match any of the declared sizes, otherwise the result will contain an exception.</returns>
    Task<Result<bool>> TryValidateImageSizeAsync(Uri imageUri, string? declaredSizes, CancellationToken cancelToken);
}

/// <summary>
/// A service that validates the icons and screenshots within a manifest. It checks that the images actually exist.
/// </summary>
public class ImageValidationService : IImageValidationService
{
    private readonly HttpClient httpClient;
    private readonly ILogger<ImageValidationService> logger;

    public ImageValidationService(IHttpClientFactory httpClientFactory, ILogger<ImageValidationService> logger)
    {
        httpClient = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
        this.logger = logger;
    }

    /// <summary>
    /// Checks whether the image exists asynchronously. 
    /// </summary>
    /// <param name="imageUrl"></param>
    /// <returns></returns>
    public async Task<Result<bool>> TryImageExistsAsync(Uri imageUrl, CancellationToken cancelToken)
    {
        // First try HEAD which is cheap and quick.
        try
        {
            using var headResponse = await httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Head, imageUrl), cancelToken);
            if (headResponse.IsSuccessStatusCode)
            {
                // Vercel: Vercel-hosted images will always return 200! Even if they don't exist. It returns a dummy image of length 110322 bytes.
                // Check for that here and fail it if we see it.
                if (imageUrl.Host.Contains(".vercel.app") && headResponse.Content.Headers.ContentLength == 110322)
                {
                    return new HttpRequestException($"Your PWA's web manifest refers to an image that doesn't exist: {imageUrl}.", null, System.Net.HttpStatusCode.NotFound);
                }

                // Ensure the content type is an image
                return EnsureImageContentType(imageUrl, headResponse.Content.Headers.ContentType?.MediaType);
            }
        }
        catch (Exception headException)
        {
            // Ignore exception and see if we can fetch it via GET.
            logger.LogWarning(headException, "Attempted to check if image {url} exists via HEAD request, but got exception. Will try GET.", imageUrl);
        }

        // We couldn't load the image with HEAD. See if we can load it with GET without fetching the whole body.
        try
        {
            using var response = await httpClient.GetAsync(
                imageUrl,
                HttpCompletionOption.ResponseHeadersRead, // Don't buffer the body
                cancelToken
            );

            if (response.IsSuccessStatusCode)
            {
                return EnsureImageContentType(imageUrl, response.Content.Headers.ContentType?.MediaType);
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
            {
                // Common error: 403 Forbidden. Usually indicates Cloudflare is blocking us.
                var isCloudflare = response.Headers.Server.Any(h => string.Equals(h?.ToString(), "cloudflare", StringComparison.OrdinalIgnoreCase));
                if (isCloudflare)
                {
                    return new HttpRequestException($"Your Cloudflare settings are blocking PWABuilder from accessing your web app's image {imageUrl}. Please temporarily disable Cloudflare's \"Bot fight mode\" while you package with PWABuilder.", null, response.StatusCode);
                }

                return new HttpRequestException($"Fetching image {imageUrl} failed with 403 Forbidden. Please ensure your web app firewall, CDN, or other security service isn't blocking PWABuilder from accessing your app images. Consider whitelisting PWABuilder's user agent, PWABuilderHttpAgent", null, response.StatusCode);
            }
            else
            {
                return new HttpRequestException($"Fetching image {imageUrl} failed with status code {(int)response.StatusCode} {response.ReasonPhrase}.", null, response.StatusCode);
            }
        }
        catch (Exception error)
        {
            logger.LogWarning(error, "Attempted to check if image {url} exists, but got an exception.", imageUrl);
            return error;
        }
    }

    /// <summary>
    /// Validates that the image matches the declared type in the manifest.
    /// </summary>
    public async Task<Result<bool>> TryValidateImageTypeAsync(Uri imageUri, string? declaredType, CancellationToken cancelToken)
    {
        if (string.IsNullOrWhiteSpace(declaredType))
        {
            return true; // No type declared, so we can't validate it
        }

        if (declaredType.Trim().Equals("image/x-icon", StringComparison.OrdinalIgnoreCase) || imageUri.ToString().EndsWith(".ico"))
        {
            return true; // ImageSharp doesn't handle ico files. We'll skip those and assume all is well.
        }
        if (declaredType.Trim().Equals("image/svg+xml", StringComparison.OrdinalIgnoreCase) || imageUri.ToString().EndsWith(".svg"))
        {
            return true; // ImageSharp doesn't handle svg files. We'll skip those and assume all is well.
        }

        try
        {
            using var response = await httpClient.GetAsync(imageUri, cancelToken);
            if (!response.IsSuccessStatusCode)
            {
                return new HttpRequestException($"Fetching image {imageUri} failed with status code {(int)response.StatusCode} {response.ReasonPhrase}.", null, response.StatusCode);
            }

            using var imageStream = await response.Content.ReadAsStreamAsync(cancelToken);

            // Use ImageSharp to detect the actual image format
            var detectedFormat = await Image.DetectFormatAsync(imageStream, cancelToken);
            if (detectedFormat == null)
            {
                logger.LogWarning("Could not detect image format for {imageUri}.", imageUri);
                return true; // Allow the user to specify types not supported by ImageSharp.
            }

            var actualMimeType = detectedFormat.DefaultMimeType;
            if (string.IsNullOrWhiteSpace(actualMimeType))
            {
                logger.LogWarning("Detected image format for {imageUri} but has no mime type.", imageUri);
                return true; // Allow the user to specify types not supported by ImageSharp.
            }

            // Compare declared type with actual detected type (case-insensitive)
            var isExpectedImageType = string.Equals(declaredType.Trim(), actualMimeType.Trim(), StringComparison.OrdinalIgnoreCase);
            if (!isExpectedImageType)
            {
                logger.LogInformation("Image type mismatch for {imageUri}: declared type {declaredType}, actual type {actualMimeType}.", imageUri, declaredType, actualMimeType);
                return new Exception($"Your web manifest declares {imageUri} to be of type {declaredType}, but it's actually {actualMimeType}.");
            }

            return true;
        }
        catch (UnknownImageFormatException unknownFormatError)
        {
            logger.LogWarning(unknownFormatError, "Unsupported image format for {imageUri}.", imageUri);
            return true; // Allow the test to pass for unsupported formats.
        }
        catch (Exception error)
        {
            logger.LogError(error, "Image type validation failed for {imageUri} due to an error.", imageUri);
            return new Exception($"Error loading image {imageUri} for type validation.", error);
        }
    }

    /// <summary>
    /// Validates that the image matches the declared dimensions in the manifest.
    /// </summary>
    public async Task<Result<bool>> TryValidateImageSizeAsync(Uri imageUri, string? declaredSizes, CancellationToken cancelToken)
    {
        if (string.IsNullOrWhiteSpace(declaredSizes))
        {
            return true; // No sizes declared, so we can't validate them
        }

        try
        {
            using var response = await httpClient.GetAsync(imageUri, cancelToken);
            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new HttpRequestException($"Fetching image {imageUri} failed with 404 Not Found.", null, response.StatusCode);
                }

                if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                {
                    return new HttpRequestException($"Fetching image {imageUri} failed with 403 Forbidden. Please ensure your web server, firewall, or CDN isn't blocking PWABuilder from accessing your images.", null, response.StatusCode);
                }

                return new HttpRequestException($"Fetching image at {imageUri} failed with status code {(int)response.StatusCode} {response.ReasonPhrase}.", null, response.StatusCode);
            }

            using var imageStream = await response.Content.ReadAsStreamAsync(cancelToken);

            // Use ImageSharp to get actual image dimensions
            var imageInfo = await Image.IdentifyAsync(imageStream, cancelToken);
            if (imageInfo == null)
            {
                logger.LogWarning("Could not identify image dimensions for {imageUri}.", imageUri);
                return true; // Allow the test to pass even if we can't identify the dimensions of the image.
            }

            var actualWidth = imageInfo.Width;
            var actualHeight = imageInfo.Height;

            // Parse declared sizes (e.g., "192x192" or "192x192 256x256")
            var sizesList = declaredSizes.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            foreach (var size in sizesList)
            {
                var sizeParts = size.Split('x', StringSplitOptions.RemoveEmptyEntries);
                if (sizeParts.Length == 2 &&
                    int.TryParse(sizeParts[0], out var declaredWidth) &&
                    int.TryParse(sizeParts[1], out var declaredHeight))
                {
                    if (actualWidth == declaredWidth && actualHeight == declaredHeight)
                    {
                        return true; // Found a matching size
                    }
                }
            }

            return new Exception($"Your web manifest declares {imageUri} to be {declaredSizes}, but its actual size is {actualWidth}x{actualHeight}.");
        }
        catch (UnknownImageFormatException unknownFormatError)
        {
            logger.LogWarning(unknownFormatError, "Unsupported image format for {imageUri}.", imageUri);
            return true; // Allow the test to pass for unsupported formats.
        }
        catch (Exception error)
        {
            logger.LogError(error, "Image size validation failed for {imageUri} due to an error.", imageUri);
            return error;
        }
    }

    private Result<bool> EnsureImageContentType(Uri imageUrl, string? contentType)
    {
        // If we have no content type, we can't validate it. Assume it's valid and hope for the best.
        if (string.IsNullOrWhiteSpace(contentType))
        {
            logger.LogWarning("Image at {imageUrl} has no content-type header.", imageUrl);
            return true;
        }

        if (contentType?.StartsWith("image/", StringComparison.OrdinalIgnoreCase) == true)
        {
            return true;
        }

        // Successful image but wrong content type. This can cause some platforms (e.g. Google Play with Bubblewrap) to reject the image.
        // Common case: check if it's a Supabase binary image, served as application/octet-stream. If so, they can fix it by using the image render URL.
        if (imageUrl.AbsoluteUri.Contains("supabase.co/storage/") && imageUrl.AbsolutePath.Contains("/object/public/"))
        {
            return new Exception($"Image at {imageUrl} returned with the wrong content-type. Expected an image content type, but got {contentType}. \n\nFor Supabase-hosted images, update your manifest images to use the image rendering endpoint: {imageUrl.AbsoluteUri.Replace("/object/public", "/render/image/public")}");
        }

        return new Exception($"Fetching image {imageUrl} returned with Content-Type {contentType}. Expected an image content type, such as image/png, image/jpeg, or image/webp");
    }
}
