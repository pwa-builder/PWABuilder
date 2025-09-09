using Microsoft.Extensions.Logging;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
            EnsureValidActionsManifest(actionsManifestJson);

            // Grab the optional custom entities file.
            var customEntitiesJson = default(string);
            var customEntitiesFilePath = default(FilePath?);
            if (!string.IsNullOrWhiteSpace(options.WindowsActions.CustomEntities))
            {
                customEntitiesJson = await GetOrFetchJsonAsync(options.WindowsActions.CustomEntities, cancelToken);
                customEntitiesFilePath = await WriteJsonTempFile(customEntitiesJson);
                EnsureValidCustomEntities(customEntitiesJson);
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
                ManifestFilePath = actionsManifestFilePath,
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
            var jsonContent = await http.GetStringAsync(url, ["application/json", "text/plain"], 2 * 1024 * 1024, cancelToken);
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

    // TODO: consider moving this to proper schema validation: https://github.com/microsoft/App-Actions-On-Windows-Samples/blob/main/schema/ActionsSchema.json
    private void EnsureValidActionsManifest(string? jsonContent)
    {
        if (string.IsNullOrWhiteSpace(jsonContent))
        {
            throw new ArgumentException("The Windows Actions JSON content is null or empty.");
        }

        try
        {
            using var doc = JsonDocument.Parse(jsonContent);
            if (!doc.RootElement.TryGetProperty("version", out var versionElement) || versionElement.ValueKind != JsonValueKind.Number)
            {
                throw new ArgumentException("The Windows Actions manifest must contain a 'version' number property.");
            }
            if (!doc.RootElement.TryGetProperty("actions", out var actionsElement) || actionsElement.ValueKind != JsonValueKind.Array)
            {
                throw new ArgumentException("The Windows Actions manifest must contain an 'actions' array.");
            }
            if (actionsElement.GetArrayLength() == 0)
            {
                throw new ArgumentException("The Windows Actions manifest must contain at least one action in the 'actions' array.");
            }

            // Each action must have an id, description, invocation, inputs, and outputs.
            var actions = actionsElement.EnumerateArray();
            foreach (var action in actions)
            {
                // Validate id.
                if (!action.TryGetProperty("id", out var idElement) || idElement.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(idElement.GetString()))
                {
                    throw new ArgumentException("Each action in the Windows Actions manifest must contain a non-empty 'id' string property.");
                }

                // Validate description.
                if (!action.TryGetProperty("description", out var descriptionElement) || descriptionElement.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(descriptionElement.GetString()))
                {
                    throw new ArgumentException($"Action '{idElement.GetString()}' in the Windows Actions manifest must contain a non-empty 'description' string property.");
                }

                // Validate invocation.
                if (!action.TryGetProperty("invocation", out var invocationElement) || invocationElement.ValueKind != JsonValueKind.Object)
                {
                    throw new ArgumentException($"Action '{idElement.GetString()}' in the Windows Actions manifest must contain an 'invocation' object property.");
                }
                if (!invocationElement.TryGetProperty("type", out var typeElement) || typeElement.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(typeElement.GetString()))
                {
                    throw new ArgumentException($"Action '{idElement.GetString()}' in the Windows Actions manifest must contain a non-empty 'type' string property within the 'invocation' object.");
                }
                if (!invocationElement.TryGetProperty("uri", out var uriElement) || uriElement.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(uriElement.GetString()))
                {
                    throw new ArgumentException($"Action '{idElement.GetString()}' in the Windows Actions manifest must contain a non-empty 'uri' string property within the 'invocation' object.");
                }

                // Valid inputs.
                if (!action.TryGetProperty("inputs", out var inputsElement) || inputsElement.ValueKind != JsonValueKind.Array)
                {
                    throw new ArgumentException($"Action '{idElement.GetString()}' in the Windows Actions manifest must contain an 'inputs' array.");
                }
                foreach (var input in inputsElement.EnumerateArray())
                {
                    if (input.ValueKind != JsonValueKind.Object)
                    {
                        throw new ArgumentException($"Each item in the 'inputs' array for action '{idElement.GetString()}' in the Windows Actions manifest must be an object.");
                    }

                    if (!input.TryGetProperty("name", out var inputNameElement) || inputNameElement.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(inputNameElement.GetString()))
                    {
                        throw new ArgumentException($"Action '{idElement.GetString()}' in the Windows Actions manifest must contain a 'name' string property within the 'inputs' array.");
                    }
                }
                

                if (!action.TryGetProperty("outputs", out var outputsElement) || outputsElement.ValueKind != JsonValueKind.Array)
                {
                    throw new ArgumentException($"Action '{idElement.GetString()}' in the Windows Actions manifest must contain an 'outputs' array.");
                }
                foreach (var output in outputsElement.EnumerateArray())
                {
                    if (output.ValueKind != JsonValueKind.Object)
                    {
                        throw new ArgumentException($"Each item in the 'outputs' array for action '{idElement.GetString()}' in the Windows Actions manifest must be an object.");
                    }

                    if (!output.TryGetProperty("name", out var outputNameElement) || outputNameElement.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(outputNameElement.GetString()))
                    {
                        throw new ArgumentException($"Action '{idElement.GetString()}' in the Windows Actions manifest must contain a 'name' string property within the 'outputs' array.");
                    }
                }
            }
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "The provided JSON content is not valid JSON: {json}", jsonContent);
            throw new ArgumentException("The provided JSON content is not valid JSON.", ex);
        }
    }

    private void EnsureValidCustomEntities(string? jsonContent)
    {
        if (string.IsNullOrWhiteSpace(jsonContent))
        {
            throw new ArgumentException("The Windows Actions JSON content is null or empty.");
        }

        try
        {
            using var doc = JsonDocument.Parse(jsonContent);
            
            // Validate version.
            if (!doc.RootElement.TryGetProperty("version", out var versionElement) || versionElement.ValueKind != JsonValueKind.Number)
            {
                throw new ArgumentException("The Windows Actions custom entities file must contain a 'version' number property.");
            }

            // Validate entityDefinitions.
            if (!doc.RootElement.TryGetProperty("entityDefinitions", out var entityDefinitionsElement) || entityDefinitionsElement.ValueKind != JsonValueKind.Object)
            {                 
                throw new ArgumentException("The Windows Actions custom entities file must contain an 'entityDefinitions' object property.");
            }

            // Entity definitions must have at least one object.
            var entityDefinitions = entityDefinitionsElement.EnumerateObject();
            if (!entityDefinitions.Any())
            {
                throw new ArgumentException("The Windows Actions custom entities file must contain at least one entity definition within the 'entityDefinitions' object.");
            }
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "The provided Custom Entities JSON content is invalid: {json}", jsonContent);
            throw new ArgumentException("The provided Custom Entities JSON content is invalid.", ex);
        }
    }

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
