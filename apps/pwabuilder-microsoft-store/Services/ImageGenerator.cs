﻿using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PWABuilder.MicrosoftStore.Common;
using PWABuilder.MicrosoftStore.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace PWABuilder.MicrosoftStore
{
    /// <summary>
    /// Creates the recommended Windows package images using images from the <see cref="WindowsAppPackageOptions"/>, images from the PWA's web app manifest, and images generated on behalf of the user from the PWABuilder app image generator service.
    /// </summary>
    /// <remarks>
    /// PWABuilder app image generator service is at https://www.pwabuilder.com/imageGenerator
    /// </remarks>
    public class ImageGenerator
    {
        private readonly ILogger<ImageGenerator> logger;
        private readonly HttpClient http;
        private readonly Uri imageGeneratorServiceUrl;

        public ImageGenerator(
            IHttpClientFactory httpClientFactory, 
            IOptions<AppSettings> appSettings,
            ILogger<ImageGenerator> logger)
        {
            this.http = new HttpClient(new HttpClientHandler { AutomaticDecompression = DecompressionMethods.All });
            this.http.AddLatestEdgeUserAgent();
            this.imageGeneratorServiceUrl = new Uri(appSettings.Value.ImageGeneratorApiUrl);
            this.logger = logger;
        }

        /// <summary>
        /// Generates the recommended Windows 10 package images and writes them to a directory.
        /// Images will be taken from the package options, then the web app manifest, and then supplemented with images created from the PWABuilder image generator service.
        /// </summary>
        /// <param name="options">The package options.</param>
        /// <param name="manifest">The web app manifest containing one or more images.</param>
        /// <param name="outputDirectory">The directory to write the images to.</param>
        /// <returns>An object containing the paths to the generated images.</returns>
        public async Task<ImageGeneratorResult> Generate(WindowsAppPackageOptions options, WebAppManifestContext manifest, string outputDirectory)
        {
            // 1. Generate images using PWABuilder's image generation service. 
            // These will be used as a backup if the options and manifest are missing images.
            var imageOptions = options.Images ?? new WindowsImages();
            var generatedImagesZip = await InvokePwabuilderImageGeneratorService(imageOptions, manifest);

            // 2. Assemble the image sources from the options, web manifest, and generated images zip.
            var imageSources = GetImageSources(imageOptions, manifest, generatedImagesZip);

            // 3. Write all the available images to the output directory.
            var imagePaths = await TryWriteImageSourcesToDirectory(imageSources, outputDirectory);
            return new ImageGeneratorResult(imagePaths);
        }

        private IEnumerable<ImageSource> GetImageSources(WindowsImages imageOptions, WebAppManifestContext webManifest, ImageGeneratorServiceZipFile imagesZip)
        {
            var scaleSetImages = GetImageSourcesForScaleSets(imageOptions, webManifest, imagesZip);
            var targetSizeImages = GetImageSourcesForTargetSizes(imageOptions, webManifest, imagesZip);
            return scaleSetImages.Concat(targetSizeImages);
        }

        private async Task<ImageGeneratorServiceZipFile> InvokePwabuilderImageGeneratorService(WindowsImages imageOptions, WebAppManifestContext webManifest)
        {
            var baseImageBytes = await GetBaseImage(imageOptions, webManifest);
            var imagesZipUrl = await CreateWindows11ImagesZip(baseImageBytes, imageOptions.Padding, imageOptions.BackgroundColor);
            return await DownloadWindowsImagesZip(imagesZipUrl);
        }

        private async Task<byte[]> GetBaseImage(WindowsImages imageOptions, WebAppManifestContext webManifest)
        {
            // Find a base image from which to generate all Windows package images.
            // Best: the user supplied an image.
            // Second best: the largest square image from the manifest
            // Better than nothing: the largest image from the manifest

            // Go through each source and see if we can get the bytes for it.
            var baseImageSources = new[]
            {
                (source: imageOptions.BaseImage, description: "base image from package options"),
                (source: webManifest.GetIconSuitableForWindowsApps(512), description: "largest square PNG or JPG icon 512x512 or larger from web manifest"),
                (source: webManifest.GetIconSuitableForWindowsApps(256), description: "largest square PNG or JPG icon 256x256 or larger from web manifest"),
                (source: webManifest.GetIconSuitableForWindowsApps(128), description: "largest square PNG or JPG icon 128x128 or larger from web manifest"),
                (source: webManifest.GetIconSuitableForWindowsApps(0), description: "largest square PNG or JPG icon from web manifest")
            };

            if (baseImageSources.All(s => s.source == null))
            {
                throw new InvalidOperationException("No source image found. Make sure your PWA web manifest contains a square 512x512 or larger PNG icon.");
            }

            foreach (var (source, description) in baseImageSources)
            {
                if (source != null)
                {
                    using var stream = await TryDownloadImage(source);
                    if (stream != null)
                    {
                        var bytes = await TryReadStreamBytes(stream, $"{source}, {description}");
                        if (bytes != null)
                        {
                            return bytes;
                        }
                    }
                }
            }

            var imageSourceDescriptions = baseImageSources
                .Where(s => s.source != null)
                .Select(s => $"{s.description}: {s.source?.ToString()}");            
            throw new InvalidOperationException($"Couldn't find a suitable base image from which to generate all Windows package images. Please ensure your web app manifest has a square PNG image 512x512 or larger. Base image sources: {string.Join(", ", imageSourceDescriptions)}");
        }

        private async Task<Uri> CreateWindows11ImagesZip(byte[] image, double padding, string? backgroundColor)
        {
            // The image generation API documentation (https://github.com/pwa-builder/pwabuilder-Image-Generator/blob/master/README.md)
            // states the image generator takes the following parameters:
            // - fileName: bytes
            // - padding: double
            // - color: The background color (named color or hex color) of the generated images. If null, the color will be chosen from (0,0) pixel of the source image
            // - platform: windows11
            // - colorChanged: if colorOption = "choose", this should be 1. Otherwise, omit.
            var fileContent = new StreamContent(new MemoryStream(image));
            fileContent.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("form-data") { Name = "file", FileName = "image.png" };
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
            var imageGeneratorArgs = new MultipartFormDataContent
            {
                { fileContent, "fileName" },
                { new StringContent(padding.ToString()), "padding" }, // For Windows 10 images, padding is honored. For Windows 11 images, padding is overriden by individual image sizes. See https://github.com/pwa-builder/pwabuilder-Image-Generator/blob/master/AppImageGenerator/App_Data/windows11Images.json
                { new StringContent("windows11"), "platform" },
                { new StringContent(backgroundColor ?? string.Empty), "color" }
            };

            var imagesResponse = await this.http.PostAsync(imageGeneratorServiceUrl, imageGeneratorArgs);
            imagesResponse.EnsureSuccessStatusCode();
            var imagesResponseString = await imagesResponse.Content.ReadAsStringAsync(); // it should be a JSON string containing a ImageGeneratorServiceResult
            var imagesResult = JsonSerializer.Deserialize<ImageGeneratorServiceResult>(imagesResponseString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (imagesResult == null)
            {
                throw new InvalidOperationException("Unable to deserialize image generator result");
            }
            if (!Uri.TryCreate(imageGeneratorServiceUrl, imagesResult.Uri, out var imagesZipUri))
            {
                throw new Exception($"Unable to generate images for Windows package. The image URI returned from the image generator service, '{imagesResult.Uri}', is an invalid URI. Raw response: {imagesResponseString}");
            }

            return imagesZipUri;
        }

        private async Task<ImageGeneratorServiceZipFile> DownloadWindowsImagesZip(Uri url)
        {
            var zipStream = await this.http.GetStreamAsync(url);
            var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Read, false);
            return new ImageGeneratorServiceZipFile(zipArchive);
        }

        private IEnumerable<ImageSource> GetImageSourcesForTargetSizes(WindowsImages imageOptions, WebAppManifestContext webManifest, ImageGeneratorServiceZipFile generatedImagesZip)
        {
            var imageSizes = ImageTargetSizeExtensions.GetAll();
            var altForms = new[] { ImageAltForm.None, ImageAltForm.Light, ImageAltForm.Unplated };
            return from size in imageSizes
                   from form in altForms
                   select ImageSource.From(size, form, imageOptions, webManifest, generatedImagesZip);
        }

        private IEnumerable<ImageSource> GetImageSourcesForScaleSets(WindowsImages imageOptions, WebAppManifestContext webManifest, ImageGeneratorServiceZipFile generatedImagesZip)
        {
            var imageScaleSets = new[] { ImageScaleSetType.AppIcon, ImageScaleSetType.LargeTile, ImageScaleSetType.MediumTile, ImageScaleSetType.SmallTile, ImageScaleSetType.SplashScreen, ImageScaleSetType.StoreLogo, ImageScaleSetType.WideTile };
            var imageScales = new[] { ImageScale.X1, ImageScale.X125, ImageScale.X150, ImageScale.X200, ImageScale.X400 };
            return from set in imageScaleSets
                   from scale in imageScales
                   select ImageSource.From(set, scale, imageOptions, webManifest, generatedImagesZip);
        }

        private async Task<List<string>> TryWriteImageSourcesToDirectory(IEnumerable<ImageSource> sources, string outputDirectory)
        {
            var imageFilePaths = new List<string>(40);
            foreach (var source in sources)
            {
                var filePath = await TryWriteImageSourceToDirectory(source, outputDirectory);
                if (filePath != null)
                {
                    imageFilePaths.Add(filePath);
                }
            }

            return imageFilePaths;
        }

        private async Task<string?> TryWriteImageSourceToDirectory(ImageSource source, string outputDirectory)
        {
            // Go through each source in the specified ImageSource and try to write it to a file.
            //
            // Image source priority:
            // 1. The app package options. The developer specified their own image.
            // 2. The web app manifest. The developer added an image to their manifest that has the right dimensions.
            // 3. The image generated from the PWABuilder image generator service.

            var streamOpeners = new (Func<Task<Stream?>> action, string? description)[]
            {
                (action: () => TryDownloadImage(source.AppPackageOptionsSource), description: source.AppPackageOptionsSource?.ToString()),
                (action: () => TryDownloadImage(source.WebManifestSource), description: source.WebManifestSource?.ToString()),
                (action: () => TryOpenZipEntry(source.GeneratedImageSource), description: source.GeneratedImageSource?.FullName)
            };

            foreach (var (action, description) in streamOpeners)
            {
                using var stream = await action();
                if (stream != null)
                {
                    var filePath = await TryWriteStreamToOutputDirectory(stream, source.TargetFileName, outputDirectory, description ?? string.Empty);
                    if (filePath != null)
                    {
                        return filePath;
                    }
                }
            }

            return null;
        }

        private async Task<Stream?> TryDownloadImage(Uri? imageUri)
        {
            if (imageUri == null)
            {
                return null;
            }

            HttpResponseMessage? imageFetch = null;
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, imageUri);
                request.Version = new Version(2, 0);
                imageFetch = await http.SendAsync(request);
                if (!imageFetch.IsSuccessStatusCode)
                {
                    logger.LogWarning("Attempted to fetch image at {url}, but download failed with status {code}, {reason}", imageUri, imageFetch.StatusCode, imageFetch.ReasonPhrase);
                    return null;
                }
            }
            catch (Exception fetchError)
            {
                logger.LogWarning(fetchError, "Attempted to fetch image at {url}, but download failed with exception", imageUri);
                return null;
            }

            try
            {
                var imageStream = await imageFetch.Content.ReadAsStreamAsync();
                return new HttpMessageStream(imageStream, imageFetch);
            }
            catch (Exception imageBytesError)
            {
                logger.LogWarning(imageBytesError, "Unable to read image bytes from {url}", imageUri);
                return null;
            }
        }

        private async Task<byte[]?> TryReadStreamBytes(Stream stream, string streamDescription)
        {
            using var memoryStream = new MemoryStream();
            try
            {
                await stream.CopyToAsync(memoryStream);
                await memoryStream.FlushAsync();
                return memoryStream.ToArray();
            }
            catch (Exception streamError)
            {
                logger.LogWarning(streamError, "Unable to read bytes from stream {description}", streamDescription);
                return null;
            }
        }

        private Task<Stream?> TryOpenZipEntry(ZipArchiveEntry? zipEntry)
        {
            if (zipEntry == null)
            {
                return Task.FromResult(default(Stream?));
            }

            try
            {
                var zipStream = zipEntry.Open();
                return Task.FromResult<Stream?>(zipStream);
            }
            catch (Exception zipError)
            {
                logger.LogWarning(zipError, "Failed to open zip stream for zip entry {name}", zipEntry.FullName);
                return Task.FromResult(default(Stream?));
            }
        }

        /// <summary>
        /// Writes a source image stream into a file. 
        /// </summary>
        /// <param name="stream">The image source stream.</param>
        /// <param name="fileName">The desired file name to write the stream into.</param>
        /// <param name="outputDirectory">The output directory to write the file into.</param>
        /// <param name="sourceDescription">The description of the source stream. This can be a URL for an image from the web, or the zip entry name for an image from a zip file.</param>
        /// <returns>The file path of the written file, if successful. Null if downloading the stream failed.</returns>
        private async Task<string?> TryWriteStreamToOutputDirectory(Stream stream, string fileName, string outputDirectory, string sourceDescription)
        {
            var filePath = "";
            try
            {
                filePath = Path.Combine(outputDirectory, fileName);
                using var fileStream = File.Create(filePath);
                await stream.CopyToAsync(fileStream);
                await fileStream.FlushAsync();
                return filePath;
            }
            catch (Exception streamError)
            {
                logger.LogWarning(streamError, "Failed to download stream from {source} into {destination}", sourceDescription, filePath);
                return null;
            }
        }

        private class ImageGeneratorServiceResult
        {
            public string? Uri { get; set; }
        }
    }
}
