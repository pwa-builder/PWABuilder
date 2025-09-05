using System.Text.RegularExpressions;
using PWABuilder.Common;
using PWABuilder.Models;

namespace PWABuilder.Services;

/// <summary>
/// Service that detects capabilities of a web app that are unrelated to web manifest, service worker, or https.
/// </summary>
public class GeneralWebAppCapabilityDetector
{
    private readonly HttpClient http;

    public GeneralWebAppCapabilityDetector(IHttpClientFactory httpFactory)
    {
        http = httpFactory.CreateClient(Constants.PwaBuilderAgentHttpClient);
    }

    /// <summary>
    /// Detects general web app capabilities.
    /// </summary>
    /// <param name="url">The URL of the web app to detect capabilities on.</param>
    /// <param name="logger">The logger.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>A list of general web app capabilities and their statuses.</returns>
    public async Task<List<PwaCapability>> TryDetectAsync(Uri url, ILogger logger, CancellationToken cancelToken)
    {
        var generalCapabilities = PwaCapability.CreateGeneralCapabilities();
        try
        {
            foreach (var cap in generalCapabilities)
            {
                // Currently, we only support ServesHtml.
                if (cap.Id == PwaCapabilityId.ServesHtml)
                {
                    cap.Status = await TryCheckServesHtmlAsync(url, cap, logger, cancelToken);
                }
            }

            return generalCapabilities;
        }
        catch (Exception error)
        {
            logger.LogError(error, "Unable to detect general web app capabilities due to an error. Marking general web app capabilities as skipped.");
            generalCapabilities
                .Where(c => c.Status == PwaCapabilityCheckStatus.InProgress)
                .ToList()
                .ForEach(c => c.Status = PwaCapabilityCheckStatus.Skipped);
            return generalCapabilities;
        }
    }

    private async Task<PwaCapabilityCheckStatus> TryCheckServesHtmlAsync(Uri url, PwaCapability capapbility, ILogger logger, CancellationToken cancelToken)
    {
        // The purpose of this test is to quickly weed out people putting in non-HTML URLs,
        // such URLs that point to large images.
        try
        {
            using var response = await http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, cancelToken);

            // No successful status code? Consider this check as skipped. Other tests will handle true failure.
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Tried to check if {url} is HTML content, but got a non-successful status code of {code}. Marking test as skipped.", url, response.StatusCode);
                return PwaCapabilityCheckStatus.Skipped;
            }

            // If there is no content type header, consider this test skipped. 
            var contentType = response.Content.Headers.ContentType;
            if (string.IsNullOrEmpty(contentType?.MediaType))
            {
                logger.LogInformation("Tried to check if {url} is HTML content, but no content type header was present.", url);
                return PwaCapabilityCheckStatus.Skipped;
            }

            var isHtml = contentType.MediaType.Contains("text/html");
            if (!isHtml)
            {
                capapbility.ErrorMessage = "The URL does not serve HTML. Expected text/html, but got " + contentType.MediaType;
                capapbility.Description = string.Format(capapbility.Description, contentType.MediaType);
                return PwaCapabilityCheckStatus.Failed;
            }

            return PwaCapabilityCheckStatus.Passed;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Error checking ServesHtml capability for {url}. Marking test as skipped.", url);
            return PwaCapabilityCheckStatus.Skipped;
        }
    }
}