using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Finds a web manifest for a PWA. Uses PWABuilder's web manifest detection service.
    /// </summary>
    /// <remarks>
    /// PWABuilder's web manifest detection service is at https://pwabuilder-apiv2-container.calmflower-2e2ebb94.eastus.azurecontainerapps.io/api/FindWebManifest?url=https://webboard.app
    /// </remarks>
    public class WebManifestFinder
    {
        private readonly ILogger<WebManifestFinder> logger;
        private readonly HttpClient http;
        private readonly TempDirectory temp;

        private const string webManifestFinderServiceUrl = "https://pwabuilder-apiv2-container.calmflower-2e2ebb94.eastus.azurecontainerapps.io/api/FindWebManifest";

        public WebManifestFinder(IHttpClientFactory httpClientFactory, ILogger<WebManifestFinder> logger, TempDirectory temp)
        {
            this.http = httpClientFactory.CreateClient();
            this.http.AddLatestEdgeUserAgent();
            this.logger = logger;
            this.temp = temp;
        }

        private async Task GenerateManifestFile(WindowsAppPackageOptions options)
        {
            var manifestFilePath = temp.CreateFile(".json");

            try
            {
                var jsonString = JsonSerializer.Serialize(options.Manifest);
                using (StreamWriter writer = new StreamWriter(manifestFilePath))
                {
                    await writer.WriteAsync(jsonString);
                }
                options.ManifestFilePath = manifestFilePath;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
            };

        }

        /// <summary>
        /// Gets the web app manifest for the PWA.
        /// </summary>
        /// <param name="options"></param>
        /// <returns></returns>
        public async Task<WebAppManifestContext> Find(WindowsAppPackageOptions options)
        {
            // If we have a manifest and a manifest URL, use those.
            var manifestUri = options.ManifestUrl;
            JsonDocument? rawManifest = null;
            if (options.Manifest == null && manifestUri != null)
            {
                rawManifest = await TryFetchManifestFrom(manifestUri, options);
                options.Manifest = rawManifest;
                await GenerateManifestFile(options);
                return WebAppManifestContext.From(options.Manifest!, manifestUri);
            }

            //Only if custom manifest is provided, pass the custom manifest to pwa_builder.exe (But this feature does not work if the app has widgets)
            if (options.Manifest != null && options.EnableWebAppWidgets != true)
            {
                options.UsePWABuilderWithCustomManifest = true;
                await GenerateManifestFile(options);
                return WebAppManifestContext.From(options.Manifest, manifestUri != null ? manifestUri : options.Url);
            }

            // No manifest could be fetched so far. Reach out to our manifest detection service and find it.
            var pwaUri = options.Url;

            var apiUrl = webManifestFinderServiceUrl + $"?site={Uri.EscapeDataString(pwaUri.ToString())}";
            var jsonResult = await InvokeManifestFinderService(apiUrl);
            var manifestResult = DeserializeJson(jsonResult);

            if (manifestResult.content?.json != null && Uri.TryCreate(manifestResult.content.url, UriKind.Absolute, out var discoveredManifestUri))
            {
                options.Manifest = manifestResult.content?.json;
                await GenerateManifestFile(options);
                return WebAppManifestContext.From(manifestResult.content!.json, discoveredManifestUri);
            }

            throw new Exception("Unable to find manifest. Raw message from manifest detection service: " + manifestResult.error?.message);
        }

        private WebManifestFinderResult DeserializeJson(string jsonResult)
        {
            try
            {
                var result = JsonSerializer.Deserialize<WebManifestFinderResult>(jsonResult, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (result == null)
                {
                    var error = new InvalidOperationException("Couldn't deserialize JSON into manifest result.");
                    error.Data.Add("json", jsonResult);
                    throw error;
                }

                return result;
            }
            catch (Exception error)
            {
                logger.LogError(error, "Unable to deserialize manifest finder result. Raw JSON was " + jsonResult);
                throw;
            }
        }

        private async Task<string> InvokeManifestFinderService(string apiUrl)
        {
            try
            {
                using var httpGetMessage = new HttpRequestMessage(HttpMethod.Get, apiUrl);
                httpGetMessage.Version = new Version(2, 0);
                using var manifestResponse = await this.http.SendAsync(httpGetMessage);
                manifestResponse.EnsureSuccessStatusCode();
                return await manifestResponse.Content.ReadAsStringAsync();
            }
            catch (Exception httpError)
            {
                logger.LogError(httpError, "Unable to fetch manifest via manifest finder service. The call to {url} failed.", apiUrl);
                throw new InvalidOperationException("Unable to fetch manifest via manifest finder service. The call to " + apiUrl + " failed");
            }
        }

        private async Task<JsonDocument?> TryFetchManifestFrom(Uri manifestUrl, WindowsAppPackageOptions options)
        {
            try
            {
                using var manifestFetchMessage = new HttpRequestMessage(HttpMethod.Get, manifestUrl);
                manifestFetchMessage.Version = new Version(2, 0);
                using var manifestResponse = await this.http.SendAsync(manifestFetchMessage);
                manifestResponse.EnsureSuccessStatusCode();
                var manifestJson = await JsonDocument.ParseAsync(await manifestResponse.Content.ReadAsStreamAsync());
                return manifestJson;
            }
            catch (Exception manifestFetchError)
            {
                logger.LogWarning(manifestFetchError, "Unable to fetch manifest using {url}", manifestUrl);
                return null;
            }
        }

        private class Content
        {
            public JsonDocument? json { get; set; } // Use dynamic for the "json" field since it has a variable structure
            public string url { get; set; } = "";
        }

        private class WebManifestFinderResult
        {
            public Content? content { get; set; }
            public Error? error { get; set; } // Nullable for "error" property
        }

        public class Error
        {
            public string? message { get; set; }
        }
    }
}
