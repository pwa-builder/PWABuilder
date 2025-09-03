using Microsoft.Extensions.Logging;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore.Services;

/// <summary>
/// Provides helpers to enable Windows App Actions. 
/// </summary>
/// <remarks>
/// For more information App Actions on Windows, see https://learn.microsoft.com/en-us/windows/ai/app-actions/actions-get-started
/// For more information about App Actions for PWAs, see https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/app-actions
/// To test out a PWA with App Actions, see the App Actions Testing Playground https://apps.microsoft.com/detail/9plswv2gr8b4
/// </remarks>
public class WindowsActionsService
{
    private readonly ILogger<WindowsActionsService> logger;
    private readonly TempDirectory tempDirectory;
    private readonly HttpClient http;

    public WindowsActionsService(TempDirectory tempDirectory, IHttpClientFactory httpClientFactory, ILogger<WindowsActionsService> logger)
    {
        this.tempDirectory = tempDirectory;
        this.http = httpClientFactory.CreateClient();
        this.http.AddLatestEdgeUserAgent();
        this.logger = logger;
    }

    /// <summary>
    /// Creates a Windows Actions manifest file on disk from the provided options. The result is a temporary file on disk that contains the Windows Actions manifest.
    /// If <see cref="WindowsAppPackageOptions.WindowsActionsManifest"/> is not specified, this will return null.
    /// </summary>
    /// <param name="options">The Windows app package options.</param>
    /// <returns>The path to the file containing the Windows Actions manifest file, or null if none was created.</returns>
    public async Task<string?> GetActionsManifestFile(WindowsAppPackageOptions options)
    {
        // Process web action manifest file - could be a URL or direct JSON content
        if (string.IsNullOrWhiteSpace(options.WindowsActions?.Manifest))
        {
            return null;
        }
        
        try
        {
            var actionsManifestContent = options.WindowsActions.Manifest;
            
            // Check if it's a URL
            if (Uri.TryCreate(options.WindowsActions.Manifest, UriKind.Absolute, out var manifestUri) &&
                (manifestUri.Scheme == "http" || manifestUri.Scheme == "https"))
            {
                // It's a URL, download it
                actionsManifestContent = await DownloadWindowsActionsManifestFile(manifestUri);
                logger.LogInformation("Downloaded windows actions manifest from URL: {url}", options.WindowsActions.Manifest);
            }

            // Validate JSON content before processing
            if (!IsValidJson(actionsManifestContent))
            {
                throw new ArgumentException("The provided windows actions manifest content is not valid JSON.");
            }

            var actionsManifestFilePath = await WriteActionManifestContentAsync(actionsManifestContent);
            logger.LogInformation("Created windows actions manifest from provided JSON content for {url}", options.Url);
            return actionsManifestFilePath;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing windows actions manifest for {url}", options.Url);
            throw;
        }
    }

    /// <summary>
    /// Downloads a web action manifest file from a URL. Returns the contents of the file.
    /// </summary>
    private async Task<string> DownloadWindowsActionsManifestFile(Uri manifestUri)
    {
        try
        {
            using var manifestFetchMessage = new HttpRequestMessage(HttpMethod.Get, manifestUri);
            manifestFetchMessage.Version = new Version(2, 0);
            manifestFetchMessage.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            using var manifestResponse = await this.http.SendAsync(manifestFetchMessage);
            manifestResponse.EnsureSuccessStatusCode();

            var manifestContent = await manifestResponse.Content.ReadAsStringAsync();

            // Validate downloaded content is valid JSON
            if (!IsValidJson(manifestContent))
            {
                throw new InvalidOperationException("The downloaded web action manifest is not valid JSON.");
            }

            return manifestContent;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to download Windows Action manifest from {url}", manifestUri);
            throw;
        }
    }

    /// <summary>
    /// Writes web action manifest content to a temporary file
    /// </summary>
    private async Task<string> WriteActionManifestContentAsync(string manifestContent)
    {
        try
        {
            var localFilePath = await tempDirectory.WriteAllTextAsync(manifestContent, ".json");
            logger.LogInformation("Wrote Windows Action Manifest content to {localPath}", localFilePath);
            return localFilePath;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to write Windows Action Manifest content to file due to an error.");
            throw;
        }
    }

    /// <summary>
    /// Validates if a string is valid JSON
    /// </summary>
    private bool IsValidJson(string jsonContent)
    {
        try
        {
            // Attempt to parse as JSON document
            using (JsonDocument.Parse(jsonContent))
            {
                return true;
            }
        }
        catch (JsonException ex)
        {
            logger.LogWarning(ex, "Invalid JSON provided for web action manifest");
            return false;
        }
    }
}
