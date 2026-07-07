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

    /// <summary>
    /// Attempts to load the image to see if it's a valid image.
    /// </summary>
    /// <param name="imageStream">The stream to validate as an image.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if the image is valid, otherwise false with any error details.</returns>
    Task<Result<bool>> IsValidImageAsync(Stream imageStream, CancellationToken cancellationToken);
}

/// <summary>
/// A service that validates the icons and screenshots within a manifest. It checks that the images actually exist.
/// </summary>
public class ImageValidationService : IImageValidationService
{
    // Raster image formats that ImageSharp can decode. When an image claims (via content type or file
    // extension) to be one of these but can't be decoded, it's treated as corrupt/invalid rather than
    // as an unsupported-but-valid format (e.g. SVG or ICO), which we intentionally allow through.
    private static readonly string[] decodableRasterContentTypes =
    {
        "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/bmp", "image/tiff"
    };

    private static readonly string[] decodableRasterExtensions =
    {
        ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff"
    };

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
                return await ValidateFetchedImageAsync(imageUrl, headResponse.Content.Headers.ContentType?.MediaType);
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
                return await ValidateFetchedImageAsync(imageUrl, response.Content.Headers.ContentType?.MediaType);
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

    /// <inheritdoc/>
    public async Task<Result<bool>> IsValidImageAsync(Stream imageStream, CancellationToken cancellationToken)
    {
        try
        {
            var imageInfo = await Image.IdentifyAsync(imageStream, cancellationToken);
            if (imageInfo == null)
            {
                logger.LogInformation("Attempted to identify image from stream, but it couldn't be identified.");
                return new ArgumentException("Image couldn't be identified.", nameof(imageStream));
            }

            return true;
        }
        catch (UnknownImageFormatException unknownFormatError)
        {
            logger.LogInformation(unknownFormatError, "Attempted to identify image from stream, but it was in an unknown format.");
            return unknownFormatError;
        }
        catch (Exception error)
        {
            logger.LogInformation(error, "Attempted to identify image from stream, but an error occurred.");
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
            return new Exception($"Image at {imageUrl} returned with the wrong content-type. Expected an image content type, but got {contentType}. \n\nTo fix this, update your manifest images to use the image rendering endpoint on Supabase: {imageUrl.AbsoluteUri.Replace("/object/public", "/render/image/public")}");
        }

        return new Exception($"Fetching image {imageUrl} returned with Content-Type {contentType}. Expected an image content type, such as image/png, image/jpeg, or image/webp");
    }

    /// <summary>
    /// Validates a fetched image: confirms it has an image content type and, when it claims to be a
    /// decodable raster format, that its bytes can actually be read as an image. This catches images
    /// that exist and are served with an image content type but are corrupt (e.g. a PNG whose bytes
    /// were mangled by a text-encoding conversion).
    /// </summary>
    /// <param name="imageUrl">The URL of the image.</param>
    /// <param name="contentType">The content type returned by the server, if any.</param>
    /// <param name="server">The value of the response's Server header, if any.</param>
    /// <returns>True if the image is valid, otherwise an error describing the problem.</returns>
    private async Task<Result<bool>> ValidateFetchedImageAsync(Uri imageUrl, string? contentType)
    {
        // Ensure the content type is an image.
        var contentTypeCheck = EnsureImageContentType(imageUrl, contentType);
        if (contentTypeCheck.Error is not null)
        {
            return contentTypeCheck;
        }

        // An image can exist and be served with a valid image content type but still be corrupt, or the
        // host can return HTTP 200 for a missing image (e.g. Vercel, Netlify, *.run.app). When the image
        // claims to be a decodable raster format, fetch and decode its bytes to confirm it's really a
        // valid, existing image.
        if (IsDecodableRasterImageType(imageUrl, contentType))
        {
            // Only block when we actually fetched the bytes and they couldn't be decoded (i.e. the image
            // is genuinely corrupt or doesn't exist). A transient fetch failure shouldn't fail an
            // otherwise-valid PWA.
            var decodeResult = await TryDecodeImageAsync(imageUrl);
            if (decodeResult is ImageDecodeResult.Undecodable)
            {
                return new HttpRequestException($"Your PWA's web manifest refers to an image that appears to be corrupt or invalid: {imageUrl}. The server returned it as {contentType ?? "an image"}, but its contents couldn't be read as an image. Try re-exporting and re-uploading the image.", null, System.Net.HttpStatusCode.UnprocessableEntity);
            }
        }

        return true;
    }

    /// <summary>
    /// Determines whether the image claims, via its content type or file extension, to be a raster
    /// image format that ImageSharp can decode.
    /// </summary>
    /// <param name="imageUrl">The URL of the image.</param>
    /// <param name="contentType">The content type returned by the server, if any.</param>
    /// <returns>True if the image claims to be a decodable raster format, otherwise false.</returns>
    private static bool IsDecodableRasterImageType(Uri imageUrl, string? contentType)
    {
        var normalizedContentType = contentType?.Trim();
        if (!string.IsNullOrEmpty(normalizedContentType)
            && decodableRasterContentTypes.Contains(normalizedContentType, StringComparer.OrdinalIgnoreCase))
        {
            return true;
        }

        var path = imageUrl.AbsolutePath;
        return decodableRasterExtensions.Any(ext => path.EndsWith(ext, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Attempts to fetch and decode an image, distinguishing a genuinely corrupt/unreadable image from
    /// a transient fetch failure.
    /// </summary>
    /// <param name="imageUri">The URI of the image to fetch and decode.</param>
    /// <returns>The outcome of the fetch-and-decode attempt.</returns>
    private async Task<ImageDecodeResult> TryDecodeImageAsync(Uri imageUri)
    {
        HttpResponseMessage response;
        try
        {
            response = await httpClient.GetAsync(imageUri, HttpCompletionOption.ResponseHeadersRead);
        }
        catch (Exception fetchError)
        {
            logger.LogWarning(fetchError, "Failed to fetch image {imageUri} for decode validation.", imageUri);
            return ImageDecodeResult.FetchFailed;
        }

        using (response)
        {
            if (!response.IsSuccessStatusCode)
            {
                return ImageDecodeResult.FetchFailed;
            }

            try
            {
                using var imageStream = await response.Content.ReadAsStreamAsync();

                // Use IdentifyAsync to read image metadata (format/dimensions) without fully decoding
                // the image. This is faster and uses less memory, and still fails on corrupt images.
                var info = await Image.IdentifyAsync(imageStream);
                if (info is null)
                {
                    logger.LogWarning("Could not identify image {imageUri}; it may be corrupt.", imageUri);
                    return ImageDecodeResult.Undecodable;
                }

                return ImageDecodeResult.Valid;
            }
            catch (UnknownImageFormatException unknownFormatError)
            {
                logger.LogWarning(unknownFormatError, "Image {imageUri} is not in a recognized format; it may be corrupt.", imageUri);
                return ImageDecodeResult.Undecodable;
            }
            catch (Exception decodeError)
            {
                logger.LogWarning(decodeError, "Failed to decode image {imageUri}; it may be corrupt.", imageUri);
                return ImageDecodeResult.Undecodable;
            }
        }
    }

    /// <summary>
    /// The outcome of attempting to fetch and decode an image.
    /// </summary>
    private enum ImageDecodeResult
    {
        /// <summary>The image was fetched and successfully decoded.</summary>
        Valid,
        /// <summary>The image was fetched but its bytes couldn't be read as an image (corrupt/invalid).</summary>
        Undecodable,
        /// <summary>The image couldn't be fetched (network error or non-success status).</summary>
        FetchFailed
    }
}
