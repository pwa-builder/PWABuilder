using System.Text.Json;
using PWABuilder.Common;

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

}
