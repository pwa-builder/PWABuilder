using Microsoft.Extensions.Logging;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
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
    /// Creates temporary files on disk for the Windows Actions options.
    /// If <see cref="WindowsAppPackageOptions.WindowsActionsManifest"/> is not specified, this will return null.
    /// </summary>
    /// <param name="options">The Windows app package options.</param>
    /// <param name="outputDirectory">The directory where the pwabuilder.exe output will be stored. For this method, any localization files will be placed in a new LocalizedCustomEntities folder within the output directory.</param>
    /// <param name="cancelToken">The cancellation token.</param>
    /// <returns>The path to the file containing the Windows Actions manifest file, or null if none was created.</returns>
    public async Task<WindowsActionsFiles?> GetWindowsActionsFilesAsync(WindowsAppPackageOptions options, string outputDirectory, CancellationToken cancelToken)
    {
        if (string.IsNullOrWhiteSpace(options.WindowsActions?.Manifest))
        {
            return null;
        }
        
        try
        {
            // Get the Actions manifest.
            var actionsManifestJson = await GetOrFetchJsonAsync(options.WindowsActions.Manifest, cancelToken);
            var actionsManifestFilePath = await WriteJsonTempFile(actionsManifestJson);
            EnsureValidJson(actionsManifestJson);

            // Grab the optional custom entities file.
            var customEntitiesJson = default(string);
            var customEntitiesFilePath = default(FilePath?);
            if (!string.IsNullOrWhiteSpace(options.WindowsActions.CustomEntities))
            {
                customEntitiesJson = await GetOrFetchJsonAsync(options.WindowsActions.CustomEntities, cancelToken);
                customEntitiesFilePath = await WriteJsonTempFile(actionsManifestJson);
                EnsureValidJson(customEntitiesJson);
            }

            // Grab any translation files for the custom entities file.
            var localizedCustomEntitiesPath = default(FilePath?);
            if (options.WindowsActions.CustomEntitiesLocalizations != null)
            {
                // Create the LocalizedCustomEntities directory within the output directory.
                localizedCustomEntitiesPath = tempDirectory.CreateSubdirectory(outputDirectory, "LocalizedCustomEntities");
                foreach (var localization in options.WindowsActions.CustomEntitiesLocalizations)
                {
                    var localizationJson = await GetOrFetchJsonAsync(localization.Contents, cancelToken);
                    var localizationFilePath = Path.Combine(localizedCustomEntitiesPath, localization.FileName);
                    await File.WriteAllTextAsync(localizationFilePath, localizationJson, cancelToken);
                    EnsureValidJson(localizationJson);
                }
            }
                        
            logger.LogInformation("Created windows actions manifest from provided JSON content for {url}", options.Url);
            return new WindowsActionsFiles
            {
                ManifestFilePath = actionsManifestJson,
                CustomEntitiesFilePath = customEntitiesFilePath,
                CustomEntitiesLocalizationDirectoryPath = localizedCustomEntitiesPath
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing Windows Actions for {url} with actions contents {contents}", options.Url, options.WindowsActions?.Manifest);
            throw;
        }
    }

    private async Task<string> GetOrFetchJsonAsync(string jsonOrUrl, CancellationToken cancelToken)
    {
        // If it's a URL, download it.
        if (Uri.TryCreate(jsonOrUrl, UriKind.Absolute, out var manifestUri) &&
            (manifestUri.Scheme == "http" || manifestUri.Scheme == "https"))
        {
            logger.LogInformation("Downloading Windows Actions JSON content from {url}", jsonOrUrl);
            return await DownloadJsonAsync(manifestUri, cancelToken);
        }
        
        return jsonOrUrl;
    }

    private async Task<string> DownloadJsonAsync(Uri url, CancellationToken cancelToken)
    {
        try
        {
            var jsonContent = await http.GetStringAsync(url, ["application/json"], 2 * 1024 * 1024, cancelToken);
            logger.LogInformation("Downloaded JSON content from {url}", url);
            return jsonContent;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to download Windows Actions JSON file from {url}", url);
            throw;
        }
    }

    /// <summary>
    /// Writes web action manifest content to a temporary file
    /// </summary>
    /// <returns>A file path to the temporary file.</returns>
    private async Task<FilePath> WriteJsonTempFile(string json)
    {
        try
        {
            var localFilePath = await tempDirectory.WriteAllTextAsync(json, ".json");
            logger.LogInformation("Wrote Windows Action JSON content to {localPath}", localFilePath);
            return localFilePath;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to write Windows Action Manifest content to file due to an error.");
            throw;
        }
    }

    /// <summary>
    /// Ensures the specified JSON content is valid JSON. Throws an exception if it is not.
    /// </summary>
    private void EnsureValidJson(string? jsonContent)
    {
        if (string.IsNullOrWhiteSpace(jsonContent))
        {
            throw new ArgumentException("The Windows Actions JSON content is null or empty.");
        }
        try
        {
            using var doc = JsonDocument.Parse(jsonContent);
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "The provided JSON content is not valid JSON: {json}", jsonContent);
            throw new ArgumentException("The provided JSON content is not valid JSON.", ex);
        }
    }
}
