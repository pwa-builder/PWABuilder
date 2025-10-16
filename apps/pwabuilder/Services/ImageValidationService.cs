using System.Text.Json;
using PWABuilder.Common;
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
    Task<bool> TryImageExistsAsync(Uri imageUri, CancellationToken cancelToken);

    /// <summary>
    /// Validates that the image matches the declared type in the manifest.
    /// </summary>
    /// <param name="imageUri">The URI of the image to check.</param>
    /// <param name="declaredType">The type declared in the manifest (e.g., "image/png").</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>True if the actual image type matches the declared type, otherwise false.</returns>
    Task<bool> ValidateImageTypeAsync(Uri imageUri, string? declaredType, CancellationToken cancelToken);

    /// <summary>
    /// Validates that the image matches the declared dimensions in the manifest.
    /// </summary>
    /// <param name="imageUri">The URI of the image to check.</param>
    /// <param name="declaredSizes">The sizes declared in the manifest (e.g., "192x192").</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>True if the actual image dimensions match any of the declared sizes, otherwise false.</returns>
    Task<bool> ValidateImageSizeAsync(Uri imageUri, string? declaredSizes, CancellationToken cancelToken);
}

/// <summary>
/// A service that validates the icons and screenshots within a manifest. It checks that the images actually exist.
/// </summary>
public class ImageValidationService : IImageValidationService
{
    private readonly HttpClient httpClient;

    public ImageValidationService(IHttpClientFactory httpClientFactory)
    {
        httpClient = httpClientFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
    }

    public class ManifestIcon
    {
        public string? src { get; set; }
        public string? type { get; set; }
        public string? sizes { get; set; }
    }

    public class ManifestScreenshot
    {
        public string? src { get; set; }
        public string? type { get; set; }
        public string? sizes { get; set; }
        public string? platform { get; set; }
    }

    /// <summary>
    /// Checks whether the image exists asynchronously. 
    /// </summary>
    /// <param name="imageUrl"></param>
    /// <returns></returns>
    public async Task<bool> TryImageExistsAsync(Uri imageUrl, CancellationToken cancelToken)
    {
        // First try HEAD which is cheap and quick.
        try
        {
            using var response = await httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Head, imageUrl), cancelToken);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
        }
        catch
        {
            // Ingore exception and see if we can fetch it via GET.
        }

        // We couldn't load the image with HEAD. See if we can load it with GET without fetching the whole body.
        try
        {
            using var response = await httpClient.GetAsync(
                imageUrl,
                HttpCompletionOption.ResponseHeadersRead, // Don't buffer the body
                cancelToken
            );

            return response.IsSuccessStatusCode &&
                   response.Content.Headers.ContentType?.MediaType?.StartsWith("image/") == true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Validates that the image matches the declared type in the manifest.
    /// </summary>
    public async Task<bool> ValidateImageTypeAsync(Uri imageUri, string? declaredType, CancellationToken cancelToken)
    {
        if (string.IsNullOrWhiteSpace(declaredType))
        {
            return true; // No type declared, so we can't validate it
        }

        try
        {
            using var response = await httpClient.GetAsync(imageUri, HttpCompletionOption.ResponseHeadersRead, cancelToken);
            if (!response.IsSuccessStatusCode)
            {
                return false; // Image doesn't exist
            }

            // Get the actual content type from the response
            var actualContentType = response.Content.Headers.ContentType?.MediaType;
            if (string.IsNullOrWhiteSpace(actualContentType))
            {
                return false; // No content type in response
            }

            // Compare declared type with actual type (case-insensitive)
            return string.Equals(declaredType.Trim(), actualContentType.Trim(), StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Validates that the image matches the declared dimensions in the manifest.
    /// </summary>
    public async Task<bool> ValidateImageSizeAsync(Uri imageUri, string? declaredSizes, CancellationToken cancelToken)
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
                return false; // Image doesn't exist
            }

            using var imageStream = await response.Content.ReadAsStreamAsync(cancelToken);
            
            // Use ImageSharp to get actual image dimensions
            var imageInfo = await SixLabors.ImageSharp.Image.IdentifyAsync(imageStream, cancelToken);
            if (imageInfo == null)
            {
                return false; // Could not identify image
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

            return false; // No matching sizes found
        }
        catch
        {
            return false;
        }
    }

}
